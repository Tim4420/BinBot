const video = document.getElementById("webcam");
const captureButton = document.getElementById("capture");
const resultText = document.getElementById("resultText");

function startWebcam() {
    navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
        video.srcObject = stream;
    }).catch(err => {
        console.error("Error accessing the webcam: ", err);
        resultText.textContent = "Webcam access denied. Please allow webcam permissions."
    })
}

function captureFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'image.jpg');

        fetch('https://detect.roboflow.com/yolo-waste-detection-fcabg/1?api_key=dRr9cwWEIUMqxM5AIUp5', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            if (data.predictions && data.predictions.length > 0) {
                const prediction = data.predictions[0];
                resultText.textContent = `Class: ${prediction.class}, Confidence: ${prediction.confidence.toFixed(2)}`;
            } else {
                resultText.textContent = "No trash detected.";
            }
        }).catch(err => {
            console.error("Error sending frame to the backend:", err);
            resultText.textContent = "Error detecting trash. Try again.";
        });
    });
}

const darkModeToggle = document.getElementById("darkModeToggle");

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    captureButton.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    captureButton.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});

captureButton.addEventListener('click', captureFrame);

startWebcam();