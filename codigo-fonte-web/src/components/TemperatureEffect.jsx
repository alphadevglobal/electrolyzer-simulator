import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Thermometer, 
  TrendingUp, 
  Zap, 
  DollarSign,
  BarChart3,
  Info,
  Download,
  Target,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { simulateElectrolyzer } from '@/lib/calculations';

const TemperatureEffect = () => {
  const [electrolyzerType, setElectrolyzerType] = useState('PEM');
  const [pressure, setPressure] = useState(30);
  const [currentDensity, setCurrentDensity] = useState(2);
  const [voltage, setVoltage] = useState(1.8);
  const [concentration, setConcentration] = useState(25);
  const [minTemp, setMinTemp] = useState(40);
  const [maxTemp, setMaxTemp] = useState(80);
  const [tempStep, setTempStep] = useState(2);
  
  const [analysisData, setAnalysisData] = useState([]);
  const [optimalTemp, setOptimalTemp] = useState(null);
  const [minConsumptionTemp, setMinConsumptionTemp] = useState(null);
  const [efficiencyGain, setEfficiencyGain] = useState(0);
  const [energySavings, setEnergySavings] = useState(0);

  // Função para executar análise de temperatura
  const runTemperatureAnalysis = () => {
    const data = [];
    let maxEfficiency = 0;
    let minConsumption = Infinity;
    let optimalTempForEfficiency = minTemp;
    let optimalTempForConsumption = minTemp;

    for (let temp = minTemp; temp <= maxTemp; temp += tempStep) {
      try {
        const results = simulateElectrolyzer({
          electrolyzerType,
          temperature: temp,
          pressure,
          currentDensity,
          voltage,
          concentration,
          molality: 6.0,
          area: 100
        });

        const dataPoint = {
          temperature: temp,
          efficiency: results.efficiency.theoretical,
          hydrogenProduction: results.production.kgPerHour,
          energyConsumption: results.energy.specificConsumption,
          voltage: results.energy.actualVoltage,
          overpotentialActivation: results.overpotentials.activation * 1000, // mV
          overpotentialOhmic: results.overpotentials.ohmic * 1000, // mV
          overpotentialConcentration: results.overpotentials.concentration * 1000, // mV
          overpotentialTotal: results.overpotentials.total * 1000
        };

        data.push(dataPoint);

        // Encontrar temperatura ótima para eficiência
        if (results.efficiency.theoretical > maxEfficiency) {
          maxEfficiency = results.efficiency.theoretical;
          optimalTempForEfficiency = temp;
        }

        // Encontrar temperatura ótima para menor consumo
        if (results.energy.specificConsumption < minConsumption) {
          minConsumption = results.energy.specificConsumption;
          optimalTempForConsumption = temp;
        }
      } catch (error) {
        console.error(`Erro no cálculo para temperatura ${temp}°C:`, error);
      }
    }

    setAnalysisData(data);
    setOptimalTemp(optimalTempForEfficiency);
    setMinConsumptionTemp(optimalTempForConsumption);

    // Calcular ganhos
    if (data.length > 0) {
      const baselineData = data[0]; // Primeira temperatura
      const optimalData = data.find(d => d.temperature === optimalTempForEfficiency);
      
      if (optimalData && baselineData) {
        const effGain = ((optimalData.efficiency - baselineData.efficiency) / baselineData.efficiency) * 100;
        const energySave = baselineData.energyConsumption - optimalData.energyConsumption;
        
        setEfficiencyGain(effGain);
        setEnergySavings(energySave);
      }
    }
  };

  // Executar análise inicial
  useEffect(() => {
    runTemperatureAnalysis();
  }, [electrolyzerType, pressure, currentDensity, voltage, concentration, minTemp, maxTemp, tempStep]);

  // Função para exportar dados
  const exportData = () => {
    if (analysisData.length === 0) return;

    const csvContent = [
      'Temperatura(°C),Eficiência(%),Produção H2(kg/h),Consumo(kWh/kg),Tensão(V),Ativação(mV),Ôhmica(mV),Concentração(mV),Total(mV)',
      ...analysisData.map(row => 
        `${row.temperature},${row.efficiency.toFixed(2)},${row.hydrogenProduction.toFixed(6)},${row.energyConsumption.toFixed(1)},${row.voltage.toFixed(3)},${row.overpotentialActivation.toFixed(1)},${row.overpotentialOhmic.toFixed(1)},${row.overpotentialConcentration.toFixed(1)},${row.overpotentialTotal.toFixed(1)}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_temperatura_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const optimalData = analysisData.find(d => d.temperature === optimalTemp);
  const minConsumptionData = analysisData.find(d => d.temperature === minConsumptionTemp);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Thermometer className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Efeito da Temperatura na Produção de Hidrogênio</h2>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Análise da influência da temperatura na eficiência energética e produção do eletrolisador
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Parâmetros de Controle
              </CardTitle>
              <CardDescription>
                Configure os parâmetros fixos para a análise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="electrolyzerType">Tipo de Eletrolisador</Label>
                <Select value={electrolyzerType} onValueChange={setElectrolyzerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEM">Membrana de Troca de Prótons</SelectItem>
                    <SelectItem value="Alkaline">Alcalino</SelectItem>
                    <SelectItem value="SOEC">SOEC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="pressure">Pressão (bar)</Label>
                  <Input
                    id="pressure"
                    type="number"
                    value={pressure}
                    onChange={(e) => setPressure(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="currentDensity">Densidade de Corrente (A/cm²)</Label>
                  <Input
                    id="currentDensity"
                    type="number"
                    value={currentDensity}
                    onChange={(e) => setCurrentDensity(Number(e.target.value))}
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="voltage">Tensão (V)</Label>
                  <Input
                    id="voltage"
                    type="number"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="concentration">Concentração (%)</Label>
                  <Input
                    id="concentration"
                    type="number"
                    value={concentration}
                    onChange={(e) => setConcentration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Faixa de Temperatura (°C)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minTemp}
                    onChange={(e) => setMinTemp(Number(e.target.value))}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(Number(e.target.value))}
                  />
                  <Input
                    placeholder="Passo"
                    type="number"
                    value={tempStep}
                    onChange={(e) => setTempStep(Number(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runTemperatureAnalysis} className="w-full">
                Analisar Efeito da Temperatura
              </Button>

              <Button onClick={exportData} variant="outline" className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Área de Resultados */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Temperatura Ótima</p>
                    <p className="text-xl font-bold text-green-800">{optimalTemp}°C</p>
                    <p className="text-xs text-green-600">
                      Eficiência máxima: {optimalData?.efficiency.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700">Menor Consumo</p>
                    <p className="text-xl font-bold text-blue-800">{minConsumptionTemp}°C</p>
                    <p className="text-xs text-blue-600">
                      {minConsumptionData?.energyConsumption.toFixed(1)} kWh/kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-700">Ganho de Eficiência</p>
                    <p className="text-xl font-bold text-purple-800">+{efficiencyGain.toFixed(1)}%</p>
                    <p className="text-xs text-purple-600">
                      Com otimização de temperatura
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-700">Economia Energética</p>
                    <p className="text-xl font-bold text-orange-800">{energySavings.toFixed(2)}</p>
                    <p className="text-xs text-orange-600">
                      kWh/kg poupados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Eficiência vs Temperatura */}
          <Card>
            <CardHeader>
              <CardTitle>Eficiência vs Temperatura</CardTitle>
              <CardDescription>
                Relação entre temperatura operacional e eficiência energética
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="temperature" 
                      label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Eficiência (%)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      name="Eficiência"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center">
                  <p className="text-gray-500">Execute a análise para ver os resultados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Consumo Energético vs Temperatura */}
          <Card>
            <CardHeader>
              <CardTitle>Consumo Energético vs Temperatura</CardTitle>
              <CardDescription>
                Como a temperatura afeta o consumo específico de energia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="temperature" 
                      label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Consumo (kWh/kg)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="energyConsumption" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      name="Consumo Energético"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center">
                  <p className="text-gray-500">Execute a análise para ver os resultados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Análise de Sobretensões vs Temperatura */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Sobretensões vs Temperatura</CardTitle>
              <CardDescription>
                Como a temperatura afeta cada tipo de sobretensão no eletrolisador
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="temperature" 
                      label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Sobretensão (mV)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="overpotentialActivation" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Ativação"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="overpotentialOhmic" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Ôhmica"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="overpotentialConcentration" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Concentração"
                      strokeDasharray="3 3"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="overpotentialTotal" 
                      stroke="#1f2937" 
                      strokeWidth={3}
                      name="Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-400 flex items-center justify-center">
                  <p className="text-gray-500">Execute a análise para ver os resultados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights e Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Insights e Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimalData && minConsumptionData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Otimização de Eficiência</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Temperatura ótima: <strong>{optimalTemp}°C</strong></li>
                        <li>• Eficiência máxima: <strong>{optimalData.efficiency.toFixed(2)}%</strong></li>
                        <li>• Produção: <strong>{optimalData.hydrogenProduction.toFixed(4)} kg/h</strong></li>
                        <li>• Ganho vs temperatura base: <strong>+{efficiencyGain.toFixed(1)}%</strong></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-700">Otimização de Consumo</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Temperatura ótima: <strong>{minConsumptionTemp}°C</strong></li>
                        <li>• Consumo mínimo: <strong>{minConsumptionData.energyConsumption.toFixed(1)} kWh/kg</strong></li>
                        <li>• Economia energética: <strong>{energySavings.toFixed(2)} kWh/kg</strong></li>
                        <li>• Redução de custos operacionais significativa</li>
                      </ul>
                    </div>
                  </div>
                )}

                <Alert>
                  <Thermometer className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recomendação:</strong> Para máxima eficiência, opere o eletrolisador a {optimalTemp}°C. 
                    Para menor consumo energético, considere {minConsumptionTemp}°C. A diferença de {Math.abs(optimalTemp - minConsumptionTemp)}°C 
                    entre as temperaturas ótimas sugere um ponto de equilíbrio para operação otimizada.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemperatureEffect;

