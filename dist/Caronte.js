(function (root, factory) {
    if (typeof define === 'function' && define.amd)
        define([], factory)
    else if (typeof exports === 'object')
        module.exports = factory()
    else
        root.Caronte = factory()
}(this, function () {
/**
 * Borrowed from riot.observable
 */
'use strict';

var observable = function observable(el) {

  el = el || {};

  var callbacks = {},
      _id = 0;

  el.on = function (events, fn) {
    if (typeof fn === 'function') {
      fn._id = typeof fn._id === 'undefined' ? _id++ : fn._id;

      events.replace(/\S+/g, function (name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn);
        fn.typed = pos > 0;
      });
    }
    return el;
  };

  el.off = function (events, fn) {
    if (events === '*') callbacks = {};else {
      events.replace(/\S+/g, function (name) {
        if (fn) {
          var arr = callbacks[name];
          for (var i = 0, cb; cb = arr && arr[i]; ++i) {
            if (cb._id === fn._id) {
              arr.splice(i, 1);i--;
            }
          }
        } else {
          callbacks[name] = [];
        }
      });
    }
    return el;
  };

  // only single event supported
  el.one = function (name, fn) {
    function on() {
      el.off(name, on);
      fn.apply(el, arguments);
    }
    return el.on(name, on);
  };

  el.trigger = function (name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || [];

    for (var i = 0, fn; fn = fns[i]; ++i) {
      if (!fn.busy) {
        fn.busy = 1;
        fn.apply(el, fn.typed ? [name].concat(args) : args);
        if (fns[i] !== fn) {
          i--;
        }
        fn.busy = 0;
      }
    }

    if (callbacks.all && name !== 'all') {
      el.trigger.apply(el, ['all', name].concat(args));
    }

    return el;
  };

  return el;
};
function Caronte(el, opts) {
  this.opts = opts;
  this.el = this._getElement(el);
  if (!this.el) throw 'No form element found with the "' + opts.el + '"';
  // make this class observable
  observable(this);
  // get the file input
  this.input = this.el.querySelector('input[type=file]');
  // bing the ui events
  this._bind();
  // return the public api
  return {
    destroy: this.destroy.bind(this),
    on: this.on.bind(this),
    off: this.off.bind(this),
    one: this.one.bind(this)
  };
}

Caronte.prototype = {
  constructor: Caronte,
  /**
   * Bind the submit event to the form element
   * @return { self }
   */
  _bind: function _bind() {
    this.el.addEventListener('submit', this._onSubmit.bind(this), false);

    return this;
  },
  /**
   * Callback executed once the form got submitted
   * @param  { Object } e event object
   * @return { self }
   */
  _onSubmit: function _onSubmit(e) {
    var _this = this;

    e.preventDefault();

    var data = new FormData(e.target),
        xhr = new XMLHttpRequest();

    // get the total files size
    Array.prototype.forEach.call(this.input.files, function (file) {
      _this._total = file.size;
    });

    // setup the ajax request
    xhr.open('post', this.el.getAttribute('action'), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    // bind some listeners to the ajax request
    xhr.upload.addEventListener('load', this._onXhrLoaded.bind(this), false);
    xhr.upload.addEventListener('error', this._onXhrFailed.bind(this), false);
    xhr.upload.addEventListener('abort', this._onXhrAborted.bind(this), false);
    xhr.upload.addEventListener('progress', this._onXhrProgress.bind(this), false);

    // send your stuff to the server
    xhr.send(data);

    return this;
  },
  /**
   * Callback executed while the form data get uploaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrProgress: function _onXhrProgress(e) {
    var loaded = (e.loaded / this._total).toFixed(2) * 100; // percent
    this.trigger('progress', loaded, e);
    return this;
  },
  /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrLoaded: function _onXhrLoaded(e) {

    var request = e.target;

    if (request.status >= 200 && request.status < 400) this.trigger('success', e);else this.trigger('error', e);
    return this;
  },
  /**
  * On ajax request loaded
  * @param  { Object } e event object
  * @return { self }
  */
  _onXhrFailed: function _onXhrFailed(e) {
    this.trigger('error', e);
  },
  /**
  * On ajax request loaded
  * @param  { Object } e event object
  * @return { self }
  */
  _onXhrAborted: function _onXhrAborted(e) {
    this.trigger('aborted', e);
  },
  /**
   * Get the form element bound to
   * @param  { Object|String } form DOM node we want to use to upload the files
   * @return { Object } form DOM node
   */
  _getElement: function _getElement(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  },
  /**
   * Remove the events from the form element
   */
  destroy: function destroy() {
    this.el.removeEventListener('submit', this._onSubmit);
    this.off('*');
  }
};
  return Caronte
}));