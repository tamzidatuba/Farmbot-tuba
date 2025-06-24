export let token = '';

//for login and logout
const settingsBtn = document.querySelector('.settings-btn');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const farmbotMenu = document.getElementById('farmbotMenu');
const toggle = document.getElementById('createTaskToggle');
const viewJobs = document.getElementById('viewJobs');
const subtask = document.getElementById('subtaskContainer');
const subtaskView = document.getElementById('subtaskView');


//login features
let isLoggedIn = false;

window.addEventListener('DOMContentLoaded', () => {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
});


settingsBtn.addEventListener('click', () => {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = logoutBtn.style.display === 'block' ? 'none' : 'block';
    } else {
        logoutBtn.style.display = 'none';
        loginBtn.style.display = loginBtn.style.display === 'block' ? 'none' : 'block';
    }
});

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});
logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'block';
    alert('Successfully Logged Out');
    farmbotMenu.textContent = 'Farmbot Menu ';
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
            alert('Login successful!');
            isLoggedIn = true;

            if (loginModal) loginModal.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (farmbotMenu) farmbotMenu.textContent = 'Farmbot Menu Admin';
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
                alert(data.message || 'Invalid login. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Server error. Please try again later.');
    }
});


// Optional: Close on background click
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});
//end of login and logout feature