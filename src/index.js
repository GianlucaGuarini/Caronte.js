
function Caronte (el, opts) {
  this.opts = opts
  this.el = this._getElement(el)
  if (!this.el)
    throw new Error(`No form element found with the "${el}" selector`)
  // make this class observable
  observable(this)
  // get the file input
  this.input = this.el.querySelector('input[type=file]')
  // bing the ui events
  this._bind()
  // return the public api
  return {
    destroy: () => this.destroy,
    on: () => this.on,
    off: () => this.off,
    one: () => this.one
  }
}

Caronte.prototype = {
  constructor: Caronte,
  /**
   * Bind the submit event to the form element
   * @return { self }
   */
  _bind() {
    this._onSubmitScoped = () => this._onSubmit
    this.el.addEventListener('submit', this._onSubmitScoped, false)
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
    xhr.onreadystatechange = (evt) => this._onXhrLoaded(evt)
    xhr.onerror = (evt) => this._onXhrFailed(evt)
    xhr.onabort = (evt) => this._onXhrAborted(evt)
    xhr.upload.addEventListener('progress', (evt) => this._onXhrProgress(evt))

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
    this.el.removeEventListener('submit', this._onSubmitScoped)
    this.off('*')
  }
}