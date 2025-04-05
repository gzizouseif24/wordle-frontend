// Function to analyze the word list and find optimal starting words
export function findOptimalStartingWords(wordList, topN = 5) {
  // Step 1: Count letter frequencies
  const letterFrequency = {};
  
  wordList.forEach(word => {
    // Create a set of unique letters in this word
    const uniqueLetters = [...new Set(word.split(''))];
    
    // Increment count for each unique letter
    uniqueLetters.forEach(letter => {
      letterFrequency[letter] = (letterFrequency[letter] || 0) + 1;
    });
  });
  
  // Step 2: Score each word based on unique letters and their frequencies
  const wordScores = wordList.map(word => {
    const uniqueLetters = [...new Set(word.split(''))];
    let score = 0;
    
    // Add up the frequency scores of each unique letter
    uniqueLetters.forEach(letter => {
      score += letterFrequency[letter];
    });
    
    // Favor words with more unique letters
    score *= uniqueLetters.length / 5;
    
    return { word, score };
  });
  
  // Step 3: Sort words by score and return top N
  return wordScores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(item => item.word);
}