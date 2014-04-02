XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    function byteValue(x) {
        return x.charCodeAt(0) & 0xff;
    }
    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a);
}

var DiskApi = {
    host: 'https://webdav.yandex.ru',

    make_directory: function(path) {
        console.log('Path: ' + path);

        this.directory = path;

        var request = new XMLHttpRequest();

        request.open('MKCOL', this.host + path);

        request.setRequestHeader('Accept', '*/*');
        request.setRequestHeader('Authorization', 'OAuth ' + this.token);

        request.onreadystatechange = function (state) {
            if (state == XMLHttpRequest.DONE) {
                console.log("Request done!");
                console.log(this.responseText);
            }
        }

        request.send(null);
    },

    getHashes: function(image) {
        return {
            'Sha256': CryptoJS.SHA256(image),
            'Etag': CryptoJS.MD5(image)
        };
    },

    put: function(path, image) {
        console.log("API: PUT");
        var replaceRegexp = /^data:image\/(jpeg|png);base64,/;
        var imageSource = image.replace(replaceRegexp, "");
        imageSource = atob(imageSource);

        var hashes = this.getHashes(imageSource);
        var request = new XMLHttpRequest();

        var slash = (this.directory.slice(-1) == '/') ? '' : '/';
        request.open('PUT', this.host + this.directory + slash + path);

        request.setRequestHeader('Accept', '*/*');
        request.setRequestHeader('Authorization', 'OAuth ' + this.token);

        for (var header in hashes) {
            if (hashes.hasOwnProperty(header)) {
                request.setRequestHeader(header, hashes[header]);
            }
        }

        request.onload = function() {
            console.log("Request done!");
            console.log(this.responseText);
        }

        request.sendAsBinary(imageSource);
    }
}