import { getTranslation } from "./translation.js";
import { customAlert } from "./popups.js";

class Question {
  constructor(email, question) {
    this.email = email;
    this.question = question;
    this.createdAt = new Date();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const questionBtn = document.getElementById('openQuestionFormBtn');
  const modal = document.getElementById('questionModal');
  const closeModal = document.getElementById('closeQuestionModal');
  const emailInput = document.getElementById('email');
  const questionInput = document.getElementById('question');
  const submitBtn = document.getElementById('submitQuestionBtn');
  const statusDiv = document.getElementById('questionStatus');

  // ✅ Open floating modal
  questionBtn.addEventListener('click', () => {
    statusDiv.textContent = '';
    emailInput.value = '';
    questionInput.value = '';
    modal.style.display = 'flex';
  });

  // ✅ Close modal via close button
  closeModal.addEventListener('click', () => modal.style.display = 'none');

  // ✅ Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && e.target !== questionBtn) {
      modal.style.display = 'none';
    }
  });
  

  // ✅ Submit logic with proper translation
  submitBtn.addEventListener('click', async () => {
    statusDiv.textContent = '';

    const email = emailInput.value.trim();
    const questionText = questionInput.value.trim();

    if (!email || !questionText) {
      statusDiv.textContent = getTranslation("fillValues") || "❗ Please fill in all fields.";
      return;
    }

    const q = new Question(email, questionText);
    console.log('New question:', q);

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, question: questionText })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      customAlert(getTranslation("questionanswer"));
      setTimeout(() => {
        modal.style.display = 'none';
      }, 1500);
    } catch (err) {
      console.error('Question send error:', err);
      statusDiv.textContent = getTranslation("unkownError") || "❌ Failed to send your question.";
    }

    emailInput.value = '';
    questionInput.value = '';
  });
});
