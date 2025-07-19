// feedback.js
import { getTranslation } from "./translation.js";
import { customAlert } from "./popups.js";


class Feedback {
  constructor( message) {
    this.message = message;
    //this.rating = rating;
    this.createdAt = new Date();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const feedbackBtn = document.getElementById('feedbackBtn');
  const modal = document.getElementById('feedbackModal');
  const closeModal = document.getElementById('closeFeedbackModal');
  const textInput = document.getElementById('feedbackText');
  //const ratingStars = document.getElementsByName('rating');
  const submitBtn = document.getElementById('submitFeedbackBtn');
  const errorDiv = document.getElementById('feedbackError');
  const successDiv = document.getElementById('feedbackSuccess');
 
  // In-memory store
  const feedbackList = [];

  // Helper to get selected rating
  /* function getSelectedRating() {
    for (const star of ratingStars) {
      if (star.checked) return Number(star.value);
    }
    return 0;
  } */

  // Open modal
  feedbackBtn.addEventListener('click', () => {
    errorDiv.textContent = '';
    successDiv.textContent = '';
    textInput.value = '';
    //ratingStars.forEach(s => s.checked = false);
    modal.style.display = 'flex';
  });

  // Close modal
  closeModal.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Submit feedback
  submitBtn.addEventListener('click', async () => {
    errorDiv.textContent = '';
    successDiv.textContent = '';
  
    const message = textInput.value.trim();
    //const rating = getSelectedRating();
  
    /* if (message.length() < 1 || message.length() > 5) {
      errorDiv.textContent = getTranslation("noFeedback");
      return;
    } */
  
    const fb = new Feedback(message);
    feedbackList.push(fb);
    console.log('New feedback:', fb);
  
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
  
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.error);
  
      customAlert(getTranslation("feedbackResponse"));
      modal.style.display='none';
    } catch (err) {
      console.error('Feedback send error:', err);
      errorDiv.textContent = '❌ Failed to send feedback. Please try again later.';
    }
  
    textInput.value = '';
    //ratingStars.forEach(s => s.checked = false);
  });
  
});
