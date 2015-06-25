
function Caronte (el, opts) {
  this.opts = opts
  this.el = this._getElement(el)
  if (!this.el)
    throw `No form element found with the "${opts.el}" selector`
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

    this._total = 0

    // get the total files size
    Array.prototype.forEach.call(this.input.files, (file) => {
      this._total += file.size
    })

    // setup the ajax request
    xhr.open('post', this.el.getAttribute('action'), true)

    // bind some listeners to the ajax request
    xhr.onreadystatechange = this._onXhrLoaded.bind(this)
    xhr.onerror = this._onXhrFailed.bind(this)
    xhr.onabort = this._onXhrAborted.bind(this)
    xhr.upload.addEventListener('progress', this._onXhrProgress.bind(this))

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
    this.trigger('progress', ~~loaded, e)
    return this
  },
  /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrLoaded(e) {

    var xhr = e.target

    if (xhr.readyState !== 4) return this

    if (xhr.status >= 200 && xhr.status < 400)
      this.trigger('success', JSON.parse(xhr.responseText))
    else
      this.trigger('error', xhr)

    return this
  },
   /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrFailed(e) {
    this.trigger('error', e.target)
    return this
  },
   /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  _onXhrAborted(e) {
    this.trigger('aborted', e.target)
    return this
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