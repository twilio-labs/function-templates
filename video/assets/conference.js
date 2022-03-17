const getPasscode = () => {
  const passcodeInput = document.getElementById('passcode') || {};
  const passcode = passcodeInput.value;
  passcodeInput.value = '';

  return passcode;
};

const trackSubscribed = (div, track) => {
  div.appendChild(track.attach());
};

const trackUnsubscribed = (track) => {
  track.detach().forEach((element) => element.remove());
};

// connect participant
const participantConnected = (participant) => {
  console.log(`Participant ${participant.identity} connected'`);

  const participantsDiv = document.getElementById('participants');
  const div = document.createElement('div'); // create div for new participant
  div.id = participant.sid;

  participant.on('trackSubscribed', (track) => trackSubscribed(div, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);

  participant.tracks.forEach((publication) => {
    if (publication.isSubscribed) {
      trackSubscribed(div, publication.track);
    }
  });
  participantsDiv.appendChild(div);
};

const participantDisconnected = (participant) => {
  console.log(`Participant ${participant.identity} disconnected.`);
  document.getElementById(participant.sid).remove();
};

(() => {
  const { Video } = Twilio;
  let videoRoom;
  let localStream;
  const video = document.getElementById('video');

  // preview screen
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((vid) => {
      video.srcObject = vid;
      localStream = vid;
    });

  const joinRoomButton = document.getElementById('button-join');
  const leaveRoomButton = document.getElementById('button-leave');
  const roomControlsForm = document.getElementById('room-controls-form');
  const preConnectControls = document.getElementById('pre-connect-controls');
  const postConnectControls = document.getElementById('post-connect-controls');
  const participantsDiv = document.getElementById('participants');
  const permissionsHelp = document.getElementById('permissions-help');

  const joinRoom = (event) => {
    event.preventDefault();
    // get access token
    fetch(`video-token?passcode=${getPasscode()}`)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        console.error(resp);
        if (resp.status === 401) {
          throw new Error('Invalid passcode');
        } else {
          throw new Error('Unexpected error. Open dev tools for logs');
        }
      })
      .then((body) => {
        const { token, room } = body;
        console.log(token);
        // connect to room
        return Video.connect(token, { name: room });
      })
      .then((room) => {
        console.log(`Connected to Room ${room.name}`);
        videoRoom = room;

        room.participants.forEach(participantConnected);
        room.on('participantConnected', participantConnected);

        room.on('participantDisconnected', participantDisconnected);
        room.once('disconnected', (error) =>
          room.participants.forEach(participantDisconnected)
        );
        preConnectControls.style.display = 'none';
        permissionsHelp.style.display = 'none';
        postConnectControls.style.display = 'inline-block';
        participantsDiv.style.display = 'flex';
      })
      .catch((err) => {
        // eslint-disable-next-line no-alert
        alert(err.message);
      });
  };

  roomControlsForm.onsubmit = joinRoom;
  joinRoomButton.onclick = joinRoom;

  // leave room
  leaveRoomButton.onclick = (event) => {
    videoRoom.disconnect();
    console.log(`Disconnected from Room ${videoRoom.name}`);
    preConnectControls.style.display = 'inline-block';
    permissionsHelp.style.display = 'block';
    postConnectControls.style.display = 'none';
    participantsDiv.style.display = 'none';
    event.preventDefault();
  };
})();
