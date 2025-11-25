# MANUAL TIA PORTAL - H2 GREEN FACTORY

## GUIA COMPLETO DE PROGRAMAÇÃO E CONFIGURAÇÃO

---

## 1. CRIAÇÃO DO PROJETO

### 1.1 Novo Projeto

1. **Abrir TIA Portal V17** (ou superior)
2. Menu: `Create new project`
3. Configurações:
   - **Project name:** `H2_Green_Factory`
   - **Path:** `C:\TIA_Projects\H2_Green_Factory`
   - **Author:** [Seu Nome]
   - **Comment:** "Projeto Final AV3 - Simulação Planta de H2 Verde"

### 1.2 Adicionar PLC

1. `Add new device`
2. **Hardware:**
   - **PLC:** Siemens S7-1200 / CPU 1214C DC/DC/DC
   - **Versão Firmware:** V4.5 ou superior
   - **Ordem:** 6ES7 214-1AG40-0XB0

3. **Propriedades do PLC:**
   - Nome: `PLC_H2_Factory`
   - IP Address: `192.168.0.1`
   - Subnet Mask: `255.255.255.0`

---

## 2. ESTRUTURA DO PROJETO

### 2.1 Organização de Blocos

```
Program blocks
├── Main [OB1]              → Bloco principal de execução
├── DB_FactoryIO            → Data Block de comunicação
├── DB_Process_Data         → Data Block de dados de processo
├── FC_Temperature_Scale    → Function: Conversão temperatura
├── FC_Calc_Next_Position   → Function: Cálculo próxima posição livre
└── FB_Stacker_Control      → Function Block: Controle transelevador
```

### 2.2 Criar Data Blocks

#### DB_FactoryIO (DB1) - Comunicação OPC UA

```scl
DATA_BLOCK "DB_FactoryIO"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1

STRUCT
    // ===== ENTRADAS DIGITAIS =====
    Start_Btn : Bool;           // %I0.0
    Stop_Btn : Bool;            // %I0.1
    Emergency_Btn : Bool;       // %I0.2
    Reset_Btn : Bool;           // %I0.3
    Sensor_Envase : Bool;       // %I0.4
    Sensor_Pallet : Bool;       // %I0.5
    Sensor_Tank_Low : Bool;     // %I0.6
    Sensor_Tank_High : Bool;    // %I0.7
    Transel_Pos_Home : Bool;    // %I1.0
    Transel_Nivel_1 : Bool;     // %I1.1
    Transel_Nivel_2 : Bool;     // %I1.2
    Transel_Nivel_3 : Bool;     // %I1.3
    Transel_Avancado : Bool;    // %I1.4
    Transel_Recuado : Bool;     // %I1.5
    Transel_Garra_Aberta : Bool;   // %I1.6
    Transel_Garra_Fechada : Bool;  // %I1.7

    // ===== ENTRADAS ANALÓGICAS =====
    Nivel_Tanque_Raw : Int;     // %IW64
    Potenc_Temp_Raw : Int;      // %IW66

    // ===== SAÍDAS DIGITAIS =====
    Motor_Esteira : Bool;       // %Q0.0
    Valvula_Agua : Bool;        // %Q0.1
    Stopper_Envase : Bool;      // %Q0.2
    Luz_Verde : Bool;           // %Q0.3
    Luz_Amarela : Bool;         // %Q0.4
    Luz_Vermelha : Bool;        // %Q0.5
    Palletizer_Load : Bool;     // %Q0.6
    Palletizer_Unload : Bool;   // %Q0.7
    Transel_Motor_Subir : Bool;    // %Q1.0
    Transel_Motor_Descer : Bool;   // %Q1.1
    Transel_Motor_Avancar : Bool;  // %Q1.2
    Transel_Motor_Recuar : Bool;   // %Q1.3
    Transel_Garra_Abrir : Bool;    // %Q1.4
    Transel_Garra_Fechar : Bool;   // %Q1.5

    // ===== SAÍDAS ANALÓGICAS =====
    Display_Temp : Int;         // %QW64
    Display_Nivel : Int;        // %QW66
END_STRUCT;
```

**Como Criar:**
1. Project Tree → `Add new block` → `Data block`
2. Nome: `DB_FactoryIO`
3. Tipo: `Global DB`
4. Desmarcar: `Optimized block access` (importante para OPC UA!)
5. Copiar estrutura acima

---

#### DB_Process_Data (DB2) - Variáveis de Processo

```scl
DATA_BLOCK "DB_Process_Data"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

STRUCT
    // Controle de Sistema
    Sistema_Ativo : Bool := FALSE;
    Emergencia_Acionada : Bool := FALSE;
    Eficiencia_Otima : Bool := FALSE;

    // Temperatura e Eficiência
    Temp_Norm : Real := 0.0;
    Temp_Real : Real := 25.0;
    Nivel_Tanque_Percent : Real := 0.0;
    Tempo_Processo : Int := 5000;  // ms

    // Contadores
    Contador_Cilindros : Int := 0;
    Contador_Pallets : Int := 0;

    // Transelevador
    Transel_Estado : Int := 0;
    Transel_Posicao_Atual : Int := 0;
    Transel_Posicao_Destino : Int := 0;
    Transel_Em_Movimento : Bool := FALSE;
    Transel_Erro : Bool := FALSE;

    // Matriz de Estoque (12 posições: 3 níveis x 4 colunas)
    Matriz_Estoque : Array[0..11] of Bool := [FALSE, FALSE, FALSE, FALSE,
                                               FALSE, FALSE, FALSE, FALSE,
                                               FALSE, FALSE, FALSE, FALSE];
END_STRUCT;
```

---

## 3. PROGRAMAÇÃO LADDER - NETWORKS

### 3.1 Main [OB1] - Estrutura Principal

```ladder
Network 1: Chamada de Funções
─────────────────────────────

     ┌──┤ Always ON ├──┐
     │                 │
     ├──┤ CALL FC_Map_IO_to_DB ├───────────────────────┐
     │                                                   │
     ├──┤ CALL FC_Temperature_Scale ├──────────────────┐│
     │                                                  ││
     ├──┤ CALL FC_Control_Logic ├─────────────────────┐││
     │                                                 │││
     └──┤ CALL FB_Stacker_Control, DB_Stacker ├───────┘┘┘
```

---

### 3.2 Network 1: Ativação do Sistema

```ladder
Network 1: Ativação do Sistema (Selo)
──────────────────────────────────────

     ┌──┤ DB_FactoryIO.Start_Btn ├──┬──┤/DB_Process_Data.Sistema_Ativo ├──┐
     │                              │                                      │
     │  ┌───────────────────────────┘                                      │
     │  │                                                                   │
     │  ├──┤ DB_Process_Data.Sistema_Ativo ├─────────────────────────┐    │
     │  │                                                              │    │
     │  └──┤ DB_FactoryIO.Stop_Btn ├────────────────────────────────┐│    │
     │                                                               ││    │
     │     ┌──┤/DB_FactoryIO.Emergency_Btn ├────────────────────────┘│    │
     │     │                                                          │    │
     │     └──( S )─ DB_Process_Data.Sistema_Ativo                   │    │
     │        ( S )─ DB_FactoryIO.Luz_Verde                          │    │
     │        ( R )─ DB_FactoryIO.Luz_Vermelha ───────────────────────────┘
     │
     └──┤ DB_FactoryIO.Emergency_Btn ├──( R )─ DB_Process_Data.Sistema_Ativo
        ( S )─ DB_Process_Data.Emergencia_Acionada
        ( S )─ DB_FactoryIO.Luz_Vermelha
        ( R )─ DB_FactoryIO.Luz_Verde
```

---

### 3.3 Network 2: Tratamento Analógico da Temperatura

```ladder
Network 2: Conversão Temperatura (0-27648 → 25-100°C)
──────────────────────────────────────────────────────

     ┌──┤ DB_Process_Data.Sistema_Ativo ├──┐
     │                                      │
     │  ┌──┤ NORM_X ├───────────────────────────────────────┐
     │  │    IN: DB_FactoryIO.Potenc_Temp_Raw              │
     │  │    MIN: 0                                         │
     │  │    MAX: 27648                                     │
     │  │    OUT: DB_Process_Data.Temp_Norm                │
     │  └──────────────────────────────────────────────────┘
     │
     │  ┌──┤ SCALE_X ├──────────────────────────────────────┐
     │  │    IN: DB_Process_Data.Temp_Norm                  │
     │  │    MIN: 25.0                                      │
     │  │    MAX: 100.0                                     │
     │  │    OUT: DB_Process_Data.Temp_Real                │
     │  └──────────────────────────────────────────────────┘
     │
     │  ┌──┤ MOVE ├─────────────────────────────────────────┐
     │  │    IN: DB_Process_Data.Temp_Real (convertido INT)│
     │  │    OUT: DB_FactoryIO.Display_Temp                │
     │  └──────────────────────────────────────────────────┘
     │
     └────────────────────────────────────────────────────────
```

**Blocos Utilizados:**
- **NORM_X:** Normaliza valor bruto (0-27648) para 0.0-1.0
- **SCALE_X:** Escalona valor normalizado para faixa física (25-100°C)
- **MOVE:** Transfere valor para display

---

### 3.4 Network 3: Algoritmo de Eficiência

```ladder
Network 3: Detecção de Faixa Ótima (70-80°C)
─────────────────────────────────────────────

     ┌──┤ DB_Process_Data.Temp_Real >= 70.0 ├──┐
     │                                          │
     │  ┌──┤ DB_Process_Data.Temp_Real <= 80.0 ├──┐
     │  │                                          │
     │  │  ┌──( S )─ DB_Process_Data.Eficiencia_Otima
     │  │  └──( S )─ DB_FactoryIO.Luz_Verde (piscar)
     │  │
     │  └──┤/DB_Process_Data.Temp_Real <= 80.0 ├──┐
     │                                             │
     │     ┌──( R )─ DB_Process_Data.Eficiencia_Otima
     │     └──( S )─ DB_FactoryIO.Luz_Amarela
     │
     └──┤/DB_Process_Data.Temp_Real >= 70.0 ├──┐
                                                │
        ┌──( R )─ DB_Process_Data.Eficiencia_Otima
        └──( S )─ DB_FactoryIO.Luz_Amarela
```

**Lógica:**
- **70°C ≤ Temp ≤ 80°C:** Eficiência ótima (luz verde)
- **Temp < 70°C ou Temp > 80°C:** Eficiência reduzida (luz amarela)

---

### 3.5 Network 4: Controle de Envase Variável

```ladder
Network 4: Tempo de Envase Dinâmico
────────────────────────────────────

     ┌──┤ DB_Process_Data.Eficiencia_Otima ├──┐
     │                                         │
     │  ┌──┤ MOVE 2000 ├─► DB_Process_Data.Tempo_Processo
     │  │    (Eficiência ótima = envase rápido: 2s)
     │  │
     │  └──┤/DB_Process_Data.Eficiencia_Otima ├──┐
     │                                            │
     │     ┌──┤ MOVE 5000 ├─► DB_Process_Data.Tempo_Processo
     │     │    (Eficiência baixa = envase lento: 5s)
     │     │
     │     └───────────────────────────────────────┘
     │
     │  ┌──┤ DB_FactoryIO.Sensor_Envase ├──┐
     │  │                                   │
     │  │  ┌──( S )─ DB_FactoryIO.Stopper_Envase (segura cilindro)
     │  │  │
     │  │  └──┤ TON ├────────────────────────────────────┐
     │  │       IN: TRUE                                 │
     │  │       PT: DB_Process_Data.Tempo_Processo (ms)  │
     │  │       Q → DB_FactoryIO.Valvula_H2_Envase       │
     │  │                                                 │
     │  │     ┌──┤ TON.Q ├──( R )─ Stopper_Envase        │
     │  │     │             (libera cilindro após envase)│
     │  │     │                                           │
     │  │     └──────────────────────────────────────────┘
     │  │
     │  └───────────────────────────────────────────────────
     │
     └─────────────────────────────────────────────────────
```

**Funcionamento:**
1. Temperatura determina tempo de envase (2s vs 5s)
2. Sensor detecta cilindro → Ativa stopper
3. Timer conta tempo de envase → Abre válvula H2
4. Fim do timer → Libera stopper

---

### 3.6 Network 5: Paletização

```ladder
Network 5: Contador de Palletização
────────────────────────────────────

     ┌──┤ DB_FactoryIO.Sensor_Pallet ├──┐
     │    (Detecção de borda de subida) │
     │                                   │
     │  ┌──┤ CTU ├─────────────────────────────────────┐
     │  │    CU: Sensor_Pallet (pulso)                │
     │  │    R: DB_FactoryIO.Reset_Btn                │
     │  │    PV: 6 (6 cilindros por pallet)           │
     │  │    Q → DB_FactoryIO.Palletizer_Load         │
     │  │    CV → DB_Process_Data.Contador_Cilindros  │
     │  └────────────────────────────────────────────┘
     │
     │  ┌──┤ CTU.Q ├──( S )─ Palletizer_Unload
     │  │              ( ADD 1 )─ Contador_Pallets
     │  │              ( R )─ CTU (reset contador)
     │  │
     │  └──────────────────────────────────────────────
     │
     └────────────────────────────────────────────────
```

**Lógica:**
- Contador CTU incrementa a cada cilindro
- Ao atingir 6 → Aciona paletizador
- Pallet completo → Reset contador e incrementa pallets

---

### 3.7 Network 6: Controle do Transelevador

**Ver arquivo detalhado:** `ladder/Network_06_Transelevador.md`

(Implementação completa da máquina de estados já documentada)

---

## 4. CONFIGURAÇÃO OPC UA SERVER

### 4.1 Habilitar OPC UA no PLC

1. **Project Tree** → `PLC_H2_Factory` → `Properties`
2. Aba: `OPC UA`
3. Marcar: `☑ Enable OPC UA Server`
4. **Server Interfaces:**
   - Endpoint URL: `opc.tcp://192.168.0.1:4840`
   - Security: `None` (apenas para testes locais)
   - Authentication: `Anonymous`

5. **Server Profiles:**
   - Marcar: `☑ Standard UA Server Profile`

---

### 4.2 Publicar Tags no OPC UA

1. **Project Tree** → `OPC UA` → `Server interfaces`
2. Clicar em: `Add new server interface`
3. Nome: `FactoryIO_Interface`

4. **Mapear Data Block:**
   - Arrastar `DB_FactoryIO` para `Published variables`
   - Todas as variáveis do DB serão expostas automaticamente

5. **Configurar Node IDs:**
   - Namespace Index: `3` (padrão TIA Portal)
   - Node ID Pattern: `ns=3;s="DB_FactoryIO"."[TagName]"`

**Exemplo:**
```
Tag: Start_Btn
Node ID: ns=3;s="DB_FactoryIO"."Start_Btn"
```

---

### 4.3 Testar Conexão OPC UA

**Ferramentas de Teste:**

1. **OPC UA Client (Built-in TIA Portal):**
   - Menu: `Online > OPC UA Client`
   - Connect to: `opc.tcp://192.168.0.1:4840`
   - Browse: Verificar se tags aparecem
   - Read/Write: Testar valores

2. **UaExpert (Software Externo):**
   - Download: [Unified Automation](https://www.unified-automation.com/downloads/opc-ua-clients.html)
   - Adicionar servidor: `opc.tcp://192.168.0.1:4840`
   - Navegar: `Objects > DeviceSet > PLC_H2_Factory > DataBlocksGlobal > DB_FactoryIO`
   - Verificar leitura/escrita de tags

---

## 5. INTERFACE HOMEM-MÁQUINA (IHM)

### 5.1 Adicionar Painel HMI

1. **Add new device:**
   - Device: `SIMATIC HMI > KTP700 Basic PN`
   - Nome: `HMI_H2_Factory`
   - IP: `192.168.0.10`

2. **Conectar ao PLC:**
   - Network View → Conectar HMI ao PLC via Ethernet
   - Testar comunicação: `Online > Ping PLC`

---

### 5.2 Criar Tela Principal

**Nome:** `Main_Screen`

**Elementos:**

1. **Barra de Nível (Tank Level):**
   - Tipo: `Bar` (vertical)
   - Tag: `DB_Process_Data.Nivel_Tanque_Percent`
   - Min: 0, Max: 100
   - Cor: Azul → Vermelho (se < 20%)

2. **Display de Temperatura:**
   - Tipo: `I/O Field`
   - Tag: `DB_Process_Data.Temp_Real`
   - Formato: `##.# °C`
   - Read-only: TRUE

3. **Indicador de Eficiência:**
   - Tipo: `Circle` (LED)
   - Tag: `DB_Process_Data.Eficiencia_Otima`
   - Animação:
     - Value 0: Cor Cinza (texto: "Baixa Eficiência")
     - Value 1: Cor Verde Piscando (texto: "Eficiência Ótima")

4. **Contador de Pallets:**
   - Tipo: `Text` + `I/O Field`
   - Tag: `DB_Process_Data.Contador_Pallets`
   - Formato: `Pallets: ##`

5. **Matriz de Estoque (Transelevador):**
   - **12 Círculos** organizados em grid 3×4
   - Tag: `DB_Process_Data.Matriz_Estoque[0..11]`
   - Animação:
     - FALSE: Verde (vazio)
     - TRUE: Vermelho (ocupado)

**Layout ASCII:**
```
┌────────────────────────────────────────────┐
│  H2 GREEN FACTORY - SUPERVISÃO             │
├────────────────────────────────────────────┤
│                                            │
│  ELETROLISADOR    │  TEMPERATURA           │
│  ║ ░░░░░ ║ 50%   │  75.2 °C               │
│  ║ █████ ║        │  [●] Eficiência Ótima  │
│  ║ █████ ║        │                        │
│  ╚═══════╝        │  PRODUÇÃO              │
│                   │  Pallets: 05           │
├───────────────────┴────────────────────────┤
│  ESTOQUE (TRANSELEVADOR)                   │
│  Nível 3: [●][○][○][○]                    │
│  Nível 2: [●][●][○][○]                    │
│  Nível 1: [●][●][●][○]                    │
│  Status: ARMAZENANDO NÍVEL 3               │
├────────────────────────────────────────────┤
│  [START] [STOP] [RESET]       [12:45:30]  │
└────────────────────────────────────────────┘
```

---

### 5.3 Adicionar Botões de Controle

1. **Botão START:**
   - Evento `Press`: SetBit `DB_FactoryIO.Start_Btn`
   - Evento `Release`: ResetBit `DB_FactoryIO.Start_Btn`

2. **Botão STOP:**
   - Evento `Press`: SetBit `DB_FactoryIO.Stop_Btn`

3. **Botão RESET:**
   - Evento `Press`: SetBit `DB_FactoryIO.Reset_Btn`
   - Evento `Release`: ResetBit `DB_FactoryIO.Reset_Btn`

---

## 6. COMPILAÇÃO E DOWNLOAD

### 6.1 Compilar Projeto

1. **Compilar Hardware:**
   - Selecionar `PLC_H2_Factory` → `Compile > Hardware and software`
   - Verificar: `0 Errors, 0 Warnings`

2. **Compilar HMI:**
   - Selecionar `HMI_H2_Factory` → `Generate screens`

### 6.2 Simulação (PLCSIM)

**Para testar sem hardware real:**

1. **Iniciar PLCSIM:**
   - Menu: `Online > Simulation > Start`
   - Selecionar: `PLC_H2_Factory`

2. **Download para PLCSIM:**
   - `Online > Download to device > Software`
   - Target: `PLCSIM Virtual CPU`

3. **Testar com Factory IO:**
   - Factory IO: Conectar ao endpoint `opc.tcp://localhost:4840`
   - Verificar atualização de tags em tempo real

---

## 7. EXPORTAR DOCUMENTAÇÃO

### 7.1 Exportar Ladder como PDF

1. **Selecionar Main [OB1]**
2. Menu: `Project > Export > PDF`
3. Configurações:
   - ☑ Include all networks
   - ☑ Include tag comments
   - ☑ Include symbol table
4. Salvar: `03-tia-portal/ladder/Main_OB1_Complete.pdf`

### 7.2 Exportar Tag Table

1. **PLC Tags** → `Show all tags`
2. Menu: `Table > Export`
3. Formato: `Excel (.xlsx)`
4. Salvar: `04-integracao/PLC_Tag_Table.xlsx`

### 7.3 Backup Completo do Projeto

1. Menu: `Project > Archive`
2. Nome: `H2_Green_Factory_v1.0.zap17`
3. ☑ Include all device configurations
4. ☑ Include libraries
5. Salvar: `03-tia-portal/H2_Green_Factory_v1.0.zap17`

---

## 8. TROUBLESHOOTING

### Erro: "OPC UA Server não inicia"

**Solução:**
1. Verificar se porta 4840 não está em uso:
   ```cmd
   netstat -an | findstr 4840
   ```
2. Recompilar projeto
3. Reiniciar PLCSIM

### Erro: "Factory IO não conecta"

**Solução:**
1. TIA Portal: `Online > Diagnostics > OPC UA Server Status`
2. Verificar: `Status = Running`
3. Firewall: Liberar porta 4840 TCP/UDP
4. Factory IO: Verificar endpoint URL correto

---

## 9. CHECKLIST FINAL

- [ ] Projeto `H2_Green_Factory` criado
- [ ] PLC S7-1200 adicionado e configurado
- [ ] DB_FactoryIO (59 tags) criado
- [ ] DB_Process_Data criado
- [ ] Networks 1-6 implementados em Ladder
- [ ] OPC UA Server habilitado e testado
- [ ] HMI KTP700 adicionado
- [ ] Tela principal da IHM criada
- [ ] Compilação sem erros
- [ ] Teste em PLCSIM bem-sucedido
- [ ] Conexão com Factory IO validada
- [ ] Backup `.zap17` criado

---

**Documento:** MANUAL-TIA-Portal.md
**Projeto:** H2 Green Factory
**Versão:** 1.0
**Data:** Novembro 2025
**Software:** TIA Portal V17+
