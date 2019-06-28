/**
 * @author William Lindner
 * @license MIT
 *
 *  Location for test requests:
 *  https://jsonplaceholder.typicode.com
 */

(global => {
  //

  ('use strict');

  /**
   * Transforms a dataset into a get request manageable url string
   *
   * @function
   */
  const GET = {
    parse(dataObject) {
      let getString = '?';
      // takes an object and turns it into a string for
      for (key in dataObject) {
        getString +=
          encodeURIComponent(key) +
          '=' +
          encodeURIComponent(dataObject[key]) +
          '&';
      }

      return getString;
    }
  };

  old = {
    request(options = {}, callback) {
      console.info('sending the request');
      return;
      const self = this;
      console.group('Simple-XHR Request');
      // establish XHR request (asynchronous)
      const XHR = new XMLHttpRequest();

      // set the URL for GET scenarios
      if (self.method === 'GET') {
        self.url += GET.parse(self.data);
      }
      // Open the XHR request to the file with the options passed
      XHR.open(self.method, self.url, self.async);
      XHR.timeout = self.timeOut;

      // Serialize the data for parsing with forms as url encoded items
      let requestData = self.formalize(self.data);

      // Add an error handler for the XHR request
      XHR.onerror = function(e) {
        console.log(e);
        reject('There was an error with the hermes request.');
        // when there is an error do something
      };

      XHR.onprogress = function() {
        // this is for my progress bar when it is loading something
      };

      XHR.ontimeout = function() {
        // do something when a timeout occurs
      };

      /**
       *
       */
      XHR.onload = function() {
        // set the base status and responses to the overal object
        self.status = this.status;
        self.responseText = this.responseText;
        self.statusText = this.statusText;

        // evaluate the status and react accordingly
        switch (this.status) {
          case 200:
            switch (self.dataType) {
              case 'json':
                try {
                  self.response = JSON.parse(this.responseText);
                  self.response = self.response.response || self.response;
                } catch (e) {}
                break;
              default:
                self.response = this.responseText;
            }
            break;
          default:
            console.log('There was an issue with your request', this.status);
        }
        resolve({
          status: this.status,
          response: self.response
        });
      };

      try {
        switch (self.method) {
          case 'GET':
            XHR.send();
            break;
          default:
            XHR.send(requestData);
        }
      } catch (e) {}

      console.groupEnd('Simple-XHR Request');
    },
    serialize(data) {
      data = data || this.data;

      // private function for correction of data when sending post requests as objects
      this.data = (object => {
        if (object === null) return;
        let answer = [];
        for (let value in object) {
          answer.push(
            encodeURIComponent(value) + '=' + encodeURIComponent(answer[value])
          );
        }
        return answer.join('&');
      })(data);
    },
    formalize(data = {}) {
      const formData = new FormData();
      for (let key in data) {
        formData.append(key, data[key]);
      }
      return formData;
    },
    setOptions(options = {}) {
      // Fix options that may be passed as something other than object to the default object
      options = typeof options !== 'object' ? {} : options;

      /* 
              Setup the default options - these can be reconfigured
              These double as an example of the options available to you when making new hermes requests
              The type indicator is used later for a data integrity check cycle
            */
      const defaultOptions = {
        url: {
          default: '', // you can set a default url to return error content from your server based on the user
          type: 'string'
        },
        method: {
          default: 'GET',
          type: 'string',
          allow: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] // PUT will be added later as use cases arise
        },
        dataType: {
          default: 'json',
          type: 'string',
          allow: ['json', 'text', 'document']
        },
        async: {
          default: true,
          type: 'boolean'
        },
        data: {
          default: {},
          type: 'object'
        },
        logging: {
          default: false,
          type: 'boolean'
        },
        progressIndicator: {
          default: '',
          type: 'string'
        },
        timeOut: {
          default: 600000, // 10 minutes --
          type: 'number'
        },
        beforeSend: {}, // callback to run before sending the request
        complete: {}, // callback for when the request is completed
        dataFilter: {}, // callback to parse the data before returning it
        statusCode: {} // callbacks for when a particular code is received
        /*
                  application/json
                */
      };

      // establish default parameters in absence of options
      options.url =
        options.url || options.uri || this.url || defaultOptions.url.default;
      options.method =
        options.method ||
        options.type ||
        this.type ||
        defaultOptions.method.default;
      options.dataType =
        options.dataType || this.dataType || defaultOptions.dataType.default;
      options.async =
        options.async || this.async || defaultOptions.async.default;
      options.data = options.data || this.data || defaultOptions.data.default;
      options.logging =
        options.logging || this.logging || defaultOptions.logging.default;
      options.progressIndicator =
        options.progressIndicator ||
        this.progressIndicator ||
        defaultOptions.progressIndicator.default;
      options.timeOut =
        options.timeOut || this.timeOut || defaultOptions.timeOut.default;

      // #Check the integrity of the options based on the expected types
      for (let key in options) {
        const evaluateOption = options[key];
        const expectedOption = defaultOptions[key];
        const receivedType = typeof evaluateOption;

        //! If the option passed is not actually an option available throw an error
        if (
          receivedType === 'undefined' ||
          typeof expectedOption === 'undefined'
        ) {
          throw new Error(
            `Received an unexpected parameter "${key}": '${evaluateOption}'. Please refer to the documentation for hermes.`
          );
        }

        //! If there is an issue with the keys throw an error
        if (receivedType !== expectedOption.type) {
          throw new Error(
            `Expected type '${
              expectedOption.type
            }' for '${key}' property. Instead hermes received '${evaluateOption}' of type '${receivedType}'`
          );
        }

        // fix expected options for known string types after they have passed the integrity check
        options.method = options.method.toUpperCase();
        options.dataType = options.dataType.toLowerCase();

        //! Check to make certain the value passed is something that is allowable by the default options
        if (typeof expectedOption.allow !== 'undefined') {
          if (!expectedOption.allow.includes(evaluateOption)) {
            throw new Error(
              `The value of "${key}" as '${evaluateOption}' is not allowed / supported by hermes. Please refer to the documentation.`
            );
          }
        }
      } // #Check end

      // Place the options into this
      Object.assign(this, options);
    }
  };

  let $package = {};
  let $options = {};
  let $instance, $xhr;

  /**
   * Used to interpret the arguments passed to Hermes
   *
   * @param {*} message
   */
  function parcelService(message = {}) {
    const type = Object.prototype.toString.call(message);

    if (type === '[object Object]') {
      Object.assign($package, message);
    }

    if (type === '[object Array]') {
      switch (typeof message[0]) {
        case 'string':
          $package.url = message[0];
          break;
        case 'object':
          $package = message[0];
      }

      if (typeof message[1] === 'object') {
        Object.assign($package, message[1]);
      }
    }
    return $package;
  }

  /**
   *
   */
  const listener = function() {
    // set the base status and responses to the overal object
    const status = this.status;
    const responseText = this.responseText;
    const statusText = this.statusText;

    const dataType = 'json';

    let response = {};

    console.log(this);

    // evaluate the status and react accordingly
    switch (this.status) {
      case 200:
        switch (dataType) {
          case 'json':
            try {
              response = JSON.parse(this.responseText);
            } catch (e) {
              console.error(e);
            }
            break;
          default:
            response = this.responseText;
        }
        break;
      default:
        console.log('There was an issue with your request', this.status);
    }
    return response;
  };

  /**
   *
   */
  class Hermes {
    constructor(options = {}) {
      Object.assign(this, options);
    }
    set() {}
    request() {
      //   if (this === undefined) {
      //     return $instance;
      //   }

      $xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1', true);
      $xhr.onload = listener;
      $xhr.send();
    }
  }

  /**
   * Hermes can accept two parameters. The first can be an object or a string (containing the url).
   * The second must always be an object.
   *
   * @param {*}
   */
  global.hermes = function(...args) {
    $instance = new Hermes(parcelService(...args));
    $xhr = new XMLHttpRequest();

    if (!(this instanceof Window)) {
      return $instance;
    }

    return $instance.request;
  };

  //
})(window);

/*
| Testing code for Hermes 1.0
*/

console.group('Starting Hermes...');

const res = hermes();
console.log(res());

const ajax = new hermes('https://google.com', {
  data: {
    hey: true
  }
});
console.log('Instance', ajax);

console.groupEnd('Starting Hermes...');
