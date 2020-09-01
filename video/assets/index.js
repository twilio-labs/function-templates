'use strict';
(() => {
  const ROOM_NAME = 'demo';
  const Video = Twilio.Video;
  let videoRoom, localStream;
  const video = document.getElementById('video');

  // preview screen
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((vid) => {
      video.srcObject = vid;
      localStream = vid;
    });

  // buttons
  const joinRoomButton = document.getElementById('button-join');
  const leaveRoomButton = document.getElementById('button-leave');
  joinRoomButton.onclick = () => {
    // get access token
    fetch(`video-token?passcode=${getPasscode()}`)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          console.error(resp);
          if (resp.status === 401) {
            throw new Error('Invalid passcode');
          } else {
            throw new Error('Unexpected error. Open dev tools for logs');
          }
        }
      })
      .then((body) => {
        const token = body.token;
        console.log(token);
        //connect to room
        return Video.connect(token, { name: ROOM_NAME });
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
        joinRoomButton.disabled = true;
        leaveRoomButton.disabled = false;
      })
      .catch((err) => {
        alert(err.message);
      });
  };
  // leave room
  leaveRoomButton.onclick = () => {
    videoRoom.disconnect();
    console.log(`Disconnected from Room ${videoRoom.name}`);
    joinRoomButton.disabled = false;
    leaveRoomButton.disabled = true;
  };
})();

const getPasscode = () => {
  const passcodeInput = document.getElementById('passcode') || {};
  const passcode = passcodeInput.value;
  passcodeInput.value = '';

  return passcode;
};

// connect participant
const participantConnected = (participant) => {
  console.log(`Participant ${participant.identity} connected'`);

  const div = document.createElement('div'); //create div for new participant
  div.id = participant.sid;

  participant.on('trackSubscribed', (track) => trackSubscribed(div, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);

  participant.tracks.forEach((publication) => {
    if (publication.isSubscribed) {
      trackSubscribed(div, publication.track);
    }
  });
  document.body.appendChild(div);
};

const participantDisconnected = (participant) => {
  console.log(`Participant ${participant.identity} disconnected.`);
  document.getElementById(participant.sid).remove();
};

const trackSubscribed = (div, track) => {
  div.appendChild(track.attach());
};

const trackUnsubscribed = (track) => {
  track.detach().forEach((element) => element.remove());
};
