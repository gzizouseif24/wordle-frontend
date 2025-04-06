import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import HomePage from './components/HomePage';
import HowToPlay from './components/HowToPlay';
import Footer from './components/Footer';
import StatsModal from './components/StatsModal';
import Header from './components/Header';
import { wordList } from './data/words';
import config from './config';
import { getUserLastPlayedKey, getUserCurrentWordKey, getUserDailyWordKey, getUserStats, updateGameStats } from './utils/userUtils';

// --- DEBUG --- Set this to a 5-letter Arabic string to force the first word, or null for daily word
const DEBUG_INITIAL_WORD = null; 
// ------------- //

function App() {
  const [currentWord, setCurrentWord] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [submittedGuesses, setSubmittedGuesses] = useState([]);
  const [showHomePage, setShowHomePage] = useState(true); // Show home page by default
  const [showHowToPlay, setShowHowToPlay] = useState(false); // How to play popup
  // Authentication removed - frontend only app
  const [showStatsModal, setShowStatsModal] = useState(false); // Stats modal
  // User state removed - frontend only app
  const [dailyGameCompleted, setDailyGameCompleted] = useState(false); // Track if daily game is completed
  const [isRandomMode, setIsRandomMode] = useState(false); // New state for random word mode
  
  // Check if daily game is completed and reset for testing if needed
  useEffect(() => {
    // For testing: Reset localStorage to treat as new user when requested
    const resetForTesting = false; // Set to false to preserve localStorage
    
    if (resetForTesting) {
      // Clear all game-related localStorage items
      localStorage.removeItem(getUserLastPlayedKey());
      localStorage.removeItem(getUserCurrentWordKey());
      localStorage.removeItem(getUserDailyWordKey());
      // Don't clear stats to preserve them between sessions
      // localStorage.removeItem(getUserStats());
    }
    
    // Check if today's game is already completed
    checkDailyGameStatus();
  }, []);
  
  // Function to check if today's game has been completed
   const checkDailyGameStatus = () => {
    const lastPlayedData = localStorage.getItem(getUserLastPlayedKey());
    
    if (lastPlayedData) {
      const { date, completed } = JSON.parse(lastPlayedData);
      const today = new Date().toDateString();
      
      if (date === today && completed) {
        setDailyGameCompleted(true);
        // Do not auto-show stats when user opens the app
        // This ensures the stats modal doesn't appear automatically
      }
    }
    
    // Check if there's a saved current word in localStorage
    const savedWord = localStorage.getItem(getUserCurrentWordKey());
    if (savedWord) {
      setCurrentWord(savedWord);
    }
  };

  // Use useCallback to memoize the handleKeyPress function
  const handleKeyPress = useCallback((letter) => {
    if (gameOver) return;
    if (dailyGameCompleted && !isRandomMode) return;
    
    const currentGuessWord = guesses[currentGuess];
    
    if (letter === 'ENTER') {
      if (currentGuessWord.length !== 5) {
        setModalContent('الكلمة يجب أن تكون 5 أحرف');
        setShowModal(true);
        return;
      }
      
      // Check if word exists in dictionary
      if (!wordList.includes(currentGuessWord)) {
        // Don't show any error message, just silently accept the word for testing
        // setModalContent('الكلمة غير موجودة في القاموس');
        // setShowModal(true);
        // return;
      }
      
      // Add this guess to the submitted guesses array
      const newSubmittedGuesses = [...submittedGuesses, currentGuessWord];
      setSubmittedGuesses(newSubmittedGuesses);
      
      // Check if the guess is correct
      if (currentGuessWord === currentWord) {
        setGameOver(true);
        setModalContent(isRandomMode ? `أحسنت! الكلمة هي "${currentWord}"، جاهز للكلمة التالية؟` : `أحسنت! الكلمة هي "${currentWord}"، لقد فزت`);
        setShowModal(true);
        saveGameStats(true, currentGuess + 1);
        
        // Mark daily game as completed if not in random mode
        if (!isRandomMode) {
          markDailyGameCompleted();
        }
      } else if (currentGuess === 5) {
        setGameOver(true);
        setModalContent(`انتهت اللعبة! الكلمة كانت ${currentWord}`);
        setShowModal(true);
        saveGameStats(false, 0);
        
        // Mark daily game as completed if not in random mode
        if (!isRandomMode) {
          markDailyGameCompleted();
        }
      } else {
        setCurrentGuess(currentGuess + 1);
      }
    } else if (letter === 'DELETE') {
      if (currentGuessWord.length > 0) {
        const newGuesses = [...guesses];
        newGuesses[currentGuess] = currentGuessWord.slice(0, -1);
        setGuesses(newGuesses);
      }
    } else {
      if (currentGuessWord.length < 5) {
        const newGuesses = [...guesses];
        newGuesses[currentGuess] = currentGuessWord + letter;
        setGuesses(newGuesses);
      }
    }
  }, [currentGuess, currentWord, gameOver, guesses, submittedGuesses, dailyGameCompleted, isRandomMode]);
  
  // Mark today's game as completed
  const markDailyGameCompleted = () => {
    const today = new Date().toDateString();
    localStorage.setItem(getUserLastPlayedKey(), JSON.stringify({
      date: today,
      completed: true
    }));
    setDailyGameCompleted(true);
  };
  
  // We no longer initialize the game on component mount
  // Instead, we initialize it when the user closes the how-to-play popup
  
  // Add an effect to handle the keyboard input that depends on the current game state
  useEffect(() => {
    const handlePhysicalKeyboard = (event) => {
      // Skip handling if the focus is on an input field
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
      ) {
        return; // Allow normal input behavior in form fields
      }
      
      // Prevent default behavior to avoid conflicts with the browser's handling
      event.preventDefault();
      
      // Map physical keyboard keys to our virtual keyboard
      if (event.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (event.key === 'Backspace') {
        handleKeyPress('DELETE');
      } else {
        // Check if the key is an Arabic letter - using a more comprehensive approach
        // This includes all standard Arabic characters and special forms
        const arabicLetters = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويءؤئةىآإأ';
        // Normalize the key to handle different keyboard layouts
        if (event.key) {  // Add check to ensure event.key exists
          const normalizedKey = event.key.normalize('NFC');
          
          if (arabicLetters.includes(normalizedKey)) {
            handleKeyPress(normalizedKey);
          }
        }
      }
    };
    
    // Add event listener for keyboard input
    window.addEventListener('keydown', handlePhysicalKeyboard);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyboard);
    };
  }, [guesses, currentGuess, gameOver, currentWord, handleKeyPress, dailyGameCompleted, isRandomMode]);
  
  // Save game statistics to localStorage with user-specific ID
  const saveGameStats = (won, attempts) => {
    // Use the utility function to update game stats
    updateGameStats(won, attempts);
  };

  // Server-side saving removed - frontend only app

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    
    // If game is over, show stats for daily game or start new random game
    if (gameOver) {
      if (isRandomMode) {
        // For random mode, offer another random game
        startRandomGame();
      } else {
        // For daily game, show stats
        setShowStatsModal(true);
      }
    }
  };
  
  // Start a new random game
  const startRandomGame = () => {
    // Reset game state
    setGuesses(Array(6).fill(''));
    setCurrentGuess(0);
    setGameOver(false);
    setSubmittedGuesses([]);
    setIsRandomMode(true);
    
    // Select a random word from our local list
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex];
    setCurrentWord(randomWord);
    
    // Store the current word in localStorage for persistence with user-specific ID
    localStorage.setItem(getUserCurrentWordKey(), randomWord);
    
    // Close any open modals
    setShowStatsModal(false);
    setShowHowToPlay(false);
  };

  // Start the game from home page
  const handleStartGame = () => {
    // If today's game is already completed, give option to play random words
    if (dailyGameCompleted) {
      setShowHomePage(false);
      setShowStatsModal(true);
    } else {
      setShowHomePage(false);
      setShowHowToPlay(true);
    }
  };
  
  // Function to initialize a new daily word
  const generateDailyWord = () => {
    // First check if DEBUG_INITIAL_WORD is set
    if (DEBUG_INITIAL_WORD) {
      console.log('DEBUG MODE: Using hardcoded initial word');
      setCurrentWord(DEBUG_INITIAL_WORD);
      localStorage.setItem(getUserCurrentWordKey(), DEBUG_INITIAL_WORD);
      return;
    }
    
    // Get today's date in a consistent format
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Check if we already have the word for today in localStorage
    const lastPlayedData = localStorage.getItem(getUserLastPlayedKey());
    const savedDailyWord = localStorage.getItem(getUserDailyWordKey());
    
    // If we have data from last played game
    if (lastPlayedData) {
      try {
        const parsedData = JSON.parse(lastPlayedData);
        const lastPlayedDate = new Date(parsedData.date).toDateString();
        const todayString = today.toDateString();
        
        // If it's the same day and we have a saved word, use that
        if (lastPlayedDate === todayString && savedDailyWord) {
          setCurrentWord(savedDailyWord);
          localStorage.setItem(getUserCurrentWordKey(), savedDailyWord);
          return;
        }
      } catch (error) {
        console.error("Error parsing last played data:", error);
        // Continue to generate a new word if there's an error
      }
    }
    
    // Simple hash function to convert date string to a number
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the hash to select a word from the list (abs to ensure positive)
    const index = Math.abs(hash) % wordList.length;
    const wordOfTheDay = wordList[index];
    
    // Save daily word in localStorage
    localStorage.setItem(getUserDailyWordKey(), wordOfTheDay);
    localStorage.setItem(getUserCurrentWordKey(), wordOfTheDay);
    setCurrentWord(wordOfTheDay);
    
    // Also update last played date
    localStorage.setItem(getUserLastPlayedKey(), JSON.stringify({
      date: today.toDateString(),
      completed: false
    }));
  };
  
  // Handle Play Random Words button click
  const handlePlayRandomWords = () => {
    setShowStatsModal(false);
    startRandomGame();
  };
  
  // Reset to home page
  const handleGoHome = () => {
    setShowHomePage(true);
    setGameOver(false);
    setIsRandomMode(false);
    setShowStatsModal(false);
  };
  
  // Authentication functions removed - frontend only app
  
  // Show stats modal
  const handleShowStats = () => {
    setShowStatsModal(true);
    // Make sure to get the current daily word when showing stats
    const storedWordData = localStorage.getItem(getUserDailyWordKey());
    if (storedWordData) {
      // This ensures the daily word is available in the stats modal
      console.log('Daily word data loaded for stats');
    }
  };
  
  // Close stats modal
  const handleCloseStats = () => {
    setShowStatsModal(false);
  };
  
  // Get local game stats with user-specific ID
  const getLocalStats = () => {
    // Use the utility function to get user-specific stats
    return getUserStats();
  };
  
  // Close the how-to-play popup and start the game
  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    
    // Reset game state
    setGuesses(Array(6).fill(''));
    setCurrentGuess(0);
    setGameOver(false);
    setSubmittedGuesses([]);
    
    // Set to daily game mode (not random)
    setIsRandomMode(false);
    
    // Generate a new daily word
    generateDailyWord();
  };
  
  return (
    <div className="app-container">
      {/* Show Header only on stats modal and how to play screens, not on home page */}
      {(!showHomePage && (showStatsModal || showHowToPlay)) && <Header onShowStats={handleShowStats} />}
      
      {showHomePage ? (
        <>
          <HomePage 
            onStartGame={handleStartGame} 
            onShowStats={handleShowStats}
            hasStats={!!localStorage.getItem(getUserStats()) && JSON.parse(localStorage.getItem(getUserStats() || '{}'))?.gamesPlayed > 0}
          />
          <Footer />
        </>
      ) : (
        <>
          <div style={{ position: 'relative', width: '100%' }}>
            <GameBoard 
              guesses={guesses} 
              currentGuess={currentGuess} 
              currentWord={currentWord}
              submittedGuesses={submittedGuesses}
            />
            
            {/* Stats button below game board but attached to it */}
            <div className="game-stats-button-container">
              <button className="game-stats-button" onClick={handleShowStats}>
                الإحصائيات
              </button>
            </div>
          </div>
          
          <Keyboard 
            onKeyPress={handleKeyPress} 
            submittedGuesses={submittedGuesses}
            currentWord={currentWord}
          />
        </>
      )}
      
      {/* Footer removed from game screen, kept only on home page */}
      
      {showModal && (
        <Modal content={modalContent} onClose={closeModal} gameOver={gameOver} />
      )}
      
      {showHowToPlay && (
        <HowToPlay onClose={handleCloseHowToPlay} />
      )}
      
      {showStatsModal && (
        <StatsModal 
          onClose={handleCloseStats}
          stats={getLocalStats()}
          dailyGameCompleted={dailyGameCompleted}
          onPlayAgain={handlePlayRandomWords}
          onHome={handleGoHome}
        />
      )}
    </div>
  );
}

export default App;