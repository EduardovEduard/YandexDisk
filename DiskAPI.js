var DiskApi = {
    host: 'https://webdav.yandex.ru',

    make_directory: function(path) {
        console.log('Path: ' + path);
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

        console.log(imageSource);

        var hashes = this.getHashes(imageSource);

        var request = new XMLHttpRequest();
        request.open('PUT', this.host + path);
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

        request.send(imageSource);
    }
}