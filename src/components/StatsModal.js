import React, { useEffect, useState } from 'react';
import './StatsModal.css';
import config from '../config';

function StatsModal({ onClose, localStats }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState('local'); // 'local' or 'server'

  useEffect(() => {
    // Set local stats initially
    if (localStats) {
      setStats(localStats);
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('wordleToken');
    if (token) {
      fetchServerStats(token);
    }
  }, [localStats]);

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
      setStats(data);
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
    if (!stats || !stats.guessDistribution) return 1;
    return Math.max(...stats.guessDistribution, 1);
  };

  if (loading) {
    return (
      <div className="stats-modal-overlay">
        <div className="stats-modal-content">
          <div className="loading">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
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
            <div className="stats-value">{stats.totalGames || 0}</div>
            <div className="stats-label">عدد الألعاب</div>
          </div>
          <div className="stats-box">
            <div className="stats-value">{stats.wins || 0}</div>
            <div className="stats-label">عدد الفوز</div>
          </div>
          <div className="stats-box">
            <div className="stats-value">{stats.winRate ? `${stats.winRate}%` : '0%'}</div>
            <div className="stats-label">نسبة الفوز</div>
          </div>
          <div className="stats-box">
            <div className="stats-value">{stats.averageAttempts || 0}</div>
            <div className="stats-label">متوسط المحاولات</div>
          </div>
        </div>
        
        <div className="stats-distribution">
          <h3>توزيع المحاولات</h3>
          {stats.guessDistribution && stats.guessDistribution.map((count, index) => (
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

        {localStorage.getItem('wordleToken') && (
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
        
        <button className="stats-close-btn" onClick={onClose}>
          إغلاق
        </button>
      </div>
    </div>
  );
}

export default StatsModal; 