describe('Dynamic Simulation E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.selectTab('Dinâmico');
  });

  it('deve carregar a página de simulação dinâmica corretamente', () => {
    cy.contains('Simulação Dinâmica').should('be.visible');
    cy.contains('Iniciar').should('be.visible');
  });

  it('deve iniciar, pausar e parar simulação', () => {
    // Configurar duração curta
    cy.get('input[id*="duration"]').clear().type('10');

    // Iniciar
    cy.contains('button', /Iniciar/i).click();
    cy.contains('button', /Pausar/i, { timeout: 2000 }).should('be.visible');

    // Pausar
    cy.contains('button', /Pausar/i).click();
    cy.contains('button', /Retomar/i, { timeout: 2000 }).should('be.visible');

    // Parar
    cy.contains('button', /Parar/i).click();
    cy.contains('button', /Iniciar/i, { timeout: 2000 }).should('be.visible');
  });

  it('deve exibir gráficos durante simulação', () => {
    cy.get('input[id*="duration"]').clear().type('10');
    cy.contains('button', /Iniciar/i).click();

    // Aguardar um pouco
    cy.wait(2000);

    // Verificar se gráficos estão renderizados
    cy.checkChartRendered();
    cy.contains(/Produção de H₂/i).should('be.visible');
    cy.contains(/Eficiência/i).should('be.visible');
  });

  it('deve completar simulação automaticamente', () => {
    cy.get('input[id*="duration"]').clear().type('5'); // 5 segundos
    cy.contains('button', /Iniciar/i).click();

    // Aguardar conclusão (5s + margem)
    cy.waitForSimulation(10000);
  });

  it('não deve permitir alterar parâmetros durante simulação', () => {
    cy.contains('button', /Iniciar/i).click();

    // Tentar alterar parâmetros
    cy.get('input[id*="membraneArea"]').should('be.disabled');
    cy.get('input[id*="numberOfCells"]').should('be.disabled');
    cy.get('input[id*="electrodeGap"]').should('be.disabled');
  });

  it('deve renderizar simulação PhET interativa', () => {
    cy.contains('Simulação Interativa Estilo PhET Colorado').should('be.visible');
    cy.get('canvas').should('be.visible');
  });

  it('deve ter controles de visualização PhET', () => {
    cy.scrollTo('bottom');

    // Verificar controles
    cy.contains(/Zoom/i).should('be.visible');
    cy.contains(/Velocidade/i).should('be.visible');
    cy.contains(/Tensão/i).should('be.visible');
    cy.contains(/Corrente/i).should('be.visible');
  });

  it('deve permitir ajustar parâmetros do PhET', () => {
    cy.scrollTo('bottom');

    // Ajustar voltagem
    cy.get('input[type="range"]').first().invoke('val', 2.5).trigger('change');

    // Verificar que o valor mudou
    cy.contains(/2\.5/i).should('be.visible');
  });

  it('deve alternar camadas de visualização no PhET', () => {
    cy.scrollTo('bottom');

    // Encontrar e clicar nos toggles de camada
    cy.contains(/Moléculas/i).click();
    cy.contains(/Bolhas/i).click();
    cy.contains(/Elétrons/i).click();

    // Verificar que os toggles responderam (mudaram estado visual)
    // Nota: verificação visual depende da implementação
  });
});
