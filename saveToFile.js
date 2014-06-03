
$(document).ready(function() {
   $('#save_button').click(function() {
       var content = $('#screenshot_canvas')[0].toDataURL();
       content = base64ToBinary(content);
       var blob = new Blob([content]);
       saveToDisk(blob, localStorage.title + '.png');
   });
});

function base64ToBinary(url) {
    var replaceRegexp = /^data:image\/(jpeg|png);base64,/;
    var imageSource = url.replace(replaceRegexp, "");
    var raw = atob(imageSource);
    var length = raw.length;
    var array = new Uint8Array(new ArrayBuffer(length));

    for (var i = 0; i < length; ++i) {
        array[i] = raw.charCodeAt(i);
    }

    return array;
}

function saveToDisk(blob, filename) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function(event) {
        var save = document.createElement('a');
        save.href = event.target.result;
        save.target = '_blank';
        save.download = filename;

        var downloadEvent = document.createEvent('Event');
        downloadEvent.initEvent('click', true, true);
        save.dispatchEvent(downloadEvent);

        console.log('saved');
        delete save;
    };
}