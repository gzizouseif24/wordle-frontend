import React from 'react';
import './Modal.css';

function Modal({ content, onClose, gameOver }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-message">{content}</div>
        <div className="modal-buttons">
          <button className="modal-close" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;