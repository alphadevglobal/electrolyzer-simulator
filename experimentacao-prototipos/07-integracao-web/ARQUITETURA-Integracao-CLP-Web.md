# ARQUITETURA DE INTEGRAÇÃO CLP ↔ WEB

## SISTEMA HÍBRIDO: AUTOMAÇÃO INDUSTRIAL + APLICAÇÃO WEB

---

## 1. VISÃO GERAL

Este documento detalha a arquitetura de integração entre:
- **Sistema de Automação:** TIA Portal (PLC S7-1200) + Factory IO
- **Aplicação Web:** Electrolyzer Simulator (Next.js/React)

### Objetivo
Criar ambiente industrial em rede onde a aplicação web possa:
1. **Monitorar** em tempo real os dados do CLP (temperatura, produção, estoque)
2. **Controlar** remotamente o processo (start/stop, setpoints)
3. **Armazenar** histórico de produção em banco de dados
4. **Visualizar** dashboards e KPIs industriais
5. **Alertar** operadores sobre eventos críticos

---

## 2. ARQUITETURA DE SISTEMA

### 2.1 Diagrama de Integração

```
┌──────────────────────────────────────────────────────────────────┐
│                    CAMADA DE SIMULAÇÃO                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │  Factory IO     │◄──OPC UA────►│  TIA Portal     │           │
│  │  (Planta 3D)    │  (Client)    │  (PLC Server)   │           │
│  └─────────────────┘              └────────┬────────┘           │
│                                            │                     │
└────────────────────────────────────────────┼─────────────────────┘
                                             │ OPC UA
                                             │ Server
┌────────────────────────────────────────────┼─────────────────────┐
│                    CAMADA DE MIDDLEWARE                          │
├────────────────────────────────────────────┼─────────────────────┤
│                                            ▼                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Node-RED / OPC UA Gateway                      │    │
│  │  • OPC UA Client (lê dados do PLC)                      │    │
│  │  • Processamento de dados (conversões, filtros)         │    │
│  │  • WebSocket Server (streaming para web)                │    │
│  │  • REST API (consultas históricas)                      │    │
│  │  • MQTT Broker (pub/sub eventos)                        │    │
│  └──────┬──────────────────────────────────────────┬───────┘    │
│         │ WebSocket (ws://)                        │            │
│         │ REST API (http://)                       │            │
│         │ MQTT (mqtt://)                           │            │
└─────────┼──────────────────────────────────────────┼────────────┘
          │                                          │
┌─────────┼──────────────────────────────────────────┼────────────┐
│         │           CAMADA WEB APPLICATION         │            │
├─────────┼──────────────────────────────────────────┼────────────┤
│         ▼                                          ▼            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │   Next.js/React Application (electrolyzer-simulator) │      │
│  │   • Dashboard de Supervisão                          │      │
│  │   • Controle Remoto de Processo                      │      │
│  │   • Gráficos Históricos (Chart.js)                   │      │
│  │   • Alertas e Notificações                           │      │
│  │   • Simulações Preditivas                            │      │
│  └─────────────────────┬────────────────────────────────┘      │
│                        │                                        │
│                        ▼                                        │
│  ┌──────────────────────────────────────────────────────┐      │
│  │   Banco de Dados (PostgreSQL / TimescaleDB)          │      │
│  │   • Séries Temporais (temperatura, produção)         │      │
│  │   • Eventos de Sistema (alarmes, comandos)           │      │
│  │   • Configurações de Usuário                         │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CAMADA DE MIDDLEWARE: NODE-RED

### 3.1 Por que Node-RED?

Node-RED é plataforma open-source ideal para integração IoT/IIoT por ser:
- **Visual:** Programação flow-based (arraste e solte)
- **Extensível:** Biblioteca com 4000+ nodes (OPC UA, MQTT, WebSocket, etc.)
- **Leve:** Roda em Raspberry Pi, containers Docker, nuvem
- **Tempo Real:** Event-driven, latências < 50ms

### 3.2 Instalação do Node-RED

**Docker (Recomendado):**
```bash
docker run -it -p 1880:1880 -v node_red_data:/data --name node-red nodered/node-red
```

**Npm (Local):**
```bash
npm install -g --unsafe-perm node-red
node-red
```

Acessar: `http://localhost:1880`

### 3.3 Instalar Pacotes Necessários

No Node-RED UI:
1. Menu → Manage palette → Install
2. Instalar:
   - `node-red-contrib-opcua` (Cliente OPC UA)
   - `node-red-dashboard` (Dashboard web opcional)
   - `node-red-contrib-postgres` (PostgreSQL)
   - `node-red-node-websocket` (WebSocket)

---

## 4. FLUXO NODE-RED: LEITURA DO CLP

### 4.1 Flow JSON Completo

```json
[
  {
    "id": "opcua_client",
    "type": "OpcUa-Client",
    "endpoint": "opc.tcp://192.168.0.1:4840",
    "action": "subscribe",
    "time": 100,
    "timeUnit": "ms"
  },
  {
    "id": "read_temperature",
    "type": "OpcUa-Item",
    "item": "ns=3;s=\"DB_FactoryIO\".\"Temp_Real\"",
    "datatype": "Double",
    "wires": [["process_temp"]]
  },
  {
    "id": "process_temp",
    "type": "function",
    "func": "msg.payload = { timestamp: new Date(), temperature: msg.payload, tag: 'TEMP_01' }; return msg;",
    "wires": [["websocket_out", "db_insert"]]
  },
  {
    "id": "websocket_out",
    "type": "websocket out",
    "server": "ws://localhost:1880/ws/plc",
    "client": ""
  },
  {
    "id": "db_insert",
    "type": "postgres",
    "postgresdb": "timeseries_db",
    "sqlquery": "INSERT INTO sensor_data (timestamp, tag, value) VALUES ($1, $2, $3)",
    "output": false
  }
]
```

### 4.2 Descrição dos Nodes

**1. OpcUa-Client:**
- Conecta ao TIA Portal Server
- Modo: `subscribe` (recebe atualizações automáticas)
- Intervalo: 100 ms (10 atualizações/s)

**2. OpcUa-Item (read_temperature):**
- Node ID: `ns=3;s="DB_FactoryIO"."Temp_Real"`
- Lê temperatura em tempo real

**3. Function (process_temp):**
- Adiciona timestamp
- Formata payload em JSON
- Enriquece com metadata (tag name)

**4. WebSocket Out:**
- Envia dados para clientes web conectados
- Endpoint: `ws://localhost:1880/ws/plc`

**5. Postgres:**
- Insere dados em banco de dados
- Tabela: `sensor_data`

---

## 5. ESTRUTURA DE BANCO DE DADOS

### 5.1 TimescaleDB (Extensão PostgreSQL)

TimescaleDB é otimizado para séries temporais industriais, oferecendo:
- Compressão automática (reduz 95% storage)
- Queries de agregação 1000x mais rápidas
- Retenção automática (apaga dados antigos)

**Instalação Docker:**
```bash
docker run -d --name timescaledb -p 5432:5432 -e POSTGRES_PASSWORD=senha timescale/timescaledb:latest-pg15
```

### 5.2 Schema do Banco

```sql
-- Criar extensão TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Tabela de séries temporais
CREATE TABLE sensor_data (
    timestamp TIMESTAMPTZ NOT NULL,
    tag VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION,
    quality VARCHAR(10) DEFAULT 'GOOD'
);

-- Converter em hypertable (otimização temporal)
SELECT create_hypertable('sensor_data', 'timestamp');

-- Índices para performance
CREATE INDEX idx_tag_timestamp ON sensor_data (tag, timestamp DESC);

-- Tabela de eventos de sistema
CREATE TABLE system_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL,  -- 'ALARM', 'COMMAND', 'STATE_CHANGE'
    source VARCHAR(100),              -- 'PLC', 'WEB', 'OPERATOR'
    message TEXT,
    severity INT DEFAULT 1            -- 1=Info, 2=Warning, 3=Error, 4=Critical
);

-- Tabela de configuração de tags
CREATE TABLE tag_config (
    tag_name VARCHAR(50) PRIMARY KEY,
    description TEXT,
    unit VARCHAR(20),
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    alarm_low DOUBLE PRECISION,
    alarm_high DOUBLE PRECISION
);

-- Popular configurações iniciais
INSERT INTO tag_config (tag_name, description, unit, min_value, max_value, alarm_low, alarm_high) VALUES
('TEMP_01', 'Temperatura Eletrolisador', '°C', 25.0, 100.0, 65.0, 85.0),
('LEVEL_01', 'Nível Tanque H2O', '%', 0.0, 100.0, 15.0, 95.0),
('PROD_COUNT', 'Contador Produção', 'un', 0, 999999, NULL, NULL);

-- View agregada (médias horárias)
CREATE MATERIALIZED VIEW sensor_data_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', timestamp) AS hour,
    tag,
    AVG(value) AS avg_value,
    MIN(value) AS min_value,
    MAX(value) AS max_value,
    COUNT(*) AS sample_count
FROM sensor_data
GROUP BY hour, tag;

-- Política de retenção (apagar dados > 90 dias)
SELECT add_retention_policy('sensor_data', INTERVAL '90 days');

-- Política de compressão (comprimir dados > 7 dias)
SELECT add_compression_policy('sensor_data', INTERVAL '7 days');
```

---

## 6. API BACKEND (Next.js API Routes)

### 6.1 Endpoint: GET /api/plc/current-data

Retorna estado atual de todos os tags.

**Arquivo:** `pages/api/plc/current-data.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (tag)
        tag,
        value,
        timestamp,
        tc.description,
        tc.unit
      FROM sensor_data sd
      LEFT JOIN tag_config tc ON sd.tag = tc.tag_name
      ORDER BY tag, timestamp DESC
    `);

    const data = result.rows.reduce((acc, row) => {
      acc[row.tag] = {
        value: row.value,
        timestamp: row.timestamp,
        description: row.description,
        unit: row.unit
      };
      return acc;
    }, {});

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching PLC data:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
}
```

### 6.2 Endpoint: GET /api/plc/historical

Retorna dados históricos com agregação.

**Arquivo:** `pages/api/plc/historical.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tag, start, end, interval = '5 minutes' } = req.query;

  try {
    const result = await pool.query(`
      SELECT
        time_bucket($1::interval, timestamp) AS bucket,
        AVG(value) AS avg_value,
        MIN(value) AS min_value,
        MAX(value) AS max_value
      FROM sensor_data
      WHERE tag = $2
        AND timestamp >= $3::timestamptz
        AND timestamp <= $4::timestamptz
      GROUP BY bucket
      ORDER BY bucket ASC
    `, [interval, tag, start, end]);

    res.status(200).json({
      success: true,
      tag,
      interval,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
}
```

### 6.3 Endpoint: POST /api/plc/write-tag

Escreve valor em tag do PLC (controle remoto).

**Arquivo:** `pages/api/plc/write-tag.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tag, value, operator } = req.body;

  try {
    // Envia comando para Node-RED (que escreve no CLP via OPC UA)
    const response = await axios.post('http://localhost:1880/plc/write', {
      tag,
      value
    });

    // Registra evento no banco
    await pool.query(`
      INSERT INTO system_events (event_type, source, message, severity)
      VALUES ('COMMAND', $1, $2, 1)
    `, [operator || 'WEB', `Write ${tag} = ${value}`]);

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error writing to PLC:', error);
    res.status(500).json({ success: false, error: 'Communication error' });
  }
}
```

---

## 7. COMPONENTE REACT: DASHBOARD TEMPO REAL

### 7.1 Hook useWebSocket

**Arquivo:** `hooks/usePlcWebSocket.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';

interface PlcData {
  temperature: number;
  level: number;
  production: number;
  efficiency: boolean;
  timestamp: string;
}

export function usePlcWebSocket(url: string) {
  const [data, setData] = useState<PlcData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setData(payload);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    return () => ws.close();
  }, [url]);

  return { data, isConnected };
}
```

### 7.2 Componente Dashboard

**Arquivo:** `components/PlcDashboard.tsx`

```typescript
import React from 'react';
import { usePlcWebSocket } from '../hooks/usePlcWebSocket';
import { Line } from 'react-chartjs-2';

export function PlcDashboard() {
  const { data, isConnected } = usePlcWebSocket('ws://localhost:1880/ws/plc');
  const [history, setHistory] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (data) {
      setHistory(prev => [...prev.slice(-50), data.temperature]);
    }
  }, [data]);

  const chartData = {
    labels: history.map((_, i) => i),
    datasets: [{
      label: 'Temperatura (°C)',
      data: history,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      <div className="mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isConnected ? 'Conectado ao PLC' : 'Desconectado'}</span>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400">Temperatura</h3>
            <p className="text-3xl font-bold">{data.temperature.toFixed(1)}°C</p>
            <span className={`text-sm ${data.efficiency ? 'text-green-400' : 'text-yellow-400'}`}>
              {data.efficiency ? 'Eficiência Ótima' : 'Fora da faixa'}
            </span>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400">Nível Tanque</h3>
            <p className="text-3xl font-bold">{data.level.toFixed(0)}%</p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-sm text-gray-400">Produção</h3>
            <p className="text-3xl font-bold">{data.production} un</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-lg mb-4">Histórico de Temperatura (50 amostras)</h3>
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
      </div>
    </div>
  );
}
```

---

## 8. CONFIGURAÇÃO COMPLETA - PASSO A PASSO

### 8.1 Preparar Ambiente

**1. Clonar Repositório:**
```bash
cd /Users/mateusmacario/Documents/electrolyzer-simulator
```

**2. Instalar Dependências:**
```bash
npm install pg ws chart.js react-chartjs-2
npm install --save-dev @types/pg @types/ws
```

**3. Configurar Variáveis de Ambiente:**

Criar `.env.local`:
```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/h2_factory
NODE_RED_URL=http://localhost:1880
WEBSOCKET_URL=ws://localhost:1880/ws/plc
```

### 8.2 Iniciar Services

**Terminal 1 - TimescaleDB:**
```bash
docker run -d --name timescaledb -p 5432:5432 \
  -e POSTGRES_PASSWORD=senha \
  -e POSTGRES_DB=h2_factory \
  timescale/timescaledb:latest-pg15
```

**Terminal 2 - Node-RED:**
```bash
docker run -it -p 1880:1880 -v $(pwd)/nodered-data:/data \
  --name node-red nodered/node-red
```

**Terminal 3 - Next.js App:**
```bash
npm run dev
```

**Terminal 4 - TIA Portal (PLCSIM):**
- Abrir TIA Portal
- Carregar projeto H2_Green_Factory
- Iniciar PLCSIM

**Terminal 5 - Factory IO:**
- Abrir Factory IO
- Carregar cena H2-Green-Factory.factoryio
- Conectar ao OPC UA Server (TIA Portal)

### 8.3 Testar Integração

1. **Verificar Conexão Node-RED → PLC:**
   - Acessar: `http://localhost:1880`
   - Verificar node OpcUa-Client (status: connected)

2. **Verificar Dados no Banco:**
   ```sql
   SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 10;
   ```

3. **Testar API:**
   ```bash
   curl http://localhost:3000/api/plc/current-data
   ```

4. **Verificar Dashboard:**
   - Acessar: `http://localhost:3000/dashboard`
   - Verificar atualização em tempo real

---

## 9. CASOS DE USO PRÁTICOS

### 9.1 Monitoramento Remoto

**Cenário:** Engenheiro em home office monitora planta 24/7

**Implementação:**
- WebSocket mantém conexão persistente
- Dashboard atualiza a cada 100ms
- Notificações push se temperatura sair da faixa

### 9.2 Controle Remoto

**Cenário:** Operador ajusta setpoint de temperatura via celular

**Fluxo:**
1. Operador acessa app mobile
2. Clica em "Ajustar Temperatura"
3. Define novo valor: 76°C
4. API POST `/api/plc/write-tag` é chamada
5. Node-RED escreve no PLC via OPC UA
6. PLC ajusta aquecimento
7. Dashboard reflete mudança em tempo real

### 9.3 Análise Histórica

**Cenário:** Analista de processos investiga queda de eficiência no dia anterior

**Queries:**
```sql
-- Temperatura média por hora nas últimas 24h
SELECT
  time_bucket('1 hour', timestamp) AS hour,
  AVG(value) AS avg_temp
FROM sensor_data
WHERE tag = 'TEMP_01'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;

-- Identificar períodos fora da faixa ótima
SELECT
  timestamp,
  value AS temperature,
  CASE
    WHEN value >= 70 AND value <= 80 THEN 'OPTIMAL'
    WHEN value < 70 THEN 'TOO_COLD'
    ELSE 'TOO_HOT'
  END AS status
FROM sensor_data
WHERE tag = 'TEMP_01'
  AND timestamp >= '2025-11-24'::date
  AND timestamp < '2025-11-25'::date
ORDER BY timestamp;
```

---

## 10. SEGURANÇA E BOAS PRÁTICAS

### 10.1 Autenticação e Autorização

**Implementar:**
1. **NextAuth.js** para login de usuários
2. **Roles:**
   - `OPERATOR`: Visualizar + Controlar
   - `ENGINEER`: Visualizar + Controlar + Configurar
   - `VIEWER`: Apenas visualizar

3. **Rate Limiting:** Limitar comandos de escrita (max 10/min por usuário)

### 10.2 Validação de Dados

**Antes de escrever no PLC:**
```typescript
function validateTagWrite(tag: string, value: number): boolean {
  const config = getTagConfig(tag);
  if (value < config.min_value || value > config.max_value) {
    throw new Error(`Value out of range: ${value} not in [${config.min_value}, ${config.max_value}]`);
  }
  return true;
}
```

### 10.3 Logs de Auditoria

**Registrar toda ação de escrita:**
```sql
INSERT INTO system_events (event_type, source, message, severity)
VALUES ('COMMAND', 'operator@company.com', 'Set TEMP_SETPOINT = 75.0', 1);
```

---

## 11. PRÓXIMOS PASSOS

**Fase 1 - Atual (Simulação):**
- ✅ Integração Node-RED + OPC UA
- ✅ WebSocket streaming
- ✅ Dashboard básico

**Fase 2 - Avançado:**
- [ ] Machine Learning para predição de falhas
- [ ] Gêmeo Digital (Digital Twin) sincronizado
- [ ] Controle adaptativo (PID auto-tuning)

**Fase 3 - Produção:**
- [ ] Redundância (backup Node-RED)
- [ ] Cibersegurança IEC 62443
- [ ] Integração com ERP (SAP, Odoo)

---

**Documento:** ARQUITETURA-Integracao-CLP-Web.md
**Projeto:** H2 Green Factory - Integração Industrial
**Versão:** 1.0
**Data:** Novembro 2025
