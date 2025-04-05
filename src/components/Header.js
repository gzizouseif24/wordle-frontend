import React from 'react';
import './Header.css';

function Header({ onShowStats }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="stats-button" onClick={onShowStats}>
          الإحصائيات
        </button>
      </div>
      
      <div className="header-center">
        <h1>Wordle بالعربي</h1>
      </div>
      
      <div className="header-right">
        {/* Authentication UI removed - frontend-only app */}
      </div>
    </header>
  );
}

export default Header;