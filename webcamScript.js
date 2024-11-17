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
            if (data && data.predictions && data.predictions.length > 0) {
                const prediction = data.predictions[0];
                const type = prediction.class;
                resultText.textContent = `Detected: ${type}`;
            } else {
                resultText.textContent = "No trash detected or invalid response.";
            }
        }).catch(err => {
            console.error("Error sending frame to the backend:", err);
            resultText.textContent = "Error detecting trash. Try again.";
        });
    });
}

captureButton.addEventListener('click', captureFrame);
startWebcam();