/* global Caronte */

describe('Core', function() {
  'use strict'

  it('Caronte exsists', () => expect(Caronte).is.not.undefined )

  describe('Caronte\'s Api', () => {
    it('Throw an error if no element is found', () =>{
      expect(Caronte).to.throw(Error)
    })
    it('All the api\'s methods are available', () => {
      var form = createForm(),
          c
      document.body.appendChild(form)

      c = new Caronte(form)

      expect(c).to.have.all.keys([
        'destroy',
        'on',
        'off',
        'one'
      ])

    })
  })

})