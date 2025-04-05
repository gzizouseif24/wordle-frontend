import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <h1 className="title">Wordle بالعربي</h1>
      <div className="subtitle">احصل على 6 محاولات لتخمين كلمة من 5 أحرف</div>
    </header>
  );
}

export default Header;