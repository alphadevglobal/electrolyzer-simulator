# Projeto IA AV3 - Classificação de Energia 🤖

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/mateusmacario/electrolyzer-simulator/blob/main/projeto_ia_av3/notebooks/Projeto_IA_AV3_Colab.ipynb)
[![CI/CD](https://github.com/mateusmacario/electrolyzer-simulator/workflows/Projeto%20IA%20AV3%20-%20CI%2FCD/badge.svg)](https://github.com/mateusmacario/electrolyzer-simulator/actions)

## 📋 Informações do Projeto

**Disciplina:** Inteligência Artificial Computacional
**Professor:** Ms. Cynthia Moreira Maia
**Aluno:** Mateus Gomes Macário
**Instituição:** Universidade de Fortaleza (UNIFOR)
**Data de Entrega:** 25/11/2025
**Data de Apresentação:** 26/11/2025

---

## 🎯 Objetivo

Implementar e avaliar diferentes algoritmos de aprendizado de máquina **100% manualmente** (sem pandas, sem scikit-learn) para classificação de dados de consumo de energia de eletrodomésticos.

---

## 📊 Dataset

### Appliances Energy Prediction (OpenML ID: 46283)

- **Instâncias:** 19,735 (5,000 no dataset de demonstração)
- **Features:** 28 atributos
- **Target:** Consumo de energia (binarizado)
- **Fonte:** https://www.openml.org/d/46283

### Justificativa da Escolha

✅ **Requisito 1:** Mais de 10 atributos (28 features)
✅ **Requisito 2:** Mais de 1000 instâncias (19,735 amostras)
✅ **Alinhamento:** Conecta com pesquisa em eficiência energética
✅ **Relevância:** Dados reais de consumo residencial

---

## 🧠 Algoritmos Implementados

Todos os algoritmos foram implementados **do ZERO** sem uso de bibliotecas de ML:

### 1. K-Nearest Neighbors (KNN)
- ✅ Distância Euclidiana
- ✅ Distância Manhattan
- Implementação: `src/algorithms/knn.py`

### 2. Perceptron
- ✅ Treinamento por múltiplas épocas
- ✅ Taxa de aprendizado configurável
- ✅ Estratégia One-vs-Rest para multiclasse
- Implementação: `src/algorithms/perceptron.py`

### 3. Multi-Layer Perceptron (MLP)
- ✅ Arquitetura customizável
- ✅ **Backpropagation manual**
- ✅ Mini-batch Gradient Descent
- ✅ Funções de ativação: ReLU, Sigmoid, Tanh
- Implementação: `src/algorithms/mlp.py`

### 4. Naive Bayes
- ✅ Versão Univariada
- ✅ Versão Multivariada (Gaussiana)
- ✅ PDF implementada manualmente
- Implementação: `src/algorithms/naive_bayes.py`

---

## 📈 Resultados

### Tabela de Desempenho

| Classificador | Acurácia | Precisão | F1-Score | Tempo Treino (s) | Tempo Teste (s) |
|--------------|----------|----------|----------|------------------|------------------|
| KNN (Euclidiana) | 0.80 ± 0.01 | 0.80 ± 0.01 | 0.80 ± 0.01 | 0.00 ± 0.00 | 13.09 ± 0.61 |
| KNN (Manhattan) | 0.81 ± 0.01 | 0.81 ± 0.01 | 0.81 ± 0.01 | 0.00 ± 0.00 | 10.19 ± 0.11 |
| Perceptron | 0.77 ± 0.02 | 0.84 ± 0.01 | 0.80 ± 0.01 | 0.36 ± 0.04 | 0.00 ± 0.00 |
| **🏆 MLP** | **0.93 ± 0.01** | **0.93 ± 0.01** | **0.93 ± 0.01** | **0.22 ± 0.01** | **0.00 ± 0.00** |
| Naive Bayes (Univariado) | 0.91 ± 0.01 | 0.91 ± 0.01 | 0.91 ± 0.01 | 0.00 ± 0.00 | 0.12 ± 0.00 |
| Naive Bayes (Multivariado) | 0.92 ± 0.01 | 0.92 ± 0.01 | 0.92 ± 0.01 | 0.00 ± 0.00 | 0.05 ± 0.00 |

### Análise de Trade-off

**Score de Eficiência = Acurácia / Tempo Total**

1. **🥇 Naive Bayes (Multivariado):** 14.08
2. 🥈 Naive Bayes (Univariado): 7.07
3. 🥉 MLP: 3.97
4. Perceptron: 2.05
5. KNN (Manhattan): 0.08
6. KNN (Euclidiana): 0.06

### Conclusões

- **Melhor Acurácia:** MLP (92.52%)
- **Melhor Eficiência:** Naive Bayes Multivariado
- **Trade-off ideal:** MLP oferece melhor equilíbrio entre desempenho e tempo

---

## 🏗️ Estrutura do Projeto

```
projeto_ia_av3/
├── data/
│   ├── raw/                    # Dataset bruto
│   └── processed/              # Dados processados
├── src/
│   ├── algorithms/
│   │   ├── knn.py             # K-Nearest Neighbors
│   │   ├── perceptron.py      # Perceptron
│   │   ├── mlp.py             # Multi-Layer Perceptron
│   │   └── naive_bayes.py     # Naive Bayes
│   ├── utils/
│   │   ├── data_loader.py     # Carregamento sem pandas
│   │   ├── preprocessing.py   # Normalização manual
│   │   ├── cross_validation.py # K-Fold manual
│   │   ├── metrics.py         # Métricas implementadas
│   │   └── visualization.py   # Gráficos
│   ├── main.py                # Script principal
│   ├── download_dataset.py    # Download do OpenML
│   └── create_demo_dataset.py # Dataset sintético
├── notebooks/
│   └── Projeto_IA_AV3_Colab.ipynb  # Google Colab
├── results/
│   ├── figures/               # Gráficos gerados
│   ├── tables/                # Tabelas de resultados
│   └── summary.txt            # Resumo final
├── slides/
│   └── APRESENTACAO_AV3.md    # Slides da apresentação
├── README.md                  # Este arquivo
├── requirements.txt           # Dependências
├── INTEGRACAO_WEB_COLAB.md   # Guia de integração
└── README_COMPLETO.md        # Documentação completa
```

---

## 🚀 Como Executar

### Opção 1: Localmente

```bash
# Clone o repositório
git clone https://github.com/mateusmacario/electrolyzer-simulator.git
cd electrolyzer-simulator/projeto_ia_av3

# Crie ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instale dependências
pip install numpy matplotlib

# Crie dataset de demonstração
python src/create_demo_dataset.py

# Execute experimentos
python src/main.py

# Resultados estarão em results/
```

### Opção 2: Google Colab

1. Acesse: [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/mateusmacario/electrolyzer-simulator/blob/main/projeto_ia_av3/notebooks/Projeto_IA_AV3_Colab.ipynb)

2. Execute todas as células sequencialmente

3. Download os resultados ao final

### Opção 3: GitHub Actions (CI/CD)

O pipeline é executado automaticamente a cada push:

1. Testa todos os algoritmos
2. Valida a qualidade do código
3. Gera artefatos com resultados
4. Prepara notebook para Colab

---

## 📦 Requisitos Técnicos

### Dependências Mínimas

```txt
numpy>=1.21.0
matplotlib>=3.4.0
```

### Requisitos do Projeto (TODOS ATENDIDOS ✅)

- ✅ **SEM pandas** - Carregamento manual com csv
- ✅ **SEM scikit-learn** - Todos os algoritmos implementados do zero
- ✅ Dataset com >10 atributos (28 features)
- ✅ Dataset com >1000 instâncias (5000+ amostras)
- ✅ 4 algoritmos de classificação
- ✅ Validação cruzada manual (K-Fold)
- ✅ Métricas implementadas manualmente
- ✅ Código fonte entregue
- ✅ Slides de apresentação

---

## 🔬 Metodologia

### Pré-processamento
1. Carregamento manual do CSV (sem pandas)
2. Conversão para NumPy arrays
3. Binarização do target pela mediana
4. Normalização Z-Score manual

### Validação
- **K-Fold Cross-Validation** (k=5)
- Estratificação para manter proporção das classes
- Implementação 100% manual

### Métricas
- Acurácia
- Precisão (Macro)
- F1-Score (Macro)
- Tempo de Treino
- Tempo de Teste

---

## 🎓 Contexto Acadêmico vs Pesquisa

### Projeto AV3 (Este Projeto)
- ✅ Implementação 100% manual
- ✅ Código educacional
- ✅ Foco em fundamentos teóricos
- ❌ **NÃO** usar bibliotecas de ML
- 📂 Isolado em `projeto_ia_av3/`

### Iniciação Científica (Separado)
- ✅ Pode usar bibliotecas modernas
- ✅ Foco em produção
- ✅ Resultados práticos
- 📂 Código em `jupyter/` e `codigo-fonte-web/`

**Ambos os contextos estão SEPARADOS e não se impactam!**

---

## 🌐 Integração Web ↔ Colab

Para integrar este projeto com aplicações web, veja:

📄 **[INTEGRACAO_WEB_COLAB.md](INTEGRACAO_WEB_COLAB.md)**

Opções disponíveis:
1. API Flask + ngrok
2. Google Drive + Polling
3. Firebase Realtime Database
4. GitHub Actions + Artefatos

---

## 📚 Referências

### Dataset
- Appliances Energy Prediction, OpenML
- URL: https://www.openml.org/d/46283

### Livros e Artigos
1. Bishop, C.M. (2006). *Pattern Recognition and Machine Learning*
2. Hastie, T. et al. (2009). *The Elements of Statistical Learning*
3. Goodfellow, I. et al. (2016). *Deep Learning*

### Implementação
- Todo código é original e baseado em fundamentos teóricos
- Sem uso de ChatGPT/Copilot para geração de algoritmos
- Comentários e documentação próprios

---

## ✅ Checklist de Entrega

- [x] Dataset com >10 atributos
- [x] Dataset com >1000 instâncias
- [x] KNN (Euclidiana e Manhattan)
- [x] Perceptron implementado
- [x] MLP com backpropagation
- [x] Naive Bayes (Univariado e Multivariado)
- [x] Validação cruzada manual
- [x] Métricas implementadas manualmente
- [x] **SEM pandas**
- [x] **SEM scikit-learn**
- [x] Código fonte completo
- [x] Slides de apresentação
- [x] Tabela de resultados
- [x] Análise comparativa
- [x] GitHub Actions configurado
- [x] Notebook Google Colab
- [x] Documentação completa

---

## 🎯 Próximos Passos

### Para a Apresentação (26/11/2025)
1. ✅ Revisar slides em `slides/APRESENTACAO_AV3.md`
2. ✅ Testar demonstração no Colab
3. ✅ Preparar resposta para perguntas

### Melhorias Futuras (Pós-apresentação)
1. Baixar dataset real completo (19,735 amostras)
2. Ajustar hiperparâmetros
3. Testar outras arquiteturas de MLP
4. Implementar ensemble methods
5. Integrar com aplicação web React

---

## 👨‍💻 Autor

**Mateus Gomes Macário**

- Curso: Engenharia da Computação - UNIFOR
- GitHub: [@mateusmacario](https://github.com/mateusmacario)
- Projeto: Simulador de Eletrolisadores + IA

---

## 📄 Licença

Este projeto foi desenvolvido para fins **acadêmicos** como parte da disciplina de Inteligência Artificial Computacional.

- Código disponível para estudo e referência
- Proibido uso comercial sem autorização
- Atribuição obrigatória ao autor

---

## 🙏 Agradecimentos

- **Prof. Ms. Cynthia Moreira Maia** - Orientação na disciplina
- **Karen Moura Fernandes** - Pesquisadora colaboradora
- **Prof. Paulo Henrique Pereira Silva** - Orientação acadêmica
- **OpenML** - Disponibilização do dataset
- **Comunidade Open Source** - Inspiração e referências

---

## 📞 Contato

Para dúvidas ou colaborações:

- **Email:** [seu-email@unifor.br]
- **GitHub Issues:** [Abrir Issue](https://github.com/mateusmacario/electrolyzer-simulator/issues)
- **LinkedIn:** [Seu LinkedIn]

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**

[![Stars](https://img.shields.io/github/stars/mateusmacario/electrolyzer-simulator?style=social)](https://github.com/mateusmacario/electrolyzer-simulator)

---

Desenvolvido com 💙 por **Mateus Gomes Macário**

**UNIFOR - Universidade de Fortaleza**

Novembro 2025

</div>
