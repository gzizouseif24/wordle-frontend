import React from 'react';
import './StatsModal.css';
import { getUserDailyWordKey } from '../utils/userUtils';

function StatsModal({ onClose, stats, dailyGameCompleted, onPlayAgain, onHome }) {
  // Frontend-only app - only using local stats with user-specific ID

  const calculateMaxDistribution = () => {
    if (!stats || !stats.guessDistribution) return 1;
    return Math.max(...stats.guessDistribution, 1);
  };

  const displayStats = stats;

  // Loading state removed - frontend-only app uses local storage

  if (!displayStats) {
    return (
      <div className="stats-modal-overlay" onClick={onClose}>
        <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
          <h2 className="stats-modal-title">الإحصائيات</h2>
          <p>لا توجد إحصائيات متاحة حاليًا</p>
          <button className="stats-close-btn" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  const maxValue = calculateMaxDistribution();

  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="stats-modal-title">الإحصائيات</h2>
        
        <div className="stats-summary">
          <div className="stats-box">
            <div className="stats-value">{displayStats.gamesPlayed || 0}</div>
            <div className="stats-label">عدد الألعاب</div>
          </div>
          <div className="stats-box">
            <div className="stats-value">{displayStats.gamesWon || 0}</div>
            <div className="stats-label">عدد الفوز</div>
          </div>
          <div className="stats-box">
            <div className="stats-value">
              {displayStats.gamesPlayed 
                ? `${Math.round((displayStats.gamesWon / displayStats.gamesPlayed) * 100)}%` 
                : '0%'
              }
            </div>
            <div className="stats-label">نسبة الفوز</div>
          </div>
          <div className="stats-box">
            <div className="stats-value">{displayStats.currentStreak || 0}</div>
            <div className="stats-label">سلسلة الفوز</div>
          </div>
        </div>
        
        <div className="stats-distribution">
          <h3>توزيع المحاولات</h3>
          {displayStats.guessDistribution && displayStats.guessDistribution.map((count, index) => (
            <div className="distribution-row" key={index}>
              <div className="guess-number">{index + 1}</div>
              <div className="guess-bar-container">
                <div 
                  className="guess-bar" 
                  style={{ 
                    width: `${(count / maxValue) * 100}%`,
                    backgroundColor: count > 0 ? '#4caf50' : '#1e3a5f'
                  }}
                >
                  {count > 0 && <span className="guess-count">{count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data source toggle removed - frontend-only app */}
        
        {dailyGameCompleted && (
          <div className="daily-completed-actions">
            <p>لقد أكملت لعبة اليوم!</p>
            {/* Always display the daily word when game is completed */}
            <p className="daily-word">كلمة اليوم: {
              (() => {
                try {
                  const storedWordData = localStorage.getItem(getUserDailyWordKey());
                  return storedWordData ? JSON.parse(storedWordData).word : "";
                } catch (error) {
                  console.error("Error parsing daily word:", error);
                  return "";
                }
              })()
            }</p>
            <button className="play-random-btn" onClick={onPlayAgain}>
              العب كلمة عشوائية
            </button>
          </div>
        )}
        
        <div className="stats-modal-buttons">
          <button className="stats-home-btn" onClick={onHome}>
            الصفحة الرئيسية
          </button>
          <button className="stats-close-btn" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatsModal;