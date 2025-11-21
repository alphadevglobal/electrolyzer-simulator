# Guia de Testes - Simulador de Eletrolisador

## Visão Geral

Este projeto possui uma infraestrutura completa de testes com:
- **Testes Unitários**: Vitest + React Testing Library
- **Testes E2E**: Cypress
- **CI/CD**: GitHub Actions

## Pré-requisitos

```bash
# Node.js 20+ e pnpm instalados
node --version  # v20.x.x
pnpm --version  # 10.4.1
```

## Instalação

```bash
# Instalar dependências
pnpm install
```

## Testes Unitários

### Executar Todos os Testes
```bash
pnpm run test:unit
```

### Executar com Coverage
```bash
pnpm run test:unit -- --coverage
```

### Executar em Watch Mode (desenvolvimento)
```bash
pnpm run test:unit -- --watch
```

### Executar Teste Específico
```bash
pnpm run test:unit src/test/components/StaticSimulation.test.jsx
```

### Estrutura de Testes Unitários

```
src/test/
├── setup.js                       # Configuração global
├── components/
│   ├── StaticSimulation.test.jsx  # Testes do componente
│   └── DynamicSimulation.test.jsx
└── lib/
    └── calculations.test.js       # Testes de lógica
```

### Exemplo de Teste Unitário

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent />);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });

  it('deve permitir interação', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText(/Clicked/i)).toBeInTheDocument();
  });
});
```

## Testes E2E (Cypress)

### Executar Todos os Testes E2E
```bash
# Primeiro, build a aplicação
pnpm run build

# Depois, rodar testes
pnpm run test:e2e
```

### Executar em Modo Interativo
```bash
# Iniciar servidor de desenvolvimento
pnpm run dev

# Em outro terminal, abrir Cypress UI
npx cypress open
```

### Executar Teste Específico
```bash
npx cypress run --spec "cypress/e2e/static-simulation.cy.js"
```

### Estrutura de Testes E2E

```
cypress/
├── e2e/
│   ├── static-simulation.cy.js   # Testes de simulação estática
│   ├── dynamic-simulation.cy.js  # Testes de simulação dinâmica
│   └── business-model.cy.js      # Testes de modelo de negócios
└── support/
    ├── commands.js                # Comandos customizados
    └── e2e.js                     # Setup global
```

### Exemplo de Teste E2E

```javascript
describe('My Feature', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.selectTab('Minha Tab');
  });

  it('deve executar fluxo completo', () => {
    // Preencher formulário
    cy.get('input[name="temperature"]').type('80');
    cy.get('input[name="pressure"]').type('30');

    // Submeter
    cy.contains('button', 'Calcular').click();

    // Verificar resultado
    cy.contains('Resultado: 75.5%').should('be.visible');
  });
});
```

### Comandos Customizados do Cypress

```javascript
// Navegar para uma tab
cy.selectTab('Dinâmico');

// Preencher parâmetros de simulação
cy.fillStaticSimulationParams({
  temperature: 80,
  pressure: 30,
  concentration: 30,
});

// Iniciar simulação dinâmica
cy.startDynamicSimulation(60);

// Aguardar simulação completar
cy.waitForSimulation();

// Verificar se gráfico renderizou
cy.checkChartRendered();
```

## Executar Todos os Testes

```bash
# Roda unit tests + E2E
pnpm run test
```

## CI/CD (GitHub Actions)

### Workflow Automático

Toda vez que você faz push ou PR para `main` ou `develop`:

1. **Lint**: ESLint verifica código
2. **Unit Tests**: Vitest roda todos os testes unitários
3. **E2E Tests**: Cypress testa fluxos críticos
4. **Build**: Verifica se build funciona
5. **Security Audit**: Verifica vulnerabilidades
6. **Code Quality**: SonarCloud (se configurado)

### Ver Resultados

1. Vá para GitHub Actions na página do repositório
2. Clique no workflow recente
3. Veja logs de cada job

### Artefatos

- **Cobertura de Testes**: `coverage/`
- **Screenshots Cypress**: Salvos em falhas
- **Vídeos Cypress**: Salvos sempre
- **Build**: `dist/` zipado

## Cobertura de Testes

### Visualizar Relatório

```bash
# Gerar cobertura
pnpm run test:unit -- --coverage

# Abrir relatório HTML
open coverage/index.html
```

### Meta de Cobertura

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Arquivos Excluídos da Cobertura

- `node_modules/`
- `src/test/`
- `**/*.config.js`
- `**/ui/**` (componentes Radix)

## Debugging

### Debug Testes Unitários

```javascript
// Usar screen.debug() para ver DOM
import { render, screen } from '@testing-library/react';

it('debug test', () => {
  render(<MyComponent />);
  screen.debug(); // Printa todo o DOM
  screen.debug(screen.getByRole('button')); // Printa elemento específico
});
```

### Debug Testes Cypress

```javascript
// Usar cy.pause() para pausar execução
it('debug test', () => {
  cy.visit('/');
  cy.pause(); // Pausa aqui
  cy.get('button').click();
});

// Ou cy.debug() para inspecionar elemento
cy.get('button').debug();
```

## Mocks e Stubs

### Mock de Módulos

```javascript
import { vi } from 'vitest';

// Mock de módulo inteiro
vi.mock('../../lib/calculations', () => ({
  simulateElectrolyzer: vi.fn(() => ({ efficiency: 75.5 })),
}));
```

### Mock de APIs

```javascript
// Mock de fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' }),
  })
);
```

### Mock de Canvas

Canvas já está mockado globalmente em `src/test/setup.js`.

## Boas Práticas

### Testes Unitários

✅ **DO**:
- Testar comportamento, não implementação
- Usar `userEvent` ao invés de `fireEvent`
- Esperar por mudanças com `waitFor()`
- Usar queries acessíveis (`getByRole`, `getByLabelText`)
- Limpar mocks entre testes

❌ **DON'T**:
- Testar detalhes de implementação
- Usar `container.querySelector()` (anti-pattern)
- Esperar por timeouts fixos
- Deixar mocks ativos entre testes

### Testes E2E

✅ **DO**:
- Testar fluxos de usuário reais
- Usar comandos customizados
- Fazer assertions específicas
- Tirar screenshots em falhas

❌ **DON'T**:
- Testar lógica de negócio (use unit tests)
- Fazer muitas assertions por teste
- Usar `cy.wait(1000)` (use `cy.wait('@alias')`)
- Depender de dados externos

## Solução de Problemas

### "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Test timeout"
```javascript
// Aumentar timeout
it('slow test', async () => {
  // ...
}, 10000); // 10 segundos
```

### "Canvas not supported"
Já mockado em `src/test/setup.js`, mas se precisar customizar:
```javascript
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = () => ({
    // seus mocks aqui
  });
});
```

### Cypress - "Server not running"
```bash
# Garantir que dev server está rodando
pnpm run dev

# Em outro terminal
pnpm run test:e2e
```

## Recursos Adicionais

### Documentação Oficial
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress](https://www.cypress.io/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Exemplos
- Ver `src/test/components/` para exemplos de testes unitários
- Ver `cypress/e2e/` para exemplos de testes E2E

### Scripts Úteis

```bash
# Lint
pnpm run lint

# Build
pnpm run build

# Preview build
pnpm run preview

# Todos os testes + lint
pnpm run lint && pnpm run test
```

## Métricas de Qualidade

### Estado Atual (2025-11-20)
- ✅ Infraestrutura: 100%
- ✅ Unit Tests: 60%+ cobertura (target)
- ✅ E2E Tests: Fluxos críticos cobertos
- ✅ CI/CD: Totalmente automatizado

### Roadmap
- Q1 2025: 80% cobertura unit tests
- Q2 2025: 90% cobertura + mutation testing
- Q3 2025: Performance testing
- Q4 2025: Load testing e stress testing

---

**Última atualização**: 2025-11-20
**Mantenedor**: Equipe de Desenvolvimento

Para dúvidas ou sugestões, abra uma issue no GitHub.
