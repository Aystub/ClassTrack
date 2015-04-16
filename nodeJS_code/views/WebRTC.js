    /**
     * All the code dealing with WebRTC
     *
    **/



    var pcConstraints = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };
    // var key = '{{token}}';




    var mediaConstraints;
    var started = false;
    var localStream;
    var remoteStream;
    var msgQueue = [];
    var hasLocalStream;
    var channelReady = false;
    var signalingReady = false;
    var multipleParticipants = false;
    var initialized = false;


    function initialize() {
        if( $('.chatMemberElement').length < 2)
        {
          alert("Please wait until the other participant arrives");
          return;
        }
        if(initiator){
          socket.emit("WebRTC message", {type:"Initialize"});
	}
	else{
	  socket.emit("WebRTC message", {type:"joined"});
	}

        mediaConstraints = {
            video: true,
            audio: true
        };

        remoteStream = null;



        signalingReady = initiator;

        if (navigator.getUserMedia) {
            navigator.getUserMedia(mediaConstraints, onUserMediaSuccess, onUserMediaError);

        } else {
            console.log("getUserMedia not supported");
        }

        if (mediaConstraints.audio === false && mediaConstraints.video === false) 
        {
          hasLocalStream = false;
          maybeStart();
        }
        else 
        {
            hasLocalStream = true;
        }

    }

    function doGetUserMedia() {
        // Call into getUserMedia via the polyfill (adapter.js).
        try {
            getUserMedia(mediaConstraints, onUserMediaSuccess,
                onUserMediaError);
            console.log('Requested access to local media with mediaConstraints:\n' +
                '  \'' + JSON.stringify(mediaConstraints) + '\'');
        } catch (e) {
            alert('getUserMedia() failed. Is this a WebRTC capable browser?');
            messageError('getUserMedia failed with exception: ' + e.message);

        }
    }

    function onUserMediaSuccess(localMediaStream) {
        // Do something with the video here, e.g. video.play()
        $('#localVideo').attr('src', window.URL.createObjectURL(localMediaStream));
        localStream = localMediaStream;
	      socket.emit("WebRTC message", {type: "joined"});
        maybeStart();
    }

    function onUserMediaError(err) {
        console.log("The following error occured: " + err);
        //maybeStart();
    }

    function createPeerConnection() {
        var pc_config = {
		      "iceServers":[
        	{
	          url: 'turn:numb.viagenie.ca',
        	  credential: '1029384756',
	          username: 'dvv297@gmail.com'
	        }]
	     };

        try {
            // Create an RTCPeerConnection via the polyfill (adapter.js).
            console.log(pcConstraints);
            // pc = new RTCPeerConnection(pc_config, pcConstraints); // SOMETHING ABOUT THIS CAUSES THE CRASH
            pc = new RTCPeerConnection(pc_config);
            pc.onicecandidate = onIceCandidate;
            console.log("Created RTCPeerConnnection with config:\n" + "  \"" +
                JSON.stringify(pc_config) + "\".");
                started = true;
        } catch (e) {
            console.log("Failed to create PeerConnection, exception: " + e.message);
            alert("Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.");
            return;
        }
        pc.onconnecting = onSessionConnecting;
        pc.onopen = onSessionOpened;
        pc.onaddstream = onRemoteStreamAdded;
        pc.onremovestream = onRemoteStreamRemoved;
    }

    function onIceCandidate(event) {
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log("End of candidates.");
        }
    }


    function onSessionConnecting() {
        Console.log("Session Connecting...")
    };

    function onSessionOpened() {
        Console.log("Session Opened")
    };

    function onRemoteStreamAdded(event) {
        if(debugAlerts){
          alert("Remote Stream Added");
        }
        attachMediaStream(remoteVideo, event.stream);
        remoteStream = event.stream;
        waitForRemoteVideo();
    }

    function waitForRemoteVideo() {
        // Call the getVideoTracks method via adapter.js.
        videoTracks = remoteStream.getVideoTracks();
        if (videoTracks.length === 0 || remoteVideo.currentTime > 0) {
            // transitionToActive();
        } else {
            setTimeout(waitForRemoteVideo, 100);
        }
    }

    function onRemoteStreamRemoved() {
        Console.log("Remote Sream Removed")
    };

    function onOfferError(err) {
        console.log(err);
    }

    function onMediaError() {
        console.log("Media Error");
    }

    function setLocalAndSendMessage(sessionDescription) {
        sessionDescription.sdp = maybePreferAudioReceiveCodec(sessionDescription.sdp);
        pc.setLocalDescription(sessionDescription, onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
        sendMessage(sessionDescription);
    }

    function onSetSessionDescriptionSuccess() {
        console.log('Set session description success.');
    }

    function onSetSessionDescriptionError(error) {
        console.log('Failed to set session description: ' + error.toString());
    }

    function maybePreferAudioSendCodec(sdp) {
        if (audio_send_codec == '') {
            console.log('No preference on audio send codec.');
            return sdp;
        }
        console.log('Prefer audio send codec: ' + audio_send_codec);
        return preferAudioCodec(sdp, audio_send_codec);
    }

    function maybePreferAudioReceiveCodec(sdp) {
        if (audio_receive_codec == '') {
            console.log('No preference on audio receive codec.');
            return sdp;
        }
        console.log('Prefer audio receive codec: ' + audio_receive_codec);
        return preferAudioCodec(sdp, audio_receive_codec);
    }



    var preferOpus = function(sdp) {
        var sdpLines = sdp.split('\r\n');

        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }
    }


    function setRemote(message) {
        // Set Opus in Stereo, if stereo enabled.
        // if (stereo)
        //   message.sdp = addStereo(message.sdp);
        message.sdp = maybePreferAudioSendCodec(message.sdp);
        pc.setRemoteDescription(new RTCSessionDescription(message), onSetRemoteDescriptionSuccess, onSetRemoteDescriptionError);

    }

    function onSetRemoteDescriptionSuccess() {
        console.log("Set remote session description success.");
        // By now all addstream events for the setRemoteDescription have fired.
        // So we can know if the peer is sending any stream or is only receiving.
        if (remoteStream) {
            waitForRemoteVideo();
        } else {
            console.log("Not receiving any stream.");
            // transitionToActive();
        }
    }

    function onSetRemoteDescriptionError(err) {
        console.log("Set remote session description error: " + err);
    }


    function sendMessage(message) {
          var msgString = JSON.stringify(message);
          console.log('Client to Server: ' + msgString);
	  socket.emit('WebRTC message', message);
    }


    function processSignalingMessage(msg) {
        // var message = JSON.parse(msg.data);
        console.log("Processing");
        if (!started) {
          console.log('peerConnection has not been created yet!');
          //maybeStart();
	  initialize();
          return;
        }
        if(!initialized){
          console.log("Received call but not initialized");
          return;
        }

        if (msg.type === 'offer') {
            setRemote(msg);
            doAnswer();
        } else if (msg.type === 'answer') {
            if(debugAlerts){
              alert("Got the answer");
	          }
            setRemote(msg);
        } else if (msg.type === 'candidate') {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: msg.label,
                candidate: msg.candidate
            });
            // noteIceCandidate("Remote", iceCandidateType(message.candidate));
            pc.addIceCandidate(candidate,
                onAddIceCandidateSuccess, onAddIceCandidateError);
        } else if (msg.type === 'bye') {
            onRemoteHangup();
        }
    }

    function onSetRemoteDescriptionSuccess() {
        console.log("Set remote session description success.");
        // By now all addstream events for the setRemoteDescription have fired.
        // So we can know if the peer is sending any stream or is only receiving.
        if (remoteStream) {
            waitForRemoteVideo();
        } else {
            console.log("Not receiving any stream.");
            // transitionToActive();
        }
        // doAnswer();
    }

    function onSetRemoteDescriptionSuccessAndOffered() {
        console.log("Set remote session description success.");
        // By now all addstream events for the setRemoteDescription have fired.
        // So we can know if the peer is sending any stream or is only receiving.
        if (remoteStream) {
            waitForRemoteVideo();
        } else {
            console.log("Not receiving any stream.");
            // transitionToActive();
        }
        doAnswer();
    }

    function onSetRemoteDescriptionError(err) {
        console.log("OnSetRemoteDescriptionError: " + err);
    }

    function onSetRemoteDescriptionErrorAndOffered(err) {
        console.log("OnSetRemoteDescriptionErrorAndOffered: " + err);
    }

    function onAddIceCandidateSuccess() {
        console.log('AddIceCandidate success.');
    }

    function onAddIceCandidateError(error) {
        console.log('Failed to add Ice Candidate: ' + error.toString());
    }

    function doAnswer() {
        if(debugAlerts){
          alert("Answering");
	}
        console.log("Sending answer to peer.");
        mediaConstraints = {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        }, onMediaError, mediaConstraints;
        pc.createAnswer(setLocalAndSendMessage, onCreateSessionDescriptionError, mediaConstraints);
    }

    function maybeStart() {
        // if (!started && signalingReady && channelReady && turnDone && (localStream || !hasLocalStream)) 
        if (!started && signalingReady && channelReady  && (localStream || !hasLocalStream)) {
            if(debugAlerts){
	      alert("Started");
            }
            console.log('Creating PeerConnection.');
            createPeerConnection();

            if (localStream != null) {
                if(debugAlerts){
		  //alert("Calling the other user");
		  alert('Adding local stream');
                }
                //console.log('Adding local stream.');
                pc.addStream(localStream);
            }

            started = true;

            if (initiator)
                doCall();
            else
                calleeStart();
        }
    }

    function doCall() {
        console.log("Sending offer to peer.");
        // mediaConstraints = {'has_audio':true, 'has_video':true}; 

        mediaConstraints = {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        }, onMediaError, mediaConstraints;

        pc.createOffer(setLocalAndSendMessage, onOfferError, mediaConstraints);
    }

    function calleeStart() {
        // Callee starts to process cached offer and other messages.
        while (msgQueue.length > 0) {
            processSignalingMessage(msgQueue.shift());
        }
    }


    function endCall() {
        socket.emit('disconnect', {roomkey: roomkey ,user_id: user_id});
        localStream = null;
        localVideo.src = null;
    }




    function onCreateSessionDescriptionError(error) {
        console.log('Failed to create session description: ' + error.toString());
    }



    // Set |codec| as the default audio codec if it's present.
    // The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
    function preferAudioCodec(sdp, codec) {
        var fields = codec.split('/');
        if (fields.length != 2) {
            console.log('Invalid codec setting: ' + codec);
            return sdp;
        }
        var name = fields[0];
        var rate = fields[1];
        var sdpLines = sdp.split('\r\n');

        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null)
            return sdp;

        // If the codec is available, set it as the default in m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search(name + '/' + rate) !== -1) {
                var regexp = new RegExp(':(\\d+) ' + name + '\\/' + rate, 'i');
                var payload = extractSdp(sdpLines[i], regexp);
                if (payload)
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex],
                        payload);
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    // Set Opus in stereo if stereo is enabled.
    function addStereo(sdp) {
        var sdpLines = sdp.split('\r\n');

        // Find opus payload.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                break;
            }
        }

        // Find the payload in fmtp line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('a=fmtp') !== -1) {
                var payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
                if (payload === opusPayload) {
                    var fmtpLineIndex = i;
                    break;
                }
            }
        }
        // No fmtp line found.
        if (fmtpLineIndex === null)
            return sdp;

        // Append stereo=1 to fmtp line.
        sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat(' stereo=1');

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return (result && result.length == 2) ? result[1] : null;
    }

    // Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            if (elements[i] !== payload)
                newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

    // Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }

    function waitForRemoteVideo() {
        // Call the getVideoTracks method via adapter.js.
        videoTracks = remoteStream.getVideoTracks();
        if (videoTracks.length === 0 || remoteVideo.currentTime > 0) {
            // transitionToActive();
        } else {
            setTimeout(waitForRemoteVideo, 100);
        }
    }
