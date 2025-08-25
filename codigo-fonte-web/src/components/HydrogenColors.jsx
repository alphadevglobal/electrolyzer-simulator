import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette } from 'lucide-react';

const HydrogenColors = () => {
  const hydrogenTypes = [
    {
      color: 'Green',
      description: 'Produzido por eletrólise da água usando energia renovável (solar, eólica). É o hidrogênio mais limpo, com zero emissões de carbono na produção.',
      pros: ['Zero emissões de carbono na produção', 'Sustentável a longo prazo', 'Versátil para diversas aplicações'],
      cons: ['Custo de produção ainda elevado', 'Dependência da disponibilidade de fontes renováveis'],
      applications: ['Combustível para veículos (células a combustível)', 'Armazenamento de energia renovável', 'Matéria-prima industrial (amônia, metanol)'],
    },
    {
      color: 'Blue',
      description: 'Produzido a partir de gás natural com captura e armazenamento de carbono (CCS). Emissões de carbono são significativamente reduzidas, mas não eliminadas.',
      pros: ['Menor custo de produção que o hidrogênio verde', 'Redução significativa de emissões comparado ao cinza', 'Utiliza infraestrutura de gás natural existente'],
      cons: ['Não é totalmente livre de carbono', 'Dependência de combustíveis fósseis', 'Viabilidade e custo do CCS'],
      applications: ['Indústria (refinarias, produção de fertilizantes)', 'Geração de energia com baixas emissões'],
    },
    {
      color: 'Grey',
      description: 'Produzido a partir de gás natural (reforma a vapor de metano - SMR) sem captura de carbono. É o tipo mais comum e mais barato, mas com altas emissões de CO2.',
      pros: ['Custo de produção baixo', 'Tecnologia madura e amplamente disponível'],
      cons: ['Altas emissões de carbono', 'Contribui para o aquecimento global', 'Dependência de combustíveis fósseis'],
      applications: ['Produção de amônia', 'Refino de petróleo', 'Indústria química'],
    },
    {
      color: 'Pink',
      description: 'Produzido por eletrólise da água usando energia nuclear. Não emite gases de efeito estufa, mas levanta questões sobre resíduos nucleares.',
      pros: ['Produção em larga escala e constante', 'Zero emissões de carbono na produção', 'Independência de combustíveis fósseis'],
      cons: ['Questões de segurança nuclear', 'Gerenciamento de resíduos radioativos', 'Alto custo inicial de infraestrutura'],
      applications: ['Geração de energia', 'Indústria pesada', 'Produção de combustíveis sintéticos'],
    },
    {
      color: 'Turquoise',
      description: 'Produzido por pirólise de metano, que decompõe o gás natural em hidrogênio e carbono sólido. As emissões de CO2 são evitadas, mas a viabilidade em larga escala ainda está em pesquisa.',
      pros: ['Carbono sólido como subproduto (pode ser armazenado ou utilizado)', 'Menor consumo de energia que a eletrólise', 'Zero emissões de CO2'],
      cons: ['Tecnologia em fase de desenvolvimento', 'Viabilidade econômica em larga escala', 'Uso do carbono sólido'],
      applications: ['Potencial para diversas aplicações industriais e energéticas'],
    },
    {
      color: 'Yellow',
      description: 'Produzido por eletrólise da água usando energia da rede elétrica, que pode vir de fontes renováveis ou fósseis. A pegada de carbono depende da matriz energética local.',
      pros: ['Flexibilidade na fonte de energia', 'Pode aproveitar excesso de energia renovável na rede'],
      cons: ['Emissões de carbono variáveis (depende da matriz energética)', 'Não é totalmente renovável se a rede não for'],
      applications: ['Diversas aplicações, dependendo da fonte de energia da rede'],
    },
    {
      color: 'White',
      description: 'Hidrogênio natural encontrado em depósitos subterrâneos. É uma fonte rara e sua exploração ainda está em fase inicial.',
      pros: ['Fonte natural e renovável (em alguns casos)', 'Baixo custo de produção (se encontrado em abundância)'],
      cons: ['Raro e difícil de encontrar', 'Tecnologia de extração em desenvolvimento', 'Impacto ambiental da extração'],
      applications: ['Potencial para diversas aplicações, se a exploração for viável'],
    },
    {
      color: 'Black/Brown',
      description: 'Produzido a partir de carvão (gaseificação de carvão). É o tipo de hidrogênio com a maior pegada de carbono, devido às altas emissões de CO2.',
      pros: ['Utiliza recurso abundante (carvão)'],
      cons: ['Altíssimas emissões de carbono', 'Impacto ambiental severo', 'Não sustentável'],
      applications: ['Indústria pesada (historicamente)'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold">Hidrogênio Colorido</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entendendo as Cores do Hidrogênio</CardTitle>
          <CardDescription>
            O hidrogênio é incolor, mas diferentes "cores" são usadas para classificar sua origem e o impacto ambiental de sua produção.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hydrogenTypes.map((type, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full bg-${type.color.toLowerCase()}-500`}></span>
                Hidrogênio {type.color}
              </h3>
              <p className="mt-2 text-muted-foreground">{type.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <h4 className="font-medium">Prós:</h4>
                  <ul className="list-disc list-inside text-sm text-green-700">
                    {type.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Contras:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {type.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Aplicações:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-700">
                    {type.applications.map((app, i) => (
                      <li key={i}>{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HydrogenColors;


