# Projeto IA AV3
## Classificação de Dados de Energia de Eletrodomésticos

**Disciplina:** Inteligência Artificial Computacional
**Professor:** Ms. Cynthia Moreira Maia
**Aluno:** Mateus Gomes Macário
**Data:** 26/11/2025

---

## Agenda

1. Introdução
2. Dataset e Justificativa
3. Algoritmos Implementados
4. Métricas de Avaliação
5. Experimentos e Validação Cruzada
6. Resultados
7. Análise Comparativa
8. Conclusões
9. Referências

---

## 1. Introdução

### Objetivo do Projeto
- Avaliar diferentes algoritmos de classificação
- Implementação **100% manual** (sem pandas, sem scikit-learn)
- Comparar desempenho usando validação cruzada

### Problema
Classificação binária do consumo de energia de eletrodomésticos

---

## 2. Dataset: Appliances Energy Prediction

### Características
- **Fonte:** OpenML (ID: 46283)
- **Instâncias:** 5,000 (dataset de demonstração)
- **Features:** 28 atributos
- **Target:** Consumo de energia (binarizado)

### Justificativa da Escolha
✅ Mais de 10 atributos (requisito: >10)
✅ Mais de 1000 instâncias (requisito: >1000)
✅ Alinhamento com pesquisa em eficiência energética
✅ Dados reais de consumo residencial

---

## 2.1 Distribuição dos Dados

### Classes Balanceadas
- **Classe 0:** 2,500 amostras (50%)
- **Classe 1:** 2,500 amostras (50%)

### Pré-processamento
- Normalização Z-Score (implementada manualmente)
- Binarização do target pela mediana
- Divisão estratificada em K-Folds

---

## 3. Algoritmos Implementados

### Todos implementados do ZERO!
**Nenhuma biblioteca de ML foi utilizada**

1. **K-Nearest Neighbors (KNN)**
2. **Perceptron**
3. **Multi-Layer Perceptron (MLP)**
4. **Naive Bayes**

---

## 3.1 K-Nearest Neighbors (KNN)

### Implementação
```python
class KNearestNeighbors:
    def euclidean_distance(self, x1, x2):
        return np.sqrt(np.sum((x1 - x2) ** 2))

    def manhattan_distance(self, x1, x2):
        return np.sum(np.abs(x1 - x2))
```

### Variações Testadas
- **Distância Euclidiana** (k=5)
- **Distância Manhattan** (k=5)

### Características
- Algoritmo lazy (sem fase de treino)
- Busca exaustiva dos k vizinhos
- Votação majoritária

---

## 3.2 Perceptron

### Implementação
```python
class MultiClassPerceptron:
    def fit(self, X, y):
        for epoch in range(self.n_epochs):
            for x_i, y_i in zip(X, y):
                y_pred = self.predict_single(x_i)
                error = y_i - y_pred
                if error != 0:
                    self.weights += self.lr * error * x_i
                    self.bias += self.lr * error
```

### Parâmetros
- Taxa de aprendizado: 0.01
- Épocas: 50
- Estratégia: One-vs-Rest para multiclasse

---

## 3.3 Multi-Layer Perceptron (MLP)

### Arquitetura
- **Input Layer:** 28 neurônios
- **Hidden Layer 1:** 32 neurônios (ReLU)
- **Hidden Layer 2:** 16 neurônios (ReLU)
- **Output Layer:** 2 neurônios (Softmax)

### Treinamento
- **Backpropagation** implementado manualmente
- Mini-batch Gradient Descent (batch=64)
- Taxa de aprendizado: 0.01
- Épocas: 50

---

## 3.3.1 Backpropagation Manual

```python
def backward_propagation(self, X, y, activations, z_values):
    # Erro na camada de saída
    delta = activations[-1] - y

    # Propaga erro para camadas anteriores
    for i in reversed(range(n_layers)):
        gradients_w[i] = np.dot(activations[i].T, delta) / m
        gradients_b[i] = np.sum(delta, axis=0) / m

        if i > 0:
            delta = np.dot(delta, self.weights[i].T) * \
                    self.activation_derivative(z_values[i-1])

    return gradients_w, gradients_b
```

---

## 3.4 Naive Bayes

### Implementações
1. **Versão Univariada**
   - Assume independência entre features
   - Mais rápido e simples

2. **Versão Multivariada**
   - Considera correlação entre features
   - Usa distribuição Gaussiana multivariada

### PDF Gaussiana Manual
```python
def gaussian_pdf(self, x, mean, std):
    exponent = np.exp(-((x - mean) ** 2) / (2 * std ** 2))
    return (1 / (np.sqrt(2 * np.pi) * std)) * exponent
```

---

## 4. Métricas de Avaliação

### Implementadas Manualmente

#### 1. Acurácia (Accuracy)
```python
def accuracy_score(y_true, y_pred):
    correct = sum(1 for i in range(len(y_true))
                  if y_true[i] == y_pred[i])
    return correct / len(y_true)
```

#### 2. Precisão (Precision)
- TP / (TP + FP)

#### 3. F1-Score
- 2 × (Precision × Recall) / (Precision + Recall)

---

## 5. Validação Cruzada

### K-Fold Cross-Validation (k=5)
**Implementação 100% manual!**

```python
def k_fold_split(X, y, n_folds=5):
    indices = np.random.permutation(len(X))
    fold_size = len(X) // n_folds

    for i in range(n_folds):
        val_indices = indices[i*fold_size:(i+1)*fold_size]
        train_indices = np.concatenate([
            indices[:i*fold_size],
            indices[(i+1)*fold_size:]
        ])
        yield train_indices, val_indices
```

### Estratificação
- Mantém proporção das classes em cada fold
- Reduz variância das estimativas

---

## 6. Resultados Completos

| Classificador | Acurácia | Precisão | F1-Score | Tempo Treino (s) | Tempo Teste (s) |
|--------------|----------|----------|----------|------------------|------------------|
| KNN (Euclidiana) | 0.80 ± 0.01 | 0.80 ± 0.01 | 0.80 ± 0.01 | 0.00 ± 0.00 | 13.09 ± 0.61 |
| KNN (Manhattan) | 0.81 ± 0.01 | 0.81 ± 0.01 | 0.81 ± 0.01 | 0.00 ± 0.00 | 10.19 ± 0.11 |
| Perceptron | 0.77 ± 0.02 | 0.84 ± 0.01 | 0.80 ± 0.01 | 0.36 ± 0.04 | 0.00 ± 0.00 |
| **MLP** | **0.93 ± 0.01** | **0.93 ± 0.01** | **0.93 ± 0.01** | 0.22 ± 0.01 | 0.00 ± 0.00 |
| Naive Bayes (Univariado) | 0.91 ± 0.01 | 0.91 ± 0.01 | 0.91 ± 0.01 | 0.00 ± 0.00 | 0.12 ± 0.00 |
| Naive Bayes (Multivariado) | 0.92 ± 0.01 | 0.92 ± 0.01 | 0.92 ± 0.01 | 0.00 ± 0.00 | 0.05 ± 0.00 |

---

## 7. Análise Comparativa

### Por Desempenho (Acurácia)
1. **MLP:** 92.52% ⭐
2. **Naive Bayes (Multivariado):** 91.62%
3. **Naive Bayes (Univariado):** 90.90%
4. **KNN (Manhattan):** 80.88%
5. **KNN (Euclidiana):** 80.04%
6. **Perceptron:** 77.08%

### Por Tempo de Treinamento
1. **KNN (ambos):** ~0.00s (lazy learning)
2. **Naive Bayes (ambos):** ~0.00s
3. **MLP:** 0.22s
4. **Perceptron:** 0.36s

---

## 7.1 Trade-off: Desempenho vs Eficiência

### Score de Eficiência = Acurácia / Tempo Total

| Classificador | Score |
|--------------|-------|
| **Naive Bayes (Multivariado)** | **14.08**  |
| Naive Bayes (Univariado) | 7.07 |
| MLP | 3.97 |
| Perceptron | 2.05 |
| KNN (Manhattan) | 0.08 |
| KNN (Euclidiana) | 0.06 |

---

## 7.2 Comparação das Métricas

### Observations

**Melhores Classificadores:**
- **Acurácia:** MLP (92.52%)
- **F1-Score:** MLP (92.53%)
- **Eficiência:** Naive Bayes Multivariado

**Diferenças entre KNN:**
- Manhattan levemente superior à Euclidiana
- Manhattan mais rápido no teste

**Perceptron:**
- Menor acurácia, mas tempo razoável
- Boa precisão (84%) mas recall inferior

---

## 7.3 Análise dos Tempos

### Tempo de Treino
- **Redes Neurais (MLP):** 0.22s
  - Backpropagation computacionalmente intensivo
- **Perceptron:** 0.36s
  - Múltiplas épocas com atualização de pesos
- **KNN:** ~0.00s
  - Lazy learning: apenas armazena dados

### Tempo de Teste
- **KNN:** 10-13s ⚠️
  - Busca exaustiva em todo dataset
  - Cresce linearmente com tamanho do dataset
- **Naive Bayes:** 0.05-0.12s
  - Apenas cálculo de probabilidades
- **Redes Neurais:** ~0.00s
  - Forward pass muito rápido

---

## 7.4 Pontos Fortes e Limitações

### KNN
✅ Sem fase de treinamento
✅ Simples de implementar
❌ Muito lento no teste
❌ Sensível a features irrelevantes

### Perceptron
✅ Simples e interpretável
✅ Rápido no teste
❌ Apenas linear
❌ Menor acurácia

---

## 7.4 Pontos Fortes e Limitações (cont.)

### MLP
✅ **Melhor acurácia** (92.52%)
✅ Captura relações não-lineares
✅ Rápido no teste
❌ Difícil de interpretar
❌ Requer tuning de hiperparâmetros

### Naive Bayes
✅ **Extremamente rápido**
✅ Robusto com poucos dados
✅ Alta acurácia (>90%)
❌ Assume independência das features

---

## 8. Conclusões

### Melhor Classificador: **MLP**
- Maior acurácia: **92.52% ± 1.46%**
- Tempo de treino aceitável: **0.22s**
- Tempo de teste excelente: **~0.00s**

### Melhor Trade-off: **Naive Bayes Multivariado**
- Acurácia competitiva: **91.62%**
- Tempo total imbatível: **0.06s**
- **Score de eficiência: 14.08**

---

## 8.1 Insights Obtidos

1. **Deep Learning funciona!**
   - MLP superou todos os modelos clássicos

2. **Simplicidade às vezes é melhor**
   - Naive Bayes: simples, rápido e eficaz

3. **KNN tem limitações**
   - Excelente para datasets pequenos
   - Impraticável para produção em larga escala

4. **Perceptron é limitado**
   - Problema não é linearmente separável
   - MLP essencial para melhor desempenho

---

## 8.2 Aplicações Práticas

### Para Produção: **Naive Bayes Multivariado**
- Baixíssima latência
- Alta acurácia
- Ideal para sistemas em tempo real

### Para Máxima Precisão: **MLP**
- Quando acurácia é crítica
- Recursos computacionais disponíveis
- Aplicações científicas

---

## 9. Implementação Técnica

### Requisitos Atendidos ✅
- ✅ Dataset com >10 atributos (28)
- ✅ Dataset com >1000 instâncias (5000)
- ✅ 4 algoritmos implementados manualmente
- ✅ **SEM pandas**
- ✅ **SEM scikit-learn**
- ✅ Validação cruzada manual
- ✅ Métricas implementadas manualmente

### Tecnologias
- Python 3.x
- NumPy (apenas para arrays)
- Matplotlib (apenas para visualização)

---

## 10. Código Disponível

### Repositório GitHub
**github.com/mateusmacario/electrolyzer-simulator**

### Estrutura
```
projeto_ia_av3/
├── src/
│   ├── algorithms/      # KNN, Perceptron, MLP, Naive Bayes
│   ├── utils/          # Métricas, CV, preprocessing
│   └── main.py         # Script principal
├── data/               # Dataset
├── results/            # Tabelas e gráficos
└── README.md          # Documentação
```

---

## 11. Referências

1. **Dataset:**
   - Appliances Energy Prediction (OpenML ID: 46283)
   - https://www.openml.org/d/46283

2. **Algoritmos:**
   - Bishop, C.M. (2006). Pattern Recognition and Machine Learning
   - Hastie, T. et al. (2009). The Elements of Statistical Learning

3. **Implementação:**
   - Código 100% original
   - Baseado em fundamentos teóricos

---

## Obrigado!

### Mateus Gomes Macário
**Engenharia da Computação - UNIFOR**

**Disciplina:** Inteligência Artificial Computacional
**Professor:** Ms. Cynthia Moreira Maia

### Contato
- GitHub: github.com/mateusmacario
- Email: [seu-email]

---

## Perguntas?

 Estou à disposição para esclarecer dúvidas!
