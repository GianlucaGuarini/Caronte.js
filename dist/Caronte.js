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
  var _this = this;

  /**
   * Constructor function where we initialize the script internal logic
   * @return { self }
   */
  this._init = function () {
    _this.opts = opts;
    _this.el = _this._getElement(el);
    if (!_this.el) throw new Error('No form element found with the "' + el + '" selector');
    // make this class observable
    observable(_this);
    // get the file input
    _this.input = _this.el.querySelector('input[type=file]');
    // bing the ui events
    _this._bind();

    return _this;
  };

  /**
   * Bind the submit event to the form element
   * @return { self }
   */
  this._bind = function () {
    _this.el.addEventListener('submit', _this._onSubmit, false);
    return _this;
  };
  /**
   * Callback executed once the form got submitted
   * @param  { Object } e event object
   * @return { self }
   */
  this._onSubmit = function (e) {

    e.preventDefault();

    var data = new FormData(e.target),
        xhr = new XMLHttpRequest();

    _this._total = 0;

    // get the total files size
    Array.prototype.forEach.call(_this.input.files, function (file) {
      return _this._total += file.size;
    });

    // setup the ajax request
    xhr.open('post', _this.el.getAttribute('action'), true);

    // bind some listeners to the ajax request
    xhr.onreadystatechange = _this._onXhrLoaded;
    xhr.onerror = _this._onXhrFailed;
    xhr.onabort = _this._onXhrAborted;
    xhr.upload.addEventListener('progress', _this._onXhrProgress);

    // send your stuff to the server
    xhr.send(data);

    return _this;
  };
  /**
   * Callback executed while the form data get uploaded
   * @param  { Object } e event object
   * @return { self }
   */
  this._onXhrProgress = function (e) {
    var loaded = (e.loaded / _this._total).toFixed(2) * 100; // percent
    _this.trigger('progress', ~ ~loaded, e);
    return _this;
  };
  /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  this._onXhrLoaded = function (e) {

    var xhr = e.target;

    if (xhr.readyState !== 4) return _this;

    if (xhr.status >= 200 && xhr.status < 400) _this.trigger('success', JSON.parse(xhr.responseText));else _this.trigger('error', xhr);

    return _this;
  };
  /**
  * On ajax request loaded
  * @param  { Object } e event object
  * @return { self }
  */
  this._onXhrFailed = function (e) {
    _this.trigger('error', e.target);
    return _this;
  };
  /**
  * On ajax request loaded
  * @param  { Object } e event object
  * @return { self }
  */
  this._onXhrAborted = function (e) {
    _this.trigger('aborted', e.target);
    return _this;
  };
  /**
   * Get the form element bound to
   * @param  { Object|String } form DOM node we want to use to upload the files
   * @return { Object } form DOM node
   */
  this._getElement = function (elm) {
    return typeof elm === 'string' ? document.querySelector(elm) : elm;
  };
  /**
   * Remove the events from the form element
   */
  this.destroy = function () {
    _this.el.removeEventListener('submit', _this._onSubmit);
    _this.off('*');
  };

  // initialize the script
  this._init();

  // return the public api
  return {
    destroy: this.destroy,
    on: this.on,
    off: this.off,
    one: this.one
  };
}
  return Caronte
}));