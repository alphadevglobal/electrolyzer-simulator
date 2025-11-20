# Integração Web ↔ Google Colab

## 📋 Visão Geral

Este documento descreve como integrar a aplicação web React com o Google Colab para processamento de modelos de IA.

---

## 🎯 Arquitetura da Integração

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Aplicação     │         │   Google Colab   │         │   GitHub        │
│   Web (React)   │◄────────┤   (Python)       │◄────────┤   Actions       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                             │
        │  1. Requisição            │  2. Processa               │  3. Deploy
        │     de Predição           │     com IA                  │     Automático
        │                            │                             │
        └──────────────────────────┴─────────────────────────────┘
                            Fluxo de Dados
```

---

## 🔧 Opção 1: API Flask no Colab

### Passo 1: Criar API no Colab

```python
# Cell 1: Instalação
!pip install flask-ngrok pyngrok

# Cell 2: Setup da API
from flask import Flask, request, jsonify
from pyngrok import ngrok
import numpy as np

# Importa seus modelos
from algorithms.mlp import MLP
from algorithms.naive_bayes import MultivariateNaiveBayes

app = Flask(__name__)

# Carrega modelos treinados
model_mlp = MLP(input_size=28, hidden_sizes=[32, 16], output_size=2)
model_nb = MultivariateNaiveBayes()

# Endpoint de predição
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = np.array(data['features']).reshape(1, -1)

    # Faz predição
    prediction = model_mlp.predict(features)[0]
    proba = model_mlp.predict_proba(features)[0]

    return jsonify({
        'prediction': int(prediction),
        'probability': proba.tolist(),
        'model': 'MLP'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'API is running'})

# Cell 3: Iniciar servidor
public_url = ngrok.connect(5000)
print(f"API disponível em: {public_url}")
app.run(port=5000)
```

### Passo 2: Cliente React

```typescript
// src/services/colabAPI.ts
const COLAB_API_URL = 'https://seu-ngrok-url.ngrok.io';

export async function predictWithColab(features: number[]) {
  const response = await fetch(`${COLAB_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ features }),
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer predição no Colab');
  }

  return await response.json();
}

// Uso no componente
const handlePredict = async () => {
  try {
    const result = await predictWithColab(inputFeatures);
    console.log('Predição:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

---

## 🔧 Opção 2: Google Drive + Polling

### Passo 1: Salvar Resultados no Drive

```python
# No Colab
from google.colab import drive
drive.mount('/content/drive')

# Salva resultados
import json

results = {
    'predictions': predictions.tolist(),
    'accuracy': float(accuracy),
    'timestamp': str(datetime.now())
}

with open('/content/drive/MyDrive/ia_results.json', 'w') as f:
    json.dump(results, f)
```

### Passo 2: Compartilhar Arquivo

1. Torne o arquivo público no Google Drive
2. Obtenha o link de compartilhamento
3. Converta para link direto de download

### Passo 3: Cliente React com Polling

```typescript
// src/services/driveAPI.ts
const DRIVE_FILE_ID = 'seu-file-id-aqui';
const DRIVE_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;

export async function fetchColabResults() {
  const response = await fetch(DRIVE_URL, {
    method: 'GET',
    cache: 'no-store', // Força atualização
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar resultados do Colab');
  }

  return await response.json();
}

// Polling periódico
useEffect(() => {
  const interval = setInterval(async () => {
    const results = await fetchColabResults();
    setIaResults(results);
  }, 10000); // A cada 10 segundos

  return () => clearInterval(interval);
}, []);
```

---

## 🔧 Opção 3: Firebase Realtime Database

### Passo 1: Setup Firebase

```bash
# No projeto React
npm install firebase
```

### Passo 2: Colab → Firebase

```python
# No Colab
!pip install firebase-admin

from firebase_admin import credentials, initialize_app, db

# Inicializa Firebase (use suas credenciais)
cred = credentials.Certificate('path/to/serviceAccountKey.json')
initialize_app(cred, {
    'databaseURL': 'https://seu-projeto.firebaseio.com'
})

# Salva resultados
ref = db.reference('ia_results')
ref.set({
    'predictions': predictions.tolist(),
    'accuracy': float(accuracy),
    'timestamp': str(datetime.now())
})
```

### Passo 3: React → Firebase

```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "sua-api-key",
  databaseURL: "https://seu-projeto.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Escuta mudanças em tempo real
export function subscribeToIAResults(callback: (data: any) => void) {
  const resultsRef = ref(database, 'ia_results');

  return onValue(resultsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

// Uso no componente
useEffect(() => {
  const unsubscribe = subscribeToIAResults((results) => {
    console.log('Novos resultados:', results);
    setIaResults(results);
  });

  return () => unsubscribe();
}, []);
```

---

## 🔐 Autenticação e Segurança

### Tokens de API

```python
# No Colab
API_TOKEN = "seu-token-secreto-aqui"

@app.route('/predict', methods=['POST'])
def predict():
    token = request.headers.get('Authorization')

    if not token or token != f"Bearer {API_TOKEN}":
        return jsonify({'error': 'Unauthorized'}), 401

    # Resto do código...
```

```typescript
// No React
const response = await fetch(`${COLAB_API_URL}/predict`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_COLAB_TOKEN}`
  },
  body: JSON.stringify({ features }),
});
```

---

## 🚀 Deploy Automatizado

### GitHub Actions → Colab

```yaml
# .github/workflows/train-models.yml
name: Treinar Modelos IA

on:
  schedule:
    - cron: '0 2 * * *'  # Todo dia às 2h
  workflow_dispatch:

jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Treinar modelos
        run: |
          cd projeto_ia_av3
          pip install numpy
          python src/main.py

      - name: Upload para Firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          # Script para fazer upload dos resultados
          python scripts/upload_to_firebase.py
```

---

## 📊 Monitoramento

### Dashboard de Status

```typescript
// src/components/IAStatus.tsx
export function IAStatus() {
  const [status, setStatus] = useState({
    isOnline: false,
    lastUpdate: null,
    currentAccuracy: 0
  });

  useEffect(() => {
    // Verifica status da API
    const checkStatus = async () => {
      try {
        const response = await fetch(`${COLAB_API_URL}/health`);
        const data = await response.json();

        setStatus({
          isOnline: true,
          lastUpdate: new Date(),
          currentAccuracy: data.accuracy
        });
      } catch (error) {
        setStatus(prev => ({ ...prev, isOnline: false }));
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ia-status">
      <div className={`status-indicator ${status.isOnline ? 'online' : 'offline'}`} />
      <span>IA Status: {status.isOnline ? 'Online' : 'Offline'}</span>
      {status.lastUpdate && (
        <span>Última atualização: {status.lastUpdate.toLocaleString()}</span>
      )}
    </div>
  );
}
```

---

## 🎓 Separação de Contextos

### Projeto AV3 (Faculdade)
- ✅ Mantém implementação isolada em `projeto_ia_av3/`
- ✅ Código 100% manual
- ✅ Foco em avaliação acadêmica
- ❌ **NÃO** misturar com iniciação científica

### Iniciação Científica (Pesquisa)
- ✅ Mantém código em `jupyter/` e `codigo-fonte-web/`
- ✅ Pode usar bibliotecas modernas
- ✅ Foco em produção e resultados reais
- ❌ **NÃO** afetar requisitos da AV3

### Integração Futura
```
┌──────────────────────────────────────┐
│         Aplicação Web                │
├──────────────────────────────────────┤
│  ┌────────────┐    ┌──────────────┐ │
│  │ Módulo IC  │    │  Módulo AV3  │ │
│  │ (Produção) │    │  (Acadêmico) │ │
│  └────────────┘    └──────────────┘ │
│       │                    │         │
│       ▼                    ▼         │
│  [APIs Modernas]    [APIs Manuais]  │
└──────────────────────────────────────┘
```

---

## 📝 Checklist de Implementação

- [ ] Escolher método de integração (Flask/Drive/Firebase)
- [ ] Configurar autenticação e tokens
- [ ] Testar conexão local
- [ ] Configurar ngrok para acesso público
- [ ] Implementar cliente React
- [ ] Adicionar tratamento de erros
- [ ] Configurar monitoramento
- [ ] Documentar endpoints
- [ ] Fazer deploy no GitHub Actions
- [ ] Testar integração completa

---

## 💡 Dicas Importantes

1. **ngrok gratuito:** URL muda a cada execução
2. **Firebase:** Melhor para produção
3. **GitHub Actions:** Use secrets para tokens
4. **Colab:** Sessão expira após inatividade
5. **CORS:** Configure corretamente no Flask

---

## 📚 Recursos

- [ngrok Documentation](https://ngrok.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [GitHub Actions](https://docs.github.com/actions)

---

**Desenvolvido por:** Mateus Gomes Macário
**Última atualização:** 20/11/2025
