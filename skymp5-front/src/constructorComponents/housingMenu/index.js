import React from 'react';
import './styles.scss';

const sendAction = (payload) => {
  const json = JSON.stringify(payload);
  if (window.skyrimPlatform?.sendMessage) {
    window.skyrimPlatform.sendMessage('cef::housing:action', json);
  } else if (window.mp?.send) {
    window.mp.send('cef::housing:action', json);
  }
};

const closeMenuLocally = () => {
  if (typeof window.__closeHousingMenuLocally === 'function') {
    window.__closeHousingMenuLocally();
  }
};

const HousingMenuPanel = ({ data }) => {
  const ui = data || {};
  if (ui.open !== true) {
    return null;
  }
  const propertyId = ui.propertyId || '';
  const accessPointId = ui.accessPointId || '';
  const owner = !!ui.owner;
  const canAccess = !!ui.canAccess;
  const options = Array.isArray(ui.options) ? ui.options : [];
  const nearbyPlayers = Array.isArray(ui.nearbyPlayers) ? ui.nearbyPlayers : [];
  const residents = Array.isArray(ui.residents) ? ui.residents : [];

  const act = (action, extra) => {
    sendAction({
      action,
      propertyId,
      accessPointId,
      ...(extra || {}),
    });
  };

  const closeMenu = () => {
    sendAction({ action: 'closeUi', propertyId, accessPointId });
    closeMenuLocally();
  };

  return (
    <div className="housing-menu" id="housing-menu">
      <div className="housing-menu__header">
        <span>Дом и ключи</span>
        <button type="button" className="housing-menu__close" onClick={closeMenu}>
          ×
        </button>
      </div>

      {ui.error ? <div className="housing-menu__error">{ui.error}</div> : null}
      {ui.message ? <div className="housing-menu__status">{ui.message}</div> : null}

      <div className="housing-menu__meta">
        <div>property: <strong>{propertyId || '—'}</strong></div>
        <div>mode: <strong>{ui.mode || 'closed'}</strong></div>
        <div>owner: <strong>{owner ? 'yes' : 'no'}</strong></div>
        <div>access: <strong>{canAccess ? 'allow' : 'deny'}</strong></div>
      </div>

      <div className="housing-menu__actions">
        {options.includes('enter') && (
          <button type="button" onClick={() => act('enter')}>
            Войти
          </button>
        )}
        {options.includes('open') && (
          <button type="button" onClick={() => act('open')}>
            Открыть
          </button>
        )}
        {options.includes('close') && (
          <button type="button" onClick={() => act('close')}>
            Закрыть
          </button>
        )}
        {options.includes('rent') && (
          <button type="button" onClick={() => act('rent')}>
            Взять в аренду
          </button>
        )}
        {options.includes('buy') && (
          <button type="button" onClick={() => act('buy')}>
            Купить землю
          </button>
        )}
        {options.includes('addResident') && nearbyPlayers.length > 0 && (
          <button
            type="button"
            onClick={() => act('addResident', { targetProfileId: nearbyPlayers[0].profileId })}
          >
            Прописать ближайшего
          </button>
        )}
        {options.includes('removeResident') && residents.length > 0 && (
          <button
            type="button"
            onClick={() => act('removeResident', { targetProfileId: residents[0] })}
          >
            Выселить первого жителя
          </button>
        )}
      </div>

      {owner ? (
        <div className="housing-menu__lists">
          <div className="housing-menu__list">
            <div className="housing-menu__list-title">Игроки рядом</div>
            {nearbyPlayers.length === 0 ? (
              <div className="housing-menu__muted">Никого рядом</div>
            ) : (
              nearbyPlayers.map((p) => (
                <div key={p.actorId} className="housing-menu__row">
                  <span>{p.name} (profile {p.profileId})</span>
                  <div className="housing-menu__row-buttons">
                    <button
                      type="button"
                      onClick={() => act('addResident', { targetProfileId: p.profileId })}
                    >
                      Житель
                    </button>
                    <button
                      type="button"
                      onClick={() => act('grantKey', { targetActorId: p.actorId })}
                    >
                      Ключ
                    </button>
                    <button
                      type="button"
                      onClick={() => act('revokeKey', { targetActorId: p.actorId })}
                    >
                      Забрать ключ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="housing-menu__list">
            <div className="housing-menu__list-title">Жители</div>
            {residents.length === 0 ? (
              <div className="housing-menu__muted">Список пуст</div>
            ) : (
              residents.map((profileId) => (
                <div key={profileId} className="housing-menu__row">
                  <span>Profile {profileId}</span>
                  <button
                    type="button"
                    onClick={() => act('removeResident', { targetProfileId: profileId })}
                  >
                    Выселить
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HousingMenuPanel;
