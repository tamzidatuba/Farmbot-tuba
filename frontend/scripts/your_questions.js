import { getTranslation } from "./translation.js";
import { isLoggedIn, token } from "./auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const yourQuestionsBtn = document.getElementById('yourQuestions');
  const yourQuestionsSection = document.getElementById('yourQuestionsSection');
  const questionsList = document.getElementById('questionsList');
  const closeYourQuestions = document.getElementById('closeYourQuestions');
  const addSection = document.getElementById('add-question-section');
  const addBtn = document.getElementById('add-question-btn');
  const form = document.getElementById('question-form');
  const userInput = document.getElementById('user');
  const questionInput = document.getElementById('user-question');
  const answerInput = document.getElementById('user-answer');

  let questions = [];

  async function fetchQuestions() {
  try {
    const response = await fetch('/api/getquestions');
    if (!response.ok) throw new Error('Network response was not ok');

    questions = await response.json();

    if (questions.length === 0) {
      questionsList.innerHTML = '<p>' + getTranslation("noQuestions") + '</p>';
    } else {
      questionsList.innerHTML = questions.map(q => `
        <div class="question-item" data-id="${q.id}">
          <p><strong>${getTranslation("user")}:</strong> <span class="user-text">${q.user}</span></p>
          <p><strong>${getTranslation("question")}:</strong> <span class="question-text">${q.question}</span></p>
          <p><strong>${getTranslation("answer")}:</strong> <span class="answer-text">${q.answer}</span></p>
          ${isLoggedIn ? `
            <div class="button-row">
              <button class="icon-btn edit-btn" title="Edit">&#9998;</button>
              <button class="icon-btn delete-btn" title="Delete">&#128465;</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    }
  } catch (error) {
    questionsList.innerHTML = `<p>Error loading questions: ${error.message}</p>`;
  }
}

  questionsList.addEventListener('click', async e => {
  const row = e.target.closest('.question-item');
  if (!row) return;                         // clicked outside rows
  if (!e.target.classList.contains('icon-btn')) return;

  const id = row.dataset.id;
  const inEdit = row.dataset.editing === 'true';
  const editBtn = row.querySelector('.edit-btn');
  const delBtn  = row.querySelector('.delete-btn');

  /* ---------- normal mode ---------- */
  if (!inEdit && e.target === editBtn) {
    // turn spans into inputs
    row.querySelector('.user-text').outerHTML =
      `<input class="user-input"   value="${row.querySelector('.user-text').textContent}">`;
    row.querySelector('.question-text').outerHTML =
      `<input class="question-input" value="${row.querySelector('.question-text').textContent}">`;
    row.querySelector('.answer-text').outerHTML =
      `<textarea class="answer-input">${row.querySelector('.answer-text').textContent}</textarea>`;

    // swap button icons
    editBtn.textContent = '💾';          // save
    delBtn.textContent  = '❌';          // cancel
    row.dataset.editing = 'true';
    return;
  }

  /* ---------- cancel (❌) ---------- */
  if (inEdit && e.target === delBtn) {
    await fetchQuestions();               // reload original list
    return;
  }

  /* ---------- save (💾) ---------- */
  if (inEdit && e.target === editBtn) {
    const payload = {
      id: id,
      user:     row.querySelector('.user-input').value.trim(),
      question: row.querySelector('.question-input').value.trim(),
      answer:   row.querySelector('.answer-input').value.trim()
    };

    console.log("Update this: " + JSON.stringify(payload, token));

    try {
      const r = await fetch(`/api/questions/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({payload, token})
      });
      if (!r.ok) throw new Error('Update failed');
      await fetchQuestions();
    } catch (err) {
      alert(err.message);
    }
    return;
  }

  /* ---------- delete (🗑️) in normal mode ---------- */
  if (!inEdit && e.target === delBtn) {
    console.log("Id: " + id);
    if (!confirm(getTranslation("confirmDelete") || 'Delete?')) return;
    try {
      const r = await fetch(`/api/questions/delete`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: id, token: token})
      });
      if (!r.ok) throw new Error('Delete failed');
      await fetchQuestions();
    } catch (err) {
      alert(err.message);
    }
  }
});



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

    const highestId = questions.length > 0
      ? Math.max(...questions.map(q => q.id))
      : 0;

    const newQuestion = {
      id: highestId,
      user: userInput.value.trim(),
      question: questionInput.value.trim(),
      answer: answerInput.value.trim()
    };

    console.log(JSON.stringify(newQuestion));

    try {
      const response = await fetch('/api/questions', {
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
