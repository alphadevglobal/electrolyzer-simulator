import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { simulateElectrolyzer } from '../lib/calculations';
import { Play, Pause, Square, AlertCircle, CheckCircle, BookOpen, ExternalLink } from 'lucide-react';
import ElectrochemicalVisualization from './ElectrochemicalVisualization';
import InteractiveElectrolyzerPhET from './InteractiveElectrolyzerPhET';

const DynamicSimulation = () => {
  // Estados da simulação
  const [duration, setDuration] = useState(60);
  const [timeStep, setTimeStep] = useState(1);
  const [electrolyzerType, setElectrolyzerType] = useState('Alkaline');
  const [baseTemperature, setBaseTemperature] = useState(80);
  const [baseCurrent, setBaseCurrent] = useState(2);
  const [basePressure, setBasePressure] = useState(30);
  const molality = 6.0;
  const area = 100;

  // Estados de controle
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [simulationData, setSimulationData] = useState([]);
  const [debugInfo, setDebugInfo] = useState([]);
  const [hasResults, setHasResults] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Função para adicionar debug
  const addDebug = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-9), { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Função para gerar valores baseados em perfis
  const generateProfileValue = (baseValue, profile, time, totalDuration) => {
    switch (profile) {
      case 'sinusoidal':
        return baseValue * (1 + 0.2 * Math.sin(2 * Math.PI * time / (totalDuration / 2)));
      case 'step':
        return time < totalDuration / 2 ? baseValue : baseValue * 1.2;
      case 'ramp':
        return baseValue * (1 + 0.3 * (time / totalDuration));
      default:
        return baseValue;
    }
  };

  // Função para executar um passo da simulação
  const runSimulationStep = (time) => {
    try {
      addDebug(`Executando passo em t=${time.toFixed(1)}s`, 'info');
      
      // Gerar valores baseados nos perfis
      const temperature = generateProfileValue(baseTemperature, 'constant', time, duration);
      const currentDensity = generateProfileValue(baseCurrent, 'sinusoidal', time, duration);
      const pressure = generateProfileValue(basePressure, 'constant', time, duration);

      addDebug(`Parâmetros: T=${temperature.toFixed(1)}°C, I=${currentDensity.toFixed(2)}A/cm², P=${pressure.toFixed(1)}bar`, 'info');

      // Calcular resultados usando a função de simulação
      const results = simulateElectrolyzer({
        electrolyzerType,
        temperature,
        currentDensity,
        pressure,
        molality,
        area,
        voltage: 2.0,
        concentration: 25
      });

      if (!results) {
        addDebug('Erro: simulateElectrolyzer retornou null', 'error');
        return null;
      }

      // Verificar estrutura dos resultados
      if (!results.production || !results.efficiency || !results.energy || !results.overpotentials) {
        addDebug(`Erro: Estrutura de resultados inválida - ${JSON.stringify(Object.keys(results))}`, 'error');
        return null;
      }

      const dataPoint = {
        time: time,
        timeHours: time / 3600,
        temperature,
        currentDensity,
        pressure,
        voltage: results.energy.actualVoltage || 0,
        efficiency: results.efficiency.theoretical || 0,
        hydrogenProduction: results.production.kgPerHour || 0,
        hydrogenMoles: results.production.molesPerSecond || 0,
        power: (results.energy.actualVoltage || 0) * currentDensity * area,
        energyConsumption: results.energy.specificConsumption || 0,
        overpotentialActivation: (results.overpotentials.activation || 0) * 1000,
        overpotentialOhmic: (results.overpotentials.ohmic || 0) * 1000,
        overpotentialConcentration: (results.overpotentials.concentration || 0) * 1000
      };

      addDebug(`Resultado: H2=${dataPoint.hydrogenProduction.toFixed(4)}kg/h, Eff=${dataPoint.efficiency.toFixed(1)}%`, 'success');
      
      return dataPoint;
    } catch (error) {
      addDebug(`Erro na simulação: ${error.message}`, 'error');
      console.error('Erro detalhado:', error);
      return null;
    }
  };

  // Função para iniciar a simulação
  const startSimulation = () => {
    addDebug(' Iniciando simulação dinâmica...', 'info');
    
    if (isPaused) {
      // Retomar simulação pausada
      setIsPaused(false);
      setIsRunning(true);
      startTimeRef.current = Date.now() - currentTime * 1000;
      addDebug('Retomando simulação pausada', 'info');
    } else {
      // Iniciar nova simulação
      setCurrentTime(0);
      setProgress(0);
      setSimulationData([]);
      setHasResults(false);
      setIsRunning(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      addDebug('Nova simulação iniciada', 'info');
    }

    // Executar primeiro passo imediatamente
    const firstStep = runSimulationStep(0);
    if (firstStep) {
      setSimulationData([firstStep]);
      setHasResults(true);
      addDebug('Primeiro passo executado com sucesso', 'success');
    }

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      
      if (elapsed >= duration) {
        // Simulação completa
        setIsRunning(false);
        setCurrentTime(duration);
        setProgress(100);
        clearInterval(intervalRef.current);
        addDebug('✅ Simulação concluída com sucesso!', 'success');
        return;
      }

      setCurrentTime(elapsed);
      setProgress((elapsed / duration) * 100);

      // Executar passo da simulação a cada timeStep
      if (Math.floor(elapsed / timeStep) > Math.floor((elapsed - 0.1) / timeStep)) {
        const stepResult = runSimulationStep(elapsed);
        if (stepResult) {
          setSimulationData(prev => {
            const newData = [...prev, stepResult];
            addDebug(`Dados atualizados: ${newData.length} pontos`, 'info');
            return newData;
          });
          setHasResults(true);
        }
      }
    }, 100); // Atualizar a cada 100ms para suavidade
  };

  // Função para pausar a simulação
  const pauseSimulation = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    addDebug('⏸️ Simulação pausada', 'info');
  };

  // Função para parar a simulação
  const stopSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    addDebug('⏹️ Simulação parada', 'info');
  };

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Função para formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold">⚡</span>
        </div>
        <h2 className="text-2xl font-bold">Simulação Dinâmica</h2>
      </div>

      {/* Configurações da Simulação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm">⚙️</span>
            Configurações da Simulação
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure os parâmetros temporais e perfis de variação para a simulação dinâmica
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="10"
                max="3600"
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500 mt-1">1.0 minutos</p>
            </div>

            <div>
              <Label htmlFor="timeStep">Passo de Tempo (s)</Label>
              <Input
                id="timeStep"
                type="number"
                value={timeStep}
                onChange={(e) => setTimeStep(Number(e.target.value))}
                min="0.1"
                max="10"
                step="0.1"
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500 mt-1">{Math.floor(duration / timeStep)} pontos de cálculo</p>
            </div>

            <div>
              <Label htmlFor="electrolyzerType">Tipo de Eletrolisador</Label>
              <Select value={electrolyzerType} onValueChange={setElectrolyzerType} disabled={isRunning}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alkaline">Alcalino</SelectItem>
                  <SelectItem value="PEM">PEM</SelectItem>
                  <SelectItem value="SOEC">SOEC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="baseTemperature">Temperatura Base (°C)</Label>
              <Input
                id="baseTemperature"
                type="number"
                value={baseTemperature}
                onChange={(e) => setBaseTemperature(Number(e.target.value))}
                min="25"
                max="80"
                disabled={isRunning}
              />
            </div>

            <div>
              <Label htmlFor="baseCurrent">Corrente Base (A/cm²)</Label>
              <Input
                id="baseCurrent"
                type="number"
                value={baseCurrent}
                onChange={(e) => setBaseCurrent(Number(e.target.value))}
                min="0.5"
                max="3"
                step="0.1"
                disabled={isRunning}
              />
            </div>

            <div>
              <Label htmlFor="basePressure">Pressão Base (bar)</Label>
              <Input
                id="basePressure"
                type="number"
                value={basePressure}
                onChange={(e) => setBasePressure(Number(e.target.value))}
                min="1"
                max="30"
                disabled={isRunning}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles da Simulação */}
      <Card>
        <CardHeader>
          <CardTitle>Controles da Simulação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={startSimulation} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isPaused ? 'Retomar' : 'Iniciar'} Simulação
            </Button>
            
            <Button 
              onClick={pauseSimulation} 
              disabled={!isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pausar
            </Button>
            
            <Button 
              onClick={stopSimulation} 
              disabled={!isRunning && !isPaused}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Parar
            </Button>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso: {progress.toFixed(1)}%</span>
              <span>Tempo: {formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Status da Simulação */}
          <div className="flex items-center gap-2">
            {isRunning && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Simulação em execução... Os dados estão sendo coletados em tempo real.
                </AlertDescription>
              </Alert>
            )}
            
            {hasResults && !isRunning && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Simulação concluída! {simulationData.length} pontos de dados coletados.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className={`text-xs p-2 rounded ${
                  info.type === 'error' ? 'bg-red-50 text-red-700' :
                  info.type === 'success' ? 'bg-green-50 text-green-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  <span className="font-mono">[{info.timestamp}]</span> {info.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {hasResults && simulationData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Simulação Dinâmica</CardTitle>
            <p className="text-sm text-gray-600">
              Análise temporal do desempenho do eletrolisador com {simulationData.length} pontos de dados
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resumo" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="producao">Produção</TabsTrigger>
                <TabsTrigger value="eficiencia">Eficiência</TabsTrigger>
                <TabsTrigger value="analise">Análise</TabsTrigger>
                <TabsTrigger value="quimica">Química</TabsTrigger>
              </TabsList>

              <TabsContent value="resumo" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {simulationData[simulationData.length - 1]?.hydrogenProduction.toFixed(4) || '0.0000'}
                      </div>
                      <p className="text-xs text-gray-500">kg/h de H₂</p>
                      <p className="text-sm font-medium">Produção Final</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {simulationData[simulationData.length - 1]?.efficiency.toFixed(1) || '0.0'}%
                      </div>
                      <p className="text-xs text-gray-500">eficiência</p>
                      <p className="text-sm font-medium">Eficiência Final</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {simulationData[simulationData.length - 1]?.energyConsumption.toFixed(1) || '0.0'}
                      </div>
                      <p className="text-xs text-gray-500">kWh/kg</p>
                      <p className="text-sm font-medium">Consumo Final</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hydrogenProduction" stroke="#2563eb" name="Produção H₂ (kg/h)" />
                      <Line type="monotone" dataKey="efficiency" stroke="#16a34a" name="Eficiência (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="producao" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hydrogenProduction" stroke="#2563eb" name="Produção H₂ (kg/h)" />
                      <Line type="monotone" dataKey="hydrogenMoles" stroke="#7c3aed" name="Produção H₂ (mol/s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="eficiencia" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="efficiency" stroke="#16a34a" name="Eficiência (%)" />
                      <Line type="monotone" dataKey="energyConsumption" stroke="#dc2626" name="Consumo (kWh/kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="analise" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="voltage" stroke="#f59e0b" name="Tensão (V)" />
                      <Line type="monotone" dataKey="power" stroke="#8b5cf6" name="Potência (W)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="quimica" className="space-y-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Escolha a visualização:</strong> Visualização básica (abaixo) ou Simulação Interativa PhET (mais abaixo)
                  </AlertDescription>
                </Alert>
                <ElectrochemicalVisualization />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : !isRunning && !hasResults && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma simulação executada</h3>
            <p className="text-gray-500">
              Configure os parâmetros e clique em "Iniciar Simulação" para ver os resultados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rodapé com Validação Científica */}
      <Card className="border-t-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Validação Científica dos Processos Químicos
          </CardTitle>
          <p className="text-sm text-gray-600">
            Referências bibliográficas que fundamentam os modelos eletroquímicos implementados neste simulador
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reações Fundamentais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900">Reações Eletroquímicas</h3>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Eletrólise Alcalina da Água (Solução KOH):</strong>
              </p>
              <ul className="space-y-1 text-sm text-gray-700 ml-4">
                <li><strong>Cátodo (-):</strong> 2H₂O + 2e⁻ → H₂ + 2OH⁻</li>
                <li><strong>Ânodo (+):</strong> 2OH⁻ → H₂O + ½O₂ + 2e⁻</li>
                <li><strong>Reação Global:</strong> H₂O → H₂ + ½O₂</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                Tensão termodinâmica mínima: 1.23 V (25°C, 1 atm)
              </p>
            </div>
          </div>

          {/* Referências Bibliográficas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900">Referências Bibliográficas</h3>

            {/* Referência 1 */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm font-semibold text-gray-900">
                [1] Degradação de Eletrodos de Níquel em Eletrólise
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Fonte:</strong> Nature (2025). "Relationship between degradation mechanism and water electrolysis efficiency of electrodeposited nickel electrodes under external magnetic fields"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Principais Descobertas:</strong> Demonstra que campos magnéticos externos podem formar camadas de hidróxido mais estáveis e reduzir degradação causada por formação de bolhas, oxidação e limitações de transferência de O₂.
              </p>
              <a
                href="https://www.nature.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
              >
                Acessar publicação <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Referência 2 */}
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="text-sm font-semibold text-gray-900">
                [2] Efeito da Temperatura na Eletrólise Alcalina
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Fonte:</strong> BI et al. (2025). "Simulation study on the effect of temperature on hydrogen production performance of alkaline electrolytic water"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Principais Descobertas:</strong> Análise detalhada de como a temperatura (25-90°C) afeta a cinética de produção de H₂, formação de bolhas e eficiência energética em eletrolisadores alcalinos.
              </p>
            </div>

            {/* Referência 3 */}
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-sm font-semibold text-gray-900">
                [3] Tecnologias de Produção de Hidrogênio
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Fonte:</strong> EL-SHAFIE, M. (2023). "Hydrogen production by water electrolysis technologies: A review"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Principais Descobertas:</strong> Revisão abrangente das tecnologias de eletrólise (Alcalina, PEM, SOEC), comparando eficiências, custos, e aplicações industriais.
              </p>
            </div>

            {/* Referência 4 */}
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="text-sm font-semibold text-gray-900">
                [4] Produção de Hidrogênio Não-Carbonogênico
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Fonte:</strong> SALIBA-SILVA et al. (2008). "Produção de hidrogênio não-carbonogênico"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Principais Descobertas:</strong> Fundamentos termodinâmicos e cinéticos da produção de hidrogênio via eletrólise, incluindo cálculos de eficiência de Faraday e consumo específico de energia.
              </p>
            </div>

            {/* Referência 5 */}
            <div className="border-l-4 border-cyan-500 pl-4 py-2">
              <p className="text-sm font-semibold text-gray-900">
                [5] Desempenho Avançado de Eletrolisadores Alcalinos
              </p>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Fonte:</strong> AZUAN et al. (2024). "Advanced alkaline electrolyzer performance: Operating strategies and materials"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Principais Descobertas:</strong> Estratégias operacionais para maximizar desempenho, incluindo controle de temperatura, pressão e densidade de corrente para minimizar sobrepotenciais.
              </p>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Modelos Implementados</h3>
            <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
              <li>Equação de Nernst para cálculo do potencial reversível</li>
              <li>Equação de Butler-Volmer para sobrepotenciais de ativação</li>
              <li>Lei de Ohm para sobrepotenciais ôhmicos</li>
              <li>Equações de transferência de massa para sobrepotenciais de concentração</li>
              <li>Lei de Faraday para cálculo de produção de H₂</li>
              <li>Modelo de degradação temporal de eletrodos baseado em stress térmico e eletroquímico</li>
            </ul>
          </div>

          {/* Nota sobre PhET Colorado */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Metodologia de Visualização:</strong> A visualização química interativa foi inspirada nas simulações educacionais do PhET Interactive Simulations (University of Colorado Boulder), conhecidas por sua eficácia pedagógica em demonstrar processos químicos e físicos complexos de forma intuitiva.
              <a
                href="https://phet.colorado.edu/pt_BR/simulations/filter?subjects=chemistry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 ml-2"
              >
                Visitar PhET <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* Informações sobre o Projeto */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-600">
              <strong>Desenvolvido por:</strong> Mateus Gomes Macário - Engenharia da Computação, UNIFOR
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <strong>Projeto de Iniciação Científica:</strong> Simulador Avançado de Eletrolisadores para Produção de Hidrogênio Verde
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <strong>Orientadora:</strong> Profa. Dra. Regiane de Cássia Maritan Ugulino de Araújo
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Última atualização: Novembro 2025
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Visualização Interativa PhET */}
      <Card className="border-t-4 border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="w-6 h-6 text-purple-600" />
            Simulação Interativa Estilo PhET Colorado
          </CardTitle>
          <p className="text-sm text-gray-600">
            Visualização molecular totalmente interativa com drag & drop, zoom, controle de velocidade e múltiplas camadas.
            Inspirada nas simulações educacionais do PhET Interactive Simulations da University of Colorado Boulder.
          </p>
        </CardHeader>
        <CardContent>
          <InteractiveElectrolyzerPhET />
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicSimulation;
