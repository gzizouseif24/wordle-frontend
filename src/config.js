// API endpoint configuration
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://wordle-clone-ss6h.onrender.com' // Replace with your actual backend URL after deployment
  : 'http://localhost:5000';

export default {
  API_URL
}; 