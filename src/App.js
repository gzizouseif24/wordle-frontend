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
  const [isRandomMode, setIsRandomMode] = useState(false); // New state for random word mode
  
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
        setModalContent(isRandomMode ? 'أحسنت! جاهز للكلمة التالية؟' : 'أحسنت! لقد فزت');
        setShowModal(true);
        saveGameStats(true, currentGuess + 1);
        
        // Only save to server if it's the daily game (not random mode)
        if (!isRandomMode) {
          saveGameToServer(true, currentGuess + 1, newSubmittedGuesses);
          markDailyGameCompleted();
        }
      } else if (currentGuess === 5) {
        setGameOver(true);
        setModalContent(`انتهت اللعبة! الكلمة كانت ${currentWord}`);
        setShowModal(true);
        saveGameStats(false, 0);
        
        // Only save to server if it's the daily game (not random mode)
        if (!isRandomMode) {
          saveGameToServer(false, 6, newSubmittedGuesses);
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
  }, [currentGuess, currentWord, gameOver, guesses, submittedGuesses, dailyGameCompleted, isRandomMode]); // Added isRandomMode
  
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
  }, [guesses, currentGuess, gameOver, currentWord, showAuthModal, handleKeyPress, dailyGameCompleted, isRandomMode]); // Added isRandomMode
  
  // Save game statistics to localStorage
  const saveGameStats = (won, attempts) => {
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
    
    // Only update stats for daily games, not random mode
    if (!isRandomMode) {
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
    }
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
  const startRandomGame = async () => {
    try {
      // Reset game state
      setGuesses(Array(6).fill(''));
      setCurrentGuess(0);
      setGameOver(false);
      setSubmittedGuesses([]);
      setIsRandomMode(true);
      
      // Get a random word from the API
      const response = await fetch(`${config.API_URL}/api/words/random`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch random word');
      }
      
      const data = await response.json();
      setCurrentWord(data.word);
      
      // Close any open modals
      setShowStatsModal(false);
      setShowHowToPlay(false);
    } catch (error) {
      console.error('Error starting random game:', error);
      // If API call fails, fall back to a word from the local list
      const randomIndex = Math.floor(Math.random() * wordList.length);
      setCurrentWord(wordList[randomIndex]);
    }
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
    
    // Fetch the daily word from the API
    const fetchDailyWord = async () => {
      try {
        // Use the API to get the daily word
        const response = await fetch(`${config.API_URL}/api/words/daily`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch daily word');
        }
        
        const data = await response.json();
        setCurrentWord(data.word);
      } catch (error) {
        console.error('Error fetching daily word:', error);
        // Fallback if the API call fails - select a random word from our local list
        // Or use the debug word if set
        if (DEBUG_INITIAL_WORD) {
          setCurrentWord(DEBUG_INITIAL_WORD);
        } else {
          const randomIndex = Math.floor(Math.random() * wordList.length);
          setCurrentWord(wordList[randomIndex]);
        }
      }
    };
    
    fetchDailyWord();
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
  
  // Show authentication modal
  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };
  
  // Close authentication modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };
  
  // Handle user login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('wordleUser', JSON.stringify(userData));
  };
  
  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('wordleUser');
    localStorage.removeItem('wordleToken');
  };
  
  // Show stats modal
  const handleShowStats = () => {
    setShowStatsModal(true);
  };
  
  // Close stats modal
  const handleCloseStats = () => {
    setShowStatsModal(false);
  };
  
  // Get local game stats
  const getLocalStats = () => {
    return JSON.parse(localStorage.getItem('gameStats')) || {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
  };
  
  return (
    <div className="app-container">
      <Header 
        onShowStats={handleShowStats} 
        onShowAuth={handleShowAuthModal}
        onLogout={handleLogout}
        user={user}
        isLoggedIn={!!user}
      />
      
      {showHomePage ? (
        <HomePage onStartGame={handleStartGame} />
      ) : (
        <>
          <GameBoard 
            guesses={guesses} 
            currentGuess={currentGuess} 
            currentWord={currentWord}
            submittedGuesses={submittedGuesses}
          />
          <Keyboard 
            onKeyPress={handleKeyPress} 
            submittedGuesses={submittedGuesses}
            currentWord={currentWord}
          />
        </>
      )}
      
      <Footer />
      
      {showModal && (
        <Modal onClose={closeModal}>
          <div className="modal-content">
            <p>{modalContent}</p>
            <button onClick={closeModal}>إغلاق</button>
          </div>
        </Modal>
      )}
      
      {showHowToPlay && (
        <HowToPlay onClose={handleCloseHowToPlay} />
      )}
      
      {showAuthModal && (
        <AuthModal 
          onClose={handleCloseAuthModal} 
          onLogin={handleLogin}
          apiUrl={config.API_URL}
        />
      )}
      
      {showStatsModal && (
        <StatsModal 
          onClose={handleCloseStats}
          stats={getLocalStats()}
          dailyGameCompleted={dailyGameCompleted}
          onPlayAgain={handlePlayRandomWords} // New prop for playing random words
          onHome={handleGoHome}
        />
      )}
    </div>
  );
}

export default App;