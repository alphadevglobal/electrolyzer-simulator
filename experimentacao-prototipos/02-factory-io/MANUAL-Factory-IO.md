# MANUAL FACTORY IO - H2 GREEN FACTORY

## GUIA COMPLETO DE MONTAGEM E CONFIGURAÇÃO

---

## 1. INTRODUÇÃO

Este manual detalha a construção da cena 3D "H2 Green Factory" no software Factory IO, uma planta industrial de produção e armazenamento de Hidrogênio Verde.

### Requisitos do Sistema
- **Software:** Factory IO v2.5.0 ou superior
- **Sistema Operacional:** Windows 10/11 (64-bit)
- **RAM:** Mínimo 4GB
- **Placa Gráfica:** DirectX 11 compatível
- **Driver de Comunicação:** OPC UA Client (incluído no Factory IO)

---

## 2. VISÃO GERAL DA PLANTA

### Layout da Fábrica

```
┌─────────────────────────────────────────────────────────────────┐
│                    H2 GREEN FACTORY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐        ┌──────────────┐                       │
│  │ ELETROLISA- │        │ PAINEL DE    │                       │
│  │ DOR (TANK)  │        │ CONTROLE     │    ┌─────────────┐    │
│  │   + SENSOR  │        │ • Start      │    │ TRANSELEVADOR│    │
│  │   NÍVEL     │        │ • Stop       │    │  (3 NÍVEIS)  │    │
│  └──────┬──────┘        │ • Emergency  │    │              │    │
│         │               │ • Potenciôme-│    │ ▓▓▓▓ ▓▓▓▓    │    │
│         │               │   tro Temp   │    │ ▓▓▓▓ ▓▓▓▓    │    │
│         V               └──────────────┘    │ ▓▓▓▓ ▓▓▓▓    │    │
│  ═══════════════════════════                └─────────────┘    │
│    ESTEIRA PRINCIPAL                                           │
│         │                                                       │
│         V                                                       │
│  ┌──────────────┐        ┌──────────────┐                      │
│  │ FILLING      │        │ PALETIZADOR  │                      │
│  │ STATION      │──────> │  (6 PEÇAS)   │─────────>            │
│  │ + STOPPER    │        │              │                      │
│  │ + SENSOR     │        └──────────────┘                      │
│  └──────────────┘                                               │
│                                                                 │
│  [ENTRADA CILINDROS]  ────>  [ENVASE]  ────>  [PALLET]  ────> [ESTOQUE]
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPONENTES FACTORY IO UTILIZADOS

### 3.1 ELETROLISADOR (Célula Eletrolítica)

**Componente:** `Tank with Level Sensor`

**Configuração:**
- **Capacidade:** 1000 litros
- **Level Sensor Type:** Analog (0-10V)
- **Output Tag:** `Nivel_Tanque_Raw`
- **Fill Valve Tag:** `Valvula_Agua`

**Montagem:**
1. Arrastar `Tank` da paleta de componentes
2. Configurar propriedades:
   - Width: 2.0m
   - Height: 3.0m
   - Material: Stainless Steel
3. Adicionar `Analog Level Sensor` ao tanque
4. Conectar válvula de entrada (`Solenoid Valve`)

**Representação Visual:**
- Adicionar painel decorativo com texto "ELECTROYZER"
- Incluir tubulação azul (símbolo de H2O)
- Display digital mostrando nível

---

### 3.2 PAINEL DE CONTROLE

**Componentes:**

| Item | Componente Factory IO | Tag | Cor |
|------|----------------------|-----|-----|
| Botão Start | Push Button (NO) | Start_Btn | Verde |
| Botão Stop | Push Button (NC) | Stop_Btn | Vermelho |
| Botão Emergency | Emergency Stop | Emergency_Btn | Vermelho |
| Botão Reset | Push Button (NO) | Reset_Btn | Amarelo |
| Potenciômetro | Analog Input (Potentiometer) | Potenc_Temp_Raw | Cinza |
| Display Temperatura | 7-Segment Display (Analog) | Display_Temp | LED Vermelho |
| Display Nível | 7-Segment Display (Analog) | Display_Nivel | LED Verde |

**Montagem:**
1. Criar painel vertical (2m x 1.5m)
2. Posicionar botões em layout ergonômico:
   ```
   ┌──────────────┐
   │   CONTROLE   │
   ├──────────────┤
   │  [ START ]   │  ← Verde
   │  [ STOP  ]   │  ← Vermelho
   │  [EMERGÊNC.] │  ← Vermelho
   │  [ RESET ]   │  ← Amarelo
   ├──────────────┤
   │  ╔══════╗    │
   │  ║ 75.0 ║    │  ← Display Temp
   │  ╚══════╝    │
   │  ◯─────◯     │  ← Potenciômetro
   ├──────────────┤
   │  ╔══════╗    │
   │  ║  50% ║    │  ← Display Nível
   │  ╚══════╝    │
   └──────────────┘
   ```
3. Agrupar componentes: `Ctrl+G` → Nomear "Control_Panel"

---

### 3.3 LINHA DE PRODUÇÃO

#### ESTEIRA PRINCIPAL

**Componente:** `Conveyor Belt`

**Configuração:**
- **Length:** 15 metros
- **Width:** 0.6 metros
- **Speed Control:** Variable (Tag: `Velocidade_Esteira`)
- **Motor Tag:** `Motor_Esteira_Principal`
- **Type:** Roller Conveyor

**Seções:**
1. **Entrada:** Alimentador de cilindros vazios (`Emitter`)
2. **Transporte:** Esteira contínua
3. **Estação de Envase:** Stopper para posicionamento
4. **Saída:** Direcionamento para paletizador

#### EMITTER (Gerador de Cilindros)

**Componente:** `Emitter`

**Configuração:**
- **Part Type:** Cylinder (Green - símbolo H2)
- **Emission Rate:** 1 peça a cada 5 segundos
- **Max Parts:** 50
- **Tag:** (automático)

**Propriedades do Cilindro:**
- **Height:** 0.8m
- **Diameter:** 0.25m
- **Color:** Verde (#00FF00) - identidade visual H2

---

### 3.4 FILLING STATION (Estação de Envase)

**Componentes:**

1. **Stopper (Trava Mecânica)**
   - **Tag:** `Stopper_Envase`
   - **Type:** Pneumatic Stopper
   - **Action:** Stop quando acionado

2. **Vision Sensor (Detector de Presença)**
   - **Tag:** `Sensor_Envase`
   - **Detection Range:** 0.5m
   - **Type:** Difuso

3. **Solenoid Valve (Válvula de H2)**
   - **Tag:** `Valvula_H2_Envase`
   - **Function:** Controla fluxo de enchimento

**Montagem:**
1. Posicionar Stopper sobre esteira na posição 8m
2. Instalar Vision Sensor 0.3m antes do Stopper
3. Adicionar válvula decorativa acima (simulação de bico de enchimento)
4. Criar animação visual de "enchimento" (opcional):
   - Efeito de partículas
   - Mudança de cor do cilindro (vazio → cheio)

**Lógica:**
```
1. Sensor detecta cilindro → Ativa Stopper
2. Stopper segura cilindro
3. Timer de envase (2s ou 5s dependendo da eficiência térmica)
4. Desativa Stopper → Cilindro segue para paletizador
```

---

### 3.5 PALETIZADOR

**Componente:** `Palletizer`

**Configuração:**
- **Pattern:** 2x3 (6 cilindros por pallet)
- **Pallet Type:** Euro Pallet (1.2m x 0.8m)
- **Load Tag:** `Palletizer_Load`
- **Unload Tag:** `Palletizer_Unload`
- **Counter Tag:** (vinculado ao PLC via Network 5)

**Montagem:**
1. Arrastar `Palletizer` da paleta
2. Posicionar após Filling Station
3. Configurar padrão de empilhamento:
   - Layer 1: 3 cilindros (linha frontal)
   - Layer 2: 3 cilindros (linha traseira)
   - Total: 6 cilindros/pallet

4. **Esteira de Saída:**
   - Conectar saída do paletizador → Entrada do transelevador
   - Adicionar sensor de detecção de pallet completo

**Propriedades:**
- **Cycle Time:** 3 segundos
- **Auto Start:** Desabilitado (controle via PLC)

---

### 3.6 TRANSELEVADOR (STACKER CRANE) ⭐ OBRIGATÓRIO

**Componente:** `Stacker Crane`

**Configuração:**
- **Type:** 3-Axis Stacker Crane
- **Vertical Levels:** 3 (+ Home = 4 posições)
- **Horizontal Positions:** 4 colunas
- **Gripper Type:** Pneumatic Fork Gripper
- **Capacity:** 12 pallets (3 níveis × 4 colunas)

**Tags de Movimento:**

| Movimento | Tag | Tipo |
|-----------|-----|------|
| Subir | Transel_Motor_Subir | Bool |
| Descer | Transel_Motor_Descer | Bool |
| Avançar | Transel_Motor_Avancar | Bool |
| Recuar | Transel_Motor_Recuar | Bool |
| Abrir Garra | Transel_Garra_Abrir | Bool |
| Fechar Garra | Transel_Garra_Fechar | Bool |

**Sensores de Posição:**

| Sensor | Tag | Localização |
|--------|-----|-------------|
| Home | Transel_Pos_Home | Posição inicial (chão, recuado) |
| Nível 1 | Transel_Nivel_1 | 2.5m altura |
| Nível 2 | Transel_Nivel_2 | 5.0m altura |
| Nível 3 | Transel_Nivel_3 | 7.5m altura |
| Avançado | Transel_Avancado | Posição frontal (próximo à prateleira) |
| Recuado | Transel_Recuado | Posição traseira (seguro para subir/descer) |
| Garra Aberta | Transel_Garra_Aberta | Limit switch |
| Garra Fechada | Transel_Garra_Fechada | Limit switch |

**Montagem Passo-a-Passo:**

1. **Inserir Stacker Crane:**
   - Menu: `Parts > Logistics > Stacker Crane`
   - Posicionar ao lado da saída do paletizador

2. **Configurar Estrutura de Armazenamento:**
   - Adicionar `Rack` (estante metálica)
   - Dimensões: 4 colunas × 3 níveis
   - Espaçamento entre níveis: 2.5m
   - Profundidade: 1.5m (para acomodar pallet)

3. **Configurar Sensores:**
   - Adicionar 8 `Proximity Sensors` nas posições listadas acima
   - Conectar cada sensor ao tag correspondente

4. **Configurar Gripper:**
   - Type: Fork Gripper (garfo duplo)
   - Width: 1.2m (largura do pallet)
   - Stroke: 0.3m
   - Adicionar 2 `Limit Switches` (aberta/fechada)

5. **Testar Movimento Manual:**
   - Ativar `Manual Mode` no Factory IO
   - Testar cada eixo individualmente:
     - Vertical: Subir até cada nível e verificar sensores
     - Horizontal: Avançar/Recuar e verificar sensores
     - Garra: Abrir/Fechar e verificar limit switches

**Dicas de Montagem:**
- Use `Grid Snap` (tecla `G`) para alinhar componentes
- Ajuste altura da câmera para visualizar todos os níveis
- Adicione iluminação extra (`Spotlight`) nos níveis superiores
- Pinte a estrutura com cores industriais (cinza, amarelo)

---

### 3.7 ELEMENTOS VISUAIS E AMBIENTAÇÃO

#### Torre de Sinalização (Light Tower)

**Componentes:**
- **Verde** (`Luz_Processo_Verde`): Sistema operando normalmente
- **Amarela** (`Luz_Processo_Amarela`): Atenção / Modo manual
- **Vermelha** (`Luz_Processo_Vermelha`): Erro / Parada de emergência

**Posicionamento:** Topo do painel de controle (visível de todos os ângulos)

#### Cenário Energético (Opcional - Visual)

**Componentes decorativos:**
1. **Painéis Solares:** 3 painéis (símbolo de energia limpa)
2. **Turbinas Eólicas:** 2 turbinas
3. **Texto 3D:** "H2 GREEN FACTORY"
4. **Plataforma Verde:** Base simbolizando sustentabilidade

**Nota:** Estes elementos são puramente decorativos e não se conectam ao PLC.

---

## 4. CONFIGURAÇÃO DE DRIVERS E COMUNICAÇÃO

### 4.1 Configurar Driver OPC UA

**Passos:**

1. **Abrir Configurações de Driver:**
   - Menu: `File > Drivers`
   - Selecionar: `OPC UA Client`

2. **Configurar Endpoint:**
   ```
   Endpoint URL: opc.tcp://localhost:4840
   Security Policy: None (para testes locais)
   Security Mode: None
   ```

3. **Namespace e Node IDs:**
   - Namespace Index: 3
   - Node ID Prefix: "DB_FactoryIO"

4. **Mapear Tags:**
   - Clicar em `Add Tag Mapping`
   - Importar tags da tabela de endereçamento
   - Exemplo:
     ```
     Factory IO Tag        →  OPC UA Node ID
     Start_Btn             →  ns=3;s="DB_FactoryIO"."Start_Btn"
     Motor_Esteira_Prin    →  ns=3;s="DB_FactoryIO"."Motor_Esteira"
     ```

5. **Testar Conexão:**
   - Clicar em `Test Connection`
   - Verificar status: `Connected`
   - Verificar taxa de atualização: `100ms` (recomendado)

### 4.2 Verificar Tags no Monitor

**Ferramentas de Debug:**

1. **Tag Monitor:**
   - Menu: `View > Tag Monitor`
   - Lista todas as tags com valores em tempo real
   - Verde = conectado, Vermelho = desconectado

2. **Forçar Valores (Teste Manual):**
   - Clicar com botão direito na tag
   - `Force Value` → Digite valor (0 ou 1 para Bool)
   - Verificar se atuadores respondem

3. **Log de Comunicação:**
   - Menu: `View > Communication Log`
   - Monitora todas as mensagens OPC UA
   - Útil para diagnosticar erros de conexão

---

## 5. SALVAR E EXPORTAR PROJETO

### 5.1 Salvar Cena

1. **Salvar Arquivo:**
   - Menu: `File > Save As`
   - Nome: `H2-Green-Factory.factoryio`
   - Local: `experimentacao-prototipos/02-factory-io/`

2. **Criar Backup:**
   - Menu: `File > Export > Backup`
   - Formato: `.zip` (inclui todas as dependências)

### 5.2 Capturar Screenshots

**Para Documentação:**

1. **Visão Geral da Planta:**
   - Ajustar câmera para vista isométrica
   - Menu: `View > Camera > Isometric`
   - `F12` para screenshot
   - Salvar como: `01-visao-geral-planta.png`

2. **Quadro de Controle:**
   - Aproximar câmera do painel
   - `F12` → `02-quadro-controle.png`

3. **Eletrolizador:**
   - Foco no tanque + sensores
   - `F12` → `03-eletrolizador.png`

4. **Filling Station:**
   - Mostrar stopper, sensor e cilindro
   - `F12` → `04-filling-station.png`

5. **Paletizador:**
   - Capturar momento de formação do pallet
   - `F12` → `05-paletizador.png`

6. **Transelevador:**
   - Mostrar todos os 3 níveis
   - `F12` → `06-transelevador.png`

7. **Tag Configuration:**
   - Screenshot da tela de tags configuradas
   - `F12` → `07-tags-configuradas.png`

**Salvar em:** `experimentacao-prototipos/02-factory-io/screenshots/`

---

## 6. TROUBLESHOOTING (Resolução de Problemas)

### Problema 1: Tags não conectam ao TIA Portal

**Sintomas:**
- Tags aparecem em vermelho no Tag Monitor
- Valores não atualizam

**Soluções:**
1. Verificar se TIA Portal está com OPC UA Server habilitado:
   - TIA Portal: `Project Tree > PLC > Properties > OPC UA`
   - Marcar: `Enable OPC UA Server`
2. Verificar firewall do Windows (liberar porta 4840)
3. Reiniciar ambos os softwares

---

### Problema 2: Transelevador não se move

**Sintomas:**
- Motores não acionam
- Garra não responde

**Soluções:**
1. Verificar se `Sistema_Ativo = TRUE` no PLC
2. Verificar se `Transel_Erro = FALSE`
3. Testar movimento manual:
   - Factory IO: `Mode > Manual`
   - Forçar tags de motor manualmente
4. Verificar sensores de posição:
   - Todos os sensores devem estar visíveis e configurados
   - Testar com `Tag Monitor`

---

### Problema 3: Cilindros não param no Stopper

**Sintomas:**
- Cilindros passam direto pela Filling Station
- Sensor não detecta

**Soluções:**
1. Verificar alinhamento do sensor:
   - Distância: 0.3m antes do stopper
   - Altura: mesma do centro do cilindro
2. Verificar range do sensor:
   - Propriedades: `Detection Range = 0.5m`
3. Testar detecção manual:
   - Colocar cilindro manualmente na frente do sensor
   - Verificar `Sensor_Envase = TRUE` no Tag Monitor

---

### Problema 4: Paletizador não completa pallet

**Sintomas:**
- Fica travado em 3/6 ou 5/6 peças
- Não emite sinal de `Palletizer_Unload`

**Soluções:**
1. Verificar contador no PLC:
   - Network 5: `CTU` deve ter `PV = 6`
2. Verificar se há cilindros suficientes:
   - Ajustar `Emission Rate` do Emitter
3. Resetar paletizador:
   - Factory IO: Clicar com direito → `Reset`

---

## 7. OTIMIZAÇÕES E MELHORIAS

### Performance

1. **Reduzir Resolução Gráfica:**
   - Menu: `Edit > Settings > Graphics`
   - Qualidade: Medium (para PCs mais fracos)

2. **Limitar Taxa de Atualização:**
   - OPC UA: `Publish Interval = 100ms` (padrão)
   - Se lag, aumentar para 200ms

### Realismo Visual

1. **Adicionar Efeitos:**
   - Partículas de vapor no eletrolisador
   - Brilho nos displays
   - Sombras dinâmicas

2. **Iluminação:**
   - Adicionar `Spotlights` nos pontos de trabalho
   - Luz ambiente: Cor branca neutra

3. **Texturas:**
   - Chão: Concreto industrial
   - Estruturas: Metal escovado
   - Painéis: Aço inox

---

## 8. CHECKLIST FINAL

Antes de considerar a cena completa, verificar:

- [ ] Todos os 59 tags estão mapeados e conectados
- [ ] Eletrolizador com sensor de nível funcional
- [ ] Painel de controle com 4 botões + potenciômetro + 2 displays
- [ ] Esteira principal com velocidade variável
- [ ] Filling Station com stopper e sensor
- [ ] Paletizador configurado para 6 peças
- [ ] **Transelevador com 3 níveis e 4 colunas operacional**
- [ ] 8 sensores de posição do transelevador funcionando
- [ ] Garra do transelevador com limit switches
- [ ] Torre de sinalização (3 cores)
- [ ] Comunicação OPC UA estabelecida
- [ ] 7 screenshots capturados
- [ ] Arquivo `.factoryio` salvo

---

## 9. PRÓXIMOS PASSOS

Após completar a montagem no Factory IO:

1. **Integrar com TIA Portal:**
   - Importar tags no projeto do PLC
   - Testar comunicação bidirecional
   - Validar Networks 1-6 do Ladder

2. **Desenvolver IHM:**
   - Criar tela de supervisão
   - Adicionar animações da planta
   - Implementar matriz de estoque do transelevador

3. **Testes Integrados:**
   - Simular produção completa (cilindro → pallet → estoque)
   - Testar cenários de erro
   - Validar eficiência térmica (70-80°C)

4. **Gravar Vídeo:**
   - Usar Factory IO recording feature
   - Ou software externo (OBS Studio)

---

**Documento:** MANUAL-Factory-IO.md
**Projeto:** H2 Green Factory
**Versão:** 1.0
**Data:** Novembro 2025
**Software:** Factory IO v2.5+
