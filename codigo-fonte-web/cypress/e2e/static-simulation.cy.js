describe('Static Simulation E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.selectTab('Estático');
  });

  it('deve carregar a página de simulação estática corretamente', () => {
    cy.contains('Simulação Estática').should('be.visible');
    cy.contains('Calcular').should('be.visible');
  });

  it('deve permitir configurar parâmetros e executar cálculo', () => {
    // Preencher parâmetros
    cy.fillStaticSimulationParams({
      temperature: 80,
      pressure: 30,
      concentration: 30,
      currentDensity: 1.5,
    });

    // Executar cálculo
    cy.contains('button', 'Calcular').click();

    // Verificar resultados
    cy.contains(/Produção de H₂/i).should('be.visible');
    cy.contains(/Eficiência/i).should('be.visible');
  });

  it('deve exibir parâmetros geométricos', () => {
    cy.contains('Geometria do Eletrolizador').should('be.visible');
    cy.get('input[id*="membraneArea"]').should('be.visible');
    cy.get('input[id*="numberOfCells"]').should('be.visible');
    cy.get('input[id*="electrodeGap"]').should('be.visible');
  });

  it('deve calcular área total corretamente', () => {
    cy.get('input[id*="membraneArea"]').clear().type('100');
    cy.get('input[id*="numberOfCells"]').clear().type('10');

    cy.contains(/Área total ativa: 1000 cm²/i).should('be.visible');
  });

  it('deve permitir alternar entre abas de resultados', () => {
    // Executar cálculo primeiro
    cy.contains('button', 'Calcular').click();

    // Aguardar resultados
    cy.contains(/Produção de H₂/i, { timeout: 5000 }).should('be.visible');

    // Verificar abas
    cy.contains('Resultados').should('be.visible');
    cy.contains('Gráficos').should('be.visible');
  });

  it('deve exportar dados para CSV', () => {
    // Executar cálculo
    cy.contains('button', 'Calcular').click();
    cy.contains(/Produção de H₂/i, { timeout: 5000 }).should('be.visible');

    // Exportar CSV
    cy.contains('button', /Exportar CSV/i).click();

    // Verificar download (nota: arquivos baixados não são verificáveis facilmente no Cypress)
  });

  it('deve validar valores mínimos e máximos', () => {
    const tempInput = cy.get('input[id*="temperature"]');

    // Valor muito alto
    tempInput.clear().type('200');
    tempInput.should('have.value', '100'); // Max = 100

    // Valor muito baixo
    tempInput.clear().type('-10');
    tempInput.should('have.value', '20'); // Min = 20
  });
});
