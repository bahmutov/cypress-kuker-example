/// <reference types="Cypress" />

const kukerMessage = ke => (ke.label ? `${ke.type}: ${ke.label}` : ke.type)

context('Counter with Kuker', () => {
  // spy on Kuker messages
  let kuker

  beforeEach(() => {
    kuker = null
  })

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad (win) {
        kuker = cy.spy().as('kuker')
        // cy.spy(win, 'postMessage')

        const postMessage = win.postMessage.bind(win)
        win.postMessage = (what, target) => {
          if (Cypress._.isPlainObject(what) && what.kuker) {
            // trigger spy
            kuker(what, target)

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
  })
})
