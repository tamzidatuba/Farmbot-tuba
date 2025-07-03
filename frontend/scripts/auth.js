import { getTranslation } from "./translation.js";
export let token = '';

//for login and logout
const settingsBtn = document.querySelector('.settings-btn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const farmbotMenu = document.getElementById('farmbotMenu');
const toggle = document.getElementById('createTaskToggle');
const viewJobs = document.getElementById('viewJobs');
const subtask = document.getElementById('subtaskContainer');
const subtaskView = document.getElementById('subtaskView');


//login features
let isLoggedIn = false;


settingsBtn.addEventListener('click', () => {
    if (isLoggedIn) {
        isLoggedIn = false;
        alert(getTranslation('logoutSuccess'));
        farmbotMenu.textContent = getTranslation('menu');
        toggle.style.display = 'none';
        subtask.style.display = 'none';
        viewJobs.style.display = 'none';
        subtaskView.style.display = 'none';
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "token": token
            })
        });
        token = "";
    } else {
        loginModal.style.display = 'block';
    }
});


closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    // Send to API
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value.trim(),
                password: password.value.trim()
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Success - Login passed
            alert(getTranslation('successLogin'));
            isLoggedIn = true;

            if (loginModal) loginModal.style.display = 'none';
            if (farmbotMenu) farmbotMenu.textContent = getTranslation('menuAdmin');
            toggle.style.display = 'flex';
            //subtask.style.display='none';
            viewJobs.style.display = 'flex';
            //viewJobsBtn.style.display='block';

            token = data.token;

        } else {
            // API rejected credentials
            if (data.message?.toLowerCase().includes('username')) {
                usernameError.textContent = data.message;
            } else if (data.message?.toLowerCase().includes('password')) {
                passwordError.textContent = data.message;
            } else {
                alert(data.message || getTranslation('invalidLogin'));
            }
        }
    } catch (error) {
        console.error(getTranslation("errorLogin"), error);
        alert(getTranslation("errorServer"));
    }
});


// Optional: Close on background click
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});
//end of login and logout feature