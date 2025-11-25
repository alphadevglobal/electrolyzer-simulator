# DIAGRAMA DE REDE INDUSTRIAL - H2 GREEN FACTORY

## TOPOLOGIA DE REDE E COMUNICAÇÃO

---

## 1. ARQUITETURA DE REDE EM CAMADAS

### Modelo Purdue (ISA-95)

```
┌─────────────────────────────────────────────────────────────────┐
│ NÍVEL 5: ENTERPRISE (Gestão Corporativa)                       │
│ • ERP (SAP, Odoo)                                               │
│ • BI/Analytics                                                  │
│ IP: 10.0.0.0/24 (Internet via VPN)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ Firewall DMZ
┌────────────────────────────┴────────────────────────────────────┐
│ NÍVEL 4: OPERATIONS (Planejamento e Logística)                 │
│ • MES (Manufacturing Execution System)                          │
│ • Servidor Web (Next.js App)                                    │
│ • Banco de Dados (TimescaleDB)                                  │
│ IP: 192.168.10.0/24                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ Switch Industrial L3
┌────────────────────────────┴────────────────────────────────────┐
│ NÍVEL 3: SUPERVISORY (Supervisão e Aquisição de Dados)         │
│ • SCADA / Node-RED                                              │
│ • Servidor OPC UA                                               │
│ • IHM (KTP700 Basic)                                            │
│ IP: 192.168.1.0/24                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ Switch Industrial L2 (PROFINET)
┌────────────────────────────┴────────────────────────────────────┐
│ NÍVEL 2: CONTROL (Controle de Processos)                       │
│ • PLC S7-1200 (192.168.0.1)                                     │
│ • Inversor de Frequência (VFD)                                  │
│ • Controladores Locais                                          │
│ IP: 192.168.0.0/24                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ I/O Remoto / PROFIBUS
┌────────────────────────────┴────────────────────────────────────┐
│ NÍVEL 1: FIELD (Sensores e Atuadores)                          │
│ • Sensores: Temperatura, Nível, Pressão                         │
│ • Atuadores: Motores, Válvulas, Stoppers                        │
│ Protocolo: 4-20mA, 0-10V, Digital (24VDC)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. TABELA DE ENDEREÇAMENTO IP

### Rede de Automação (192.168.0.0/24)

| Device | IP Address | Subnet Mask | Gateway | Descrição |
|--------|------------|-------------|---------|-----------|
| PLC S7-1200 | 192.168.0.1 | 255.255.255.0 | - | Controlador principal |
| I/O Remoto 1 | 192.168.0.10 | 255.255.255.0 | 192.168.0.1 | Módulo I/O eletrolisador |
| I/O Remoto 2 | 192.168.0.11 | 255.255.255.0 | 192.168.0.1 | Módulo I/O transelevador |
| VFD Esteira | 192.168.0.20 | 255.255.255.0 | 192.168.0.1 | Inversor de frequência |

### Rede de Supervisão (192.168.1.0/24)

| Device | IP Address | Subnet Mask | Gateway | Descrição |
|--------|------------|-------------|---------|-----------|
| IHM KTP700 | 192.168.1.10 | 255.255.255.0 | 192.168.1.1 | Interface operador |
| Node-RED | 192.168.1.20 | 255.255.255.0 | 192.168.1.1 | Gateway OPC UA |
| Factory IO PC | 192.168.1.30 | 255.255.255.0 | 192.168.1.1 | Simulador 3D |

### Rede Corporativa (192.168.10.0/24)

| Device | IP Address | Subnet Mask | Gateway | Descrição |
|--------|------------|-------------|---------|-----------|
| Web Server | 192.168.10.100 | 255.255.255.0 | 192.168.10.1 | Next.js App |
| DB Server | 192.168.10.101 | 255.255.255.0 | 192.168.10.1 | TimescaleDB |

---

## 3. PROTOCOLOS DE COMUNICAÇÃO

### 3.1 OPC UA (PLC ↔ SCADA)

**Características:**
- **Porta:** 4840 (TCP)
- **Protocolo:** opc.tcp://
- **Segurança:** TLS 1.2 + Certificate-based
- **Taxa de Atualização:** 100 ms (10 Hz)
- **Payload:** Binary encoding

**Endpoint URL:**
```
opc.tcp://192.168.0.1:4840/OPCUA/SimulationServer
```

**Node IDs:**
```
ns=3;s="DB_FactoryIO"."Start_Btn"
ns=3;s="DB_FactoryIO"."Temp_Real"
ns=3;s="DB_FactoryIO"."Transel_Estado"
```

### 3.2 PROFINET (PLC ↔ I/O)

**Características:**
- **Protocolo:** Ethernet Industrial (IEEE 802.3)
- **Cycle Time:** 10 ms (tempo real)
- **Topologia:** Linha, Estrela ou Anel (MRP - Media Redundancy Protocol)
- **QoS:** Priorização de pacotes (VLAN Priority)

**Configuração:**
- VLAN ID: 100 (tráfego PROFINET isolado)
- Prioridade: 6 (alta)

### 3.3 WebSocket (Node-RED ↔ Web App)

**Características:**
- **Porta:** 1880 (ou 443 se SSL)
- **Protocolo:** ws:// ou wss://
- **Latência:** < 50 ms
- **Throughput:** ~1000 mensagens/s

**Endpoint:**
```
ws://192.168.1.20:1880/ws/plc
```

**Formato de Mensagem:**
```json
{
  "timestamp": "2025-11-25T14:30:45.123Z",
  "tag": "TEMP_01",
  "value": 75.3,
  "quality": "GOOD"
}
```

### 3.4 MQTT (Pub/Sub para IoT)

**Broker:** Mosquitto (192.168.1.20:1883)

**Tópicos:**
```
h2factory/sensors/temperature
h2factory/sensors/level
h2factory/actuators/motor/status
h2factory/alarms/critical
```

**QoS Levels:**
- QoS 0: Sensores não-críticos (nível tanque)
- QoS 1: Sensores críticos (temperatura)
- QoS 2: Comandos de controle (start/stop)

---

## 4. SEGURANÇA DE REDE INDUSTRIAL

### 4.1 Segmentação (VLANs)

| VLAN ID | Nome | Subnet | Devices |
|---------|------|--------|---------|
| 10 | AUTOMATION | 192.168.0.0/24 | PLCs, I/O |
| 20 | SUPERVISION | 192.168.1.0/24 | IHM, SCADA |
| 30 | CORPORATE | 192.168.10.0/24 | Servidores |
| 99 | MANAGEMENT | 192.168.99.0/24 | Switch configs |

### 4.2 Firewall Rules (ACL)

**Regra 1:** AUTOMATION → SUPERVISION
```
Permitir: OPC UA (TCP 4840), PROFINET (UDP 34962-34964)
Bloquear: Tudo mais
```

**Regra 2:** SUPERVISION → CORPORATE
```
Permitir: HTTP/HTTPS (TCP 80, 443), PostgreSQL (TCP 5432)
Bloquear: SSH, RDP
```

**Regra 3:** CORPORATE → Internet
```
Permitir: HTTP/HTTPS (saída)
Bloquear: Todas entradas (exceto VPN)
```

### 4.3 Detecção de Intrusão (IDS)

**Ferramentas:**
- **Snort:** Detecta tráfego anômalo
- **Suricata:** IDS/IPS para SCADA

**Regras Customizadas:**
```
alert tcp any any -> 192.168.0.1 4840 (msg:"OPC UA - acesso não autorizado"; sid:1000001;)
```

---

## 5. QUALIDADE DE SERVIÇO (QoS)

### Priorização de Tráfego

| Prioridade | DSCP | Tipo de Tráfego | Latência Max |
|------------|------|-----------------|--------------|
| P1 (Alta) | EF (46) | Controle tempo real (PROFINET) | < 10 ms |
| P2 (Média-Alta) | AF41 (34) | OPC UA, comandos | < 50 ms |
| P3 (Média) | AF21 (18) | WebSocket streaming | < 100 ms |
| P4 (Baixa) | BE (0) | HTTP, logs | < 500 ms |

---

## 6. BACKUP E REDUNDÂNCIA

### 6.1 Redundância de PLC

**Hot Standby (futuro):**
```
PLC Principal: 192.168.0.1
PLC Backup: 192.168.0.2
Heartbeat: A cada 1s via PROFINET
Failover: Automático em < 5s
```

### 6.2 Redundância de Rede

**MRP (Media Redundancy Protocol):**
- Topologia em anel
- Recuperação de falha: < 200 ms
- Switch gerenciável com suporte MRP

---

## 7. MONITORAMENTO DE REDE

### 7.1 SNMP (Simple Network Management Protocol)

**Switches Industriais:**
- Community String: `h2factory_readonly`
- Trap Receiver: 192.168.1.20:162

**Métricas Monitoradas:**
- Utilização de banda (%)
- Taxa de erros (CRC, colisões)
- Temperatura do switch

### 7.2 Grafana Dashboard

**Data Source:** TimescaleDB

**Painéis:**
1. Latência OPC UA (ms)
2. Throughput WebSocket (msg/s)
3. CPU/RAM do PLC (%)
4. Alarmes de rede (count)

---

## 8. DIAGRAMA DE TOPOLOGIA FÍSICA

```
                    ┌─────────────┐
                    │   INTERNET  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  FIREWALL   │
                    │   + VPN     │
                    └──────┬──────┘
                           │
        ┌──────────────────┴──────────────────┐
        │   Switch L3 Core (192.168.10.1)     │
        │   • VLAN Routing                    │
        │   • Firewall interno                │
        └─┬─────────────┬─────────────┬───────┘
          │             │             │
    ┌─────┴─────┐ ┌────┴────┐ ┌─────┴─────┐
    │ Web Server│ │DB Server│ │  Node-RED │
    │ .10.100   │ │ .10.101 │ │  .1.20    │
    └───────────┘ └─────────┘ └─────┬─────┘
                                    │
        ┌───────────────────────────┘
        │
    ┌───┴───────────────────────────────────┐
    │   Switch L2 Industrial (192.168.0.254)│
    │   • PROFINET Support                  │
    │   • MRP Ring                          │
    └─┬─────────┬─────────┬─────────┬───────┘
      │         │         │         │
  ┌───┴───┐ ┌──┴──┐  ┌───┴────┐ ┌──┴───┐
  │PLC    │ │IHM  │  │I/O Rem │ │ VFD  │
  │.0.1   │ │.1.10│  │.0.10   │ │.0.20 │
  └───┬───┘ └─────┘  └────┬───┘ └──────┘
      │                   │
  ┌───┴────┐         ┌────┴────┐
  │Sensores│         │Atuadores│
  │Tanque  │         │Esteira  │
  └────────┘         └─────────┘
```

---

## 9. DOCUMENTAÇÃO DE CABOS E CONECTORES

### PLC → I/O Remoto (PROFINET)

| Cabo | Tipo | Comprimento | Conectores |
|------|------|-------------|------------|
| PROFINET Cable | Cat6a S/FTP | 15m | RJ45 Industrial (IP67) |
| Tensão | - | - | 24VDC (fonte separada) |

### Sensores → I/O

| Sensor | Sinal | Cabo | Faixa |
|--------|-------|------|-------|
| Temperatura | 0-10V | 2x 0.5mm² blindado | 25-100°C |
| Nível | 4-20mA | 2x 0.5mm² blindado | 0-100% |
| Pressão | 4-20mA | 2x 0.5mm² blindado | 0-10 bar |

---

## 10. CHECKLIST DE COMISSIONAMENTO

- [ ] Configurar VLANs nos switches
- [ ] Atribuir IPs estáticos aos dispositivos
- [ ] Testar conectividade (ping) entre camadas
- [ ] Validar comunicação OPC UA (UaExpert)
- [ ] Configurar firewall rules
- [ ] Habilitar SNMP nos switches
- [ ] Configurar NTP (sincronização de relógios)
- [ ] Documentar senhas em cofre (LastPass, Bitwarden)
- [ ] Realizar teste de failover (desconectar cabos)
- [ ] Validar QoS (medição de latências)

---

**Documento:** DIAGRAMA-Rede-Industrial.md
**Projeto:** H2 Green Factory
**Versão:** 1.0
**Data:** Novembro 2025
