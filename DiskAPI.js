XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    function byteValue(x) {
        return x.charCodeAt(0) & 0xff;
    }
    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a);
}

var PUBLISH_STRING = '<propertyupdate xmlns="DAV:">' +
    '<set>' +
    '<prop>' +
    '<public_url xmlns="urn:yandex:disk:meta">true</public_url>' +
    '</prop></set></propertyupdate>';

var DiskApi = {
    host: 'https://webdav.yandex.ru',

    make_directory: function(path) {
        console.log('Path: ' + path);
        this.isPathExists(path, function(result) {
            if (result == false)
            {
                this.directory = path;

                var request = new XMLHttpRequest();

                request.open('MKCOL', DiskApi.host + path);

                request.setRequestHeader('Accept', '*/*');
                request.setRequestHeader('Authorization', 'OAuth ' + DiskApi.token);

                request.onreadystatechange = function (state) {
                    if (state == XMLHttpRequest.DONE) {
                        console.log("Request done!");
                        console.log(this.responseText);
                    }
                }

                request.send(null);
            }
        });
    },

    getHashes: function(image) {
        return {
            'Sha256': CryptoJS.SHA256(image),
            'Etag': CryptoJS.MD5(image)
        };
    },

    put: function(image) {
        var dateString = new Date().toString().split(' ').join('_').slice(0, -15);

        var replaceRegexp = /^data:image\/(jpeg|png);base64,/;
        var imageSource = image.replace(replaceRegexp, "");
        imageSource = atob(imageSource);

        var hashes = this.getHashes(imageSource);
        var request = new XMLHttpRequest();

        var slash = (localStorage.directory.slice(-1) == '/') ? '' : '/';
        var requestString = this.host + localStorage.directory + slash + localStorage.title + ":" + dateString;
        localStorage.lastSavedFile = localStorage.title + ":" + dateString;

        console.log("Request: " + requestString);
        request.open('PUT', requestString);

        request.setRequestHeader('Accept', '*/*');
        request.setRequestHeader('Authorization', 'OAuth ' + this.token);

        for (var header in hashes) {
            if (hashes.hasOwnProperty(header)) {
                request.setRequestHeader(header, hashes[header]);
            }
        }

        request.onload = function() {
            console.log("Put finished!");
            console.log(this.responseText);
            DiskApi.publish(requestString, null);
        }

        request.sendAsBinary(imageSource);
    },

    isPathExists: function(path, callback) {
        localStorage.directory = path;
        var request = new XMLHttpRequest();

        console.log("API: PROPFIND " + path);
        request.open('PROPFIND', this.host + path);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('Authorization', 'OAuth ' + this.token);

        request.setRequestHeader('Depth', '1');

        request.onload = function() {
            if (this.status == 404) {
                callback(false);
            }
            else {
                callback(true);
            }
        }

        request.send(null);
    },

    publish: function(path, callback) {
        var request = new XMLHttpRequest();

        request.open('PROPPATCH', path);
        request.setRequestHeader('Authorization', 'OAuth ' + this.token);

        request.onload = function() {
            console.log('Proppatch status: ' + this.status);
            console.log('Proppatch response: ' + this.responseText);
            var xml = $.parseXML(this.responseText);

            $xml = $(xml), $url = $xml.find('public_url');
            chrome.tabs.sendMessage(parseInt(localStorage.screenshotTabId), {publicUrl : $url.text()}, function(response) {
               console.log(response.farewell);
            });
        };

        request.send(PUBLISH_STRING);
    }
}