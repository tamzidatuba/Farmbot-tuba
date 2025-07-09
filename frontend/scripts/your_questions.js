import { getTranslation } from "./translation.js";

document.addEventListener('DOMContentLoaded', () => {
  const yourQuestionsBtn = document.getElementById('yourQuestions');
  const yourQuestionsSection = document.getElementById('yourQuestionsSection');
  const questionsList = document.getElementById('questionsList');
  const closeYourQuestions = document.getElementById('closeYourQuestions');

  yourQuestionsBtn.addEventListener('click', async () => {
    // Show the section
    console.log('Your Questions button clicked');
    yourQuestionsSection.style.display = 'block';
    questionsList.innerHTML = getTranslation('loading');

    try {
      const response = await fetch('/api/yourquestions');
      if (!response.ok) throw new Error('Network response was not ok');

      const questions = await response.json();

      if (questions.length === 0) {
        questionsList.innerHTML = '<p>' + getTranslation("noQuestions") + '</p>';
      } else {
        questionsList.innerHTML = questions.map(q =>
          `<div class="question-item">
            <p><strong>` + getTranslation("user)" + `</strong> ${q.user}</p>
            <p><strong>` + getTranslation("question") + `:</strong> ${q.question}</p>
            <p><strong>` + getTranslation("answer") + `:</strong> ${q.answer}</p>
          </div>`
        ).join(''));
      }
    } catch (error) {
      questionsList.innerHTML = `<p>Error loading questions: ${error.message}</p>`;
    }
  });

  closeYourQuestions.addEventListener('click', () => {
    yourQuestionsSection.style.display = 'none';
  });
});
