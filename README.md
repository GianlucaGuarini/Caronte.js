## Caronte.js - Simple javascript ajax file uploader
[![Build Status][travis-image]][travis-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]

![Caronte logo](logo.png "Caronte logo")


> Portitor has horrendus aquas et flumina servat
terribili squalore Charon, cui plurima mento
canities inculta iacet, stant lumina flamma,
sordidus ex umeris nodo dependet amictus.
_Aeneid 6.298–301_

# Installation

### Npm
```
npm install caronte-js --save
```
### bower
```
bower install caronte-js --save
```

# Usage

## Include Caronte.js in you app
```html
<script src="path/to/caronte/dist/Caronte.js"></script>
```

## Create a Caronte.js instance linking it to your form tag
```html
<form
  class="my-form"
  enctype="multipart/form-data"
  action="php/index.php"
  method="post">
  <input name="files[]" type="file" multiple>
  <button type="submit">Send</button>
</form>
```
```js
var uploader = new Caronte('.my-form')
uploader.on('progress', function(percentage) {
  // show the progress of your upload
})
uploader.on('success', function(res) {
  // do something with response coming from the server
})
uploader.on('error', function(res) {
  // oups there was an error
})
uploader.on('abort', function(res) {
  // the upload was aborted
})
```

# API

- `on([string, function])`: listen any event triggered from the script
- `one([string, function])`: listen any event only once
- `off([string, function])`: stop listening any Caronte.js event
- `destroy`: destroy a Caronte.js instance killing all its events listeners

#Credits

Logo by [bubachop](http://bubachop.deviantart.com/)

[travis-image]:https://img.shields.io/travis/GianlucaGuarini/Caronte.js.svg?style=flat-square
[travis-url]:https://travis-ci.org/GianlucaGuarini/Caronte.js

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE

[npm-version-image]:http://img.shields.io/npm/v/caronte-js.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/caronte-js.svg?style=flat-square
[npm-url]:https://npmjs.org/package/caronte-js