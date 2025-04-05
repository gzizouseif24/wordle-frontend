import React from 'react';
import './Keyboard.css';

function Keyboard({ onKeyPress, submittedGuesses, currentWord }) {
  // Arabic keyboard layout
  const keyboardRows = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'أ', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ذ'],
    ['DELETE', 'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'ENTER']
  ];

  // Function to determine the state of each key based on guesses using the correct two-pass algorithm
  const getKeyState = (key) => {
    if (key === 'ENTER' || key === 'DELETE') return '';
    if (!submittedGuesses || submittedGuesses.length === 0) return '';
    
    // Track the best state for each key (correct > present > absent)
    let bestState = '';
    
    for (const guess of submittedGuesses) {
      // Create a copy of the target word to track which letters are available for matching
      const wordLetters = currentWord.split('');
      const guessLetters = guess.split('');
      const states = Array(guessLetters.length).fill('absent');
      
      // First pass: Mark exact matches (correct position)
      for (let i = 0; i < guessLetters.length; i++) {
        if (guessLetters[i] === wordLetters[i]) {
          states[i] = 'correct';
          wordLetters[i] = '*'; // Mark as used
        }
      }
      
      // Second pass: Mark partial matches (correct letter, wrong position)
      for (let i = 0; i < guessLetters.length; i++) {
        if (states[i] !== 'correct') { // Skip already matched positions
          const letterIndex = wordLetters.indexOf(guessLetters[i]);
          if (letterIndex !== -1) {
            states[i] = 'present';
            wordLetters[letterIndex] = '*'; // Mark as used
          }
        }
      }
      
      // Update the best state for this key based on this guess
      for (let i = 0; i < guessLetters.length; i++) {
        if (guessLetters[i] === key) {
          const keyState = states[i];
          if (keyState === 'correct') {
            return 'correct'; // Correct is the best possible state, return immediately
          } else if (keyState === 'present' && bestState !== 'correct') {
            bestState = 'present';
          } else if (keyState === 'absent' && bestState === '') {
            bestState = 'absent';
          }
        }
      }
    }
    
    return bestState;
  };

  return (
    <div className="keyboard">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const keyState = getKeyState(key);
            return (
              <button
                key={key}
                className={`keyboard-key ${keyState} ${key === 'ENTER' || key === 'DELETE' ? 'special-key' : ''}`}
                onClick={() => onKeyPress(key)}
              >
                {key === 'DELETE' ? '⌫' : key === 'ENTER' ? 'إدخال' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;