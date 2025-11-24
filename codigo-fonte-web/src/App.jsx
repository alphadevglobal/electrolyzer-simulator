import './App.css';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Activity, HelpCircle, Palette, Download, Github, FileImage, Globe, Thermometer, Briefcase, Network, Clapperboard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import StaticSimulation from './components/StaticSimulation';
import DynamicSimulation from './components/DynamicSimulation';
import ScientificFAQ from './components/ScientificFAQ';
import HydrogenColors from './components/HydrogenColors';
import ResearchGallery from './components/ResearchGallery';
import ClimateAnalysis from './components/ClimateAnalysis';
import TemperatureEffect from './components/TemperatureEffect';
import BusinessModel from './components/BusinessModel';
import ProcessFlowVisualization from './components/ProcessFlowVisualization';
import AnimatedProcessVisualization from './components/AnimatedProcessVisualization';

function App() {
  const [activeTab, setActiveTab] = useState('static');
  const [isDesktop, setIsDesktop] = useState(false);

  const container = "w-full max-w-[1800px] 2xl:max-w-[2000px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16";

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const navItems = [
    { value: 'static', label: 'Simulação Estática', icon: Zap },
    { value: 'dynamic', label: 'Simulação Dinâmica', icon: Activity },
    { value: 'animated', label: 'Visualização Animada', icon: Clapperboard },
    { value: 'process', label: 'Fluxo de Processo', icon: Network },
    { value: 'temperature', label: 'Efeito da Temperatura', icon: Thermometer },
    { value: 'climate', label: 'Análise Climática', icon: Globe },
    { value: 'gallery', label: 'Galeria', icon: FileImage },
    { value: 'faq', label: 'FAQ Científico', icon: HelpCircle },
    { value: 'hydrogen', label: 'H₂ Colorido', icon: Palette },
    { value: 'business', label: 'Modelo de Negócio', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className={container}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Simulador de Eletrolisador
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Versão 3.0 - Modelagem Híbrida Avançada
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Baseado em Pesquisa Científica
              </Badge>
              <Badge variant="outline" className="text-xs">
                UNIFOR
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${container} py-8`}>
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-xl">
                Simulador Avançado de Eletrolisadores
              </CardTitle>
              <CardDescription className="text-blue-100">
                Ferramenta de simulação baseada em princípios físicos e Machine Learning para análise 
                de desempenho de eletrolisadores alcalinos, PEM e SOEC. Desenvolvido com base no artigo 
                científico "Simulation study on the effect of temperature on hydrogen production 
                performance of alkaline electrolytic water".
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className={isDesktop ? "grid grid-cols-[360px_minmax(0,1fr)] gap-12 items-start" : "flex flex-col gap-6"}>
          {isDesktop && (
          <aside className="w-full">
            <Card className="sticky top-8 w-full">
              <CardHeader>
                <CardTitle className="text-base">Navegação</CardTitle>
                <CardDescription>Escolha a simulação ou recurso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setActiveTab(item.value)}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>
          )}

          <div className="space-y-6 min-w-0 w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full min-w-0">
              {/* Desktop quick nav */}
              {isDesktop ? (
                <TabsList className="flex flex-wrap gap-2 bg-white/60 border border-gray-200 rounded-xl p-3 shadow-sm w-full justify-start">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <TabsTrigger
                        key={item.value}
                        value={item.value}
                        className="flex items-center gap-2 text-sm px-3 py-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              ) : (
                <>
                  <div className="w-full">
                    <Select value={activeTab} onValueChange={setActiveTab}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma página" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="static">Simulação Estática</SelectItem>
                        <SelectItem value="dynamic">Simulação Dinâmica</SelectItem>
                        <SelectItem value="animated">Visualização Animada</SelectItem>
                        <SelectItem value="process">Fluxo de Processo</SelectItem>
                        <SelectItem value="temperature">Efeito da Temperatura</SelectItem>
                        <SelectItem value="climate">Análise Climática</SelectItem>
                        <SelectItem value="gallery">Galeria</SelectItem>
                        <SelectItem value="faq">FAQ Científico</SelectItem>
                        <SelectItem value="hydrogen">H₂ Colorido</SelectItem>
                        <SelectItem value="business">Modelo de Negócio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
                    <TabsTrigger value="static" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Estática
                    </TabsTrigger>
                    <TabsTrigger value="dynamic" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Dinâmica
                    </TabsTrigger>
                    <span className="border-l border-gray-300 h-8 mx-1"></span>
                    <TabsTrigger value="animated" className="flex items-center gap-2">
                      <Clapperboard className="h-4 w-4" /> Animada
                    </TabsTrigger>
                    <TabsTrigger value="process" className="flex items-center gap-2">
                      <Network className="h-4 w-4" /> Processo
                    </TabsTrigger>
                    <span className="border-l border-gray-300 h-8 mx-1"></span>
                    <TabsTrigger value="temperature" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" /> Temperatura
                    </TabsTrigger>
                    <TabsTrigger value="climate" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Clima
                    </TabsTrigger>
                    <span className="border-l border-gray-300 h-8 mx-1"></span>
                    <TabsTrigger value="gallery" className="flex items-center gap-2">
                      <FileImage className="h-4 w-4" /> Galeria
                    </TabsTrigger>
                    <TabsTrigger value="faq" className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" /> FAQ
                    </TabsTrigger>
                    <TabsTrigger value="hydrogen" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" /> H₂ Colorido
                    </TabsTrigger>
                    <TabsTrigger value="business" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Negócio
                    </TabsTrigger>
                  </TabsList>
                </>
              )}

              <TabsContent value="static">
                <StaticSimulation />
              </TabsContent>

              <TabsContent value="dynamic">
                <DynamicSimulation />
              </TabsContent>

              <TabsContent value="animated">
                <AnimatedProcessVisualization />
              </TabsContent>

              <TabsContent value="process">
                <ProcessFlowVisualization />
              </TabsContent>

              <TabsContent value="temperature">
                <TemperatureEffect />
              </TabsContent>

              <TabsContent value="climate">
                <ClimateAnalysis />
              </TabsContent>

              <TabsContent value="gallery">
                <ResearchGallery />
              </TabsContent>

              <TabsContent value="faq">
                <ScientificFAQ />
              </TabsContent>

              <TabsContent value="hydrogen">
                <HydrogenColors />
              </TabsContent>

              <TabsContent value="business">
                <BusinessModel />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sobre o Projeto
              </h3>
              <p className="text-gray-600 text-sm">
                Este simulador foi desenvolvido como parte de uma pesquisa científica 
                sobre eletrolisadores, combinando modelagem física rigorosa com 
                técnicas avançadas de Machine Learning.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                <strong>Equipe de Desenvolvimento:</strong><br/>
                Mateus Gomes Macário (Desenvolvedor Principal)<br/>
                Karen Moura Fernandes (Pesquisadora)<br/>
                Prof. Paulo Henrique Pereira Silva (Orientador)<br/>
                <span className="text-gray-400">Desenvolvido com auxílio de inteligência artificial</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Funcionalidades
              </h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Simulação estática e dinâmica em tempo real</li>
                <li>• Visualização animada interativa com SVG</li>
                <li>• Visualização do fluxo de processo completo</li>
                <li>• Análise de custos operacionais em tempo real</li>
                <li>• Análise do efeito da temperatura na produção</li>
                <li>• Análise climática regional comparativa</li>
                <li>• Modelagem híbrida (Físico + ML)</li>
                <li>• Análise de múltiplos tipos de eletrolisadores</li>
                <li>• Galeria de pesquisa com upload de imagens</li>
                <li>• Exportação de dados para pesquisa</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recursos
              </h3>
              <div className="space-y-2">
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Baixar Notebook Colab
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Github className="h-4 w-4" />
                  Código Fonte
                </a>
                <div className="text-xs text-gray-500 mt-4">
                  <p><strong>Pesquisa:</strong> Karen Moura Fernandes</p>
                  <p><strong>Desenvolvimento:</strong> Mateus Gomes Macário</p>
                  <p><strong>Instituição:</strong> UNIFOR</p>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-gray-500 text-sm">
            <p>
              © 2025 UNIFOR - Universidade de Fortaleza
            </p>
            <p className="mt-1">
              <strong>Desenvolvido por:</strong> Mateus Gomes Macário | <strong>Pesquisadora:</strong> Karen Moura Fernandes
            </p>
            <p className="mt-1">
              <strong>Orientação:</strong> Prof. Paulo Henrique Pereira Silva
            </p>
            <p className="mt-2 text-xs">
              Simulador desenvolvido com auxílio de algumas inteligências artificiais como Manus, 
              utilizando conhecimentos prévios de programação e arquitetura de software para validação científica.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
