import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="copyright">
          © {currentYear} طلع الكلمة | جميع الحقوق محفوظة
        </div>
        <div className="footer-links">
          <span>سيف قزيزو</span>
          <span className="separator">|</span>
          <span>الإصدار 1.0</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;