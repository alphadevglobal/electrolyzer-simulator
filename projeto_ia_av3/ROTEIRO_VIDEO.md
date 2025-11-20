# 🎬 ROTEIRO DE VÍDEO - PROJETO IA AV3

## 📋 Informações do Vídeo

**Duração Estimada:** 10-15 minutos
**Formato:** Apresentação com demonstração prática
**Recursos Necessários:**
- Apresentação PPTX aberta
- Google Colab aberto
- Terminal com código pronto
- Câmera/gravação de tela

---

## 🎯 ESTRUTURA DO VÍDEO

### Abertura (0:00 - 1:00)

**[SLIDE 1 - CAPA]**

**🎤 ROTEIRO:**
> Olá! Meu nome é Mateus Gomes Macário e vou apresentar o Projeto IA AV3 da disciplina de Inteligência Artificial Computacional, ministrada pela professora Cynthia Moreira Maia.
>
> Neste projeto, implementei e avaliei quatro algoritmos de aprendizado de máquina COMPLETAMENTE do zero, sem uso de bibliotecas como pandas ou scikit-learn.

**📹 DICAS DE GRAVAÇÃO:**
- Sorria e seja entusiasmado
- Mantenha contato visual com a câmera
- Fale pausadamente e claramente
- Mostre confiança no seu trabalho

**⏱️ Tempo:** 45 segundos

---

### Parte 1: Introdução e Objetivo (1:00 - 2:30)

**[SLIDE 2 - AGENDA]**

**🎤 ROTEIRO:**
> A apresentação está dividida em 8 partes principais:
> [Leia rapidamente os tópicos da agenda]
>
> Vamos começar pelos objetivos do projeto.

**[SLIDE 3 - INTRODUÇÃO]**

**🎤 ROTEIRO:**
> O objetivo principal foi avaliar diferentes algoritmos de classificação com um desafio especial: implementar TUDO manualmente!
>
> [ENFATIZE] Isso significa: SEM pandas para carregar dados, SEM scikit-learn para os algoritmos. Tudo foi programado do ZERO em Python puro, usando apenas NumPy para operações matemáticas básicas.
>
> O problema escolhido foi classificação de consumo de energia de eletrodomésticos, um tema que se alinha com minha pesquisa em eficiência energética.

**📹 DICAS:**
- Enfatize a palavra "MANUAL" e "DO ZERO"
- Use gestos de mão para reforçar pontos importantes
- Mantenha energia alta

**⏱️ Tempo:** 1min 30s

---

### Parte 2: Dataset (2:30 - 3:30)

**[SLIDE 4 - DATASET]**

**🎤 ROTEIRO:**
> O dataset escolhido foi o "Appliances Energy Prediction" disponível no OpenML.
>
> Ele possui 28 atributos - bem acima do requisito mínimo de 10 - e 5 mil instâncias de treino, muito além das 1000 exigidas.
>
> [MOSTRE NO SLIDE] O dataset contém medições de temperatura, umidade, e consumo de energia de uma residência real.

**[SLIDE 5 - DISTRIBUIÇÃO]**

**🎤 ROTEIRO:**
> Os dados foram divididos em duas classes balanceadas: baixo consumo e alto consumo, com 2500 amostras cada.
>
> Apliquei pré-processamento manual incluindo normalização Z-Score - sim, implementei a normalização do zero também! - e divisão estratificada para validação cruzada.

**📹 DICAS:**
- Aponte para os números relevantes no slide
- Mostre que entende bem os dados

**⏱️ Tempo:** 1 minuto

---

### Parte 3: Algoritmos Implementados (3:30 - 7:00)

**[SLIDE 6 - KNN]**

**🎤 ROTEIRO:**
> Vamos aos algoritmos! O primeiro foi o K-Nearest Neighbors, ou KNN.
>
> Implementei duas versões: uma com distância Euclidiana e outra com Manhattan. Tudo calculado manualmente, sem bibliotecas.
>
> [EXPLIQUE CONCEITO] O KNN funciona encontrando os k vizinhos mais próximos de um ponto e fazendo votação majoritária.

**⏱️ Tempo:** 45 segundos

**[SLIDE 7 - PERCEPTRON]**

**🎤 ROTEIRO:**
> O segundo algoritmo foi o Perceptron, o neurônio artificial mais simples.
>
> Configurei com taxa de aprendizado de 0.01 e 50 épocas de treinamento. Para problemas multiclasse, usei a estratégia One-vs-Rest.
>
> A regra de atualização dos pesos foi implementada seguindo a teoria clássica: w = w + learning rate vezes erro vezes x.

**⏱️ Tempo:** 40 segundos

**[SLIDE 8 - MLP]**

**🎤 ROTEIRO:**
> Aqui está o destaque: o Multi-Layer Perceptron!
>
> [ENFATIZE COM ENTUSIASMO] Implementei uma rede neural completa com BACKPROPAGATION DO ZERO!
>
> A arquitetura tem 28 neurônios na entrada, duas camadas ocultas com 32 e 16 neurônios usando ReLU, e saída com Softmax.
>
> O mais desafiador foi implementar o backpropagation manualmente - calcular os gradientes camada por camada, propagar o erro para trás, e atualizar os pesos. Mas funcionou!

**📹 DICAS:**
- Mostre orgulho nesta parte
- Gesticule ao explicar as camadas
- Seja entusiasmado - isso é impressionante!

**⏱️ Tempo:** 1 minuto

**[SLIDE 9 - NAIVE BAYES]**

**🎤 ROTEIRO:**
> Por fim, implementei o Naive Bayes em duas versões: univariada e multivariada.
>
> A diferença é que a versão multivariada considera a correlação entre as features usando a distribuição Gaussiana completa.
>
> Implementei manualmente o cálculo da função densidade de probabilidade - aquela famosa fórmula com exponencial e raiz de 2 pi!

**⏱️ Tempo:** 40 segundos

---

### Parte 4: Metodologia (7:00 - 8:00)

**[SLIDE 10 - VALIDAÇÃO CRUZADA]**

**🎤 ROTEIRO:**
> Para validar os modelos, implementei K-Fold Cross-Validation do zero.
>
> O processo divide os dados em 5 partes, treina com 4 e testa com 1, rodando 5 vezes.
>
> [IMPORTANTE] Também implementei manualmente a estratificação, que mantém a proporção das classes em cada fold.

**[SLIDE 11 - MÉTRICAS]**

**🎤 ROTEIRO:**
> Todas as métricas também foram implementadas do zero: acurácia, precisão, F1-Score, além de medir os tempos de treino e teste.
>
> Isso garantiu que eu realmente entendesse o que cada métrica significa e como calculá-las.

**⏱️ Tempo:** 1 minuto

---

### Parte 5: RESULTADOS - MOMENTO CHAVE! (8:00 - 10:00)

**[SLIDE 12 - TABELA DE RESULTADOS]**

**🎤 ROTEIRO:**
> E agora, o momento mais importante: os resultados!
>
> [PAUSE PARA EFEITO]
>
> [APONTE PARA MLP] O MLP alcançou incríveis 92.52% de acurácia! Isso mostra que a implementação manual do backpropagation funcionou perfeitamente.
>
> O Naive Bayes Multivariado ficou em segundo lugar com 91.62%, muito próximo.
>
> Os modelos KNN ficaram em torno de 80%, e o Perceptron em 77% - esperado, já que o problema não é linearmente separável.

**📹 DICAS:**
- Aponte para cada linha da tabela
- Enfatize o resultado do MLP com orgulho
- Use tom de voz variado para manter interesse

**[SLIDE 13 - RANKING]**

**🎤 ROTEIRO:**
> Aqui está o ranking completo de acurácia. Note que os métodos baseados em probabilidade (MLP e Naive Bayes) superaram os baseados em distância (KNN).

**[SLIDE 14 - TRADE-OFF]**

**🎤 ROTEIRO:**
> Mas acurácia não é tudo! Também preciso considerar o tempo de execução.
>
> Criei um "Score de Eficiência" que divide a acurácia pelo tempo total.
>
> [RESULTADO SURPREENDENTE] O grande vencedor aqui é o Naive Bayes Multivariado com score de 14.08!
>
> Ele combina excelente acurácia (91%) com tempo de execução ínfimo (0.06 segundos).
>
> Isso mostra que nem sempre o modelo mais preciso é o melhor para produção.

**⏱️ Tempo:** 2 minutos

---

### Parte 6: Análise e Conclusões (10:00 - 11:30)

**[SLIDE 15 - PONTOS FORTES]**

**🎤 ROTEIRO:**
> Cada algoritmo tem seus pontos fortes e limitações.
>
> O MLP tem a melhor acurácia mas é difícil de interpretar - é uma "caixa preta".
>
> O Naive Bayes é extremamente rápido e eficiente, mas assume independência entre features.
>
> O KNN, apesar de simples, se mostrou muito lento para teste - impraticável em produção.

**[SLIDE 16 - INSIGHTS]**

**🎤 ROTEIRO:**
> Os principais insights que tirei deste projeto:
>
> Primeiro: Deep Learning realmente funciona! O MLP superou todos os modelos clássicos.
>
> Segundo: Simplicidade pode ser melhor dependendo do contexto. O Naive Bayes é uma excelente escolha para sistemas em tempo real.
>
> Terceiro: Entendi na prática as limitações do KNN e do Perceptron linear.

**⏱️ Tempo:** 1min 30s

---

### Parte 7: Demonstração Prática (11:30 - 13:00)

**[SLIDE 20 - DEMONSTRAÇÃO]**

**🎤 ROTEIRO:**
> Agora vou mostrar o código funcionando!
>
> [MUDE PARA TELA DO TERMINAL]

**[DEMONSTRAÇÃO 1: Terminal]**

**🎤 ROTEIRO:**
> Aqui está o código rodando localmente.
>
> [EXECUTE] python src/main.py
>
> [ENQUANTO EXECUTA] Vejam que ele está carregando os dados SEM pandas, normalizando manualmente, e rodando a validação cruzada em cada modelo.
>
> [MOSTRE OUTPUT] Aqui estão os resultados sendo calculados fold por fold...

**[DEMONSTRAÇÃO 2: Google Colab]**

**🎤 ROTEIRO:**
> Também criei um notebook interativo no Google Colab onde qualquer pessoa pode executar os experimentos.
>
> [MOSTRE O NOTEBOOK ABERTO]
>
> Basta clicar no botão "Open in Colab" e executar as células sequencialmente.

**📹 DICAS:**
- Grave a tela do computador
- Mostre confiança ao navegar pelo código
- Não se preocupe se demorar um pouco - é normal

**⏱️ Tempo:** 1min 30s

---

### Parte 8: Extras e Conclusão (13:00 - 14:30)

**[SLIDE 18 - EXTRAS]**

**🎤 ROTEIRO:**
> Além de cumprir todos os requisitos, implementei vários extras:
>
> [LEIA ENTUSIASMADAMENTE]
> - GitHub Actions para CI/CD automático
> - Deploy em AWS Lambda usando Free Tier
> - Notebook completo no Google Colab
> - Documentação profissional
> - Integração entre web e Colab
>
> Tudo isso demonstra não só conhecimento teórico, mas também habilidades práticas de engenharia de software.

**[SLIDE 21 - CONCLUSÕES]**

**🎤 ROTEIRO:**
> Em conclusão:
>
> ✅ Implementei com sucesso quatro algoritmos complexos do zero
> ✅ O MLP alcançou 92% de acurácia com backpropagation manual
> ✅ A validação cruzada garantiu resultados confiáveis
> ✅ Todo o código é original e bem documentado
>
> [ENFATIZE] Este projeto demonstra domínio completo dos fundamentos de Machine Learning, desde a teoria até a implementação prática.

**⏱️ Tempo:** 1min

**[SLIDE 23 - AGRADECIMENTOS]**

**🎤 ROTEIRO:**
> Gostaria de agradecer à professora Cynthia pela excelente orientação na disciplina, aos colaboradores da minha pesquisa em eficiência energética, e à comunidade open source.

**⏱️ Tempo:** 20 segundos

---

### Encerramento (14:30 - 15:00)

**[SLIDE 24 - PERGUNTAS]**

**🎤 ROTEIRO:**
> E finalizo aqui! Estou à disposição para responder qualquer pergunta sobre o projeto.
>
> Todo o código está disponível no GitHub no repositório "electrolyzer-simulator" na pasta "projeto_ia_av3".
>
> Muito obrigado pela atenção!
>
> [SORRIA E ACENE]

**⏱️ Tempo:** 30 segundos

---

## 📹 CHECKLIST DE GRAVAÇÃO

### Antes de Gravar

- [ ] Testar câmera e microfone
- [ ] Configurar iluminação adequada
- [ ] Abrir apresentação PPTX
- [ ] Abrir Google Colab em outra aba
- [ ] Ter terminal pronto com código
- [ ] Fechar notificações do computador
- [ ] Limpar desktop (sem distrações)
- [ ] Testar gravação de áudio (5 segundos)
- [ ] Ter água por perto

### Durante a Gravação

- [ ] Respirar fundo antes de começar
- [ ] Sorrir e manter energia
- [ ] Falar pausadamente
- [ ] Fazer pausas entre slides
- [ ] Apontar para elementos importantes
- [ ] Variar tom de voz
- [ ] Manter postura ereta
- [ ] Olhar para a câmera

### Após Gravação

- [ ] Revisar vídeo completo
- [ ] Verificar áudio (sem ruídos)
- [ ] Adicionar intro/outro (opcional)
- [ ] Adicionar legendas (recomendado)
- [ ] Exportar em boa qualidade (1080p)
- [ ] Upload para plataforma
- [ ] Compartilhar link

---

## 🎬 CONFIGURAÇÕES TÉCNICAS RECOMENDADAS

### Gravação de Vídeo

- **Resolução:** 1920x1080 (Full HD) mínimo
- **FPS:** 30 fps
- **Codec:** H.264
- **Bitrate:** 5-8 Mbps

### Gravação de Áudio

- **Sample Rate:** 48 kHz
- **Bitrate:** 128-192 kbps
- **Formato:** AAC ou MP3
- **Microfone:** Perto da boca (20-30cm)
- **Redução de ruído:** Ativar

### Software Recomendado

**Gravação de Tela:**
- OBS Studio (grátis e profissional)
- QuickTime (Mac)
- ScreenRec
- Loom

**Edição:**
- DaVinci Resolve (grátis)
- iMovie (Mac)
- Filmora
- Camtasia

---

## 💡 DICAS PROFISSIONAIS

### Presença de Câmera

1. **Olhe para a câmera, não para a tela**
   - A câmera é seu público

2. **Sorria naturalmente**
   - Transmite confiança e entusiasmo

3. **Gesticule moderadamente**
   - Ajuda a enfatizar pontos
   - Não exagere

4. **Varie o tom de voz**
   - Evita monotonia
   - Mantém atenção

### Estrutura da Narrativa

1. **Hook inicial** (primeiros 30s)
   - Capture atenção imediatamente
   - "Implementei 4 algoritmos do ZERO"

2. **Build-up** (meio)
   - Construa expectativa
   - "Agora vem o melhor..."

3. **Clímax** (resultados)
   - Momento de revelação
   - "92.52% de acurácia!"

4. **Conclusão** (final)
   - Recapitule pontos principais
   - Call to action

### Linguagem Corporal

- **Mãos:** Visíveis, gestos naturais
- **Postura:** Ereta mas relaxada
- **Expressões:** Naturais e variadas
- **Movimento:** Mínimo, mas não rígido

---

## ⏱️ TIMING DETALHADO

| Seção | Tempo | Slides | Pontos-Chave |
|-------|-------|--------|--------------|
| Abertura | 0:00-1:00 | 1 | Apresentação pessoal |
| Introdução | 1:00-2:30 | 2-3 | Objetivo e desafio |
| Dataset | 2:30-3:30 | 4-5 | Dados e pré-processamento |
| Algoritmos | 3:30-7:00 | 6-9 | 4 implementações |
| Metodologia | 7:00-8:00 | 10-11 | Validação e métricas |
| Resultados | 8:00-10:00 | 12-14 | Tabelas e análises |
| Análise | 10:00-11:30 | 15-16 | Insights |
| Demo | 11:30-13:00 | 20 | Código rodando |
| Extras/Conclusão | 13:00-14:30 | 18,21,23 | Extras e conclusões |
| Encerramento | 14:30-15:00 | 24 | Agradecimentos |

**TOTAL: 15 minutos**

---

## 🎯 PONTOS DE ÊNFASE

### MUITO Importante (Enfatizar Bastante)

1. **"Implementado DO ZERO"**
   - Repetir várias vezes
   - Este é o grande diferencial

2. **"SEM pandas, SEM scikit-learn"**
   - Mostrar que seguiu regras
   - Demonstrar compreensão profunda

3. **"Backpropagation MANUAL"**
   - Parte mais impressionante
   - Demonstra domínio técnico

4. **"92.52% de acurácia"**
   - Resultado excelente
   - Prova que funciona

### Importante (Mencionar Claramente)

- Validação cruzada K-Fold
- 28 features, 5000 amostras
- 4 algoritmos diferentes
- Extras implementados

### Mencionar (Não precisa enfatizar)

- Detalhes técnicos específicos
- Números exatos de configuração
- Bibliotecas auxiliares permitidas

---

## 📝 SCRIPT DE EMERGÊNCIA

### Se Esquecer o que Falar

**Frase curinga:**
> "Como podem ver neste slide, [descreva o que está na tela]..."

### Se Errar

**NÃO:**
- ❌ Parar e reiniciar
- ❌ Pedir desculpas excessivamente
- ❌ Fazer careta

**SIM:**
- ✅ Continuar naturalmente
- ✅ Corrigir rapidamente se necessário
- ✅ Sorrir e seguir em frente

### Se Travar

**Respirar fundo e:**
> "Recapitulando rapidamente: [mencione ponto anterior] e agora vamos para [próximo ponto]..."

---

## ✅ CHECKLIST FINAL

**1 DIA ANTES:**
- [ ] Revisar todos os slides
- [ ] Ensaiar pelo menos 2x completo
- [ ] Preparar ambiente de gravação
- [ ] Testar equipamentos
- [ ] Dormir bem

**NO DIA:**
- [ ] Tomar café/água
- [ ] Vestir roupa apropriada
- [ ] Fazer aquecimento vocal
- [ ] Relaxar (respirar fundo 3x)
- [ ] Sorrir e GRAVAR!

---

**BOA SORTE! VOCÊ VAI ARRASAR! 🚀🎬**
