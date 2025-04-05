import React, { useEffect, useState } from 'react';
import './StatsModal.css';
import config from '../config';

function StatsModal({ onClose, stats, dailyGameCompleted, onPlayAgain, onHome }) {
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('local'); // 'local' or 'server'

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('wordleToken');
    if (token) {
      fetchServerStats(token);
    }
  }, []);

  const fetchServerStats = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في جلب الإحصائيات');
      }

      const data = await response.json();
      setServerStats(data);
      setDataSource('server');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('فشل في جلب الإحصائيات من الخادم');
      setLoading(false);
    }
  };

  const toggleDataSource = () => {
    setDataSource(dataSource === 'local' ? 'server' : 'local');
  };

  const calculateMaxDistribution = () => {
    const currentStats = dataSource === 'server' && serverStats ? serverStats : stats;
    if (!currentStats || !currentStats.guessDistribution) return 1;
    return Math.max(...currentStats.guessDistribution, 1);
  };

  const displayStats = dataSource === 'server' && serverStats ? serverStats : stats;

  if (loading && !displayStats) {
    return (
      <div className="stats-modal-overlay">
        <div className="stats-modal-content">
          <div className="loading">جاري التحميل...</div>
        </div>
      </div>
    );
  }

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
        
        {error && <div className="stats-error">{error}</div>}
        
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

        {localStorage.getItem('wordleToken') && serverStats && (
          <div className="data-source-toggle">
            <button 
              onClick={toggleDataSource} 
              className={`source-btn ${dataSource === 'local' ? 'active' : ''}`}
            >
              إحصائيات محلية
            </button>
            <button 
              onClick={toggleDataSource} 
              className={`source-btn ${dataSource === 'server' ? 'active' : ''}`}
            >
              إحصائيات الحساب
            </button>
          </div>
        )}
        
        {dailyGameCompleted && (
          <div className="daily-completed-actions">
            <p>لقد أكملت لعبة اليوم!</p>
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