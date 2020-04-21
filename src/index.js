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
        if (typeof this.response === "object") {
            return this.response;
        }

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
                this.exec(this._catch, response, false);
            }
        }

        this.exec(this._finally, response, false);

        if (throws) {
            throw new Error(e);
        }
    };

    Atlantiades.prototype.exec = function (chain, response, check = true) {
        if (check && !response.successful) {
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

        this.xhr.responseType = message.expect || "json";

        this.formally = method !== "GET" ? this.formify(message.params) : null;

        if (method === "GET") {
            destination = this.label(destination, message.params);
        } else {
            this.formally = this.formify(message.params);
        }

        this.xhr.open(method, destination, true);
    }

    Parcel.prototype.formify = function (params) {
        if (!params) {
            return null;
        }

        const formData = new FormData();

        for (let key in params) {
            formData.append(key, params[key]);
        }

        return formData;
    };

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
        this.xhr.send(this.formally);

        return this;
    };

    // --
    // Application entry point
    const hermes = {
        get: function (destination, payload = {}) {
            const parcel = new Parcel("GET", destination, payload);

            return new Atlantiades(parcel);
        },
        post: function (destination, payload = {}) {
            const parcel = new Parcel("POST", destination, payload);

            return new Atlantiades(parcel);
        },
    };

    global.hermes = hermes;
})(window);

hermes
    .post("https://jsonplaceholder.typicode.com/posts", {
        expect: "json",
        params: {
            userId: 1,
            body: "Another note!",
        },
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (response) {
        console.log(response);
    })
    .finally(function (response) {
        console.log(response);
    });
