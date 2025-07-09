import { getTranslation } from "./translation.js";

document.addEventListener('DOMContentLoaded', () => {
  const yourQuestionsBtn = document.getElementById('yourQuestions');
  const yourQuestionsSection = document.getElementById('yourQuestionsSection');
  const questionsList = document.getElementById('questionsList');
  const closeYourQuestions = document.getElementById('closeYourQuestions');

  yourQuestionsBtn.addEventListener('click', async () => {
    // Show the section
    yourQuestionsSection.style.display = 'block';
    questionsList.innerHTML = getTranslation('loading');

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
});
