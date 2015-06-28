/* eslint no-unused-vars: [0, {"vars": "all", "args": "after-used"}] */
function createForm() {
  var form = document.createElement('form')
  form.innerHTML = '<input type="submit" />'
  form.setAttribute('enctype', 'multipart/form-data')
  form.setAttribute('action', 'php/index.php')
  form.setAttribute('method', 'post')
  return form
}
