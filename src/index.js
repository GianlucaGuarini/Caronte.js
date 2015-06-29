function Caronte (el, opts) {

  /**
   * Constructor function where we initialize the script internal logic
   * @return { self }
   */
  this._init = () => {
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

    return this
  }

  /**
   * Bind the submit event to the form element
   * @return { self }
   */
  this._bind = () => {
    this.el.addEventListener('submit', this._onSubmit, false)
    return this
  }
  /**
   * Callback executed once the form got submitted
   * @param  { Object } e event object
   * @return { self }
   */
  this._onSubmit = (e) => {

    e.preventDefault()

    var data = new FormData(e.target),
        xhr = new XMLHttpRequest()

    this._total = 0

    // get the total files size
    Array.prototype.forEach.call(this.input.files, (file) => this._total += file.size)

    // setup the ajax request
    xhr.open('post', this.el.getAttribute('action'), true)

    // bind some listeners to the ajax request
    xhr.onreadystatechange = this._onXhrLoaded
    xhr.onerror = this._onXhrFailed
    xhr.onabort = this._onXhrAborted
    xhr.upload.addEventListener('progress', this._onXhrProgress)

    // send your stuff to the server
    xhr.send(data)

    return this
  }
  /**
   * Callback executed while the form data get uploaded
   * @param  { Object } e event object
   * @return { self }
   */
  this._onXhrProgress = (e) => {
    var loaded = (e.loaded / this._total).toFixed(2) * 100 // percent
    this.trigger('progress', ~~loaded, e)
    return this
  }
  /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  this._onXhrLoaded = (e) => {

    var xhr = e.target

    if (xhr.readyState !== 4) return this

    if (xhr.status >= 200 && xhr.status < 400)
      this.trigger('success', JSON.parse(xhr.responseText))
    else
      this.trigger('error', xhr)

    return this
  }
   /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  this._onXhrFailed = (e) => {
    this.trigger('error', e.target)
    return this
  }
   /**
   * On ajax request loaded
   * @param  { Object } e event object
   * @return { self }
   */
  this._onXhrAborted = (e) => {
    this.trigger('aborted', e.target)
    return this
  }
  /**
   * Get the form element bound to
   * @param  { Object|String } form DOM node we want to use to upload the files
   * @return { Object } form DOM node
   */
  this._getElement = (elm) => {
    return typeof elm === 'string' ? document.querySelector(elm) : elm
  }
  /**
   * Remove the events from the form element
   */
  this.destroy = () => {
    this.el.removeEventListener('submit', this._onSubmit)
    this.off('*')
  }

  // initialize the script
  this._init()

  // return the public api
  return {
    destroy: this.destroy,
    on: this.on,
    off: this.off,
    one: this.one
  }
}