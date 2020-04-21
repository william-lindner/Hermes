(function (global) {
    ("use strict");

    let xhr;

    // --
    // Response
    function Response(request) {
        this.status = request.status;
        this.response = request.response;
        this.statusText = request.statusText;
        this.responseType = request.responseType;

        this.successful = this.status >= 200 && this.status < 300;
    }

    Response.prototype.json = function () {
        return (this.response = JSON.parse(this.response));
    };

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
        let throws = false,
            response = new Response(request);

        try {
            this.exec(this._then, response);
        } catch (e) {
            if (!this._catch.length) {
                throws = e;
            } else {
                this.exec(this._catch, response);
            }
        }

        this.exec(this._finally, response);

        if (throws) {
            throw new Error(e);
        }
    };

    Atlantiades.prototype.exec = function (chain, response) {
        if (!response.successful) {
            throw new Error(response);
        }

        let result = response;

        chain.forEach(function (callback) {
            result = callback(result);
        });

        return result;
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
        console.log(response.json());
        return response.json();
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
