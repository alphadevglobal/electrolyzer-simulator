import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Building2, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Pesquisa Aplicada',
    price: 'R$ 0*',
    description: 'Para universidades e laboratórios parceiros.',
    features: [
      'Simulações ilimitadas',
      'Exportação científica (CSV, LaTeX)',
      'Acesso ao notebook Colab',
      'Canal direto com pesquisadores',
    ],
    cta: 'Solicitar parceria',
    highlighted: false,
  },
  {
    name: 'Indústria',
    price: 'R$ 2.900/mês',
    description: 'Modelagem, integração e suporte para plantas-piloto.',
    features: [
      'API dedicada e SLA 99,5%',
      'Modelos ajustados com dados operacionais',
      'Dashboards customizados',
      'Oficina trimestral com especialistas',
      'Integração AWS/Vercel pronta',
    ],
    cta: 'Fale com o time',
    highlighted: true,
  },
  {
    name: 'OEM & Integradores',
    price: 'Sob consulta',
    description: 'Licenciamento white-label para fabricantes.',
    features: [
      'Biblioteca de cálculos embarcável',
      'Treinamento de equipes comerciais',
      'Roadmap conjunto de features',
      'Análises econômicas e PPA',
    ],
    cta: 'Agendar demonstração',
    highlighted: false,
  },
];

const BusinessModel = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <DollarSign className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modelo de Negócio</h2>
          <p className="text-muted-foreground">
            Transformamos pesquisa em valor. Veja como universidades, indústrias e integradores podem trabalhar conosco.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? 'border-emerald-400 shadow-lg shadow-emerald-100' : ''}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.highlighted && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Preferido
                  </Badge>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <p className="text-3xl font-bold">{plan.price}</p>
              {plan.price === 'R$ 0*' && (
                <p className="text-xs text-muted-foreground">
                  *Mediante convênio institucional
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Estratégia de monetização
          </CardTitle>
          <CardDescription>
            Estruturamos um funil claro: comunidade acadêmica gera confiabilidade, indústrias validam casos e OEMs levam o simulador ao mercado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Discovery Científico</p>
              <p>Uso gratuito em pesquisas gera benchmark público e alimenta o pipeline de features.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Pacotes de Integração</p>
              <p>APIs e consultoria recorrente para empresas que desejam simular CAPEX/OPEX de plantas de H₂.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Licenciamento OEM</p>
              <p>Fabricantes incorporam o simulador em portais técnicos e remuneram via setup + royalties.</p>
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Para propostas personalizadas, escreva para <a className="text-blue-600 hover:underline" href="mailto:contato@alphadevglobal.com">contato@alphadevglobal.com</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessModel;
