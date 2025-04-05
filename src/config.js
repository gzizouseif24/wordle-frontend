// API endpoint configuration
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://wordle-backend-7vy5.onrender.com' // Backend URL already deployed on Render
  : 'http://localhost:5000';

export default {
  API_URL
}; 