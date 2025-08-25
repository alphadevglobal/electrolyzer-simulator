import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, BookOpen, Calculator, Wrench, Download, ExternalLink, Info } from 'lucide-react';

const ScientificFAQ = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">FAQ Científico</h2>
      </div>

      <Tabs defaultValue="equations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Equações
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Perguntas Frequentes
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ferramentas Avançadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equations">
          <Card>
            <CardHeader>
              <CardTitle>Equações Matemáticas Implementadas</CardTitle>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Clique em uma equação para ver detalhes sobre variáveis, aplicações e exemplos práticos.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-green-600 mb-2">Lei de Faraday da Eletrólise</h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm mb-2">
                    m = (I × t × M) / (n × F)
                  </div>
                  <p className="text-sm text-gray-600">
                    Calcula a massa de hidrogênio produzida baseada na corrente elétrica aplicada
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Onde:</strong> I = corrente (A), t = tempo (s), M = massa molar H₂, n = elétrons, F = constante de Faraday
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-green-600 mb-2">Eficiência Energética</h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm mb-2">
                    η = (E_química / E_elétrica) × 100%
                  </div>
                  <p className="text-sm text-gray-600">
                    Razão entre a energia química do hidrogênio produzido e a energia elétrica consumida
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Típico:</strong> 60-80% para eletrolisadores alcalinos e PEM
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-green-600 mb-2">Equação de Nernst</h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm mb-2">
                    V_rev = V° - (RT/nF) × ln(a_H₂ × a_O₂^0.5 / a_H₂O)
                  </div>
                  <p className="text-sm text-gray-600">
                    Calcula a tensão termodinâmica reversível para a eletrólise da água
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>V°:</strong> 1.229 V a 25°C e 1 atm
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-green-600 mb-2">Equação de Butler-Volmer</h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm mb-2">
                    I = I₀ × [exp(αnFη/RT) - exp(-(1-α)nFη/RT)]
                  </div>
                  <p className="text-sm text-gray-600">
                    Descreve a cinética eletroquímica e a relação entre corrente e sobretensão
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Simplificada:</strong> η = (RT/αnF) × ln(I/I₀) para altas sobretensões
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-green-600 mb-2">Sobretensões Totais</h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm mb-2">
                    V_total = V_rev + η_ativação + η_ôhmica + η_concentração
                  </div>
                  <p className="text-sm text-gray-600">
                    Soma de todas as perdas de tensão no eletrolisador
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Típico:</strong> 1.8-2.2 V para operação normal
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-green-600 mb-2">Consumo Específico de Energia</h3>
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm mb-2">
                    CEE = E_elétrica / m_H₂
                  </div>
                  <p className="text-sm text-gray-600">
                    Energia elétrica necessária para produzir uma unidade de massa de hidrogênio
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Unidade:</strong> kWh/kg H₂ (típico: 45-60 kWh/kg)
                  </div>
                </Card>

              </div>

              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <strong>Implementação no Código:</strong> Todas essas equações estão implementadas no arquivo 
                  <code className="mx-1 px-1 bg-gray-100 rounded">src/lib/calculations.js</code> e podem ser 
                  exportadas para análise externa em formatos CSV, MAT ou JSON.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes sobre a Simulação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  Quais equações são usadas para calcular a tensão teórica (reversível)?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  A tensão teórica (ou reversível) é calculada usando a equação de Nernst, que considera a temperatura, pressão e a atividade da água na solução. As equações específicas são baseadas no artigo "Simulation study on the effect of temperature on hydrogen production performance of alkaline electrolytic water", focando nas Equações (14) a (20) para detalhar a dependência da temperatura, pressão de vapor da água e molalidade do KOH.
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  Como as sobretensões são calculadas?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  As sobretensões são divididas em ativação, ôhmica e concentração. As sobretensões de ativação (ânodo e cátodo) são calculadas usando a equação de Butler-Volmer simplificada (Equações 21 e 22 do artigo), que depende da densidade de corrente e da temperatura. A sobretensão ôhmica (Equação 27) considera a resistência dos eletrodos, eletrólito e membrana, que são influenciadas pela temperatura e molalidade (Equações 30 a 36). A sobretensão de concentração é uma simplificação baseada na densidade de corrente.
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  O que é molalidade e por que ela é importante?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  Molalidade (mol/kg) é uma medida da concentração de um soluto (neste caso, KOH) em um solvente (água). Ela é crucial porque afeta diretamente a condutividade do eletrólito e a pressão de vapor da solução, impactando a tensão reversível e as sobretensões ôhmicas. Uma molalidade adequada otimiza a eficiência do eletrolisador.
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  Como os eletrolizadores são aquecidos na prática?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  Eletrolizadores industriais utilizam diferentes métodos de aquecimento para atingir temperaturas operacionais ótimas:
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li><strong>Resistores Elétricos:</strong> Elementos de aquecimento imersos ou externos que convertem energia elétrica em calor. Comuns em sistemas menores e durante a inicialização.</li>
                    <li><strong>Trocadores de Calor:</strong> Utilizam fluidos quentes (vapor, água aquecida) para transferir calor ao eletrólito. Mais eficientes energeticamente.</li>
                    <li><strong>Aproveitamento do Calor Residual:</strong> Recuperação do calor gerado pela própria reação eletroquímica e resistências internas. Sistemas avançados integram este calor ao processo.</li>
                    <li><strong>Aquecimento Solar/Renovável:</strong> Em instalações sustentáveis, painéis solares térmicos ou outras fontes renováveis fornecem energia térmica.</li>
                    <li><strong>Aquecimento Indutivo:</strong> Tecnologia mais avançada que usa campos magnéticos para aquecer diretamente componentes metálicos.</li>
                  </ul>
                  O método escolhido depende da escala, eficiência desejada e disponibilidade energética local.
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  Como o clima tropical de Fortaleza afeta o desempenho dos eletrolizadores?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  O efeito de tropicalização em Fortaleza apresenta características únicas que impactam significativamente o desempenho:
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li><strong>Alta Umidade (70-85%):</strong> Reduz a necessidade de umidificação em eletrolizadores PEM, mas pode causar condensação indesejada em componentes eletrônicos.</li>
                    <li><strong>Temperatura Constante (26-32°C):</strong> Reduz custos de aquecimento inicial, mas pode exigir resfriamento para manter temperaturas operacionais ótimas.</li>
                    <li><strong>Salinidade do Ar:</strong> Proximidade ao oceano introduz sal no ambiente, acelerando corrosão de componentes metálicos e afetando a pureza do eletrólito.</li>
                    <li><strong>Radiação Solar Intensa:</strong> Oportunidade para aquecimento solar direto e degradação acelerada de materiais poliméricos expostos.</li>
                    <li><strong>Estabilidade Climática:</strong> Menor variação sazonal facilita o controle de processo e previsibilidade operacional.</li>
                    <li><strong>Qualidade da Água:</strong> Água local pode conter minerais específicos que afetam a condutividade e pureza do eletrólito.</li>
                  </ul>
                  Estes fatores tornam Fortaleza um caso de estudo interessante para eletrolisadores em regiões tropicais costeiras.
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  Este simulador utiliza dados experimentais?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  Não, este simulador utiliza um modelo preditivo baseado em princípios físicos e equações derivadas de pesquisas científicas. Ele não é calibrado com dados experimentais de um único eletrolisador real. Isso permite que ele seja uma ferramenta educacional e de simulação generalizável, mas para aplicações industriais reais, o modelo precisaria ser ajustado com dados experimentais que incluam ruídos, efeitos de degradação, impurezas da água e variações de materiais/fabricantes.
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold text-left py-2 border-b">
                  Como posso avançar ainda mais nas simulações com dados reais?
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-4 text-muted-foreground">
                  Para simulações mais robustas e aplicáveis à indústria, recomendamos:
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li><strong>Coleta de Dados Reais:</strong> Buscar parcerias com laboratórios ou indústrias para coletar dados experimentais de eletrolisadores em operação, incluindo ruídos, degradação e impurezas.</li>
                    <li><strong>Modelagem Híbrida Avançada:</strong> Utilizar os dados exportados deste simulador (dados sintéticos) para desenvolver e validar metodologias de Machine Learning (ex: redes neurais como MLP) em plataformas como Google Colab ou Jupyter. Posteriormente, re-treinar e validar esses modelos com dados reais.</li>
                    <li><strong>Softwares Especializados:</strong> Integrar os dados e modelos desenvolvidos com softwares como MATLAB, Aspen Plus ou gPROMS para simulações de processo mais complexas e otimização de sistemas em escala industrial.</li>
                    <li><strong>Integração com IA:</strong> Explorar a integração de modelos de IA (como redes neurais ou processamento de linguagem natural) para análise preditiva e interação com o simulador, tornando a ferramenta mais inteligente e acessível.</li>
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas Avançadas para Simulação</CardTitle>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para simulações mais robustas e análises avançadas, considere estas ferramentas especializadas que oferecem maior precisão e funcionalidades específicas.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">MATLAB/Simulink</h3>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Modelagem de sistemas dinâmicos e controle</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Aplicações:</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Controle de eletrolisadores</Badge>
                      <Badge variant="outline" className="text-xs">Integração com renováveis</Badge>
                      <Badge variant="outline" className="text-xs">Análise de estabilidade</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">COMSOL Multiphysics</h3>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Simulação multifísica avançada</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Aplicações:</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Distribuição de corrente</Badge>
                      <Badge variant="outline" className="text-xs">Transferência de calor</Badge>
                      <Badge variant="outline" className="text-xs">Fluidodinâmica</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">ANSYS Fluent</h3>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Dinâmica de fluidos computacional</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Aplicações:</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Fluxo de gases</Badge>
                      <Badge variant="outline" className="text-xs">Distribuição de temperatura</Badge>
                      <Badge variant="outline" className="text-xs">Otimização de geometria</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">Python (SciPy/NumPy)</h3>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Computação científica open-source</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Aplicações:</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Modelos personalizados</Badge>
                      <Badge variant="outline" className="text-xs">Análise de dados</Badge>
                      <Badge variant="outline" className="text-xs">Machine learning</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">Aspen Plus</h3>
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Simulação de processos químicos</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Aplicações:</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Balanços de massa/energia</Badge>
                      <Badge variant="outline" className="text-xs">Integração de processos</Badge>
                      <Badge variant="outline" className="text-xs">Análise econômica</Badge>
                    </div>
                  </div>
                </Card>

              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Exportação de Dados para Análise Externa</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Este simulador permite exportar dados em múltiplos formatos para integração com ferramentas avançadas:
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-blue-900">Dados Recomendados para Exportação:</h4>
                        <ul className="text-xs text-blue-700 ml-4 mt-1 space-y-1">
                          <li>• Séries temporais de corrente, tensão e temperatura</li>
                          <li>• Produção de hidrogênio e eficiência ao longo do tempo</li>
                          <li>• Sobretensões detalhadas (ativação, ôhmica, concentração)</li>
                          <li>• Parâmetros operacionais e condições de contorno</li>
                          <li>• Dados estatísticos (médias, desvios, correlações)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-blue-900">Formatos de Exportação:</h4>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="text-center">
                            <Badge variant="secondary" className="text-xs">CSV</Badge>
                            <p className="text-xs text-blue-600 mt-1">Para Excel, Python, R</p>
                          </div>
                          <div className="text-center">
                            <Badge variant="secondary" className="text-xs">MAT</Badge>
                            <p className="text-xs text-blue-600 mt-1">Para MATLAB/Simulink</p>
                          </div>
                          <div className="text-center">
                            <Badge variant="secondary" className="text-xs">JSON</Badge>
                            <p className="text-xs text-blue-600 mt-1">Para APIs e web services</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-blue-900">Validação de Modelos:</h4>
                        <ul className="text-xs text-blue-700 ml-4 mt-1 space-y-1">
                          <li>• Compare resultados com dados experimentais da literatura</li>
                          <li>• Verifique balanços de massa e energia</li>
                          <li>• Analise sensibilidade paramétrica</li>
                          <li>• Valide condições limite e casos extremos</li>
                          <li>• Use dados de fabricantes para benchmarking</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScientificFAQ;

