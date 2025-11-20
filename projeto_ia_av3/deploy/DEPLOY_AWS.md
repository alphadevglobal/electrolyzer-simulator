# Deploy Automático para AWS (Free Tier)

##  Visão Geral

Deploy serverless usando **AWS Lambda + API Gateway** (100% Free Tier)

### Custos Estimados
- **AWS Lambda Free Tier:**
  - 1 milhão de requisições/mês GRÁTIS
  - 400,000 GB-segundos de computação GRÁTIS

- **API Gateway Free Tier:**
  - 1 milhão de chamadas/mês GRÁTIS (12 primeiros meses)

- **S3 (armazenamento modelos):**
  - 5 GB GRÁTIS permanentemente

**Total:** R$ 0,00/mês dentro do Free Tier! 

---

##  Pré-requisitos

### 1. Conta AWS
- Criar conta em: https://aws.amazon.com/free/
- Verificar email e configurar billing

### 2. Credenciais AWS
- Acessar: IAM Console → Users → Security Credentials
- Criar Access Key
- **Guardar:** `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`

### 3. Instalar Ferramentas

```bash
# Serverless Framework
npm install -g serverless

# AWS CLI
pip install awscli

# Configurar AWS CLI
aws configure
# Inserir: Access Key ID, Secret Access Key, region (us-east-1)
```

---

##  Configuração com Token (SEM Intervenção)

### Opção 1: Usando GitHub Secrets (RECOMENDADO)

1. **Adicionar Secrets no GitHub:**
   - Acesse: Repositório → Settings → Secrets → Actions
   - Adicione:
     - `AWS_ACCESS_KEY_ID`: Sua access key
     - `AWS_SECRET_ACCESS_KEY`: Sua secret key
     - `AWS_REGION`: `us-east-1`

2. **GitHub Actions faz deploy automaticamente!**
   - Arquivo: `.github/workflows/deploy-aws.yml` (já criado)
   - Push para `main` → Deploy automático

### Opção 2: Usando Serverless Dashboard

```bash
# Login no Serverless
serverless login

# Deploy
serverless deploy --stage prod

# Output: URL da API
# Exemplo: https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

---

##  Deploy Manual (Primeira Vez)

```bash
cd projeto_ia_av3/deploy

# Instalar dependências
npm install

# Deploy
serverless deploy --stage dev

# Output mostrará:
# - URL da API
# - Endpoints disponíveis
# - ARN das funções Lambda
```

### Exemplo de Output:
```
Service Information
service: projeto-ia-av3-api
stage: dev
region: us-east-1
stack: projeto-ia-av3-api-dev

endpoints:
  POST - https://xyz123.execute-api.us-east-1.amazonaws.com/dev/predict
  GET - https://xyz123.execute-api.us-east-1.amazonaws.com/dev/health

functions:
  predict: projeto-ia-av3-api-dev-predict
  health: projeto-ia-av3-api-dev-health
```

---

##  Testar API

### Health Check

```bash
curl https://SEU-ENDPOINT.amazonaws.com/dev/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "IA Predictor API",
  "version": "1.0.0"
}
```

### Predição

```bash
curl -X POST https://SEU-ENDPOINT.amazonaws.com/dev/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": [0.5, 0.3, 0.8, ...],
    "model": "mlp"
  }'
```

**Response:**
```json
{
  "prediction": 1,
  "probability": [0.3, 0.7],
  "model": "mlp",
  "timestamp": 1700123456
}
```

---

##  Integração com React

### Cliente TypeScript

```typescript
// src/services/awsAPI.ts
const AWS_API_URL = 'https://SEU-ENDPOINT.amazonaws.com/dev';

export async function predictWithAWS(features: number[], model = 'mlp') {
  const response = await fetch(`${AWS_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ features, model }),
  });

  if (!response.ok) {
    throw new Error('Erro na predição AWS');
  }

  return await response.json();
}

// Health check
export async function checkAWSHealth() {
  const response = await fetch(`${AWS_API_URL}/health`);
  return await response.json();
}
```

### Uso no Componente

```typescript
import { predictWithAWS, checkAWSHealth } from '@/services/awsAPI';

export function IAPrediction() {
  const [result, setResult] = useState(null);
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    // Verifica saúde da API
    checkAWSHealth().then(data => {
      setIsHealthy(data.status === 'healthy');
    });
  }, []);

  const handlePredict = async () => {
    const features = [0.5, 0.3, ...]; // 28 features
    const prediction = await predictWithAWS(features, 'mlp');
    setResult(prediction);
  };

  return (
    <div>
      <div className={isHealthy ? 'status-online' : 'status-offline'}>
        API Status: {isHealthy ? 'Online' : 'Offline'}
      </div>
      <button onClick={handlePredict}>Fazer Predição</button>
      {result && (
        <div>
          Classe: {result.prediction}
          Probabilidade: {result.probability[result.prediction]}
        </div>
      )}
    </div>
  );
}
```

---

##  CI/CD Automático

### GitHub Actions (já configurado)

Arquivo: `.github/workflows/deploy-aws.yml`

**Triggers:**
- Push para `main`
- Tag vX.X.X
- Manual dispatch

**Steps:**
1. ✅ Checkout código
2. ✅ Setup Node.js e Python
3. ✅ Instalar dependências
4. ✅ Executar testes
5. ✅ Deploy para AWS Lambda
6. ✅ Testar endpoints
7. ✅ Notificar sucesso/falha

### Deploy Stages

```bash
# Development
serverless deploy --stage dev

# Production
serverless deploy --stage prod
```

Cada stage tem sua própria URL independente!

---

##  Monitoramento

### CloudWatch Logs

```bash
# Ver logs em tempo real
serverless logs -f predict -t

# Logs das últimas 24h
serverless logs -f predict --startTime 24h
```

### CloudWatch Metrics

- Acessar: AWS Console → CloudWatch → Metrics
- Visualizar:
  - Invocações
  - Duração
  - Erros
  - Throttles

### Alarmes (Opcional)

```yaml
# Adicionar em serverless.yml
resources:
  Resources:
    HighErrorAlarm:
      Type: AWS::CloudWatch::Alarm
      Properties:
        AlarmName: ${self:service}-${self:provider.stage}-high-errors
        ComparisonOperator: GreaterThanThreshold
        EvaluationPeriods: 1
        MetricName: Errors
        Namespace: AWS/Lambda
        Period: 300
        Statistic: Sum
        Threshold: 10
```

---

##  Upload de Modelos Treinados

### Script de Upload

```python
# upload_models.py
import boto3
import pickle

s3 = boto3.client('s3')
bucket = 'projeto-ia-av3-models-dev'

# Carrega modelo treinado
with open('../results/mlp_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Upload para S3
s3.put_object(
    Bucket=bucket,
    Key='models/mlp_model.pkl',
    Body=pickle.dumps(model)
)

print("✓ Modelo enviado para S3!")
```

### Carregar Modelo no Lambda

```python
import boto3
import pickle

def load_model_from_s3(model_name='mlp'):
    s3 = boto3.client('s3')
    bucket = os.environ['MODEL_BUCKET']

    obj = s3.get_object(
        Bucket=bucket,
        Key=f'models/{model_name}_model.pkl'
    )

    model = pickle.loads(obj['Body'].read())
    return model
```

---

##  Segurança

### API Key (Recomendado)

```yaml
# serverless.yml
provider:
  apiGateway:
    apiKeys:
      - name: ${self:service}-${self:provider.stage}-key
        value: ${env:API_KEY}
    usagePlan:
      quota:
        limit: 5000
        period: MONTH
      throttle:
        rateLimit: 10
        burstLimit: 20
```

### CORS Configurado

```python
headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
}
```

---

##  Monitoramento de Custos

### AWS Budget Alert

1. Acessar: AWS Console → Billing → Budgets
2. Create Budget
3. Set limit: $1.00
4. Email alert quando atingir 80%

### Estimativa Mensal

Com 10,000 requisições/dia:
- Lambda: $0.00 (Free Tier)
- API Gateway: $0.00 (Free Tier primeiro ano)
- S3: $0.00 (< 5GB)

**Total: R$ 0,00** 

---

##  Cleanup (Remover Tudo)

```bash
# Remove toda infraestrutura
serverless remove --stage dev

# Confirma remoção do bucket S3
aws s3 rb s3://projeto-ia-av3-models-dev --force
```

---

##  Troubleshooting

### Erro: Access Denied

```bash
# Verificar credenciais
aws sts get-caller-identity

# Reconfigurar
aws configure
```

### Erro: Module Not Found

```bash
# Rebuild layer
serverless deploy --force
```

### Lambda Timeout

```yaml
# Aumentar timeout em serverless.yml
provider:
  timeout: 60  # Aumentar para 60s
```

---

##  Recursos Úteis

- [AWS Lambda Free Tier](https://aws.amazon.com/lambda/pricing/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [API Gateway Docs](https://docs.aws.amazon.com/apigateway/)

---

## ✅ Checklist de Deploy

- [ ] Criar conta AWS
- [ ] Configurar credenciais (Access Key)
- [ ] Adicionar secrets no GitHub
- [ ] Instalar Serverless Framework
- [ ] Fazer primeiro deploy manual
- [ ] Testar endpoints
- [ ] Configurar monitoramento
- [ ] Upload de modelos treinados
- [ ] Integrar com frontend React
- [ ] Configurar alertas de custo

---

**Próximo:** Ao fazer push para `main`, GitHub Actions faz deploy automaticamente! 
