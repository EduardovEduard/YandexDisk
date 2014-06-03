
$(document).ready(function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        if (request.publicUrl) {
            $('#public_url').val(request.publicUrl);
            sendResponse({farewell: 'goodbye'});
        }
    });
});

function submitToDisk(api) {
    console.log('submit');
    var canvas = document.getElementById('screenshot_canvas');
    var image = canvas.toDataURL();
    api.put(image);
}

function setScreenshotUrl(imageUrl, api) {
    console.log("setScreenshotUrl: " + imageUrl);
    var image = new Image();
    var canvas = document.getElementById('screenshot_canvas');
    var drawingCanvas = document.getElementById('drawing_canvas');
    var context = canvas.getContext('2d');

    image.addEventListener('load', function () {
        canvas.setAttribute('width', image.width);
        canvas.setAttribute('height', image.height);

        drawingCanvas.setAttribute('width', image.width);
        drawingCanvas.setAttribute('height', image.height);

        context.drawImage(image, 0, 0);
    });

    image.src = imageUrl;

    document.getElementById('submit').onclick = function () {
        submitToDisk(api);
    };
}