import { wordList } from '../data/words.js';
import { findOptimalStartingWords } from './wordAnalyzer.js';

// Get the top 5 optimal starting words
const optimalWords = findOptimalStartingWords(wordList, 5);
console.log("Best starting words:", optimalWords);