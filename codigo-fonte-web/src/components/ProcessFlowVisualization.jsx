import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import {
  Play,
  Pause,
  Power,
  Sun,
  Wind,
  Droplets,
  Zap,
  DollarSign,
  Settings,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Custos por hora (em R$/hora)
const COSTS = {
  green: {
    // Recursos naturais: custo direto zerado, apenas manutenção eventual
    solarPanel: { idle: 0, running: 0, maintenance: 8 },
    windTurbine: { idle: 0, running: 0, maintenance: 10 },
    electrolyzer: { idle: 2.0, running: 50, maintenance: 100 },
    compressor: { idle: 0.5, running: 8, maintenance: 30 },
    storage: { idle: 0.1, running: 0.3, maintenance: 10 },
    water: 0.05,
    energy: 0.65,
  },
  blue: {
    naturalGas: { idle: 1.0, running: 120, maintenance: 80 },
    reformer: { idle: 3.0, running: 80, maintenance: 150 },
    ccs: { idle: 2.0, running: 40, maintenance: 100 },
    storage: { idle: 0.1, running: 0.3, maintenance: 10 },
    gasPrice: 0.30,
  }
};

/**
 * Visualização Interativa do Processo Completo de Produção de H₂
 *
 * Inspirado em: Hidrogênio Verde e Azul - Fluxo completo
 *
 * Características:
 * - Custos em tempo real (por segundo)
 * - Estados: parado, funcionando, manutenção
 * - Fluxos animados de recursos (água, energia, H₂)
 * - Comparação: Hidrogênio Verde vs Azul
 */
const ProcessFlowVisualization = () => {
  // Estados de controle
  const [isRunning, setIsRunning] = useState(false);
  const [processType, setProcessType] = useState('green'); // 'green' ou 'blue'
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Estados de equipamentos (on/off/maintenance)
  const [solarPanel, setSolarPanel] = useState({ active: true, status: 'on' });
  const [windTurbine, setWindTurbine] = useState({ active: true, status: 'on' });
  const [electrolyzer, setElectrolyzer] = useState({ active: false, status: 'off' });
  const [compressor, setCompressor] = useState({ active: false, status: 'off' });
  const [storage, setStorage] = useState({ active: false, status: 'off' });

  // Parâmetros de produção
  const [solarIntensity, setSolarIntensity] = useState(80); // % 0-100
  const [windSpeed, setWindSpeed] = useState(60); // % 0-100
  const [waterFlow, setWaterFlow] = useState(100); // L/h

  // Custos acumulados
  const [totalCost, setTotalCost] = useState(0);
  const [energyCost, setEnergyCost] = useState(0);
  const [maintenanceCost, setMaintenanceCost] = useState(0);
  const [waterCost, setWaterCost] = useState(0);

  // Produção
  const [h2Produced, setH2Produced] = useState(0); // kg
  const [o2Produced, setO2Produced] = useState(0); // kg
  const [solarUsage, setSolarUsage] = useState(0); // segundos de uso diário
  const [windUsage, setWindUsage] = useState(0); // segundos de uso diário
  const NATURAL_LIMIT_SECONDS = 6 * 3600; // 6h por dia

  // Referências
  const intervalRef = useRef(null);

  // Simulação a cada segundo
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeElapsed(t => t + 1);

      // Controle de limite diário dos recursos naturais
      setSolarUsage(prev => {
        const next = solarPanel.status === 'on' ? prev + 1 : prev;
        if (next >= NATURAL_LIMIT_SECONDS && solarPanel.status === 'on') {
          setSolarPanel(curr => ({ ...curr, status: 'off', active: false }));
        }
        return Math.min(next, NATURAL_LIMIT_SECONDS);
      });
      setWindUsage(prev => {
        const next = windTurbine.status === 'on' ? prev + 1 : prev;
        if (next >= NATURAL_LIMIT_SECONDS && windTurbine.status === 'on') {
          setWindTurbine(curr => ({ ...curr, status: 'off', active: false }));
        }
        return Math.min(next, NATURAL_LIMIT_SECONDS);
      });

      // Calcular produção de H₂ (kg/h) baseada em condições
      let h2Rate = 0;
      if (electrolyzer.active) {
        const energyAvailable = (solarIntensity / 100) * 2 + (windSpeed / 100) * 3;
        const waterAvailable = waterFlow;
        const h2FromEnergy = energyAvailable / 39;
        const h2FromWater = waterAvailable / 9;
        h2Rate = Math.min(h2FromEnergy, h2FromWater);
      }

      const h2PerSecond = h2Rate / 3600;
      const o2PerSecond = h2PerSecond * 8;

      setH2Produced(prev => prev + h2PerSecond);
      setO2Produced(prev => prev + o2PerSecond);

      // Calcular custos por segundo
      let costPerSecond = 0;

      // Custos de equipamentos
      if (processType === 'green') {
        costPerSecond += COSTS.green.solarPanel[solarPanel.status] / 3600;
        costPerSecond += COSTS.green.windTurbine[windTurbine.status] / 3600;
        costPerSecond += COSTS.green.electrolyzer[electrolyzer.status] / 3600;
        costPerSecond += COSTS.green.compressor[compressor.status] / 3600;
        costPerSecond += COSTS.green.storage[storage.status] / 3600;

        // Custo de água
        const waterPerSecond = waterFlow / 3600;
        const waterCostPerSec = waterPerSecond * COSTS.green.water;
        costPerSecond += waterCostPerSec;
        setWaterCost(prev => prev + waterCostPerSec);

        // Custo de energia (da rede quando renováveis insuficientes)
        const energyNeeded = 50; // kW eletrolisador
        const renewableEnergy = (solarIntensity / 100) * 2 + (windSpeed / 100) * 3;
        const gridEnergy = Math.max(0, energyNeeded - renewableEnergy);
        const energyCostPerSec = (gridEnergy * COSTS.green.energy) / 3600;
        costPerSecond += energyCostPerSec;
        setEnergyCost(prev => prev + energyCostPerSec);
      }

      setTotalCost(prev => prev + costPerSecond);

      // Custos de manutenção (aleatório entre 0.1% e 0.5% do custo operacional)
      const maintenancePerSec = costPerSecond * (Math.random() * 0.004 + 0.001);
      setMaintenanceCost(prev => prev + maintenancePerSec);

    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, processType, solarIntensity, windSpeed, waterFlow,
      solarPanel.status, windTurbine.status, electrolyzer.status, electrolyzer.active,
      compressor.status, storage.status]);

  // Toggle de equipamentos
  const toggleEquipment = (equipment, setter) => {
    setter(prev => {
      const newStatus = prev.status === 'off' ? 'on' : prev.status === 'on' ? 'off' : 'on';
      return { ...prev, status: newStatus, active: newStatus !== 'off' };
    });
  };

  // Calcular métricas
  const lcoh = h2Produced > 0 ? totalCost / h2Produced : 0; // R$/kg H₂
  const efficiency = electrolyzer.active ? ((33.3 * h2Produced) / ((energyCost / 0.65) || 1)) * 100 : 0;
  const formatHours = (seconds) => (seconds / 3600).toFixed(1);
  const solarLimitReached = solarUsage >= NATURAL_LIMIT_SECONDS;
  const windLimitReached = windUsage >= NATURAL_LIMIT_SECONDS;

  return (
    <div className="space-y-6">
      {/* Controles Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-600" />
              Visualização do Processo Completo - H₂ {processType === 'green' ? 'Verde' : 'Azul'}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={processType === 'green' ? 'default' : 'outline'}
                onClick={() => setProcessType('green')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Sun className="w-4 h-4 mr-1" />
                Verde
              </Button>
              <Button
                size="sm"
                variant={processType === 'blue' ? 'default' : 'outline'}
                onClick={() => setProcessType('blue')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wind className="w-4 h-4 mr-1" />
                Azul
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={isRunning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar Simulação
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Simulação
                </>
              )}
            </Button>

            <div className="flex gap-4">
              <Badge variant="outline" className="text-lg">
                ⏱️ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </Badge>
              <Badge className="text-lg bg-green-600">
                🎯 {h2Produced.toFixed(3)} kg H₂
              </Badge>
              <Badge className="text-lg bg-red-600">
                💰 R$ {totalCost.toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Métricas em Tempo Real */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-gray-600">LCOH</div>
              <div className="text-2xl font-bold text-blue-600">R$ {lcoh.toFixed(2)}/kg</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-gray-600">Eficiência</div>
              <div className="text-2xl font-bold text-green-600">{efficiency.toFixed(1)}%</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-sm text-gray-600">O₂ Produzido</div>
              <div className="text-2xl font-bold text-purple-600">{o2Produced.toFixed(3)} kg</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-sm text-gray-600">Taxa H₂</div>
              <div className="text-2xl font-bold text-orange-600">
                {(() => {
                  if (!electrolyzer.active) return '0.0';
                  const energyAvailable = (solarIntensity / 100) * 2 + (windSpeed / 100) * 3;
                  const waterAvailable = waterFlow;
                  const h2FromEnergy = energyAvailable / 39;
                  const h2FromWater = waterAvailable / 9;
                  const h2Rate = Math.min(h2FromEnergy, h2FromWater);
                  return (h2Rate * 1000).toFixed(1);
                })()} g/h
              </div>
            </div>
          </div>

          {/* Diagrama do Processo - Hidrogênio Verde */}
          {processType === 'green' && (
            <div className="bg-gradient-to-b from-sky-100 to-green-100 p-6 rounded-lg relative overflow-hidden">
              {/* Sol e Vento */}
              <div className="flex justify-around mb-8">
                {/* Energia Solar */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    className={`h-24 w-24 rounded-full ${solarPanel.status === 'on' ? 'bg-yellow-400 hover:bg-yellow-500' : solarPanel.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => toggleEquipment('solar', setSolarPanel)}
                  >
                    <Sun className="w-12 h-12" />
                  </Button>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-gray-700">Energia Solar</div>
                    <Badge className={solarPanel.status === 'on' ? 'bg-green-600' : solarPanel.status === 'maintenance' ? 'bg-orange-600' : 'bg-gray-600'}>
                      {solarPanel.status === 'on' ? '✓ Online' : solarPanel.status === 'maintenance' ? '🔧 Manutenção' : '⏸ Parado'}
                    </Badge>
                    <div className="text-xs mt-1 font-semibold">
                      Recurso natural • Sem custo direto • Uso diário: {formatHours(solarUsage)}h / {formatHours(NATURAL_LIMIT_SECONDS)}h
                    </div>
                    {solarLimitReached && (
                      <div className="text-xs text-red-600 mt-1">Limite diário atingido. Retome amanhã.</div>
                    )}
                    {solarPanel.status === 'on' && (
                      <div className="mt-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={solarIntensity}
                          onChange={(e) => setSolarIntensity(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs">☀️ {solarIntensity}%</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Energia Eólica */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    className={`h-24 w-24 rounded-full ${windTurbine.status === 'on' ? 'bg-cyan-400 hover:bg-cyan-500' : windTurbine.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => toggleEquipment('wind', setWindTurbine)}
                  >
                    <Wind className={`w-12 h-12 ${windTurbine.status === 'on' ? 'animate-spin' : ''}`} />
                  </Button>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-gray-700">Energia Eólica</div>
                    <Badge className={windTurbine.status === 'on' ? 'bg-green-600' : windTurbine.status === 'maintenance' ? 'bg-orange-600' : 'bg-gray-600'}>
                      {windTurbine.status === 'on' ? '✓ Online' : windTurbine.status === 'maintenance' ? '🔧 Manutenção' : '⏸ Parado'}
                    </Badge>
                    <div className="text-xs mt-1 font-semibold">
                      Recurso natural • Sem custo direto • Uso diário: {formatHours(windUsage)}h / {formatHours(NATURAL_LIMIT_SECONDS)}h
                    </div>
                    {windLimitReached && (
                      <div className="text-xs text-red-600 mt-1">Limite diário atingido. Retome amanhã.</div>
                    )}
                    {windTurbine.status === 'on' && (
                      <div className="mt-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={windSpeed}
                          onChange={(e) => setWindSpeed(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs">💨 {windSpeed}%</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Água */}
                <div className="text-center">
                  <div className="h-24 w-24 mx-auto rounded-full bg-blue-400 flex items-center justify-center">
                    <Droplets className="w-12 h-12 text-white" />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-gray-700">Água</div>
                    <Badge className="bg-blue-600">Recurso hídrico</Badge>
                    <div className="text-xs mt-1 font-semibold">
                      Custo: R$ {((waterFlow / 3600) * COSTS.green.water).toFixed(4)}/s
                    </div>
                    <div className="mt-2">
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={waterFlow}
                        onChange={(e) => setWaterFlow(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs">💧 {waterFlow} L/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fluxo de Energia (setas animadas) */}
              <div className="flex justify-center mb-4">
                <div className="text-4xl animate-pulse">⬇️</div>
              </div>

              {/* Eletrolisador */}
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <Button
                    variant="ghost"
                    className={`h-32 w-32 rounded-lg ${electrolyzer.status === 'on' ? 'bg-blue-500 hover:bg-blue-600' : electrolyzer.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => toggleEquipment('electrolyzer', setElectrolyzer)}
                  >
                    <div className="text-center">
                      <Zap className="w-16 h-16 mx-auto" />
                      <div className="text-xs font-bold mt-1">ELETROLISADOR</div>
                    </div>
                  </Button>
                  <div className="mt-2">
                    <Badge className={electrolyzer.status === 'on' ? 'bg-green-600' : electrolyzer.status === 'maintenance' ? 'bg-orange-600' : 'bg-gray-600'}>
                      {electrolyzer.status === 'on' ? '✓ Produzindo' : electrolyzer.status === 'maintenance' ? '🔧 Manutenção' : '⏸ Parado'}
                    </Badge>
                    <div className="text-xs mt-1 font-semibold">
                      Custo: R$ {(COSTS.green.electrolyzer[electrolyzer.status] / 3600).toFixed(4)}/s
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      Potência: 50 kW
                    </div>
                  </div>
                </div>
              </div>

              {/* Fluxo de H₂ */}
              <div className="flex justify-center mb-4">
                <div className="text-4xl animate-pulse">⬇️</div>
              </div>

              {/* Compressor e Armazenamento */}
              <div className="flex justify-around">
                {/* Compressor */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    className={`h-24 w-24 rounded-lg ${compressor.status === 'on' ? 'bg-gray-600 hover:bg-gray-700' : compressor.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => toggleEquipment('compressor', setCompressor)}
                  >
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto text-white" />
                      <div className="text-xs font-bold mt-1 text-white">COMPRESSOR</div>
                    </div>
                  </Button>
                  <div className="mt-2">
                    <Badge className={compressor.status === 'on' ? 'bg-green-600' : compressor.status === 'maintenance' ? 'bg-orange-600' : 'bg-gray-600'}>
                      {compressor.status === 'on' ? '✓ Online' : compressor.status === 'maintenance' ? '🔧 Manutenção' : '⏸ Parado'}
                    </Badge>
                    <div className="text-xs mt-1 font-semibold">
                      Custo: R$ {(COSTS.green.compressor[compressor.status] / 3600).toFixed(4)}/s
                    </div>
                  </div>
                </div>

                {/* Armazenamento */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    className={`h-24 w-24 rounded-full ${storage.status === 'on' ? 'bg-green-600 hover:bg-green-700' : storage.status === 'maintenance' ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={() => toggleEquipment('storage', setStorage)}
                  >
                    <div className="text-center">
                      <div className="text-4xl">H₂</div>
                      <div className="text-xs font-bold">TANQUE</div>
                    </div>
                  </Button>
                  <div className="mt-2">
                    <Badge className={storage.status === 'on' ? 'bg-green-600' : storage.status === 'maintenance' ? 'bg-orange-600' : 'bg-gray-600'}>
                      {storage.status === 'on' ? '✓ Armazenando' : storage.status === 'maintenance' ? '🔧 Manutenção' : '⏸ Vazio'}
                    </Badge>
                    <div className="text-xs mt-1 font-semibold">
                      Custo: R$ {(COSTS.green.storage[storage.status] / 3600).toFixed(4)}/s
                    </div>
                    <div className="text-lg font-bold text-green-700 mt-2">
                      {h2Produced.toFixed(3)} kg
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown de Custos */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Breakdown de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>💡 Energia:</span>
                  <span className="font-bold">R$ {energyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>💧 Água:</span>
                  <span className="font-bold">R$ {waterCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>🔧 Manutenção:</span>
                  <span className="font-bold">R$ {maintenanceCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>⚙️ Operação:</span>
                  <span className="font-bold">R$ {(totalCost - energyCost - waterCost - maintenanceCost).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="font-bold">TOTAL:</span>
                  <span className="font-bold text-red-600">R$ {totalCost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessFlowVisualization;
