/// <reference types="Cypress" />

const isKuker = what =>
  Cypress._.isPlainObject(what) && what.kuker && what.type !== 'NEW_EMITTER'

const kukerMessage = ke => (ke.label ? `${ke.type}: ${ke.label}` : ke.type)

context('Counter with Kuker', () => {
  let kukerEvents

  beforeEach(() => {
    kukerEvents = []
    cy.visit('/', {
      onBeforeLoad (win) {
        const postMessage = win.postMessage.bind(win)
        win.postMessage = (what, target) => {
          if (isKuker(what)) {
            kukerEvents.push(Cypress._.pick(what, 'label', 'state'))

            // log better message ourselves
            Cypress.log({
              name: 'kuker',
              message: kukerMessage(what),
              consoleProps () {
                return what
              }
            }).end()
          }
          return postMessage(what, target)
        }
      }
    })
  })

  const sel = name => `[data-cy="${name}"]`

  it('has down button disabled', () => {
    cy.get(sel('down')).should('be.disabled')
  })

  it.only('clicks up and down', () => {
    cy.get(sel('up'))
      .click()
      .click()
      .click()
    cy.get(sel('down'))
      .click()
      .click()
      .click()
    cy.contains('h1', '0')
    cy.wrap(kukerEvents).toMatchSnapshot()
  })
})
