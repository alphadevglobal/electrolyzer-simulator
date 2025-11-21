// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando personalizado para navegar até uma aba específica
Cypress.Commands.add('selectTab', (tabName) => {
  cy.contains('button', tabName).click();
});

// Comando personalizado para preencher parâmetros de simulação estática
Cypress.Commands.add('fillStaticSimulationParams', (params) => {
  if (params.temperature) {
    cy.get('input[id*="temperature"]').clear().type(params.temperature);
  }
  if (params.pressure) {
    cy.get('input[id*="pressure"]').clear().type(params.pressure);
  }
  if (params.concentration) {
    cy.get('input[id*="concentration"]').clear().type(params.concentration);
  }
  if (params.currentDensity) {
    cy.get('input[id*="currentDensity"]').clear().type(params.currentDensity);
  }
});

// Comando personalizado para iniciar simulação dinâmica
Cypress.Commands.add('startDynamicSimulation', (duration = 60) => {
  cy.get('input[id*="duration"]').clear().type(duration);
  cy.contains('button', /Iniciar/i).click();
});

// Comando personalizado para aguardar simulação completar
Cypress.Commands.add('waitForSimulation', (timeout = 10000) => {
  cy.contains(/Simulação completa/i, { timeout });
});

// Comando personalizado para verificar se gráfico está renderizado
Cypress.Commands.add('checkChartRendered', () => {
  cy.get('.recharts-wrapper').should('be.visible');
});

//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
