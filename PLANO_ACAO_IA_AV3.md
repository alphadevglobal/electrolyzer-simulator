# PLANO DE AÇÃO - PROJETO IA AV3
## Dataset: Appliances Energy Prediction (OpenML ID: 46283)
### Disciplina: Inteligência Artificial Computacional
### Professor: Ms. Cynthia Moreira Maia
### Aluno: Mateus Macário

---

## ⚠️ REQUISITOS OBRIGATÓRIOS (Conforme PDF)

### ❌ PROIBIDO:
- **NÃO usar pandas**
- **NÃO usar scikit-learn** (nem para algoritmos, nem para nada)
- **NÃO usar bibliotecas que implementem os algoritmos**
- Todo código deve ser implementado **MANUALMENTE**

### ✅ OBRIGATÓRIO:
- Dataset com **>10 atributos** e **>1000 instâncias**
- Implementação manual de **TODOS** os algoritmos
- Validação cruzada implementada manualmente
- Entrega dos slides até **25/11/2025**
- Apresentação **26/11/2025**
- Código fonte **OBRIGATÓRIO** (sem código = nota zero)

---

## 📊 DATASET ESCOLHIDO

- **Nome**: Appliances Energy Prediction
- **OpenML ID**: 46283
- **Instâncias**: 19,735
- **Atributos**: 28 features + 2 targets
- **Link**: https://www.openml.org/d/46283
- **Justificativa**: Alinhamento com pesquisa sobre eficiência energética e temperatura

---

## 🗂️ ESTRUTURA DO PROJETO

```
projeto_ia_av3/
├── data/
│   ├── raw/
│   │   └── appliances_energy.csv
│   └── processed/
│       ├── train_data.npy
│       ├── val_data.npy
│       └── test_data.npy
├── src/
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── knn.py              # KNN implementado do zero
│   │   ├── perceptron.py       # Perceptron implementado do zero
│   │   ├── mlp.py              # MLP implementado do zero
│   │   └── naive_bayes.py      # Naive Bayes implementado do zero
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── data_loader.py      # Carregamento sem pandas
│   │   ├── preprocessing.py     # Normalização manual
│   │   ├── cross_validation.py  # Cross-validation manual
│   │   ├── metrics.py          # Métricas implementadas
│   │   └── visualization.py    # Gráficos com matplotlib
│   ├── experiments/
│   │   ├── run_knn.py
│   │   ├── run_perceptron.py
│   │   ├── run_mlp.py
│   │   └── run_naive_bayes.py
│   └── main.py                 # Script principal
├── results/
│   ├── figures/
│   └── tables/
├── notebooks/
│   └── exploratory_analysis.py # Análise sem pandas
├── slides/
│   └── apresentacao_av3.pptx
├── README.md
└── requirements.txt            # Apenas numpy, matplotlib
```

---

## 🔧 IMPLEMENTAÇÃO DOS ALGORITMOS (100% MANUAL)

### 1. K-Nearest Neighbors (KNN)

```python
class KNN:
    """
    Implementação manual do KNN
    - SEM uso de sklearn
    - Distâncias implementadas manualmente
    """
    
    def __init__(self, k=5, distance='euclidean'):
        self.k = k
        self.distance = distance
        
    def euclidean_distance(self, x1, x2):
        """Implementação manual da distância euclidiana"""
        return np.sqrt(np.sum((x1 - x2) ** 2))
    
    def manhattan_distance(self, x1, x2):
        """Implementação manual da distância Manhattan"""
        return np.sum(np.abs(x1 - x2))
```

**Tarefas KNN:**
- [ ] Implementar cálculo de distâncias (Euclidiana e Manhattan)
- [ ] Implementar busca dos k vizinhos mais próximos
- [ ] Implementar votação para classificação
- [ ] Testar com k = {3, 5, 7, 9, 11}

### 2. Perceptron

```python
class Perceptron:
    """
    Implementação manual do Perceptron
    - Treinamento por múltiplas épocas
    - Taxa de aprendizado configurável
    """
    
    def __init__(self, learning_rate=0.01, n_epochs=100):
        self.lr = learning_rate
        self.n_epochs = n_epochs
        
    def activation(self, x):
        """Função degrau"""
        return 1 if x >= 0 else 0
```

**Tarefas Perceptron:**
- [ ] Implementar inicialização de pesos
- [ ] Implementar forward pass
- [ ] Implementar atualização de pesos
- [ ] Implementar treinamento por épocas

### 3. Multi-Layer Perceptron (MLP)

```python
class MLP:
    """
    Rede neural com pelo menos 1 camada oculta
    - Backpropagation implementado manualmente
    - Sem uso de frameworks
    """
    
    def __init__(self, input_size, hidden_size, output_size):
        self.W1 = np.random.randn(input_size, hidden_size) * 0.01
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * 0.01
        self.b2 = np.zeros((1, output_size))
```

**Tarefas MLP:**
- [ ] Implementar forward propagation
- [ ] Implementar funções de ativação (sigmoid/ReLU)
- [ ] Implementar backpropagation
- [ ] Implementar gradiente descendente

### 4. Naive Bayes

```python
class NaiveBayes:
    """
    Implementação manual do Naive Bayes
    - Versão univariada
    - Versão multivariada
    """
    
    def __init__(self, variant='gaussian'):
        self.variant = variant
        
    def gaussian_pdf(self, x, mean, std):
        """Função densidade de probabilidade Gaussiana"""
        exponent = np.exp(-((x - mean) ** 2) / (2 * std ** 2))
        return (1 / (np.sqrt(2 * np.pi) * std)) * exponent
```

**Tarefas Naive Bayes:**
- [ ] Implementar cálculo de probabilidades a priori
- [ ] Implementar likelihood para variáveis contínuas
- [ ] Implementar versão univariada
- [ ] Implementar versão multivariada

---

## 📈 MÉTRICAS DE AVALIAÇÃO (Implementadas Manualmente)

```python
def accuracy(y_true, y_pred):
    """Acurácia implementada manualmente"""
    correct = sum(1 for i in range(len(y_true)) if y_true[i] == y_pred[i])
    return correct / len(y_true)

def precision_score(y_true, y_pred):
    """Precisão implementada manualmente"""
    # Implementar cálculo de TP, FP
    pass

def f1_score(y_true, y_pred):
    """F1-Score implementado manualmente"""
    # Implementar usando precision e recall
    pass
```

---

## 🔄 VALIDAÇÃO CRUZADA (Manual)

```python
def k_fold_cross_validation(X, y, k=5):
    """
    Implementação manual de k-fold cross-validation
    SEM uso de sklearn
    """
    n_samples = len(X)
    fold_size = n_samples // k
    indices = list(range(n_samples))
    
    for i in range(k):
        # Separar manualmente treino e validação
        val_start = i * fold_size
        val_end = val_start + fold_size
        # ... implementação completa
```

---

## 📅 CRONOGRAMA DE DESENVOLVIMENTO

### Semana 1: 20-24 de Novembro

#### Dia 1 (20/11) - Setup e Carregamento
- [ ] Baixar dataset do OpenML (usando requests ou urllib)
- [ ] Implementar leitor CSV manual (sem pandas)
- [ ] Converter dados para numpy arrays
- [ ] Verificar dimensões e tipos de dados

#### Dia 2 (21/11) - Análise e Pré-processamento
- [ ] Estatísticas básicas (média, desvio padrão) - manual
- [ ] Identificar missing values
- [ ] Normalização manual (min-max ou z-score)
- [ ] Separação treino/validação/teste (60/20/20)

#### Dia 3 (22/11) - Implementação KNN
- [ ] Classe KNN completa
- [ ] Distâncias Euclidiana e Manhattan
- [ ] Teste com diferentes valores de k
- [ ] Medição de tempo de execução

#### Dia 4 (23/11) - Implementação Perceptron e MLP
- [ ] Perceptron com múltiplas épocas
- [ ] MLP com backpropagation
- [ ] Teste de diferentes arquiteturas

#### Dia 5 (24/11) - Naive Bayes e Validação Cruzada
- [ ] Implementar Naive Bayes (univariado e multivariado)
- [ ] Implementar k-fold cross-validation manual
- [ ] Aplicar em todos os modelos

### Semana 2: 25-26 de Novembro

#### Dia 6 (25/11) - Resultados e Slides
- [ ] Calcular todas as métricas
- [ ] Gerar tabela comparativa (formato do PDF)
- [ ] Criar gráficos de desempenho
- [ ] **ENTREGAR SLIDES até 23:59**

#### Dia 7 (26/11) - Apresentação
- [ ] Revisão final do código
- [ ] **APRESENTAÇÃO**

---

## 📊 TABELA DE RESULTADOS (Modelo do PDF)

| Classificador | Acurácia | Precisão | F1-Score | Tempo Treino (s) | Tempo Teste (s) |
|--------------|----------|----------|----------|------------------|-----------------|
| K-vizinhos (Dist. Euclidiana) | 0.XX ± 0.XX | 0.XX ± 0.XX | 0.XX ± 0.XX | X.XX ± X.XX | X.XX ± X.XX |
| K-vizinhos (Dist. Manhattan) | 0.XX ± 0.XX | 0.XX ± 0.XX | 0.XX ± 0.XX | X.XX ± X.XX | X.XX ± X.XX |
| Perceptron | 0.XX ± 0.XX | 0.XX ± 0.XX | 0.XX ± 0.XX | X.XX ± X.XX | X.XX ± X.XX |
| MLP | 0.XX ± 0.XX | 0.XX ± 0.XX | 0.XX ± 0.XX | X.XX ± X.XX | X.XX ± X.XX |
| Bayesiano (Univariado) | 0.XX ± 0.XX | 0.XX ± 0.XX | 0.XX ± 0.XX | X.XX ± X.XX | X.XX ± X.XX |
| Bayesiano (Multivariado) | 0.XX ± 0.XX | 0.XX ± 0.XX | 0.XX ± 0.XX | X.XX ± X.XX | X.XX ± X.XX |

---

## 🎯 ESTRUTURA DOS SLIDES

### Slides Obrigatórios:
1. **Capa**: Título, Nome, Data
2. **Introdução**: Dataset escolhido e justificativa
3. **Banco de Dados**: 
   - Descrição das features
   - Estatísticas básicas
   - Relação com eficiência energética
4. **Algoritmos**:
   - Explicação de cada algoritmo
   - Trechos de código principais
5. **Métricas de Avaliação**:
   - Explicação de Accuracy, Precision, F1-Score
6. **Resultados**:
   - Tabela comparativa
   - Gráficos de desempenho
7. **Análise Comparativa**:
   - Comparação das métricas
   - Tempos de treino e teste
   - Relação desempenho/eficiência
8. **Conclusões**:
   - Melhor classificador
   - Pontos fortes e limitações

---

## 🚀 CÓDIGO INICIAL PARA COMEÇAR

### data_loader.py (SEM PANDAS!)
```python
import csv
import numpy as np

def load_csv_manual(filepath):
    """
    Carrega CSV sem usar pandas
    """
    data = []
    with open(filepath, 'r') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader)
        for row in csv_reader:
            data.append([float(val) for val in row])
    return np.array(data), header

def train_test_split_manual(X, y, test_size=0.2, random_seed=42):
    """
    Split manual sem sklearn
    """
    np.random.seed(random_seed)
    n_samples = len(X)
    n_test = int(n_samples * test_size)
    
    indices = np.random.permutation(n_samples)
    test_indices = indices[:n_test]
    train_indices = indices[n_test:]
    
    return X[train_indices], X[test_indices], y[train_indices], y[test_indices]
```

---

## ⚠️ CHECKLIST FINAL

### Antes da Entrega:
- [ ] **SEM pandas** em nenhum lugar do código
- [ ] **SEM scikit-learn** em nenhum lugar do código
- [ ] Todos os algoritmos implementados manualmente
- [ ] Validação cruzada implementada manualmente
- [ ] Métricas implementadas manualmente
- [ ] Código comentado e organizado
- [ ] Tabela de resultados com média ± desvio padrão
- [ ] Tempos de execução medidos

### Verificação de Plágio:
- [ ] Código original (não copiado da internet)
- [ ] Sem uso de ChatGPT/Copilot para gerar algoritmos completos
- [ ] Implementações próprias documentadas

---

## 📝 NOTAS IMPORTANTES

1. **Pontualidade**: Atraso = penalização
2. **Código obrigatório**: Sem código = nota zero
3. **Apresentação**: Se não apresentar, agendar avaliação individual
4. **Originalidade**: Será verificado plágio e uso de IA

---

## 🔗 LINKS ÚTEIS

- Dataset: https://www.openml.org/d/46283
- Formulário de escolha: https://forms.gle/X5hF8WUqpFBdXSXx9
- OpenML API (para download): https://docs.openml.org/

---

## 💡 DICAS DE IMPLEMENTAÇÃO

1. **Começar simples**: Primeiro fazer funcionar, depois otimizar
2. **Testar incrementalmente**: Testar cada função individualmente
3. **Documentar bem**: Comentários explicando a lógica
4. **Versionar código**: Usar git desde o início
5. **Medir tempos**: Usar time.time() para cronometrar

---

*Documento criado para exportação ao VS Code - Projeto IA AV3*
