/*! AeroGear JavaScript Library - v2.0.0 - 2014-10-23
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function( window, undefined ) {

/**
    The AeroGear namespace provides a way to encapsulate the library's properties and methods away from the global namespace
    @namespace
 */
this.AeroGear = {};

/**
    AeroGear.Core is a base for all of the library modules to extend. It is not to be instantiated and will throw an error when attempted
    @class
    @private
 */
AeroGear.Core = function() {
    // Prevent instantiation of this base class
    if ( this instanceof AeroGear.Core ) {
        throw "Invalid instantiation of base class AeroGear.Core";
    }

    /**
        This function is used by the different parts of AeroGear to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};
        this[ this.collectionName ] = collection;

        if ( !config ) {
            return this;
        } else if ( typeof config === "string" ) {
            // config is a string so use default adapter type
            collection[ config ] = AeroGear[ this.lib ].adapters[ this.type ]( config, this.config );
        } else if ( Array.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    collection[ current ] = AeroGear[ this.lib ].adapters[ this.type ]( current, this.config );
                } else {
                    if( current.name ) {

                        // Merge the Module( authz, datamanger, ... )config with the adapters settings
                        current.settings = AeroGear.extend( current.settings || {}, this.config );

                        collection[ current.name ] = AeroGear[ this.lib ].adapters[ current.type || this.type ]( current.name, current.settings );
                    }
                }
            }
        } else {
            if( !config.name ) {
                return this;
            }

            // Merge the Module( authz, datamanger, ... )config with the adapters settings
            // config is an object so use that signature
            config.settings = AeroGear.extend( config.settings || {}, this.config );

            collection[ config.name ] = AeroGear[ this.lib ].adapters[ config.type || this.type ]( config.name, config.settings );
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
    /**
        This function is used internally by datamanager, etc. to remove an Object (store, etc.) from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object. See the particular constructor for the object calling .remove for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};

        if ( typeof config === "string" ) {
            // config is a string so delete that item by name
            delete collection[ config ];
        } else if ( Array.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    delete collection[ current ];
                } else {
                    delete collection[ current.name ];
                }
            }
        } else if ( config ) {
            // config is an object so use that signature
            delete collection[ config.name ];
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
};

/**
    Utility function to merge many Objects in one target Object which is the first object in arguments list.
    @private
    @method
*/
AeroGear.extend = function() {
    var name, i, source,
        target = arguments[ 0 ];
    for( i=1; i<arguments.length; i++ ) {
        source = arguments[ i ];
        for( name in source ) {
            target[ name ] = source[ name ];
        }
    }
    return target;
};

(function() {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };
})();

define("promise/all", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @for RSVP
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    function all(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && isFunction(promise.then)) {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }

    __exports__.all = all;
  });
define("promise/asap", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : this;

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }

    __exports__.asap = asap;
  });
define("promise/cast", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.Promise.cast` returns the same promise if that promise shares a constructor
      with the promise being casted.

      Example:

      ```javascript
      var promise = RSVP.resolve(1);
      var casted = RSVP.Promise.cast(promise);

      console.log(promise === casted); // true
      ```

      In the case of a promise whose constructor does not match, it is assimilated.
      The resulting promise will fulfill or reject based on the outcome of the
      promise being casted.

      In the case of a non-promise, a promise which will fulfill with that value is
      returned.

      Example:

      ```javascript
      var value = 1; // could be a number, boolean, string, undefined...
      var casted = RSVP.Promise.cast(value);

      console.log(value === casted); // false
      console.log(casted instanceof RSVP.Promise) // true

      casted.then(function(val) {
        val === value // => true
      });
      ```

      `RSVP.Promise.cast` is similar to `RSVP.resolve`, but `RSVP.Promise.cast` differs in the
      following ways:
      * `RSVP.Promise.cast` serves as a memory-efficient way of getting a promise, when you
      have something that could either be a promise or a value. RSVP.resolve
      will have the same effect but will create a new promise wrapper if the
      argument is a promise.
      * `RSVP.Promise.cast` is a way of casting incoming thenables or promise subclasses to
      promises of the exact class specified, so that the resulting object's `then` is
      ensured to have the behavior of the constructor you are calling cast on (i.e., RSVP.Promise).

      @method cast
      @for RSVP
      @param {Object} object to be casted
      @return {Promise} promise that is fulfilled when all properties of `promises`
      have been fulfilled, or rejected if any of them become rejected.
    */


    function cast(object) {
      /*jshint validthis:true */
      if (object && typeof object === 'object' && object.constructor === this) {
        return object;
      }

      var Promise = this;

      return new Promise(function(resolve) {
        resolve(object);
      });
    }

    __exports__.cast = cast;
  });
define("promise/config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {
      instrument: false
    };

    function configure(name, value) {
      if (arguments.length === 2) {
        config[name] = value;
      } else {
        return config[name];
      }
    }

    __exports__.config = config;
    __exports__.configure = configure;
  });
define("promise/polyfill", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var RSVPPromise = __dependency1__.Promise;
    var isFunction = __dependency2__.isFunction;

    function polyfill() {
      var es6PromiseSupport = 
        "Promise" in window &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "cast" in window.Promise &&
        "resolve" in window.Promise &&
        "reject" in window.Promise &&
        "all" in window.Promise &&
        "race" in window.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new window.Promise(function(r) { resolve = r; });
          return isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        window.Promise = RSVPPromise;
      }
    }

    __exports__.polyfill = polyfill;
  });
define("promise/promise", 
  ["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var configure = __dependency1__.configure;
    var objectOrFunction = __dependency2__.objectOrFunction;
    var isFunction = __dependency2__.isFunction;
    var now = __dependency2__.now;
    var cast = __dependency3__.cast;
    var all = __dependency4__.all;
    var race = __dependency5__.race;
    var staticResolve = __dependency6__.resolve;
    var staticReject = __dependency7__.reject;
    var asap = __dependency8__.asap;

    var counter = 0;

    config.async = asap; // default async is asap;

    function Promise(resolver) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._subscribers = [];

      invokeResolver(resolver, this);
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      then: function(onFulfillment, onRejection) {
        var promise = this;

        var thenPromise = new this.constructor(function() {});

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        return thenPromise;
      },

      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    Promise.all = all;
    Promise.cast = cast;
    Promise.race = race;
    Promise.resolve = staticResolve;
    Promise.reject = staticReject;

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      publish(promise, promise._state = REJECTED);
    }

    __exports__.Promise = Promise;
  });
define("promise/race", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */
    var isArray = __dependency1__.isArray;

    /**
      `RSVP.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    function race(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to race.');
      }
      return new Promise(function(resolve, reject) {
        var results = [], promise;

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    }

    __exports__.race = race;
  });
define("promise/reject", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    function reject(reason) {
      /*jshint validthis:true */
      var Promise = this;

      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }

    __exports__.reject = reject;
  });
define("promise/resolve", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.resolve` returns a promise that will become fulfilled with the passed
      `value`. `RSVP.resolve` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        resolve(1);
      });

      promise.then(function(value){
        // value === 1
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @for RSVP
      @param {Any} value value that the returned promise will be resolved with
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve(value) {
      /*jshint validthis:true */
      var Promise = this;
      return new Promise(function(resolve, reject) {
        resolve(value);
      });
    }

    __exports__.resolve = resolve;
  });
define("promise/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x) {
      return typeof x === "function";
    }

    function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };


    __exports__.objectOrFunction = objectOrFunction;
    __exports__.isFunction = isFunction;
    __exports__.isArray = isArray;
    __exports__.now = now;
  });
requireModule('promise/polyfill').polyfill();
}());
;(function () {

  var
    object = typeof window != 'undefined' ? window : exports,
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    INVALID_CHARACTER_ERR = (function () {
      // fabricate a suitable error object
      try { document.createElement('$'); }
      catch (error) { return error; }}());

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) throw INVALID_CHARACTER_ERR;
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '')
    if (input.length % 4 == 1) throw INVALID_CHARACTER_ERR;
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

/**
    The AeroGear.ajax is used to perform Ajax requests.
    @status Experimental
    @param {Object} [settings={}] - the settings to configure the request
    @param {String} [settings.url] - the url to send the request to
    @param {String} [settings.type="GET"] - the type of the request
    @param {String} [settings.dataType="json"] - the data type of the recipient's response
    @param {String} [settings.accept="application/json"] - the media types which are acceptable for the recipient's response
    @param {String} [settings.contentType="application/json"] - the media type of the entity-body sent to the recipient
    @param {Object} [settings.headers] - the HTTP request headers
    @param {Object} [settings.params] - contains query parameters to be added in URL in case of GET request or in request body in case of POST and application/x-www-form-urlencoded content type
    @param {Object} [settings.data] - the data to be sent to the recipient
    @returns {Object} An ES6 Promise - the object returned will look like:

    {
        data: dataOrError, - the data or an error
        statusText: statusText, - the status of the response
        agXHR: request - the xhr request object
    };

    @example

        var es6promise = AeroGear.ajax({
            type: "GET",
            params: {
                param1: "val1"
            },
            url: "http://SERVER:PORT/CONTEXT"
        });
*/
AeroGear.ajax = function( settings ) {
    return new Promise( function( resolve, reject ) {
        settings = settings || {};

        var request = new XMLHttpRequest(),
            that = this,
            requestType = ( settings.type || "GET" ).toUpperCase(),
            responseType = ( settings.dataType || "json" ).toLowerCase(),
            accept = ( settings.accept || "application/json" ).toLowerCase(),
            // TODO: compare contentType by checking if it starts with some value since it might contains the charset as well
            contentType = ( settings.contentType || "application/json" ).toLowerCase(),
            header,
            name,
            urlEncodedData = [],
            url = settings.url,
            data = settings.data;

        if ( settings.params ) {
            // encode params
            if( requestType === "GET" || ( requestType === "POST" && contentType === "application/x-www-form-urlencoded" ) ) {
                for( name in settings.params ) {
                    urlEncodedData.push( encodeURIComponent( name ) + "=" + encodeURIComponent( settings.params[ name ] || "" ) );
                }
            // add params in request body
            } else if ( contentType === "application/json" ) {
                data = data || {};
                data.params = data.params || {};
                AeroGear.extend( data.params,  settings.params );
            }
        }

        if ( contentType === "application/x-www-form-urlencoded" ) {
            if ( data ) {
                for( name in data ) {
                    urlEncodedData.push( encodeURIComponent( name ) + '=' + encodeURIComponent( data[ name ] ) );
                }
            }
            data = urlEncodedData.join( "&" );
        }

        // if is GET request & URL params exist then add them in URL
        if( requestType === "GET" && urlEncodedData.length > 0 ) {
            url += "?" + urlEncodedData.join( "&" );
        }

        request.open( requestType, url, true, settings.username, settings.password );

        request.responseType = responseType;
        request.setRequestHeader( "Content-Type", contentType );
        request.setRequestHeader( "Accept", accept );

        if( settings.headers ) {
            for ( header in settings.headers ) {
                request.setRequestHeader( header, settings.headers[ header ] );
            }
        }

        // Success and 400's
        request.onload = function() {
            var status = ( request.status < 400 ) ? "success" : "error",
                promiseValue = that._createPromiseValue( request, status );

            if( status === "success" ) {
                return resolve( promiseValue );
            }

            return reject( promiseValue );
        };

        // Network errors
        request.onerror = function() {
            var status = "error";

            reject( that._createPromiseValue( request, status ) );
        };

        // create promise arguments
        this._createPromiseValue = function( request, status ) {
            var statusText = request.statusText || status,
                dataOrError = ( responseType === 'text' || responseType === '') ? request.responseText : request.response;

            return {
                data: dataOrError,
                statusText: statusText,
                agXHR: request
            };
        };

        request.send( data );
    });
};

(function( AeroGear, undefined ) {
    /**
        The UnifiedPushClient object is used to perfom register and unregister operations against the AeroGear UnifiedPush server.
        @status Experimental
        @constructs AeroGear.UnifiedPushClient
        @param {String} variantID - the id representing the mobile application variant
        @param {String} variantSecret - the secret for the mobile application variant
        @param {String} pushServerURL - the location of the UnifiedPush server e.g. http(s)//host:port/context
        @returns {Object} The created unified push server client
        @example
        // Create the UnifiedPush client object:
        var client = AeroGear.UnifiedPushClient(
            "myVariantID",
            "myVariantSecret",
            "http://SERVER:PORT/CONTEXT"
        );

        // assemble the metadata for the registration:
        var metadata = {
            deviceToken: "http://server.com/simplePushEndpoint",
            alias: "some_username",
            categories: [ "email" ]
        };

        var settings = {};

        settings.metadata = metadata;

        // perform the registration against the UnifiedPush server:
        client.registerWithPushServer( settings );

     */
    AeroGear.UnifiedPushClient = function( variantID, variantSecret, pushServerURL ) {

        // we require all arguments to be present, otherwise it does not work
        if ( !variantID || !variantSecret || !pushServerURL ) {
            throw "UnifiedPushClientException";
        }

        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.UnifiedPushClient ) ) {
            return new AeroGear.UnifiedPushClient( variantID, variantSecret, pushServerURL );
        }

        pushServerURL = pushServerURL.substr(-1) === '/' ? pushServerURL : pushServerURL + '/';
        /**
            Performs a register request against the UnifiedPush Server using the given metadata which represents a client that wants to register with the server.
            @param {Object} settings The settings to pass in
            @param {Object} settings.metadata - the metadata for the client
            @param {String} settings.metadata.deviceToken - identifies the client within its PushNetwork. On Android this is the registrationID, on iOS this is the deviceToken and on SimplePush this is the URL of the given SimplePush server/network.
            @param {String} [settings.metadata.alias] - Application specific alias to identify users with the system. Common use case would be an email address or a username.
            @param {Array} [settings.metadata.categories] - In SimplePush this is the name of the registration endpoint. On Hybrid platforms like Apache Cordova this is used for tagging the registered client.
            @param {String} [settings.metadata.operatingSystem] - Useful on Hybrid platforms like Apache Cordova to specifiy the underlying operating system.
            @param {String} [settings.metadata.osVersion] - Useful on Hybrid platforms like Apache Cordova to specify the version of the underlying operating system.
            @param {String} [settings.metadata.deviceType] - Useful on Hybrid platforms like Apache Cordova to specify the type of the used device, like iPad or Android-Phone.
            @returns {Object} An ES6 Promise created by AeroGear.ajax
         */
        this.registerWithPushServer = function( settings ) {
            settings = settings || {};
            var metadata = settings.metadata || {};

            // we need a deviceToken, registrationID or a channelID:
            if ( !metadata.deviceToken ) {
                throw "UnifiedPushRegistrationException";
            }

            // Make sure that settings.metadata.categories is an Array
            metadata.categories = Array.isArray( metadata.categories ) ? metadata.categories : ( metadata.categories ? [ metadata.categories ] : [] );

            return AeroGear.ajax({
                contentType: "application/json",
                dataType: "json",
                type: "POST",
                url: pushServerURL + "rest/registry/device",
                headers: {
                    "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
                },
                data: JSON.stringify( metadata )
            });
        };

        /**
            Performs an unregister request against the UnifiedPush Server for the given deviceToken. The deviceToken identifies the client within its PushNetwork. On Android this is the registrationID, on iOS this is the deviceToken and on SimplePush this is the URL of the given SimplePush server/network.
            @param {String} deviceToken - unique String which identifies the client that is being unregistered.
            @returns {Object} An ES6 Promise created by AeroGear.ajax
         */
        this.unregisterWithPushServer = function( deviceToken ) {
            return AeroGear.ajax({
                contentType: "application/json",
                dataType: "json",
                type: "DELETE",
                url: pushServerURL + "rest/registry/device/" + deviceToken,
                headers: {
                    "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
                }
            });
        };
    };

})( AeroGear );
})( this );
