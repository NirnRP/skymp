import React, { useState, useEffect } from 'react';
import './styles.scss';

const sendAction = (payload) => {
  const json = JSON.stringify(payload);
  if (window.skyrimPlatform?.sendMessage) {
    window.skyrimPlatform.sendMessage('cef::itemTransfer:action', json);
  } else if (window.mp?.send) {
    window.mp.send('cef::itemTransfer:action', json);
  }
};

const ItemTransferPanel = (props) => {
  const data = props.data || {};
  const mode = data.mode || '';
  const items = Array.isArray(data.items) ? data.items : [];
  const partnerName = data.partnerName || 'Игрок';
  const incoming = data.incomingRequest || null;
  const statusMessage = data.message || '';

  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (items.length && !selectedBaseId) {
      setSelectedBaseId(items[0].baseId || '');
    }
  }, [items, selectedBaseId]);

  if (!data.open) {
    return null;
  }

  if (mode === 'receive' && incoming) {
    return (
      <div className="item-transfer" id="item-transfer">
        <div className="item-transfer__header">
          <span>Запрос передачи</span>
          <button
            type="button"
            className="item-transfer__close"
            onClick={() =>
              sendAction({
                action: 'closeReceive',
                requestId: incoming.requestId,
              })
            }
          >
            ×
          </button>
        </div>
        {statusMessage ? (
          <div className="item-transfer__status">{statusMessage}</div>
        ) : null}
        <p className="item-transfer__offer">
          <strong>{incoming.fromName}</strong> предлагает{' '}
          <strong>
            {incoming.itemName} ×{incoming.count}
          </strong>
        </p>
        <div className="item-transfer__actions">
          <button
            type="button"
            onClick={() =>
              sendAction({
                action: 'acceptIncoming',
                requestId: incoming.requestId,
              })
            }
          >
            Принять
          </button>
          <button
            type="button"
            onClick={() =>
              sendAction({
                action: 'rejectIncoming',
                requestId: incoming.requestId,
              })
            }
          >
            Отклонить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-transfer" id="item-transfer">
      <div className="item-transfer__header">
        <span>Передача → {partnerName}</span>
        <button
          type="button"
          className="item-transfer__close"
          onClick={() => sendAction({ action: 'close' })}
        >
          ×
        </button>
      </div>

      {statusMessage ? (
        <div className="item-transfer__status">{statusMessage}</div>
      ) : null}

      {data.pendingRequestId ? (
        <div className="item-transfer__pending">
          Ожидание ответа…{' '}
          <button type="button" onClick={() => sendAction({ action: 'cancelOffer' })}>
            Отменить запрос
          </button>
        </div>
      ) : null}

      <label className="item-transfer__label">Предмет</label>
      <select
        value={selectedBaseId}
        onChange={(e) => setSelectedBaseId(e.target.value)}
        disabled={!items.length}
      >
        {items.map((it) => (
          <option key={it.baseId} value={it.baseId}>
            {it.name} (×{it.count})
          </option>
        ))}
      </select>

      <label className="item-transfer__label">Количество</label>
      <input
        type="number"
        min={1}
        value={count}
        onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
      />

      <div className="item-transfer__actions">
        <button
          type="button"
          disabled={!selectedBaseId || !!data.pendingRequestId}
          onClick={() =>
            sendAction({
              action: 'offer',
              baseId: selectedBaseId,
              count,
            })
          }
        >
          Предложить передачу
        </button>
        <button type="button" onClick={() => sendAction({ action: 'refresh' })}>
          Обновить список
        </button>
      </div>
    </div>
  );
};

export default ItemTransferPanel;
