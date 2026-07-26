import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import { store } from './redux/store';
import { Provider } from 'react-redux';

import { Widgets } from './utils/Widgets';

import './main.scss';

if (!window.skyrimPlatform) {
  window.skyrimPlatform = {};
  window.needToScroll = true;
}

if (!window.skyrimPlatform.widgets) {
  window.skyrimPlatform.widgets = new Widgets([]);
}

function isAuthFormWidget(w) {
  return w && w.type === 'form';
}

const PANEL_DEFS = [
  ['skillMenuPanel', '__skillMenuData'],
  ['housingMenuPanel', '__housingData'],
  ['adminPanel', '__adminPanelData'],
  ['itemTransferPanel', '__itemTransferData'],
  ['animWheelPanel', '__animWheelData'],
];

if (!window.__skillMenuData) {
  window.__skillMenuData = { open: false };
}
if (!window.__housingData) {
  window.__housingData = { open: false };
}
if (!window.__adminPanelData) {
  window.__adminPanelData = { open: false };
}
if (!window.__itemTransferData) {
  window.__itemTransferData = { open: false };
}
if (!window.__animWheelData) {
  window.__animWheelData = { open: false };
}

function buildChatSendFn() {
  return function sendChat(text) {
    if (!text) {
      return;
    }
    const trimmed = String(text).trim();
    if (!trimmed) {
      return;
    }
    if (window.skyrimPlatform?.sendMessage) {
      window.skyrimPlatform.sendMessage('cef::chat:send', trimmed);
    } else if (window.mp?.send) {
      window.mp.send('cef::chat:send', trimmed);
    }
  };
}

function panelSeq(data) {
  const seq = data && data.seq;
  return typeof seq === 'number' && !Number.isNaN(seq) ? seq : 0;
}

function applyPanelState(key, incoming) {
  const next = incoming || { open: false };
  const prev = window[key] || { open: false };
  if (
    next.open === true &&
    prev.open === false &&
    panelSeq(next) > 0 &&
    panelSeq(next) <= panelSeq(prev)
  ) {
    return;
  }
  window[key] = next;
}

/** Закрыть все gamemode-панели (Esc / потеря фокуса CEF). */
window.__dismissOpenGamemodePanels = function dismissOpenGamemodePanels() {
  const sendJson = (channel, payload) => {
    const json = JSON.stringify(payload);
    if (window.skyrimPlatform?.sendMessage) {
      window.skyrimPlatform.sendMessage(channel, json);
    } else if (window.mp?.send) {
      window.mp.send(channel, json);
    }
  };

  if (window.__skillMenuData?.open) {
    if (typeof window.__closeSkillMenuLocally === 'function') {
      window.__closeSkillMenuLocally();
    }
    sendJson('cef::skillMenu:action', { action: 'close' });
  }
  if (window.__housingData?.open) {
    if (typeof window.__closeHousingMenuLocally === 'function') {
      window.__closeHousingMenuLocally();
    }
    sendJson('cef::skillMenu:action', {
      action: '__housingForward',
      housingPayload: { action: 'closeUi' },
    });
  }
  if (window.__adminPanelData?.open) {
    window.__adminPanelData = { ...(window.__adminPanelData || {}), open: false, seq: Date.now() };
    sendJson('cef::admin:action', { action: 'close' });
  }
  if (window.__itemTransferData?.open) {
    window.__itemTransferData = { ...(window.__itemTransferData || {}), open: false, seq: Date.now() };
  }
  if (window.__animWheelData?.open) {
    window.__animWheelData = { ...(window.__animWheelData || {}), open: false, seq: Date.now() };
  }
  window.__rebuildCefWidgets();
};

/** Единая пересборка: auth form + чат + gamemode-панели (не затирает друг друга). */
window.__rebuildCefWidgets = function rebuildCefWidgets() {
  if (!window.skyrimPlatform?.widgets) {
    return;
  }

  const base = window.skyrimPlatform.widgets.get() || [];
  const authForms = base.filter(isAuthFormWidget);
  const widgets = authForms.slice();

  if (!window.__chatSendFn) {
    window.__chatSendFn = buildChatSendFn();
  }
  if (typeof window.__chatInputOpen === 'undefined') {
    window.__chatInputOpen = false;
  }
  if (!window.chatMessages) {
    window.chatMessages = [];
  }

  widgets.push({
    type: 'chat',
    messages: window.chatMessages.slice(),
    send: window.__chatSendFn,
    placeholder: 'Сообщение... (Enter — ввод, Esc — закрыть)',
    isInputHidden: !window.__chatInputOpen,
  });

  for (let i = 0; i < PANEL_DEFS.length; i++) {
    const type = PANEL_DEFS[i][0];
    const key = PANEL_DEFS[i][1];
    const data = window[key];
    if (data && data.open === true) {
      widgets.push({ type: type, data: data });
    }
  }

  window.skyrimPlatform.widgets.set(widgets);
  window.dispatchEvent(new CustomEvent('cefPanelsChanged'));

  if (window.scrollToLastMessage) {
    window.scrollToLastMessage();
  }
};

window.__refreshCefWidgets = window.__rebuildCefWidgets;
window.__chatRefreshWidget = window.__rebuildCefWidgets;

window.__closeSkillMenuLocally = function () {
  window.__skillMenuData = {
    ...(window.__skillMenuData || {}),
    open: false,
    message: '',
    seq: Date.now(),
  };
  window.__rebuildCefWidgets();
};

window.__closeHousingMenuLocally = function () {
  window.__housingData = {
    ...(window.__housingData || {}),
    open: false,
    message: '',
    error: '',
    seq: Date.now(),
  };
  window.__rebuildCefWidgets();
};

window.__skillMenuApply = function (data) {
  applyPanelState('__skillMenuData', data);
  window.__rebuildCefWidgets();
};

window.__housingApply = function (data) {
  applyPanelState('__housingData', data);
  window.__rebuildCefWidgets();
};

window.__adminApplyPanel = function (data) {
  applyPanelState('__adminPanelData', data);
  window.__rebuildCefWidgets();
};

window.__itemTransferApply = function (data) {
  applyPanelState('__itemTransferData', data);
  window.__rebuildCefWidgets();
};

window.__animWheelApply = function (data) {
  applyPanelState('__animWheelData', data);
  window.__rebuildCefWidgets();
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App elem={window.skyrimPlatform.widgets.get()} />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);

window.scrollToLastMessage = () => {
  const _list = document.querySelector('#chat > .chat-main > .list > .chat-list');
  if (_list != null && window.needToScroll) {
    _list.scrollTop = _list.offsetHeight * _list.offsetHeight;
  }
};

window.playSound = (name) => {
  new Audio(require('./sound/' + name).default).play();
};

if (window.skyrimPlatform?.sendMessage) {
  window.skyrimPlatform.sendMessage('front-loaded');
}
