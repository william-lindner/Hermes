(function (global) {
    ("use strict");

    let xhr;

    // --
    // Atlantiades messager to the gods
    function Atlantiades(parcel) {
        this._then = [];
        this._catch = [];
        this._finally = [];

        this._tracking = null;
        this._parcel = parcel;

        this._parcel.track(this.herald.bind(this)).send();
    }

    Atlantiades.prototype.herald = function (request) {
        let payload = request.response;

        if (request.status >= 200 && request.status < 300) {
            let chain = payload;

            this._then.forEach(function (callback) {
                chain = callback(chain);
            });
        } else {
            if (!this._catch.length) {
                throw new Error(request);
            }

            this._catch.forEach(function (callback) {
                callback(request);
            });
        }

        this._finally.forEach(function (callback) {
            callback(payload);
        });
    };

    Atlantiades.prototype.then = function (callback) {
        this._then.push(callback);

        return this;
    };

    Atlantiades.prototype.catch = function (callback) {
        this._catch.push(callback);

        return this;
    };

    Atlantiades.prototype.finally = function (callback) {
        this._finally.push(callback);

        return this;
    };

    // --
    // The package being sent
    function Parcel(method, destination, message = {}) {
        this.xhr = xhr = xhr || new XMLHttpRequest();

        this.xhr.open(method, this.label(destination, message.params), true);
    }

    Parcel.prototype.label = function (destination, params) {
        if (!params) {
            return;
        }

        let uri = destination + "?";

        for (let key in params) {
            uri +=
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(params[key]) +
                "&";
        }

        return uri.substring(0, uri.length - 1);
    };

    Parcel.prototype.track = function (tracker) {
        this.xhr.onload = function () {
            tracker(this);
        };

        return this;
    };

    Parcel.prototype.send = function () {
        this.xhr.send();

        return this;
    };

    // --
    // Application entry point
    const hermes = {
        get: function (destination, payload = {}) {
            const parcel = new Parcel("GET", destination, payload);

            return new Atlantiades(parcel);
        },
    };

    global.hermes = hermes;
})(window);

hermes
    .get("https://jsonplaceholder.typicode.com/posts", {
        params: {
            userId: 1,
        },
    })
    .then(function (response) {
        return "hey";
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (request) {
        console.log(request);
    })
    .finally(function (response) {
        console.log(response);
    });
