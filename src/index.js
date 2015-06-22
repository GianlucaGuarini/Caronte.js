
function Caronte (el, opts) {
  this.opts = opts
  this.el = this._getElement(el)
  if (!this.el)
    throw `No form element found with the "${opts.el}"`
  // make this class observable
  observable(this)
  // get the file input
  this.input = this.el.querySelector('input[type=file]')
  // bing the ui events
  this._bind()
  // return the public api
  return {
    destroy: this.destroy.bind(this),
    on: this.on.bind(this),
    off: this.off.bind(this),
    one: this.one.bind(this)
  }
}

Caronte.prototype = {
  constructor: Caronte,
  /**
   * Bind the submit event to the form element
   * @return { self }
   */
  _bind() {
    this.el.addEventListener('submit', this._onSubmit.bind(this), false)

    return this
  },
  /**
   * Callback executed once the form got submitted
   * @param  { Object } e event object
   * @return { self }
   */
  _onSubmit(e) {

    e.preventDefault()

    var data = new FormData(e.target),
        xhr = new XMLHttpRequest()

    // get the total files size
    Array.prototype.forEach.call(this.input.files, (file) => {
      this._total = file.size
    })

    // setup the ajax request
    xhr.open('post', this.el.getAttribute('action'), true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

    // bind some listeners to the ajax request
    xhr.upload.addEventListener('load', this._onXhrLoaded.bind(this), false)
    xhr.upload.addEventListener('error', this._onXhrFailed.bind(this), false)
    xhr.upload.addEventListener('abort', this._onXhrAborted.bind(this), false)
    xhr.upload.addEventListener('progress', this._onXhrProgress.bind(this), false)

    // send your stuff to the server
    xhr.send(data)

    return this
  },
  /**
   * Callback executed while the form data get uploaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrProgress(e) {
    var loaded = (e.loaded / this._total).toFixed(2) * 100 // percent
    this.trigger('progress', loaded, e)
    return this
  },
  /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrLoaded(e) {

    var request = e.target

    if (request.status >= 200 && request.status < 400)
      this.trigger('success', e)
    else
      this.trigger('error', e)
    return this
  },
   /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrFailed(e) {
    this.trigger('error', e)
  },
   /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrAborted(e) {
    this.trigger('aborted', e)
  },
  /**
   * Get the form element bound to
   * @param  { Object|String } form DOM node we want to use to upload the files
   * @return { Object } form DOM node
   */
  _getElement(el) {
    return typeof el === 'string' ? document.querySelector(el) : el
  },
  /**
   * Remove the events from the form element
   */
  destroy() {
    this.el.removeEventListener('submit', this._onSubmit)
    this.off('*')
  }
}