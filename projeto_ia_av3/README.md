# Projeto IA AV3 - Classificação de Energia de Eletrodomésticos

## Disciplina: Inteligência Artificial Computacional
**Professor**: Ms. Cynthia Moreira Maia
**Aluno**: Mateus Macário
**Data**: Novembro 2025

## Dataset
- **Nome**: Appliances Energy Prediction
- **OpenML ID**: 46283
- **Instâncias**: 19,735
- **Atributos**: 28 features
- **Fonte**: https://www.openml.org/d/46283

## Algoritmos Implementados (100% Manual)
1. **K-Nearest Neighbors (KNN)**
   - Distância Euclidiana
   - Distância Manhattan

2. **Perceptron**
   - Treinamento por múltiplas épocas

3. **Multi-Layer Perceptron (MLP)**
   - Rede neural com 1+ camadas ocultas
   - Backpropagation manual

4. **Naive Bayes**
   - Versão Univariada
   - Versão Multivariada

## Métricas de Avaliação
- Acurácia (Accuracy)
- F1-Score
- Precisão
- Tempo de Treino
- Tempo de Teste

## Estrutura do Projeto
```
projeto_ia_av3/
├── data/                    # Dados do projeto
│   ├── raw/                # Dataset bruto
│   └── processed/          # Dados processados
├── src/                    # Código fonte
│   ├── algorithms/         # Implementações dos algoritmos
│   ├── utils/             # Utilitários
│   ├── experiments/       # Scripts de experimentos
│   └── main.py           # Script principal
├── results/               # Resultados dos experimentos
│   ├── figures/          # Gráficos
│   └── tables/           # Tabelas
├── notebooks/            # Análises exploratórias
├── slides/              # Apresentação
└── README.md           # Este arquivo
```

## Requisitos
- Python 3.8+
- numpy
- matplotlib

## Importante
- **SEM pandas** - Todo carregamento manual
- **SEM scikit-learn** - Todos algoritmos implementados do zero
- Validação cruzada implementada manualmente
- Código 100% original

## Como Executar
```bash
cd projeto_ia_av3
python src/main.py
```

## Autor
Mateus Gomes Macário
Engenharia da Computação - UNIFOR
