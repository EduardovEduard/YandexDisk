function submitToDisk(api) {
    console.log('submit');
    var canvas = document.getElementById('screenshot_canvas');
    var image = canvas.toDataURL();
    console.log(image);
    api.put('/MADE/image.png', image);
}

function setScreenshotUrl(url, api) {
    console.log("setScreenshotUrl: " + url);
    var image = new Image();
    var canvas = document.getElementById('screenshot_canvas');
    var context = canvas.getContext('2d');

    image.addEventListener('load', function () {
        canvas.setAttribute('width', image.width);
        canvas.setAttribute('height', image.height);
        context.drawImage(image, 0, 0);
    });

    image.src = url;

    var submitWithApi = function() {
        submitToDisk(api);
    };

    document.getElementById('submit').onclick = submitWithApi;
}