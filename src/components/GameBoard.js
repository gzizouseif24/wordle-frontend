import React, { useEffect, useRef } from 'react';
import './GameBoard.css';

function GameBoard({ guesses, submittedGuesses, currentGuess, currentWord }) {
  // Create a 6x5 grid for standard mode (5-letter words)
  const rows = 6;
  const cols = 5;
  
  // Function to determine the state of each letter tile using the correct two-pass algorithm
  const getLetterState = (letter, position, word, guessWord) => {
    if (!letter) return '';

    const guessLetters = guessWord.split('');
    const solutionLetters = word.split('');
    const states = Array(guessLetters.length).fill('absent');
    const solutionLetterCounts = {};

    // Count frequency of each letter in the solution word
    for (const char of solutionLetters) {
      solutionLetterCounts[char] = (solutionLetterCounts[char] || 0) + 1;
    }

    // First pass: Mark exact matches ('correct') and decrement counts
    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === solutionLetters[i]) {
        states[i] = 'correct';
        if (solutionLetterCounts[guessLetters[i]]) {
          solutionLetterCounts[guessLetters[i]]--; // Decrement count for correct match
        }
      }
    }

    // Second pass: Mark partial matches ('present') and decrement counts
    for (let i = 0; i < guessLetters.length; i++) {
      // Only check letters that aren't already 'correct' and exist in the solution counts
      if (states[i] !== 'correct' && solutionLetterCounts[guessLetters[i]] > 0) {
          states[i] = 'present';
          solutionLetterCounts[guessLetters[i]]--; // Decrement count for present match
      }
    }

    return states[position];
  };

  // Generate the game board grid
  const renderBoard = () => {
    const board = [];
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      const guessWord = guesses[i] || '';
      
      for (let j = 0; j < cols; j++) {
        const letter = guessWord[j] || '';
        let state = '';
        
        // Only show letter states for submitted guesses (in the submittedGuesses array)
        if (submittedGuesses && submittedGuesses.includes(guessWord) && letter) {
          state = getLetterState(letter, j, currentWord, guessWord);
        }
        
        row.push(
          <div 
            key={`${i}-${j}`} 
            className={`tile ${state} ${letter ? 'filled' : ''}`}
          >
            {letter}
          </div>
        );
      }
      
      board.push(
        <div key={i} className="board-row">
          {row}
        </div>
      );
    }
    
    return board;
  };

  return (
    <div className="game-board">
      {renderBoard()}
    </div>
  );
}

export default GameBoard;