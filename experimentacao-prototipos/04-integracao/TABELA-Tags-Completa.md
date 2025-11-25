# TABELA COMPLETA DE TAGS - PLANTA H2 GREEN FACTORY

## ENTRADAS DIGITAIS (Digital Inputs)

| Tag Name | Endereço | Tipo | Descrição | Factory IO Component |
|----------|----------|------|-----------|---------------------|
| Start_Btn | %I0.0 | Bool | Botão de Início (NA) | Push Button - Green |
| Stop_Btn | %I0.1 | Bool | Botão de Parada (NF) | Push Button - Red |
| Emergency_Btn | %I0.2 | Bool | Botão de Emergência | Emergency Stop |
| Reset_Btn | %I0.3 | Bool | Botão de Reset | Push Button - Yellow |
| Sensor_Envase | %I0.4 | Bool | Detecta cilindro na posição de enchimento | Vision Sensor |
| Sensor_Pallet | %I0.5 | Bool | Sensor de contagem na entrada do paletizador | Vision Sensor |
| Sensor_Tank_Low | %I0.6 | Bool | Nível baixo do tanque | Tank Level Sensor (Low) |
| Sensor_Tank_High | %I0.7 | Bool | Nível alto do tanque | Tank Level Sensor (High) |
| Transel_Pos_Home | %I1.0 | Bool | Transelevador na posição inicial | Proximity Sensor |
| Transel_Nivel_1 | %I1.1 | Bool | Transelevador no nível 1 | Proximity Sensor |
| Transel_Nivel_2 | %I1.2 | Bool | Transelevador no nível 2 | Proximity Sensor |
| Transel_Nivel_3 | %I1.3 | Bool | Transelevador no nível 3 | Proximity Sensor |
| Transel_Avancado | %I1.4 | Bool | Transelevador na posição avançada | Proximity Sensor |
| Transel_Recuado | %I1.5 | Bool | Transelevador na posição recuada | Proximity Sensor |
| Transel_Garra_Aberta | %I1.6 | Bool | Garra totalmente aberta | Limit Switch |
| Transel_Garra_Fechada | %I1.7 | Bool | Garra totalmente fechada | Limit Switch |
| Transel_Pallet_Detectado | %I2.0 | Bool | Sensor de presença de pallet na garra | Vision Sensor |

---

## ENTRADAS ANALÓGICAS (Analog Inputs)

| Tag Name | Endereço | Tipo | Faixa | Descrição | Factory IO Component |
|----------|----------|------|-------|-----------|---------------------|
| Nivel_Tanque_Raw | %IW64 | Int | 0-27648 | Leitura bruta do sensor de nível | Tank Level (0-10V) |
| Potenc_Temp_Raw | %IW66 | Int | 0-27648 | Leitura bruta do potenciômetro de temperatura | Potentiometer (0-10V) |
| Pressao_H2_Raw | %IW68 | Int | 0-27648 | Leitura de pressão do H2 (opcional) | Pressure Sensor |

---

## SAÍDAS DIGITAIS (Digital Outputs)

| Tag Name | Endereço | Tipo | Descrição | Factory IO Component |
|----------|----------|------|-----------|---------------------|
| Motor_Esteira_Principal | %Q0.0 | Bool | Acionamento da esteira principal | Conveyor Motor |
| Valvula_Agua | %Q0.1 | Bool | Válvula de enchimento do tanque | Solenoid Valve |
| Stopper_Envase | %Q0.2 | Bool | Trava mecânica do cilindro na estação de envase | Stopper |
| Luz_Processo_Verde | %Q0.3 | Bool | Sinalização luminosa - Processo OK | Light Tower - Green |
| Luz_Processo_Amarela | %Q0.4 | Bool | Sinalização luminosa - Atenção | Light Tower - Yellow |
| Luz_Processo_Vermelha | %Q0.5 | Bool | Sinalização luminosa - Erro/Parado | Light Tower - Red |
| Palletizer_Load | %Q0.6 | Bool | Comando de carga do paletizador | Palletizer Load Signal |
| Palletizer_Unload | %Q0.7 | Bool | Comando de descarga do paletizador | Palletizer Unload Signal |
| Transel_Motor_Subir | %Q1.0 | Bool | Motor de elevação (subir) | Stacker Crane - Up |
| Transel_Motor_Descer | %Q1.1 | Bool | Motor de elevação (descer) | Stacker Crane - Down |
| Transel_Motor_Avancar | %Q1.2 | Bool | Motor de translação (avançar) | Stacker Crane - Forward |
| Transel_Motor_Recuar | %Q1.3 | Bool | Motor de translação (recuar) | Stacker Crane - Backward |
| Transel_Garra_Abrir | %Q1.4 | Bool | Atuador da garra (abrir) | Gripper - Open |
| Transel_Garra_Fechar | %Q1.5 | Bool | Atuador da garra (fechar) | Gripper - Close |
| Bomba_Eletrolise | %Q1.6 | Bool | Bomba de circulação do eletrolisador | Pump Motor |
| Valvula_H2_Envase | %Q1.7 | Bool | Válvula de envase de H2 | Solenoid Valve |

---

## SAÍDAS ANALÓGICAS (Analog Outputs)

| Tag Name | Endereço | Tipo | Faixa | Descrição | Factory IO Component |
|----------|----------|------|-------|-----------|---------------------|
| Display_Temp | %QW64 | Int | 0-27648 | Escrita no display digital de temperatura | 7-Segment Display |
| Display_Nivel | %QW66 | Int | 0-27648 | Display de nível do tanque | 7-Segment Display |
| Velocidade_Esteira | %QW68 | Int | 0-27648 | Controle de velocidade da esteira (VFD) | Variable Speed Drive |

---

## VARIÁVEIS INTERNAS (Memory Tags)

### Controle de Processo

| Tag Name | Tipo | Descrição |
|----------|------|-----------|
| Sistema_Ativo | Bool | Flag de sistema em operação |
| Emergencia_Acionada | Bool | Flag de parada de emergência |
| Eficiencia_Otima | Bool | Flag indicando temperatura na faixa ótima (70-80°C) |
| Modo_Manual | Bool | Modo de operação manual |
| Modo_Automatico | Bool | Modo de operação automático |

### Temperatura e Eficiência

| Tag Name | Tipo | Descrição |
|----------|------|-----------|
| Temp_Norm | Real | Temperatura normalizada (0.0-1.0) |
| Temp_Real | Real | Temperatura em °C (25.0-100.0) |
| Nivel_Tanque_Percent | Real | Nível do tanque em % (0-100) |
| Tempo_Processo | Int | Tempo de envase em ms (variável conforme eficiência) |

### Contadores e Temporizadores

| Tag Name | Tipo | Descrição |
|----------|------|-----------|
| Contador_Cilindros | Int | Contador de cilindros envasados |
| Contador_Pallets | Int | Contador de pallets completos |
| Timer_Envase | TON | Temporizador de enchimento |
| Timer_Seguranca | TOF | Temporizador de segurança |

### Transelevador - Controle de Posição

| Tag Name | Tipo | Descrição |
|----------|------|-----------|
| Transel_Posicao_Atual | Int | Posição atual (0=Home, 1-3=Níveis) |
| Transel_Posicao_Destino | Int | Posição de destino solicitada |
| Transel_Em_Movimento | Bool | Flag indicando movimento em execução |
| Transel_Estado | Int | Estado da máquina (0=Idle, 1=Subindo, 2=Descendo, 3=Avançando, 4=Recuando, 5=Pegando, 6=Soltando) |
| Transel_Erro | Bool | Flag de erro do transelevador |
| Matriz_Estoque[12] | Bool | Array de 12 posições de armazenamento (4 colunas x 3 níveis) |

---

## CONFIGURAÇÃO DE COMUNICAÇÃO OPC UA

### TIA Portal → Factory IO

**Driver:** OPC UA Server (TIA Portal V17+)

**Endpoint:** `opc.tcp://localhost:4840`

**Namespace:** ns=3;s="DB_FactoryIO"

### Tags Mapeadas no Data Block DB_FactoryIO:

```
DB_FactoryIO.Inputs         → %I*   (todas entradas)
DB_FactoryIO.Outputs        → %Q*   (todas saídas)
DB_FactoryIO.AnalogInputs   → %IW* (entradas analógicas)
DB_FactoryIO.AnalogOutputs  → %QW* (saídas analógicas)
```

---

## ESTATÍSTICAS DO PROJETO

- **Total de Entradas Digitais:** 17
- **Total de Saídas Digitais:** 16
- **Total de Entradas Analógicas:** 3
- **Total de Saídas Analógicas:** 3
- **Total de Variáveis Internas:** 20+
- **Total de Tags:** 59+

---

## NOTAS TÉCNICAS

1. **Endereçamento:** Baseado em Siemens S7-1200/1500 (TIA Portal)
2. **Analógicas:** Resolução de 0-27648 (faixa padrão TIA Portal para 0-10V)
3. **Conversão:** Use blocos NORM_X e SCALE_X para converter analógicas
4. **Segurança:** Todas as saídas devem ser desligadas em caso de emergência
5. **Transelevador:** Requer sequenciamento rigoroso para evitar colisões

---

**Documento:** TABELA-Tags-Completa.md
**Projeto:** H2 Green Factory - Experimentação de Protótipos
**Versão:** 2.0
**Data:** Novembro 2025
