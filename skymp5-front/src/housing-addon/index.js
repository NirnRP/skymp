import React from 'react';
import { createRoot } from 'react-dom/client';
import HousingMenuPanel from '../constructorComponents/housingMenu';

/** Отдельный бандл: не трогает build.js и виджеты других плагинов. */
const MOUNT_ID = 'skymp-housing-addon-root';

let mountEl = null;
let reactRoot = null;

function renderHousing(data) {
  if (!mountEl) {
    mountEl = document.createElement('div');
    mountEl.id = MOUNT_ID;
    document.body.appendChild(mountEl);
  }
  if (!reactRoot) {
    reactRoot = createRoot(mountEl);
  }
  if (!data || !data.open) {
    reactRoot.render(null);
    return;
  }
  reactRoot.render(<HousingMenuPanel data={data} />);
}

function installHousingUi() {
  if (window.__skympHousingAddonInstalled) {
    return;
  }
  window.__skympHousingAddonInstalled = true;

  window.__housingData = window.__housingData || { open: false };

  const previousApply =
    typeof window.__housingApply === 'function' ? window.__housingApply : null;

  window.__housingApply = function applyHousing(data) {
    const next = data || { open: false };
    window.__housingData = next;
    renderHousing(next);
    if (previousApply && previousApply !== window.__housingApply) {
      try {
        previousApply(next);
      } catch (e) {
        console.error('[housing-addon]', e);
      }
    }
  };

  window.__closeHousingMenuLocally = function closeHousingMenuLocally() {
    window.__housingApply({
      ...(window.__housingData || {}),
      open: false,
      message: '',
      error: '',
      seq: Date.now(),
    });
  };

  if (window.__housingData.open) {
    renderHousing(window.__housingData);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installHousingUi);
} else {
  installHousingUi();
}
