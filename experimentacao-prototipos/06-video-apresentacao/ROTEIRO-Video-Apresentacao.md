# ROTEIRO DE VÍDEO - APRESENTAÇÃO DO PROJETO AV3

## H2 GREEN FACTORY - AUTOMAÇÃO E HIDROGÊNIO VERDE

**Duração Total:** 9 minutos e 30 segundos
**Formato:** 1920x1080 (Full HD)
**Software de Gravação:** OBS Studio ou equivalente

---

## ESTRUTURA DO VÍDEO

| Tempo | Seção | Duração |
|-------|-------|---------|
| 00:00 - 00:45 | Abertura e Introdução | 45s |
| 00:45 - 02:15 | Contexto e Problema | 1min 30s |
| 02:15 - 04:00 | Demonstração Factory IO | 1min 45s |
| 04:00 - 05:30 | Demonstração IHM e Controle | 1min 30s |
| 05:30 - 07:00 | Transelevador e Armazenamento | 1min 30s |
| 07:00 - 08:30 | Integração Web e Resultados | 1min 30s |
| 08:30 - 09:30 | Conclusão e Agradecimentos | 1min |

---

## CENA 1: ABERTURA E INTRODUÇÃO (00:00 - 00:45)

### Visual
- **Tela 1:** Slide de título com logo da UNIFOR
  ```
  ┌──────────────────────────────────────────────┐
  │                                              │
  │   H2 GREEN FACTORY                           │
  │   Automação de Planta de Produção de         │
  │   Hidrogênio Verde                           │
  │                                              │
  │   Projeto Final - Experimentação Protótipos  │
  │   AV3 - 2025.2                               │
  │                                              │
  │   [Seu Nome]                                 │
  │   Universidade de Fortaleza (UNIFOR)         │
  └──────────────────────────────────────────────┘
  ```

- **Tela 2:** Transição para screenshot do Factory IO (visão geral da planta)

### Narração
> "Olá! Sou [Seu Nome], e hoje vou apresentar o projeto H2 Green Factory, desenvolvido para a disciplina de Experimentação de Protótipos. Este trabalho simula uma planta industrial completa de produção, envase e armazenamento de hidrogênio verde, integrando pesquisa científica com tecnologias de Indústria 4.0."

### Ações
- [ ] Gravar narração clara e pausada
- [ ] Adicionar música de fundo suave (instrumental, 30% volume)
- [ ] Transição suave (fade) entre slides

---

## CENA 2: CONTEXTO E PROBLEMA (00:45 - 02:15)

### Visual
- **Slide 1:** Imagem de painéis solares + turbinas eólicas
- **Slide 2:** Diagrama do processo de eletrólise
- **Slide 3:** Gráfico de eficiência vs. temperatura (70-80°C destacado)

### Narração
> "O hidrogênio verde é produzido por eletrólise da água utilizando energia renovável, sem emissão de CO₂. No entanto, a eficiência do processo depende criticamente da temperatura operacional do eletrolisador."

[PAUSA]

> "Estudos recentes demonstram que temperaturas entre 70 e 80 graus Celsius resultam em eficiência de até 82%, enquanto fora dessa faixa a eficiência cai para 60 a 65%. Nosso sistema automatizado utiliza essa informação científica para ajustar dinamicamente a velocidade de produção."

[MOSTRAR TABELA]

| Temperatura | Eficiência | Tempo de Envase |
|-------------|------------|-----------------|
| 50°C | 64% | 5 segundos |
| **75°C** | **82%** | **2 segundos** |
| 90°C | 76% | 3 segundos |

> "Como podem ver, operar na faixa ótima reduz o tempo de envase em 60%, o que se traduz diretamente em maior produtividade."

### Ações
- [ ] Criar slides no PowerPoint/Canva
- [ ] Animar entrada da tabela (aparecer linha por linha)
- [ ] Destacar linha de 75°C com cor verde

---

## CENA 3: DEMONSTRAÇÃO FACTORY IO (02:15 - 04:00)

### Visual
- **Câmera:** Vista isométrica da planta completa
- **Zoom progressivo:** Eletrolisador → Esteira → Filling Station → Paletizador → Transelevador

### Narração
> "Vamos agora para a simulação 3D desenvolvida no Factory IO. A planta está dividida em quatro módulos principais:"

[ZOOM NO ELETROLISADOR]

> "Primeiro, temos o eletrolisador, representado por este tanque. Aqui vemos o sensor de nível e o potenciômetro que simula a temperatura. No painel de controle físico, temos os botões de Start, Stop, Emergência e Reset, além de displays que mostram a temperatura atual e o nível do tanque."

[PAN PARA ESTEIRA]

> "Os cilindros vazios entram pela esteira transportadora e são direcionados para a estação de envase."

[ZOOM NA FILLING STATION]

> "Aqui, um stopper pneumático segura cada cilindro na posição exata. O sensor detecta a presença do cilindro, e a válvula de H2 é acionada. Vejam que o tempo de enchimento varia automaticamente: quando a temperatura está em 75 graus, o envase leva apenas 2 segundos. Se eu ajustar o potenciômetro para 50 graus..."

[AJUSTAR POTENCIÔMETRO - MOSTRAR MUDANÇA]

> "...o sistema detecta que saímos da faixa ótima, e o tempo de envase aumenta para 5 segundos, simulando a redução de eficiência."

[RETORNAR PARA 75°C]

> "Voltando para a temperatura ideal, a produção acelera novamente."

### Ações
- [ ] Gravar Factory IO em resolução máxima (1080p, 60fps)
- [ ] Usar ferramenta de zoom (software) para destacar componentes
- [ ] Pausar brevemente em cada módulo (2-3 segundos)
- [ ] Demonstrar mudança de temperatura AO VIVO

---

## CENA 4: DEMONSTRAÇÃO IHM E CONTROLE (04:00 - 05:30)

### Visual
- **Tela dividida:** Factory IO (50%) + IHM TIA Portal (50%)

### Narração
> "Agora vou mostrar a Interface Homem-Máquina desenvolvida no TIA Portal."

[MOSTRAR TELA DA IHM]

> "Na tela principal, temos o monitoramento em tempo real de todos os parâmetros críticos:"

[APONTAR CADA ELEMENTO]

> "• Barra de nível do eletrolisador, atualmente em 50%
> • Display de temperatura mostrando 75.2 graus Celsius
> • Este LED verde indica que estamos na faixa de eficiência ótima
> • Contador de pallets produzidos: já temos 5 pallets completos
> • E aqui embaixo, a matriz de estoque do transelevador, mostrando as posições ocupadas em vermelho e vazias em verde"

[INTERAGIR COM IHM]

> "Vou clicar no botão Start aqui da IHM para iniciar a produção..."

[CLICAR EM START - MOSTRAR FACTORY IO REAGINDO]

> "Vejam que o sistema responde imediatamente: a esteira começa a mover, a luz verde do painel acende, e os cilindros começam a ser processados."

[MOSTRAR CONTADOR INCREMENTANDO]

> "A cada 6 cilindros, o paletizador agrupa automaticamente em um pallet, que é então encaminhado para o transelevador."

### Ações
- [ ] Gravar IHM com captura de tela nativa (TIA Portal)
- [ ] Sincronizar ações IHM ↔ Factory IO (edição de vídeo)
- [ ] Adicionar setas/anotações visuais (software de edição)

---

## CENA 5: TRANSELEVADOR E ARMAZENAMENTO (05:30 - 07:00)

### Visual
- **Câmera:** Close-up do transelevador
- **Ângulo:** Lateral para mostrar os 3 níveis

### Narração
> "Este é um dos requisitos obrigatórios do projeto: o transelevador, ou stacker crane, responsável pelo armazenamento vertical."

[ACOMPANHAR MOVIMENTO]

> "Quando um pallet completo sai do paletizador, o transelevador inicia automaticamente sua sequência. Vejam:"

[NARRAR MOVIMENTO PASSO A PASSO]

> "1. Primeiro, ele sobe até o nível 3, que é onde temos a próxima posição livre
> 2. Agora avança horizontalmente para a coluna 2
> 3. A garra pneumática abre e deposita o pallet na prateleira
> 4. Recua para posição segura
> 5. E desce de volta para a posição inicial, pronto para o próximo pallet"

[MOSTRAR MATRIZ NA IHM]

> "Notem na IHM como a posição [Nível 3, Coluna 2] agora está marcada em vermelho, indicando ocupação. O sistema tem capacidade para 12 pallets, totalizando 72 cilindros de hidrogênio verde."

[MOSTRAR TEMPO DE CICLO]

> "O tempo total do ciclo do transelevador é de aproximadamente 14 segundos, o que garante alta eficiência no armazenamento."

### Ações
- [ ] Gravar movimento completo do transelevador (sem cortes)
- [ ] Adicionar timer na tela mostrando tempo decorrido
- [ ] Picture-in-picture: IHM no canto mostrando matriz atualizando

---

## CENA 6: INTEGRAÇÃO WEB E RESULTADOS (07:00 - 08:30)

### Visual
- **Transição:** Factory IO → Browser (aplicação web)

### Narração
> "Além da automação local, desenvolvemos uma integração com aplicação web para monitoramento remoto via Internet."

[MOSTRAR NAVEGADOR]

> "Através do protocolo OPC UA e middleware Node-RED, todos os dados do PLC são transmitidos em tempo real para esta interface web desenvolvida em Next.js."

[NAVEGAR PELA INTERFACE]

> "Aqui temos:
> • Gráfico histórico de temperatura das últimas horas
> • Indicadores de produção acumulada
> • Alertas automáticos quando parâmetros saem da faixa
> • E até controle remoto: posso clicar aqui para enviar comando de Start/Stop diretamente do navegador"

[MOSTRAR BANCO DE DADOS - OPCIONAL]

> "Todos os dados são armazenados em banco TimescaleDB, permitindo análises históricas e geração de relatórios de eficiência."

[MOSTRAR SLIDE DE RESULTADOS]

**RESULTADOS ALCANÇADOS:**

| Métrica | Valor |
|---------|-------|
| Ganho de produtividade (faixa ótima) | 60% |
| Capacidade de armazenamento | 12 pallets (72 cilindros) |
| Redução de área de piso (vs. horizontal) | 67% |
| Taxa de atualização (tempo real) | 100 ms |
| Total de tags PLC | 59 |

> "Estes são os principais resultados quantitativos do projeto."

### Ações
- [ ] Gravar aplicação web funcionando (localhost ou deploy)
- [ ] Demonstrar WebSocket conectado (ponto verde)
- [ ] Mostrar gráfico atualizando em tempo real

---

## CENA 7: CONCLUSÃO E AGRADECIMENTOS (08:30 - 09:30)

### Visual
- **Slide final:** Resumo visual (infográfico)
- **Background:** Screenshot da planta funcionando (loop)

### Narração
> "Para concluir, este projeto demonstrou com sucesso a integração entre pesquisa científica e automação industrial. Implementamos:"

[LISTAR COM ANIMAÇÃO]

> "✓ Simulação 3D completa no Factory IO
> ✓ Programação Ladder com 6 networks no TIA Portal
> ✓ Interface IHM funcional e intuitiva
> ✓ Sistema de paletização automatizado
> ✓ Transelevador com armazenamento vertical de 3 níveis
> ✓ Comunicação OPC UA seguindo padrões de Indústria 4.0
> ✓ Integração web para monitoramento remoto
> ✓ E o mais importante: algoritmo inteligente que utiliza dados de eficiência térmica para otimizar produção"

[PAUSA]

> "A metodologia desenvolvida pode ser aplicada em plantas reais, contribuindo para viabilização econômica do hidrogênio verde como vetor energético sustentável."

[SLIDE DE AGRADECIMENTO]

> "Agradeço ao professor [Nome], à Universidade de Fortaleza, e a todos que acompanharam esta apresentação. Toda a documentação técnica, código-fonte e artigo científico completo estão disponíveis no repositório do projeto. Muito obrigado!"

[TELA FINAL com QR Code do GitHub]

### Ações
- [ ] Criar infográfico profissional (Canva, Figma)
- [ ] Gerar QR Code apontando para repositório
- [ ] Fade out suave com música

---

## CHECKLIST DE PRODUÇÃO

### Pré-Gravação
- [ ] Testar todos os sistemas (Factory IO, TIA Portal, Web App)
- [ ] Escrever script completo (narração palavra por palavra)
- [ ] Configurar iluminação (se aparecer em câmera)
- [ ] Testar microfone (qualidade de áudio)
- [ ] Preparar todos os slides no PowerPoint

### Gravação
- [ ] Gravar em ambiente silencioso
- [ ] Usar OBS Studio para captura de tela + áudio
- [ ] Gravar cada cena separadamente (facilita edição)
- [ ] Fazer takes múltiplos de trechos difíceis
- [ ] Salvar arquivos RAW em alta qualidade

### Pós-Produção
- [ ] Editar no DaVinci Resolve ou Adobe Premiere
- [ ] Cortar silêncios e hesitações
- [ ] Normalizar volume do áudio (-14 LUFS)
- [ ] Adicionar transições suaves entre cenas
- [ ] Inserir música de fundo (cuidado com direitos autorais!)
- [ ] Adicionar legendas (opcional mas recomendado)
- [ ] Renderizar em H.264, 1080p, 30fps, 8 Mbps

### Entrega
- [ ] Verificar duração total (< 10 minutos)
- [ ] Testar reprodução em diferentes dispositivos
- [ ] Upload para YouTube (Unlisted ou Private)
- [ ] Gerar arquivo MP4 para entrega offline
- [ ] Preparar thumbnail atrativo (1280x720)

---

## DICAS PARA NARRAÇÃO PROFISSIONAL

### Tom de Voz
- **Velocidade:** 150-160 palavras/minuto (nem rápido, nem lento)
- **Entonação:** Variada (evitar monotonia)
- **Pausas:** Fazer pausas naturais entre tópicos (1-2 segundos)
- **Entusiasmo:** Demonstrar paixão pelo projeto (sem exagero)

### Linguagem
- **Evitar:** "Então...", "Né?", "É...", "Tipo..."
- **Usar:** Linguagem técnica mas acessível
- **Explicar:** Siglas na primeira menção (PLC = Programmable Logic Controller)

### Ritmo
- **Rápido:** Demonstrações visuais (deixar imagens falarem)
- **Lento:** Conceitos complexos (dar tempo para processar)
- **Pausa dramática:** Antes de revelar resultados importantes

---

## RECURSOS ADICIONAIS

### Músicas Livres de Direitos Autorais
- YouTube Audio Library: Seção "Ambient" ou "Corporate"
- Epidemic Sound (licença educacional)
- Artlist (teste gratuito)

**Sugestões:**
- "Inspiring Cinematic Background" (intro/outro)
- "Minimal Tech Loop" (demonstrações técnicas)

### Ferramentas de Edição
- **Gratuitas:** DaVinci Resolve, HitFilm Express
- **Pagas:** Adobe Premiere Pro, Final Cut Pro
- **Online:** Kapwing, Descript

### Legendas
- **Auto-generate:** YouTube Studio (após upload)
- **Manual:** Aegisub (software gratuito)
- **Formato:** SRT (compatível com todas as plataformas)

---

## SCRIPT ADICIONAL PARA B-ROLL (Imagens de Cobertura)

**B-Roll são imagens secundárias inseridas enquanto você narra, para tornar o vídeo mais dinâmico.**

### Sugestões:
1. **Transição entre cenas:** Close-ups de componentes (sensores, motores)
2. **Durante explicações técnicas:** Animações de diagramas
3. **Momentos de pausa:** Time-lapse da planta funcionando
4. **Créditos finais:** Montagem acelerada de todo o processo (10s)

---

**Documento:** ROTEIRO-Video-Apresentacao.md
**Projeto:** H2 Green Factory - AV3
**Versão:** 1.0
**Data:** Novembro 2025
**Duração Alvo:** 9min 30s (máximo 10 minutos)
