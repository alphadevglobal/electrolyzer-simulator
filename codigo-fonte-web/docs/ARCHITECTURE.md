# Arquitetura do Simulador de Eletrolisador

## Visão Geral

O Simulador de Eletrolisador é uma aplicação web React desenvolvida para simular e analisar processos de eletrólise da água para produção de hidrogênio verde. A aplicação foi projetada com foco em escalabilidade, manutenibilidade e preparação para migração de cálculos para backend.

## Stack Tecnológica

### Frontend
- **React 19.1.0**: Framework principal
- **Vite 6.3.5**: Build tool e dev server
- **TailwindCSS 4.1.7**: Framework de estilos
- **Recharts 2.15.3**: Visualização de gráficos
- **Radix UI**: Componentes de UI acessíveis
- **Lucide React**: Ícones

### Testes
- **Vitest 4.0.12**: Framework de testes unitários
- **Cypress 15.7.0**: Testes E2E
- **Testing Library**: Utilitários para testes de componentes React

### Backend (Preparado para migração)
- **AWS**: Infraestrutura cloud já integrada
- **API Gateway**: Endpoint HTTP para cálculos (futuro)
- **Lambda**: Funções serverless para processamento (futuro)

## Estrutura de Diretórios

```
codigo-fonte-web/
├── src/
│   ├── components/          # Componentes React
│   │   ├── StaticSimulation.jsx      # Simulação estática
│   │   ├── DynamicSimulation.jsx     # Simulação dinâmica
│   │   ├── BusinessModel.jsx         # Modelo de negócios
│   │   ├── InteractiveElectrolyzerPhET.jsx  # Visualização PhET
│   │   ├── ElectrochemicalVisualization.jsx # Visualização química
│   │   ├── HydrogenColors.jsx        # Info sobre hidrogênio colorido
│   │   ├── TemperatureEffect.jsx     # Análise de temperatura
│   │   ├── ClimateAnalysis.jsx       # Análise climática
│   │   ├── ResearchGallery.jsx       # Galeria de pesquisa
│   │   ├── ScientificFAQ.jsx         # FAQ científico
│   │   └── ui/                       # Componentes UI base (Radix)
│   ├── lib/                 # Lógica de negócio e cálculos
│   │   ├── calculations.js           # Cálculos principais
│   │   ├── dynamicCalculations.js    # Cálculos dinâmicos
│   │   ├── temperatureEffects.js     # Efeitos de temperatura
│   │   ├── awsApi.js                 # Integração AWS
│   │   └── utils.js                  # Utilitários
│   └── test/                # Testes
│       ├── components/               # Testes de componentes
│       ├── lib/                      # Testes de lógica de negócio
│       └── setup.js                  # Configuração de testes
├── cypress/
│   ├── e2e/                 # Testes E2E
│   │   ├── static-simulation.cy.js
│   │   ├── dynamic-simulation.cy.js
│   │   └── business-model.cy.js
│   └── support/             # Comandos e configuração Cypress
├── docs/                    # Documentação
└── .github/
    └── workflows/           # CI/CD GitHub Actions
```

## Componentes Principais

### 1. StaticSimulation
**Responsabilidade**: Simulação pontual com parâmetros fixos

**Props**: Nenhuma (componente standalone)

**Estado Principal**:
- Parâmetros de operação (temperatura, pressão, corrente)
- Parâmetros geométricos (área, células, gap)
- Resultados de cálculo

**Integrações**:
- `lib/calculations.js`: Cálculos de eletrólise
- `lib/awsApi.js`: Envio de dados para AWS

**Fluxo de Dados**:
```
User Input → State Update → calculations.js → Results Display
                                   ↓
                              awsApi.js (optional)
```

### 2. DynamicSimulation
**Responsabilidade**: Simulação temporal com evolução de parâmetros

**Estado Principal**:
- Parâmetros de simulação (duração, passo de tempo)
- Série temporal de resultados
- Estado de execução (running, paused, stopped)

**Integrações**:
- `lib/calculations.js`: Cálculos em cada passo
- `InteractiveElectrolyzerPhET`: Visualização interativa

**Fluxo de Dados**:
```
User Start → Interval Loop → calculations.js → Time Series Update
                                                      ↓
                                                 Chart Render
```

### 3. BusinessModel
**Responsabilidade**: Análise econômica e viabilidade

**Estado Principal**:
- Parâmetros de projeto (capacidade, vida útil)
- Parâmetros geométricos
- CAPEX/OPEX calculados
- Métricas econômicas (LCOH, ROI, Payback)

**Cálculos**:
- CAPEX: Stack, BoP, infraestrutura
- OPEX: Energia, manutenção, pessoal
- LCOH: Custo nivelado do hidrogênio
- ROI e Payback

**Fluxo de Dados**:
```
Geometric + Project Params → Economic Calculations → Metrics + Charts
```

### 4. InteractiveElectrolyzerPhET
**Responsabilidade**: Visualização interativa estilo PhET Colorado

**Características**:
- Canvas 2D com física de partículas
- Drag & drop
- Zoom e pan
- Controles de velocidade
- Múltiplas camadas (moléculas, bolhas, elétrons, campo elétrico)

**Classe Particle**: (movida para fora do componente)
- Propriedades: posição, velocidade, tipo, carga
- Métodos: update(), draw(), isPointInside()

**Fluxo de Dados**:
```
User Interaction → State Update → Particle Physics → Canvas Render
                                                            ↓
                                                    requestAnimationFrame
```

## Padrões de Código

### Convenções de Nomenclatura
- **Componentes**: PascalCase (`StaticSimulation.jsx`)
- **Funções utilitárias**: camelCase (`simulateElectrolyzer`)
- **Constantes**: UPPER_SNAKE_CASE (`CANVAS_WIDTH`)
- **Arquivos de teste**: `.test.jsx` ou `.cy.js`

### Estado e Props
- **useState**: Para estado local simples
- **useRef**: Para referências DOM e valores mutáveis
- **useEffect**: Para side effects (cálculos, intervalos)
- **useMemo**: Para cálculos derivados caros (recomendado)
- **useCallback**: Para event handlers estáveis (recomendado)

### Estilos
- **TailwindCSS**: Classes utilitárias
- **Componentes UI**: Radix UI com estilos customizados
- **Responsividade**: Mobile-first com breakpoints

## Preparação para Migração Backend

### Estado Atual
Todos os cálculos são executados no frontend em `lib/calculations.js` e arquivos relacionados.

### Plano de Migração

#### Fase 1: API Gateway + Lambda (Curto Prazo)
```
Frontend                Backend (AWS)
--------               ---------------
User Input   →  API Gateway  →  Lambda Function
                                    ↓
                              calculations.js
                              (migrado)
                                    ↓
Results  ←  API Response  ←  Return Results
```

**Vantagens**:
- Serverless (auto-scaling)
- Pay-per-use
- Reduz carga no cliente
- Permite cálculos mais complexos

**Implementação**:
1. Criar Lambda Functions para cada tipo de cálculo
2. Configurar API Gateway endpoints
3. Atualizar `lib/awsApi.js` para chamar endpoints
4. Manter cálculos locais como fallback

#### Fase 2: Database + Cache (Médio Prazo)
```
Frontend  →  API Gateway  →  Lambda  →  DynamoDB
                                    ↓
                              ElastiCache
                              (resultados frequentes)
```

**Vantagens**:
- Histórico de simulações
- Cache de resultados comuns
- Analytics e ML futuro

#### Fase 3: Processamento Batch (Longo Prazo)
```
Frontend  →  API Gateway  →  Step Functions  →  Batch Jobs
                                                     ↓
                                                  S3 Storage
```

**Para simulações longas/complexas**:
- Fila de processamento assíncrono
- Notificações quando completo
- Armazenamento de resultados em S3

### Arquivos Prontos para Migração
| Arquivo | Complexidade | Prioridade | Estimativa |
|---------|--------------|------------|------------|
| `lib/calculations.js` | Média | Alta | 2 dias |
| `lib/dynamicCalculations.js` | Alta | Média | 3 dias |
| `lib/temperatureEffects.js` | Baixa | Baixa | 1 dia |

### Mudanças Necessárias
1. **Adicionar loading states** em todos os componentes
2. **Error handling robusto** para falhas de rede
3. **Retry logic** para requisições
4. **Fallback local** para modo offline
5. **Caching** de resultados no localStorage

## Testes

### Estratégia de Testes
```
        Unit Tests (Vitest)
              ↓
    Component Tests (React Testing Library)
              ↓
          E2E Tests (Cypress)
              ↓
     Manual Exploratory Testing
```

### Cobertura Alvo
- **Unit Tests**: 80%+ em `lib/`
- **Component Tests**: 70%+ em `components/`
- **E2E Tests**: Fluxos críticos (Static, Dynamic, Business)

### CI/CD
GitHub Actions executa automaticamente:
1. Lint (ESLint)
2. Unit Tests
3. E2E Tests
4. Build
5. Security Audit
6. Code Quality (SonarCloud)

## Performance

### Otimizações Implementadas
- ✅ Canvas rendering com requestAnimationFrame
- ✅ Debounce em inputs (recomendado, não implementado)
- ⚠️ React.memo em componentes (não implementado)
- ⚠️ useMemo para cálculos derivados (não implementado)
- ⚠️ useCallback para event handlers (parcialmente implementado)

### Otimizações Futuras
1. **Code Splitting**: Lazy loading de componentes
2. **Virtual Scrolling**: Para listas grandes
3. **Web Workers**: Cálculos pesados em background
4. **Service Workers**: Cache e modo offline

## Segurança

### Medidas Atuais
- Validação de inputs (min/max)
- Sanitização de dados exportados
- HTTPS only (em produção)
- Dependency auditing (GitHub Actions)

### Melhorias Futuras
- Content Security Policy (CSP)
- Rate limiting em API
- JWT para autenticação
- CORS configurado corretamente

## Acessibilidade

### Estado Atual
- ⚠️ Labels em inputs (parcial)
- ❌ aria-labels (faltando)
- ❌ Navegação por teclado (incompleto)
- ❌ Screen reader support (mínimo)

### Plano de Melhoria
1. Adicionar aria-labels em todos os elementos interativos
2. Garantir navegação completa por teclado
3. Testar com screen readers
4. Adicionar skip links
5. Garantir contraste adequado (WCAG AA)

## Documentação

### Tipos de Documentação
1. **Código**: JSDoc em funções críticas
2. **Componentes**: Props e uso em Storybook (futuro)
3. **API**: OpenAPI/Swagger para endpoints (futuro)
4. **Usuário**: Manual em `/docs` (futuro)

## Roadmap Técnico

### Q1 2025
- ✅ Correção de erros críticos
- ✅ Implementação de testes
- ✅ CI/CD setup
- ⏳ Migração inicial para backend (Lambda)

### Q2 2025
- Otimizações de performance
- Melhorias de acessibilidade
- Database integration
- Cache layer

### Q3 2025
- Autenticação de usuários
- Histórico de simulações
- Exportação avançada
- Analytics dashboard

### Q4 2025
- Machine Learning para otimização
- API pública
- Mobile app (React Native)
- Internacionalização

---

**Última atualização**: 2025-11-20
**Versão**: 1.0.0
**Mantenedor**: Equipe de Desenvolvimento
