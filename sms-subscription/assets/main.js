const subscriptionForm = document.getElementById('subscriptionForm');
const notifyForm = document.getElementById('notifyForm');
const deleteForm = document.getElementById('deleteForm');

function showSubscribed() {
  const subscriptionConfirmation = document.getElementById(
    'subscriptionConfirmation'
  );
  subscriptionConfirmation.style.display = 'flex';
}

function showNotification(count) {
  const notificationConfirmation = document.getElementById(
    'notificationConfirmation'
  );
  const notificationCount = document.getElementById('notificationCount');
  notificationCount.innerText = count;
  notificationConfirmation.style.display = 'flex';
}

function showDeleteConfirmation() {
  const deleteConfirmation = document.getElementById('deleteConfirmation');
  deleteConfirmation.style.display = 'flex';
}

subscriptionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const phoneNumber = event.target.elements.subscribeNumber.value;
  fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      showSubscribed();
    });
});

notifyForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const passcode = event.target.elements.passcode.value;
  fetch('/notify', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`admin:${passcode}`)}`,
    },
  })
    .then((resp) => resp.json())
    .then((data) => {
      if (data.result) {
        showNotification(data.result.filter((x) => Boolean(x)).length);
      }
    });
});

deleteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const passcode = event.target.elements.passcode.value;
  fetch('/delete-subscriptions', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`admin:${passcode}`)}`,
    },
  })
    .then((resp) => resp.json())
    .then((data) => {
      if (data.result) {
        showDeleteConfirmation();
      }
    });
});
