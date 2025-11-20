# Code Review – Web App

## Pontos observados

- **Cálculos físicos**: a primeira versão apresentava sobretensões e eficiências irreais (valores na casa de megavolts e eficiência <10%). Simplifiquei o modelo ôhmico com ASR específico por tecnologia e corrigi a conversão energética (HHV em kWh). Agora os gráficos refletem ganhos coerentes com o estudo da AV3.
- **Testes automatizados**: não havia testes unitários para a camada de cálculos. Adicionei Vitest + Testing Library e cobri os cenários principais (`calculateHydrogenProduction`, eficiência, sobretensões e comportamento do `simulateElectrolyzer`). O pipeline passa a executar os testes antes do build.
- **Experiência de integrações**: o simulador web agora expõe um painel dedicado para AWS com health check, envio de cenário e alerta de status. Os workflows do GitHub Actions só executam deploy quando os secrets estão presentes, evitando falhas ruidosas.
- **Cobertura E2E**: expandi o smoke test do Cypress para garantir a navegação principal e corrigi seletores inconsistentes que estavam causando falsos-negativos na CI.
- **Organização de negócios**: incluí o módulo “Modelo de Negócio” com planos e CTA, abrindo espaço para propostas comerciais (pesquisa, indústria e OEM).

Recomendações futuras:
- Extrair constantes compartilhadas dos componentes `ui/*` para remover os avisos do `react-refresh`.
- Criar testes visuais para os componentes que exibem gráficos (screenshot testing) e validar dados contra séries históricas reais.
- Parametrizar os valores de ASR e limites de corrente com base em medições reais do laboratório para refinar a coerência com a pesquisa.
