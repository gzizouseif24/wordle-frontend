/**
 * Utilities for managing user identification and stats
 */

import { v4 as uuidv4 } from 'uuid';
import config from '../config';

// Get or create a unique user ID
const getUserId = () => {
  let userId = localStorage.getItem(config.STORAGE_KEYS.USER_ID);
  
  // If no user ID exists, create one and store it
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(config.STORAGE_KEYS.USER_ID, userId);
  }
  
  return userId;
};

// Get user-specific stats key
const getUserStatsKey = () => {
  const userId = getUserId();
  return `${config.STORAGE_KEYS.USER_STATS}_${userId}`;
};

// Get user-specific last played key
const getUserLastPlayedKey = () => {
  const userId = getUserId();
  return `${config.STORAGE_KEYS.LAST_PLAYED}_${userId}`;
};

// Get user-specific current word key
const getUserCurrentWordKey = () => {
  const userId = getUserId();
  return `${config.STORAGE_KEYS.CURRENT_WORD}_${userId}`;
};

// Get user-specific daily word key
const getUserDailyWordKey = () => {
  const userId = getUserId();
  return `dailyWord_${userId}`;
};

// Get user stats
const getUserStats = () => {
  const statsKey = getUserStatsKey();
  return JSON.parse(localStorage.getItem(statsKey)) || {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0]
  };
};

// Save user stats
const saveUserStats = (stats) => {
  const statsKey = getUserStatsKey();
  localStorage.setItem(statsKey, JSON.stringify(stats));
};

// Update game statistics
const updateGameStats = (won, attempts) => {
  const stats = getUserStats();
  
  // Update stats for all games
  stats.gamesPlayed += 1;
  
  if (won) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[attempts - 1] += 1;
  } else {
    stats.currentStreak = 0;
  }
  
  saveUserStats(stats);
  return stats;
};

export {
  getUserId,
  getUserStatsKey,
  getUserLastPlayedKey,
  getUserCurrentWordKey,
  getUserDailyWordKey,
  getUserStats,
  saveUserStats,
  updateGameStats
};