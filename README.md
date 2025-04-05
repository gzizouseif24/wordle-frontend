# طلع الكلمة (Talaa Alkalima)

An Arabic language Wordle clone built with React. This game challenges players to guess a 5-letter Arabic word within six attempts.

## Features

- Arabic language word-guessing game with 5-letter words
- Right-to-left (RTL) layout optimized for Arabic text
- Deep blue color theme throughout the UI
- Visual feedback for letter guesses (correct, present, absent)
- Game statistics tracking using localStorage
- Responsive design for both mobile and desktop play

## How to Play

1. Try to guess the hidden 5-letter Arabic word in six attempts
2. After each guess, the tiles will change color to show how close your guess was:
   - Green: The letter is correct and in the right position
   - Orange: The letter is in the word but in the wrong position
   - Gray: The letter is not in the word
3. Use the on-screen Arabic keyboard to enter your guesses

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Future Enhancements

- Additional hard modes with 6 and 7-letter words
- Daily word challenges
- Result sharing functionality
- Expanded word database

## Technologies Used

- React
- HTML/CSS
- localStorage for game statistics
- Arabic fonts (Tajawal, Amiri)