import React from 'react';
import './HomePage.css';

function HomePage({ onStartGame }) {
  // Get current date
  const currentDate = new Date();
  
  // Format date in Arabic
  const formattedDate = currentDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate puzzle number (days since January 1, 2022 - when original Wordle launched)
  const startDate = new Date(2022, 0, 1); // January 1, 2022
  const timeDiff = currentDate.getTime() - startDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  const puzzleNumber = dayDiff + 1; // +1 because puzzle #1 was on day 1

  return (
    <div className="home-page">
      <div className="logo-container">
        <div className="wordle-logo">
          <div className="logo-grid">
            <div className="logo-row">
              <div className="logo-tile"></div>
              <div className="logo-tile"></div>
              <div className="logo-tile"></div>
            </div>
            <div className="logo-row">
              <div className="logo-tile"></div>
              <div className="logo-tile correct"></div>
              <div className="logo-tile"></div>
            </div>
            <div className="logo-row">
              <div className="logo-tile"></div>
              <div className="logo-tile"></div>
              <div className="logo-tile present"></div>
            </div>
          </div>
        </div>
      </div>
      
      <h1 className="home-title">Wordle بالعربي</h1>
      <p className="home-subtitle">احصل على 6 محاولات لتخمين كلمة من 5 أحرف</p>
      
      <button className="play-button" onClick={onStartGame}>العب</button>
      
      <div className="game-info">
        <p className="date">{formattedDate}</p>
        <p className="puzzle-number">رقم اللغز: {puzzleNumber}</p>
        <p className="author-name">سيف قزيزو</p>
      </div>
    </div>
  );
}

export default HomePage;