/* eslint-env cypress */

describe('Electrolyzer Simulator smoke test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the main navigation tabs', () => {
    cy.contains('Simulador de Eletrolisador').should('be.visible');
    cy.contains('Simulação Estática').should('exist');
    cy.contains('Simulação Dinâmica').should('exist');
    cy.contains('Efeito Temperatura').should('exist');
  });

  it('navigates between tabs and shows content', () => {
    cy.contains('Simulação Dinâmica').click();
    cy.contains('Resultados da Simulação Dinâmica').should('be.visible');

    cy.contains('Análise Climática').click();
    cy.contains('Análise Climática Regional').should('be.visible');
  });

  it('exports climate data as CSV', () => {
    cy.contains('Análise Climática').click();
    cy.contains('Exportar Dados').should('be.visible');
  });
});
