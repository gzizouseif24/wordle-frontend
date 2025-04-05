import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Header from './components/Header';
import Modal from './components/Modal';
import HomePage from './components/HomePage';
import HowToPlay from './components/HowToPlay';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import StatsModal from './components/StatsModal';
import { wordList } from './data/words';
import config from './config';

// --- DEBUG --- Set this to a 5-letter Arabic string to force the first word, or null for random
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
  const [showAuthModal, setShowAuthModal] = useState(false); // Authentication modal
  const [showStatsModal, setShowStatsModal] = useState(false); // Stats modal
  const [user, setUser] = useState(null); // Logged-in user info
  const [dailyGameCompleted, setDailyGameCompleted] = useState(false); // Track if daily game is completed
  
  // Check if user is already logged in and if daily game is completed
  useEffect(() => {
    const storedUser = localStorage.getItem('wordleUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check if today's game is already completed
    checkDailyGameStatus();
  }, []);
  
  // Function to check if today's game has been completed
  const checkDailyGameStatus = () => {
    const lastPlayedData = localStorage.getItem('lastPlayed');
    
    if (lastPlayedData) {
      const { date, completed } = JSON.parse(lastPlayedData);
      const today = new Date().toDateString();
      
      if (date === today && completed) {
        setDailyGameCompleted(true);
        // Auto show stats if game was completed today
        setShowStatsModal(true);
      }
    }
  };

  // Use useCallback to memoize the handleKeyPress function
  const handleKeyPress = useCallback((letter) => {
    if (gameOver || dailyGameCompleted) return;
    
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
        setModalContent('أحسنت! لقد فزت');
        setShowModal(true);
        saveGameStats(true, currentGuess + 1);
        saveGameToServer(true, currentGuess + 1, newSubmittedGuesses);
        markDailyGameCompleted();
      } else if (currentGuess === 5) {
        setGameOver(true);
        setModalContent(`انتهت اللعبة! الكلمة كانت ${currentWord}`);
        setShowModal(true);
        saveGameStats(false, 0);
        saveGameToServer(false, 6, newSubmittedGuesses);
        markDailyGameCompleted();
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
  }, [currentGuess, currentWord, gameOver, guesses, submittedGuesses, dailyGameCompleted]); // Add dailyGameCompleted dependency
  
  // Mark today's game as completed
  const markDailyGameCompleted = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lastPlayed', JSON.stringify({
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
      // Skip handling if the focus is on an input field (for Auth modal)
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        showAuthModal  // Skip keyboard handling entirely if auth modal is open
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
  }, [guesses, currentGuess, gameOver, currentWord, showAuthModal, handleKeyPress, dailyGameCompleted]); // Include dailyGameCompleted
  
  // Save game statistics to localStorage
  const saveGameStats = (won, attempts) => {
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
    
    stats.gamesPlayed += 1;
    
    if (won) {
      stats.gamesWon += 1;
      stats.currentStreak += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.guessDistribution[attempts - 1] += 1;
    } else {
      stats.currentStreak = 0;
    }
    
    localStorage.setItem('gameStats', JSON.stringify(stats));
  };

  // Save game to server if user is logged in
  const saveGameToServer = async (won, attempts, guessesArray) => {
    const token = localStorage.getItem('wordleToken');
    if (!token) return; // Don't save if not logged in
    
    try {
      const response = await fetch(`${config.API_URL}/api/game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guesses: guessesArray,
          result: won ? 'win' : 'lose',
          attempts: attempts,
          word: currentWord
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save game to server');
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    
    // If game is over, show stats
    if (gameOver) {
      setShowStatsModal(true);
    }
  };
  
  // Handle Play Again button - Removed as we only want to play once per day
  // The handlePlayAgain function is now deleted since we don't want players to play multiple times

  // Start the game from home page
  const handleStartGame = () => {
    // If today's game is already completed, go directly to stats
    if (dailyGameCompleted) {
      setShowHomePage(false);
      setShowStatsModal(true);
    } else {
      setShowHomePage(false);
      setShowHowToPlay(true);
    }
  };

  // Close how to play and start the actual game
  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    
    // If today's game is already completed, show stats instead
    if (dailyGameCompleted) {
      setShowStatsModal(true);
      return;
    }
    
    // Initialize the game when starting from how-to-play
    let selectedWord;
    if (DEBUG_INITIAL_WORD && DEBUG_INITIAL_WORD.length === 5) { 
      selectedWord = DEBUG_INITIAL_WORD;
      console.log("Using debug initial word:", selectedWord); 
    } else {
      // Fallback to random word selection
      const randomIndex = Math.floor(Math.random() * wordList.length);
      selectedWord = wordList[randomIndex];
      console.log("Selected random word:", selectedWord); // Original log
    }
    setCurrentWord(selectedWord);
    
    // Reset game state
    setGuesses(Array(6).fill(''));
    setCurrentGuess(0);
    setGameOver(false);
    setSubmittedGuesses([]);
  };

  // Show the authentication modal
  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  // Close the authentication modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Handle successful login
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('wordleToken');
    localStorage.removeItem('wordleUser');
    setUser(null);
  };

  // Show stats modal
  const handleShowStats = () => {
    setShowStatsModal(true);
  };

  // Close stats modal
  const handleCloseStats = () => {
    setShowStatsModal(false);
  };

  // Get local stats from localStorage
  const getLocalStats = () => {
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {
      totalGames: 0,
      wins: 0,
      winRate: 0,
      averageAttempts: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
    
    if (stats.gamesPlayed > 0) {
      stats.totalGames = stats.gamesPlayed;
      stats.winRate = (stats.gamesWon / stats.gamesPlayed) * 100;
      
      // Calculate average attempts (if there are wins)
      if (stats.gamesWon > 0) {
        // Calculate total guesses from distribution
        const totalGuesses = stats.guessDistribution.reduce(
          (total, count, index) => total + count * (index + 1),
          0
        );
        stats.averageAttempts = totalGuesses / stats.gamesWon;
      }
    }
    
    return stats;
  };

  return (
    <div className="app" dir="rtl">
      {showHomePage ? (
        <HomePage onStartGame={handleStartGame} />
      ) : (
        <>
          <Header />
          <div className="user-controls">
            {user ? (
              <>
                <span className="welcome-message">مرحبًا {user.username}</span>
                <button className="stats-button" onClick={handleShowStats}>الإحصائيات</button>
                <button className="logout-button" onClick={handleLogout}>تسجيل الخروج</button>
              </>
            ) : (
              <>
                <button className="login-button" onClick={handleShowAuthModal}>تسجيل الدخول</button>
                <button className="stats-button" onClick={handleShowStats}>الإحصائيات</button>
              </>
            )}
          </div>
          {dailyGameCompleted ? (
            <div className="completed-message">
              <h2>لقد أكملت لعبة اليوم!</h2>
              <p>عد غدًا للعب مرة أخرى.</p>
              <button onClick={handleShowStats} className="show-stats-button">عرض الإحصائيات</button>
            </div>
          ) : (
            <>
              <GameBoard 
                guesses={guesses} 
                submittedGuesses={submittedGuesses}
                currentGuess={currentGuess} 
                currentWord={currentWord} 
              />
              <Keyboard 
                onKeyPress={handleKeyPress} 
                submittedGuesses={submittedGuesses} 
                currentWord={currentWord} 
              />
            </>
          )}
          <Footer />
          {showModal && <Modal content={modalContent} onClose={closeModal} gameOver={gameOver} />}
        </>
      )}
      {showHowToPlay && <HowToPlay onClose={handleCloseHowToPlay} />}
      {showAuthModal && <AuthModal onClose={handleCloseAuthModal} onLogin={handleLogin} />}
      {showStatsModal && <StatsModal onClose={handleCloseStats} localStats={getLocalStats()} />}
    </div>
  );
}

export default App;