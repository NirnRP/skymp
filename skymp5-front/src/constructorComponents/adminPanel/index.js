import React, { useState, useEffect } from 'react';
import './styles.scss';

const sendAction = (payload) => {
  const json = JSON.stringify(payload);
  if (window.skyrimPlatform?.sendMessage) {
    window.skyrimPlatform.sendMessage('cef::admin:action', json);
  } else if (window.mp?.send) {
    window.mp.send('cef::admin:action', json);
  }
};

const PRESETS = [
  { name: 'Золото', id: '0000000f' },
  { name: 'Отмычки', id: '0000000a' },
  { name: 'Зелье лечения', id: '0003eae3' },
];

const AdminPanel = (props) => {
  const data = props.data || {};
  const players = Array.isArray(data.players) ? data.players : [];
  const [selectedUserId, setSelectedUserId] = useState(
    players.length ? players[0].userId : -1,
  );
  const [formId, setFormId] = useState('0000000f');
  const [itemCount, setItemCount] = useState(1);
  const [announceText, setAnnounceText] = useState('');
  const statusMessage = data.message || '';

  useEffect(() => {
    if (players.length && selectedUserId < 0) {
      setSelectedUserId(players[0].userId);
    }
  }, [players, selectedUserId]);

  if (!data.open) {
    return null;
  }

  const target = { targetUserId: selectedUserId };

  return (
    <div className="admin-panel" id="admin-panel">
      <div className="admin-panel__header">
        <span>Админ-панель</span>
        <button
          type="button"
          className="admin-panel__close"
          onClick={() => sendAction({ action: 'close' })}
        >
          ×
        </button>
      </div>

      {statusMessage ? (
        <div className="admin-panel__status">{statusMessage}</div>
      ) : null}

      <div className="admin-panel__section">
        <label>Игрок</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
        >
          {players.map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.name} (id {p.userId})
            </option>
          ))}
        </select>
        <button type="button" onClick={() => sendAction({ action: 'refresh' })}>
          Обновить список
        </button>
      </div>

      <div className="admin-panel__actions">
        <button type="button" onClick={() => sendAction({ action: 'tpToMe', ...target })}>
          ТП ко мне
        </button>
        <button type="button" onClick={() => sendAction({ action: 'tpToPlayer', ...target })}>
          ТП к игроку
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Кикнуть игрока?')) {
              sendAction({ action: 'kick', ...target });
            }
          }}
        >
          Кик
        </button>
      </div>

      <div className="admin-panel__section">
        <label>Выдача предмета (hex Form ID)</label>
        <div className="admin-panel__presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFormId(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <input
          value={formId}
          onChange={(e) => setFormId(e.target.value)}
          placeholder="0000000f"
        />
        <input
          type="number"
          min={1}
          value={itemCount}
          onChange={(e) => setItemCount(Number(e.target.value) || 1)}
        />
        <button
          type="button"
          onClick={() =>
            sendAction({
              action: 'giveItem',
              formId,
              count: itemCount,
              ...target,
            })
          }
        >
          Выдать
        </button>
      </div>

      <div className="admin-panel__section">
        <label>Объявление всем</label>
        <input
          value={announceText}
          onChange={(e) => setAnnounceText(e.target.value)}
          placeholder="Текст объявления"
        />
        <button
          type="button"
          onClick={() => sendAction({ action: 'announce', text: announceText })}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
