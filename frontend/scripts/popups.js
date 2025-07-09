const alertOkBtn = document.getElementById('alert-ok-btn');
const yesBtn = document.getElementById('confirm-yes-btn');
const noBtn = document.getElementById('confirm-no-btn');

const alert = document.getElementById('custom-alert');
const confirm = document.getElementById('custom-confirm');

const alertMessage = document.getElementById('alert-message');
const confirmMessage = document.getElementById('confirm-message');


// Event listeners for buttons
alertOkBtn.addEventListener('click', closeAlert);

function customAlert(message) {
  alertMessage.innerText = message;
  alert.classList.remove('hidden');
}

function closeAlert() {
  alert.classList.add('hidden');
}


function customConfirm(message) {
  return new Promise((resolve) => {
    confirmMessage.innerText = message;
    confirm.classList.remove('hidden');

    function onYes() {
      cleanup();
      resolve(true);
    }

    function onNo() {
      cleanup();
      resolve(false);
    }

    function cleanup() {
      document.getElementById('custom-confirm').classList.add('hidden');
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
    }

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
  });
}

export {
  customAlert,
  customConfirm
};