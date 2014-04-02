function submitToDisk(api, title) {
    console.log('submit');
    var canvas = document.getElementById('screenshot_canvas');
    var image = canvas.toDataURL();
    console.log(title);
    api.put(title, image);
}

function setScreenshotUrl(imageUrl, title, api) {
    console.log("setScreenshotUrl: " + imageUrl);
    var image = new Image();
    var canvas = document.getElementById('screenshot_canvas');
    var context = canvas.getContext('2d');

    image.addEventListener('load', function () {
        canvas.setAttribute('width', image.width);
        canvas.setAttribute('height', image.height);
        context.drawImage(image, 0, 0);
    });

    image.src = imageUrl;

    document.getElementById('submit').onclick = function () {
        submitToDisk(api, title);
    };
}