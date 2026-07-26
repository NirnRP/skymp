import React from 'react';
import './styles.scss';

const sendAction = (payload) => {
  const json = JSON.stringify(payload);
  if (window.skyrimPlatform?.sendMessage) {
    window.skyrimPlatform.sendMessage('cef::skillMenu:action', json);
  } else if (window.mp?.send) {
    window.mp.send('cef::skillMenu:action', json);
  }
};

const closeMenuLocally = () => {
  if (typeof window.__closeSkillMenuLocally === 'function') {
    window.__closeSkillMenuLocally();
  }
};

const formatMs = (ms) => {
  if (ms == null || ms < 0) {
    return '—';
  }
  const sec = Math.ceil(ms / 1000);
  if (sec >= 60) {
    return Math.ceil(sec / 60) + ' мин';
  }
  return sec + ' сек';
};

const SkillMenuPanel = (props) => {
  const data = props.data || {};
  if (data.open !== true) {
    return null;
  }
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const statusMessage = data.message || '';
  const xp = data.skillXp || data.blacksmith || {};
  const walletXp = xp.xp != null ? xp.xp : 0;
  const walletMax = xp.xpMax != null ? xp.xpMax : 100;
  const memSpent = xp.memorySpent != null ? xp.memorySpent : 0;
  const memBudget = xp.memoryBudgetMax != null ? xp.memoryBudgetMax : 100;
  const memLeft = xp.memoryRemaining != null ? xp.memoryRemaining : memBudget - memSpent;

  const learn = (skillId) => {
    sendAction({ action: 'learn', skillId });
    closeMenuLocally();
  };

  const resetSkills = () => {
    sendAction({ action: 'reset' });
    closeMenuLocally();
  };

  const closeMenu = () => {
    sendAction({ action: 'close' });
    closeMenuLocally();
  };

  return (
    <div className="skill-menu" id="skill-menu">
      <div className="skill-menu__header">
        <span>Навыки</span>
        <button type="button" className="skill-menu__close" onClick={closeMenu}>
          ×
        </button>
      </div>

      <div className="skill-menu__xp">
        <div className="skill-menu__xp-row">
          <span>Кошелёк опыта:</span>
          <strong>
            {walletXp} / {walletMax}
          </strong>
        </div>
        <div className="skill-menu__xp-row">
          <span>Память (потрачено / лимит):</span>
          <strong>
            {memSpent} / {memBudget}
          </strong>
          <span className="skill-menu__xp-hint">осталось {memLeft}</span>
        </div>
        {xp.nextGrantInMs != null ? (
          <div className="skill-menu__xp-row skill-menu__xp-hint">
            Следующие +{xp.xpPerExpPoint || 5} опыта через {formatMs(xp.nextGrantInMs)}
          </div>
        ) : null}
      </div>

      {statusMessage ? (
        <div className="skill-menu__status">{statusMessage}</div>
      ) : null}

      <div className="skill-menu__list">
        {skills.length === 0 ? (
          <div className="skill-menu__empty">Нет доступных навыков</div>
        ) : (
          skills.map((skill) => {
            const cost = skill.xpRequired != null ? skill.xpRequired : 0;
            const disabled = skill.available === false;
            return (
              <button
                key={skill.id || skill.name}
                type="button"
                className={
                  'skill-menu__item' + (disabled ? ' skill-menu__item--disabled' : '')
                }
                disabled={disabled}
                onClick={() => !disabled && learn(skill.id)}
                title={skill.description || skill.name}
              >
                <span className="skill-menu__item-name">{skill.name || skill.id}</span>
                {cost > 0 ? (
                  <span className="skill-menu__item-meta">
                    опыт {skill.xpCurrent != null ? skill.xpCurrent : walletXp} / нужно {cost}
                  </span>
                ) : null}
                {skill.description ? (
                  <span className="skill-menu__item-desc">{skill.description}</span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      <div className="skill-menu__footer">
        <button type="button" className="skill-menu__reset" onClick={resetSkills}>
          Сбросить все навыки
        </button>
        <div className="skill-menu__hint">F9 или /skills · × закрыть</div>
      </div>
    </div>
  );
};

export default SkillMenuPanel;
