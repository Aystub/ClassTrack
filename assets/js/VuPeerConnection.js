// JavaScript variables holding stream and connection information  
var localStream, localPeerConnection, remotePeerConnection;

// JavaScript variables associated with HTML5 video elements in the page
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

// JavaScript variables assciated with call management buttons in the page
var callButton = document.getElementById("connect_button");
var hangupButton = document.getElementById("disconnect_button");

// Just allow the user to click on the 'Call' button at start-up
callButton.disabled = false;
hangupButton.disabled = true;

// Associate JavaScript handlers with click events on the buttons
callButton.onclick = start;
hangupButton.onclick = hangup;

// Handles NAT traversal
var servers =  {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

// Stats for info div.
var startTime, endTime;
var gatheredIceCandidateTypes = {
  Local: {},
  Remote: {}
};
var infoDivErrors = [];
var stats;
var getStatsTimer;

var roomKey= 123454321;
var me= "dv297";

/* global attachMediaStream, audioRecvBitrate, audioRecvCodec, audioSendBitrate, audioSendCodec, channelToken, createIceServers, errorMessages, getUserMedia, goog, initiator:true, me, mediaConstraints, offerConstraints, pcConfig, pcConstraints, reattachMediaStream, roomKey, roomLink, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, setupStereoscopic, stereo, stereoscopic, trace, turnUrl, videoRecvBitrate, videoSendBitrate, videoSendInitialBitrate:true */



// Function associated with clicking on the 'Start' button
// This is the event triggering all other actions
function start() {
  log("Requesting local stream");
  // Get ready to deal with different browser vendors...
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  // Now, call getUserMedia()
  navigator.getUserMedia({audio:true, video:true}, successCallback,
    function(error) {
      log("navigator.getUserMedia error: ", error);
    });
}

// Callback in case of success of the getUserMedia() call
function successCallback(stream){
  log("Received local stream");
  
  // Associate the local video element with the retrieved stream
  if (window.URL) {
    localVideo.src = URL.createObjectURL(stream);
  } else {
   localVideo.src = stream;
  }

  localStream = stream;

  call();
}


// Function associated with clicking on the 'Call' button
// This is enabled upon successful completion of the 'Start' button handler
function call() {


  // First of all, disable the 'Call' button on the page...
  callButton.disabled = true;
  // ...and enable the 'Hangup' button
  hangupButton.disabled = false;
  log("Starting call");
  
  // Chrome
  if (navigator.webkitGetUserMedia) {
    RTCPeerConnection = webkitRTCPeerConnection;
  // Firefox
  }else if(navigator.mozGetUserMedia){
    RTCPeerConnection = mozRTCPeerConnection;
    RTCSessionDescription = mozRTCSessionDescription;
    RTCIceCandidate = mozRTCIceCandidate;
  }
  log("RTCPeerConnection object: " + RTCPeerConnection);
  
  // This is an optional configuration string, associated with NAT traversal setup
  //var servers = null;
  

  createPeerConnection();
  
  // We're all set! Create an Offer to be 'sent' to the callee as soon as the local SDP is ready
  pc.createOffer(gotLocalDescription, onSignalingError);
}

function createPeerConnection() {
  try {
    // Create an RTCPeerConnection via the polyfill (adapter.js).
    pc = new RTCPeerConnection(servers);
    pc.onicecandidate = onIceCandidate;
  } catch (e) {
    messageError('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object; ' +
        'WebRTC is not supported by this browser.');
    return;
  }
  pc.onaddstream = onRemoteStreamAdded;
  pc.onremovestream = onRemoteStreamRemoved;
  pc.onsignalingstatechange = onSignalingStateChanged;
  pc.oniceconnectionstatechange = onIceConnectionStateChanged;
}

function onSignalingError(error) {
  console.log('Failed to create signaling message : ' + error.name);
}

// Handler to be called when the 'local' SDP becomes available
function gotLocalDescription(description){
  // Add the local description to the local PeerConnection
  pc.setLocalDescription(description);
  log("Offer from localPeerConnection: \n" + description.sdp);
  
  // ...do the same with the 'pseudo-remote' PeerConnection
  // Note well: this is the part that will have to be changed if you want the communicating peers to become
  // remote (which calls for the setup of a proper signaling channel)
  pc.setRemoteDescription(description);
  
  // Create the Answer to the received Offer based on the 'local' description
  pc.createAnswer(gotRemoteDescription, onSignalingError);
}

// Handler to be called when the 'remote' SDP becomes available
function gotRemoteDescription(description){
  // Set the 'remote' description as the local description of the remote PeerConnection
  remotePeerConnection.setLocalDescription(description);
  log("Answer from remotePeerConnection: \n" + description.sdp);
  // Conversely, set the 'remote' description as the remote description of the local PeerConnection 
  localPeerConnection.setRemoteDescription(description);
}

// Handler to be called when hanging up the call
function hangup() {
  log("Ending call");
  // Close PeerConnection(s)
  localPeerConnection.close();
  remotePeerConnection.close();
  // Reset local variables
  localPeerConnection = null;
  remotePeerConnection = null;
  // Disable 'Hangup' button
  hangupButton.disabled = true;
  // Enable 'Call' button to allow for new calls to be established
  callButton.disabled = false;
  // Remove src to local video - Added by Daniel Vu
  localVideo.src = null;
  remoteVideo.src = null;
  localStream.getVideoTracks()[0].enabled = false;
  localStream.getAudioTracks()[0].enabled = false;
  localStream.stop();


}

// Handler to be called as soon as the remote stream becomes available
function gotRemoteStream(event){  
  // Associate the remote video element with the retrieved stream
  if (window.URL) {
    // Chrome
    remoteVideo.src = window.URL.createObjectURL(event.stream);
  } else {
    // Firefox
    remoteVideo.src = event.stream;
  }  
  log("Received remote stream");
}

// Handler to be called whenever a new local ICE candidate becomes available
function gotLocalIceCandidate(event){
  if (event.candidate) {
  // Add candidate to the remote PeerConnection 
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    log("Local ICE candidate: \n" + event.candidate.candidate);
  }
}

// Handler to be called whenever a new 'remote' ICE candidate becomes available
function gotRemoteIceCandidate(event){
  if (event.candidate) {
  // Add candidate to the local PeerConnection    
    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    log("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}



function onIceCandidate(event) {
  if (event.candidate) {
    // if (pcConfig.iceTransports === 'relay') {
    //   // Filter out non relay Candidates, if iceTransports is set to relay.
    //   if (event.candidate.candidate.search('relay') === -1) {
    //     return;
    //   }
    // }
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
    noteIceCandidate('Local', 'STUN');
  } else {
    trace('End of candidates.');
  }
}

function onRemoteStreamAdded(event) {
  trace('Remote stream added.');
  attachMediaStream(remoteVideo, event.stream);
  remoteStream = event.stream;
}

function onRemoteStreamRemoved() {
  trace('Remote stream removed.');
}

function onSignalingStateChanged() {
  if (pc) {
    trace('Signaling state changed to: ' + pc.signalingState);
  }
}

function onIceConnectionStateChanged() {
  if (pc) {
    trace('ICE connection state changed to: ' + pc.iceConnectionState);
  }
}

function sendMessage(message) {
  var msgString = JSON.stringify(message);
  trace('C->S: ' + msgString);
  // NOTE: AppRTCClient.java searches & parses this line; update there when
  // changing here.
  var path = '/message?r=' + roomKey + '&u=' + me;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path, true);
//  xhr.send(msgString);
}

function noteIceCandidate(location, type) {
  var types = gatheredIceCandidateTypes[location];
  if (!types[type]) {
    types[type] = 1;
  } else {
    ++types[type];
  }
}



// Utility function for logging information to the JavaScript console
function log(text) {
  console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text);
}

function messageError(msg) {
  trace(msg);
}