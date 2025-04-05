import React from 'react';
import './HowToPlay.css';

function HowToPlay({ onClose }) {
  return (
    <div className="how-to-play-overlay" onClick={onClose}>
      <div className="how-to-play-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="how-to-play-title">كيفية اللعب</h2>
        
        <p className="how-to-play-instruction">خمن الكلمة في 6 محاولات.</p>
        
        <ul className="how-to-play-rules">
          <li>كل تخمين يجب أن يكون كلمة صحيحة من 5 أحرف.</li>
          <li>سيتغير لون المربعات ليظهر مدى قرب تخمينك من الكلمة.</li>
        </ul>
        
        <div className="how-to-play-examples">
          <h3>أمثلة</h3>
          
          <div className="example">
            <div className="example-row">
              <div className="example-tile correct">ك</div>
              <div className="example-tile">ت</div>
              <div className="example-tile">ا</div>
              <div className="example-tile">ب</div>
              <div className="example-tile">ي</div>
            </div>
            <p>الحرف ك موجود في الكلمة وفي المكان الصحيح.</p>
          </div>
          
          <div className="example">
            <div className="example-row">
              <div className="example-tile">ق</div>
              <div className="example-tile present">ل</div>
              <div className="example-tile">م</div>
              <div className="example-tile">ه</div>
              <div className="example-tile">ا</div>
            </div>
            <p>الحرف ل موجود في الكلمة ولكن في المكان الخطأ.</p>
          </div>
          
          <div className="example">
            <div className="example-row">
              <div className="example-tile">س</div>
              <div className="example-tile">ج</div>
              <div className="example-tile absent">ا</div>
              <div className="example-tile">د</div>
              <div className="example-tile">ة</div>
            </div>
            <p>الحرف ا غير موجود في الكلمة.</p>
          </div>
        </div>
        
        <p className="how-to-play-daily">كلمة جديدة متاحة كل يوم!</p>
        
        <button className="how-to-play-close" onClick={onClose}>ابدأ اللعب</button>
      </div>
    </div>
  );
}

export default HowToPlay;