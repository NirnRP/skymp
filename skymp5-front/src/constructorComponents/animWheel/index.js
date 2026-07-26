import React, { useMemo } from 'react';
import './styles.scss';

const sendAction = (payload) => {
  const json = JSON.stringify(payload);
  if (window.skyrimPlatform?.sendMessage) {
    window.skyrimPlatform.sendMessage('cef::animWheel:action', json);
  } else if (window.mp?.send) {
    window.mp.send('cef::animWheel:action', json);
  }
};

const AnimWheelPanel = (props) => {
  const data = props.data || {};
  const anims = Array.isArray(data.anims) ? data.anims : [];
  const statusMessage = data.message || '';

  const grouped = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < anims.length; i++) {
      const a = anims[i];
      const cat = a.category || 'other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat).push(a);
    }
    return map;
  }, [anims]);

  if (!data.open) {
    return null;
  }

  return (
    <div className="anim-wheel" id="anim-wheel">
      <div className="anim-wheel__header">
        <span>Анимации</span>
        <button
          type="button"
          className="anim-wheel__close"
          onClick={() => sendAction({ action: 'close' })}
        >
          ×
        </button>
      </div>

      {statusMessage ? (
        <div className="anim-wheel__status">{statusMessage}</div>
      ) : null}

      <div className="anim-wheel__hint">F8 — закрыть · Esc — снять фокус CEF</div>

      <button type="button" className="anim-wheel__stop" onClick={() => sendAction({ action: 'stop' })}>
        Остановить анимацию
      </button>

      {Array.from(grouped.entries()).map(([cat, list]) => (
        <div key={cat} className="anim-wheel__group">
          <div className="anim-wheel__group-title">{cat}</div>
          <div className="anim-wheel__grid">
            {list.map((a) => (
              <button
                key={a.id}
                type="button"
                title={a.note || ''}
                onClick={() => sendAction({ action: 'play', animId: a.id })}
              >
                {a.name || a.id}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimWheelPanel;
