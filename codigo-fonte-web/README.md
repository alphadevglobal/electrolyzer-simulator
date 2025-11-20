# Simulador de Eletrolisador v3.0

##  Sobre o Projeto

Este é um simulador avançado de eletrolisadores desenvolvido como parte de uma pesquisa científica na Universidade de Fortaleza (UNIFOR). O projeto combina modelagem física rigorosa com técnicas de Machine Learning para análise de desempenho de eletrolisadores alcalinos, PEM e SOEC.

###  Objetivos

- Simular o comportamento de diferentes tipos de eletrolisadores
- Analisar o efeito da temperatura na produção de hidrogênio
- Fornecer uma ferramenta educacional e de pesquisa
- Integrar modelos físicos com Machine Learning (modelo híbrido)
- Facilitar a exportação de dados para análise avançada
- Apresentar um modelo de monetização para parceiros industriais e OEMs

##  Funcionalidades

### ⚡ Simulação Estática
- Cálculo de parâmetros de desempenho instantâneos
- Suporte para eletrolisadores Alcalino, PEM e SOEC
- Análise de tensão, eficiência e produção de hidrogênio
- Exportação de dados em formato CSV

###  Simulação Dinâmica
- Simulação em tempo real com controles de play/pause
- Perfis temporais configuráveis (constante, linear, senoidal, degrau)
- Visualização gráfica em tempo real
- Análise da evolução temporal dos parâmetros

### ️ Galeria de Pesquisa
- Upload e armazenamento de gráficos e imagens
- Redimensionamento automático para otimização
- Sistema de metadados e organização
- Exportação de dados da galeria

###  Recursos Educacionais
- FAQ científico detalhado
- Guia sobre hidrogênio colorido
- Explicações das equações físicas utilizadas
- Referências bibliográficas

## ️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **Vite** - Build tool e desenvolvimento
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **Recharts** - Visualização de dados

### Bibliotecas Científicas
- Implementação própria dos cálculos físicos
- Equações baseadas em literatura científica
- Suporte para diferentes tipos de eletrolisadores

##  Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm

### Instalação
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Entre no diretório
cd electrolyzer-simulator/codigo-fonte-web

# Instale as dependências (pnpm é recomendado)
pnpm install

# Inicie o servidor de desenvolvimento
pnpm run dev
```

### Build para Produção
```bash
# Gere o build otimizado
pnpm run build

# Visualize o build localmente
pnpm run preview
```

### Testes e Qualidade
```bash
# Lint
pnpm run lint

# Testes unitários com Vitest
pnpm run test:unit

# Testes E2E com Cypress (executa servidor + testes)
pnpm run test:e2e

# Apenas executar Cypress (servidor já iniciado manualmente)
pnpm cypress run
```

## Integração com AWS Lambda

A aplicação já está integrada com o backend público implantado em AWS Lambda + API Gateway.

- **Endpoint padrão** (caso nenhuma variável seja configurada): `https://fcxzn6pkr1.execute-api.us-east-1.amazonaws.com/prod`
- Para ambientes personalizados configure:
  - `VITE_AWS_API_URL`
  - `VITE_AWS_API_TOKEN` (opcional, caso proteja o endpoint)
- O painel de “Simulação Estática” possui um cartão específico para enviar o cenário atual para a AWS e exibir o status da API.

##  Base Científica

O simulador é baseado no artigo científico:

**"Simulation study on the effect of temperature on hydrogen production performance of alkaline electrolytic water"**
- Bi, Xiaobing et al.
- Fuel, v. 380, p. 133209, 2025
- DOI: 10.1016/j.fuel.2024.133209

### Equações Implementadas

1. **Tensão Reversível (Nernst)**
   ```
   E_rev = E°_rev + (RT/nF) * ln(P_H2 * P_O2^0.5 / P_H2O)
   ```

2. **Sobretensões de Ativação**
   ```
   η_act = (RT/αnF) * ln(j/j_0)
   ```

3. **Sobretensão Ôhmica**
   ```
   η_ohm = j * R_total
   ```

4. **Eficiência Energética**
   ```
   η = (E_rev / E_cell) * 100%
   ```

##  Estrutura do Projeto

```
electrolyzer-simulator-v3/
├── src/
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes de interface
│   │   ├── StaticSimulation.jsx
│   │   ├── DynamicSimulation.jsx
│   │   ├── ResearchGallery.jsx
│   │   ├── ScientificFAQ.jsx
│   │   └── HydrogenColors.jsx
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── calculations.js  # Cálculos físicos
│   │   ├── dynamicCalculations.js
│   │   └── utils.js
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Ponto de entrada
│   └── index.css           # Estilos globais
├── public/                 # Arquivos públicos
├── AUTHORS.md              # Informações de autoria
├── README.md               # Este arquivo
└── package.json            # Dependências e scripts
```

##  Tipos de Eletrolisadores Suportados

### 1. Eletrolisador Alcalino
- Eletrólito: Solução aquosa de KOH (25-30%)
- Temperatura de operação: 70-80°C
- Eficiência: 70-80%
- Baixo custo, tecnologia madura

### 2. Eletrolisador PEM (Membrana de Troca de Prótons)
- Eletrólito: Membrana polimérica sólida
- Temperatura de operação: 50-80°C
- Eficiência: 75-85%
- Alta pureza do hidrogênio, resposta rápida

### 3. Eletrolisador SOEC (Óxido Sólido)
- Eletrólito: Cerâmica de óxido sólido
- Temperatura de operação: 700-1000°C
- Eficiência: 85-95%
- Alta eficiência, uso de vapor

##  Parâmetros de Simulação

### Entradas
- **Temperatura** (°C): 20-1000
- **Densidade de Corrente** (A/cm²): 0.1-10
- **Pressão** (bar): 1-50
- **Molalidade do KOH** (mol/kg): 1-10
- **Área do Eletrodo** (cm²): 1-1000

### Saídas
- **Tensão da Célula** (V)
- **Eficiência Energética** (%)
- **Produção de Hidrogênio** (mol/s)
- **Consumo Específico de Energia** (kWh/kg)
- **Sobretensões** (V)

##  Integração com Machine Learning

O simulador foi projetado para integração com modelos de Machine Learning:

1. **Exportação de Dados**: CSV compatível com notebooks Python
2. **Modelo Híbrido**: Combinação de física + ML para correção de erros
3. **Rede Neural Surrogate**: MLP (PyTorch) para predição rápida
4. **Validação Cruzada**: Comparação entre modelo físico e ML

##  Contribuições

Este projeto é desenvolvido para fins acadêmicos. Contribuições são bem-vindas através de:

1. Issues para reportar bugs ou sugerir melhorias
2. Pull requests com novas funcionalidades
3. Feedback sobre a precisão dos modelos físicos
4. Sugestões de novos tipos de eletrolisadores

##  Licença

Este projeto é desenvolvido para fins acadêmicos e de pesquisa na Universidade de Fortaleza (UNIFOR). Todos os direitos são reservados aos autores.

##  Equipe de Desenvolvimento

**Desenvolvedor Principal:**
- **Mateus Gomes Macário** - Arquitetura e implementação do simulador

**Pesquisadora:**
- **Karen Moura Fernandes** - Validação científica e especificações técnicas

**Orientação Acadêmica:**
- **Prof. Paulo Henrique Pereira Silva** - Supervisão e direcionamento da pesquisa

**Assistência Técnica:**
- **Manus AI** - Suporte em programação e arquitetura de software

##  Contato

Para questões acadêmicas ou técnicas, entre em contato através da UNIFOR.

##  Agradecimentos

- Universidade de Fortaleza (UNIFOR)
- Comunidade científica de eletroquímica
- Desenvolvedores das bibliotecas open-source utilizadas

---

**Desenvolvido com ❤️ para a ciência e educação**

*Simulador criado utilizando conhecimentos prévios em programação e arquitetura de software, 
com auxílio de inteligências artificiais para aceleração do desenvolvimento e validação científica.*
