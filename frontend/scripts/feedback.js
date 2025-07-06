// feedback.js
import { getTranslation } from "./translation.js";
class Feedback {
    constructor(name, message, rating) {
      this.name = name;
      this.message = message;
      this.rating = rating;
      this.createdAt = new Date();
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const feedbackBtn    = document.getElementById('feedbackBtn');
    const modal          = document.getElementById('feedbackModal');
    const closeModal     = document.getElementById('closeFeedbackModal');
    const nameInput      = document.getElementById('feedbackName');
    const textInput      = document.getElementById('feedbackText');
    const ratingStars    = document.getElementsByName('rating');
    const submitBtn      = document.getElementById('submitFeedbackBtn');
    const errorDiv       = document.getElementById('feedbackError');
    const successDiv     = document.getElementById('feedbackSuccess');
  
    // In-memory store
    const feedbackList = [];
  
    // Helper to get selected rating
    function getSelectedRating() {
      for (const star of ratingStars) {
        if (star.checked) return Number(star.value);
      }
      return 0;
    }
  
    // Open modal
    feedbackBtn.addEventListener('click', () => {
      errorDiv.textContent = '';
      successDiv.textContent = '';
      nameInput.value = '';
      textInput.value = '';
      ratingStars.forEach(s => s.checked = false);
      modal.style.display = 'flex';
    });
  
    // Close modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  
    // Submit feedback
    submitBtn.addEventListener('click', () => {
      errorDiv.textContent   = '';
      successDiv.textContent = '';
  
      const name    = nameInput.value.trim();
      const message = textInput.value.trim();
      const rating  = getSelectedRating();
  
      // Validation
      if (!name) {
        errorDiv.textContent = 'Please enter your name.';
        return;
      }
      if (!message) {
        errorDiv.textContent = 'Please enter your feedback.';
        return;
      }
      if (rating < 1 || rating > 5) {
        errorDiv.textContent = 'Please give a rating.';
        return;
      }
  
      // Create and store feedback
      const fb = new Feedback(name, message, rating);
      feedbackList.push(fb);
      console.log('New feedback:', fb);
      console.log('All feedbacks:', feedbackList);
  
      // Show success
      successDiv.textContent = 'Thanks for your feedback!';
      
      // Reset form
      nameInput.value = '';
      textInput.value = '';
      ratingStars.forEach(s => s.checked = false);
    });
  });
  