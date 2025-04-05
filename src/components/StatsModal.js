import React from 'react';
import './StatsModal.css';
import { getUserDailyWordKey } from '../utils/userUtils';

const StatsModal = ({ stats, onClose, dailyGameCompleted, onPlayAgain, onHome }) => {
  // Check if there are stats to display
  const hasStats = stats && stats.gamesPlayed > 0;
  
  // Calculate win percentage
  const winPercentage = hasStats ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  
  // Find the maximum value in the guess distribution for scaling
  const maxDistribution = hasStats ? Math.max(...stats.guessDistribution) : 0;
  
  // Get today's word to display after completion
  const dailyWord = localStorage.getItem(getUserDailyWordKey()) || "...";
  
  return (
    <div className="stats-modal-overlay">
      <div className="stats-modal">
        <div className="stats-header">
          <h2>الإحصائيات</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {/* Display daily word after completion */}
        {dailyGameCompleted && (
          <div className="daily-word-section">
            <h3>كلمة اليوم</h3>
            <p className="daily-word">{dailyWord}</p>
          </div>
        )}
        
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-value">{hasStats ? stats.gamesPlayed : 0}</div>
            <div className="stat-label">لعبت</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{winPercentage}</div>
            <div className="stat-label">% فزت</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{hasStats ? stats.currentStreak : 0}</div>
            <div className="stat-label">سلسلة الحالية</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{hasStats ? stats.maxStreak : 0}</div>
            <div className="stat-label">أفضل سلسلة</div>
          </div>
        </div>
        
        <div className="distribution-container">
          <h3>توزيع التخمينات</h3>
          {hasStats && (
            <div className="guess-distribution">
              {stats.guessDistribution.map((count, index) => (
                <div className="guess-row" key={index}>
                  <div className="guess-number">{index + 1}</div>
                  <div 
                    className="guess-bar" 
                    style={{ 
                      width: maxDistribution > 0 ? `${(count / maxDistribution) * 100}%` : '10%',
                      backgroundColor: count > 0 ? '#538d4e' : '#3a3a3c'
                    }}
                  >
                    <span className="guess-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Buttons for next actions */}
        <div className="stats-actions">
          {dailyGameCompleted && (
            <button className="play-again-button" onClick={onPlayAgain}>
              ألعب كلمات عشوائية
            </button>
          )}
          <button className="home-button" onClick={onHome}>
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;