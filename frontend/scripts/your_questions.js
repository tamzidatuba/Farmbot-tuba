import { getTranslation } from "./translation.js";
import { isLoggedIn } from "./auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const yourQuestionsBtn = document.getElementById('yourQuestions');
  const yourQuestionsSection = document.getElementById('yourQuestionsSection');
  const questionsList = document.getElementById('questionsList');
  const closeYourQuestions = document.getElementById('closeYourQuestions');
  const addSection = document.getElementById('add-question-section');
  const addBtn = document.getElementById('add-question-btn');
  const form = document.getElementById('question-form');
  const userInput = document.getElementById('user-email');
  const questionInput = document.getElementById('user-question');
  const answerInput = document.getElementById('user-answer');

  async function fetchQuestions() {
    try {
      const response = await fetch('/api/getquestions');
      if (!response.ok) throw new Error('Network response was not ok');

      const questions = await response.json();
      console.log(questions); // Debugging line to check the fetched data
      if (questions.length === 0) {
        questionsList.innerHTML = '<p>' + getTranslation("noQuestions") + '</p>';
      } else {
        questionsList.innerHTML = questions.map(q =>
          `<div class="question-item">
            <p><strong>` + getTranslation("user") + `</strong> ${q.user}</p>
            <p><strong>` + getTranslation("question") + `:</strong> ${q.question}</p>
            <p><strong>` + getTranslation("answer") + `:</strong> ${q.answer}</p>
          </div>`
        ).join('');
      }
    } catch (error) {
      questionsList.innerHTML = `<p>Error loading questions: ${error.message}</p>`;
    }
  }


  yourQuestionsBtn.addEventListener('click', async () => {
    // Show the section
    yourQuestionsSection.style.display = 'block';
    questionsList.innerHTML = getTranslation('loading');
    if (!isLoggedIn) {
      addSection.style.display = 'none';
    } else {
      addSection.style.display = 'block';
    }

    // Fetch and display questions
    await fetchQuestions();
  });

  closeYourQuestions.addEventListener('click', () => {
    yourQuestionsSection.style.display = 'none';
  });

  //Close modal on background click
  yourQuestionsSection.addEventListener('click', (e) => {
    if (e.target === yourQuestionsSection) {
      yourQuestionsSection.style.display = 'none';
    }
  });


  // Show form on button click
  addBtn.addEventListener('click', () => {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });

  //adding new question
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newQuestion = {
      user: userInput.value.trim(),
      question: questionInput.value.trim(),
      answer: answerInput.value.trim()
    };

    try {
      const response = await fetch('/api/postquestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });

      if (!response.ok) throw new Error('Failed to add question.');

      // Optionally clear form and hide it
      form.reset();
      form.style.display = 'none';

      // Re-fetch and render updated list
      await fetchQuestions(); // Call your existing fetch + render logic

    } catch (err) {
      alert(err.message);
    }
  });

});
