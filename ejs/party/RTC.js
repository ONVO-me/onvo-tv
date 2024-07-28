const iceConfiguration = {
    iceServers: [
        {
            urls: 'stun:178.16.130.67:3478',
        },
        {
            urls: 'turns:178.16.130.67:5349',
            username: 'turn', 
            credential: 'turn' 
        }
    ]
};

const senderPeerConnection = new RTCPeerConnection(iceConfiguration, {
    optional: [{
        RtpDataChannels: true
    }]
});
let dataChannel;
let localStream;

const establishSender = async () => {
    const mediaStreamPromise = navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const stream = await mediaStreamPromise;
    senderPeerConnection.addStream(stream);

    dataChannel = senderPeerConnection.createDataChannel('jsonChannel', {
        reliable: false
    });

    dataChannel.onopen = () => {
        var readyState = dataChannel.readyState;
        if (readyState == "open") {
            dataChannel.send("Hello");
        }
        console.log('DataChannel opened');
    };

    dataChannel.onclose = () => {
        console.log('DataChannel closed');
    };

    dataChannel.onerror = (error) => {
        console.error('DataChannel error:', error);
    };
    dataChannel.onmessage = (event) => {
        appendAlert(event.data);
        console.log('Received message through DataChannel:', event.data);
    }

    const offer = await senderPeerConnection.createOffer();
    await senderPeerConnection.setLocalDescription(offer);

    console.log('Sender Local description set:', senderPeerConnection.localDescription);

    party.socket.send(JSON.stringify({
        ct: 'rtc',
        to: 'reciver',
        type: 'offer',
        sdp: senderPeerConnection.localDescription
    }));

    senderPeerConnection.oniceconnectionstatechange = event => {
        console.log('Sender ICE connection state change:', senderPeerConnection.iceConnectionState);
        if (senderPeerConnection.iceConnectionState === 'connected') {
            console.log('Sender WebRTC connection established!');
        } else if (senderPeerConnection.iceConnectionState === 'disconnected') {
            console.log('Sender WebRTC connection disconnected!');
        }
    };

    senderPeerConnection.onicecandidateerror = event => {
        console.error('Sender ICE candidate error:', event.error);
    };
    senderPeerConnection.onicegatheringstatechange = event => {
        console.log('Sender ICE gathering state change:', senderPeerConnection.iceGatheringState);
    };
    senderPeerConnection.onconnectionstatechange = event => {
        console.log('Sender Connection state change:', senderPeerConnection.connectionState);
    };


    senderPeerConnection.onicecandidate = event => {

        if (event.candidate) {
            console.log('Sender Generated ICE candidate:', event.candidate);
            party.socket.send(JSON.stringify({
                ct: 'rtc',
                to: 'reciver',
                type: 'candidate',
                candidate: event.candidate
            }));
        }
    };
}



function handeSocketRTC(data) {

    // recived offer

    if (data.type === 'offer' && data.to == 'reciver') {
        console.log('Receiver Received offer');
        receiverPeerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
            .then(() => {
                return receiverPeerConnection.createAnswer();
            })
            .then(answer => {
                console.log('Receiver Created SDP answer ');
                return receiverPeerConnection.setLocalDescription(answer);
            })
            .then(() => {
                console.log('Receiver Local description set ');
                party.socket.send(JSON.stringify({
                    ct: 'rtc',
                    to: 'sender',
                    type: 'answer',
                    sdp: receiverPeerConnection.localDescription
                }));
            })
            .catch(error => {
                console.error('Receiver Error handling offer:', error);
            });
    }

    if (data.type === 'answer' && data.to == 'sender') {
        senderPeerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
            .then(() => {
                console.log('Sender Remote description set');
            })
            .catch(error => {
                console.error('Sender Error setting remote description:', error);
            });
    }

    if (data.type === 'candidate' && data.to == 'sender') {
        console.log('Sender Received ICE candidate');
        senderPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            .then(() => {
                console.log('sender Added ICE candidate successfully');
            })
            .catch(error => {
                console.error('Sender Error adding ICE candidate:', error);
            });
    }

    if (data.type === 'candidate' && data.to == 'reciver') {
        console.log('Receiver Received ICE candidate ');
        receiverPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            .then(() => {
                console.log('Receiver Added ICE candidate successfully');
            })
            .catch(error => {
                console.error('Receiver Error adding ICE candidate:', error);
            });
    }
}



function fileToStream(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            const blob = new Blob([arrayBuffer], { type: file.type });

            const mediaStream = URL.createObjectURL(blob);

            const video = document.createElement('video');
            video.src = mediaStream;
            video.addEventListener('loadedmetadata', () => {
                const stream = video.captureStream();
                resolve(stream);
            });

            video.onerror = function (error) {
                reject(error);
            };
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}

async function fileInput() {
    return new Promise((resolve, reject) => {
        inputElement.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            const data = await fileToStream(file);
            console.log(data);
            resolve(data);
        });
    });
}

const receiverPeerConnection = new RTCPeerConnection();

const establishReciver = () => {

    receiverPeerConnection.oniceconnectionstatechange = event => {
        console.log('Receiver ICE connection state change:', receiverPeerConnection.iceConnectionState);
        if (receiverPeerConnection.iceConnectionState === 'connected') {
            console.log('Receiver WebRTC connection established!');
        } else if (receiverPeerConnection.iceConnectionState === 'disconnected') {
            console.log('Receiver WebRTC connection disconnected!');
        }
    };

    receiverPeerConnection.ontrack = event => {
        const remoteStream = event.streams[0]; // Get the remote stream
        const videoElement = document.createElement('video'); // Create a new video element
        videoElement.srcObject = remoteStream; // Set the srcObject of the video element to the remote stream
        videoElement.autoplay = true; // Autoplay the video
        document.body.appendChild(videoElement); // Append the video element to the document body or any other desired DOM element
    };

    receiverPeerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log('Receiver Generated ICE candidate');
            party.socket.send(JSON.stringify({
                ct: 'rtc',
                to: 'sender',
                type: 'candidate',
                candidate: event.candidate
            }));
        }
    };

    receiverPeerConnection.ondatachannel = event => {
        dataChannel = event.channel;
        dataChannel.onopen = () => {
            console.log('DataChannel opened');
        };

        dataChannel.onclose = () => {
            console.log('DataChannel closed');
        };

        dataChannel.onerror = (error) => {
            console.error('DataChannel error:', error);
        };

        dataChannel.onmessage = (event) => {
                appendAlert(event.data)
            console.log('Received message through DataChannel:', event.data);
        };
    };
}
