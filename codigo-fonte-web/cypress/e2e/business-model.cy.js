describe('Business Model E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.selectTab('Modelo de Negócios');
  });

  it('deve carregar a página de modelo de negócios corretamente', () => {
    cy.contains('Modelo de Negócios').should('be.visible');
    cy.contains('CAPEX').should('be.visible');
    cy.contains('OPEX').should('be.visible');
  });

  it('deve permitir configurar parâmetros de projeto', () => {
    // Navegar para aba de configuração
    cy.contains('button', 'Configuração').click();

    // Configurar capacidade
    cy.get('input').first().clear().type('500');

    // Verificar atualização
    cy.contains(/500/i).should('be.visible');
  });

  it('deve calcular CAPEX corretamente', () => {
    cy.contains('button', 'CAPEX').click();

    // Verificar elementos de CAPEX
    cy.contains(/Stack de células/i).should('be.visible');
    cy.contains(/Sistema de energia/i).should('be.visible');
    cy.contains(/Infraestrutura/i).should('be.visible');
  });

  it('deve calcular OPEX corretamente', () => {
    cy.contains('button', 'OPEX').click();

    // Verificar elementos de OPEX
    cy.contains(/Energia elétrica/i).should('be.visible');
    cy.contains(/Manutenção/i).should('be.visible');
    cy.contains(/Pessoal/i).should('be.visible');
  });

  it('deve exibir análise econômica', () => {
    cy.contains('button', 'Análise Econômica').click();

    // Verificar métricas
    cy.contains(/LCOH/i).should('be.visible');
    cy.contains(/ROI/i).should('be.visible');
    cy.contains(/Payback/i).should('be.visible');
  });

  it('deve renderizar gráficos de comparação', () => {
    cy.contains('button', 'Análise Econômica').click();

    // Verificar gráficos
    cy.checkChartRendered();
  });

  it('deve permitir ajustar parâmetros geométricos', () => {
    cy.contains('button', 'Geometria').click();

    // Ajustar área da membrana
    cy.get('input[id*="membraneArea"]').clear().type('150');
    cy.get('input[id*="numberOfCells"]').clear().type('20');

    // Verificar cálculos atualizados
    cy.contains(/Área total.*3000 cm²/i).should('be.visible');
  });

  it('deve exibir indicadores de viabilidade', () => {
    cy.contains('button', 'Análise Econômica').click();

    // Verificar indicadores
    cy.contains(/Viável/i).should('be.visible');
    // ou
    cy.contains(/Não viável/i).should('be.visible');
  });

  it('deve mostrar comparação com outras geometrias', () => {
    cy.contains('button', 'Geometria').click();

    // Verificar tabela de comparação
    cy.contains(/Pequeno/i).should('be.visible');
    cy.contains(/Médio/i).should('be.visible');
    cy.contains(/Grande/i).should('be.visible');
  });
});
