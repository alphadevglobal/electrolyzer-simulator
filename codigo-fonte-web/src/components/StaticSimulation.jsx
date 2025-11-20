import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calculator, Zap, Droplets, TrendingUp, DollarSign, AlertTriangle, Info, Download } from 'lucide-react';

import { simulateElectrolyzer, validateParameters, ELECTROLYZER_PARAMS } from '../lib/calculations';
import { calculateTemperatureEffects, generateTemperatureChartData, calculateOptimalTemperature } from '../lib/temperatureEffects';
import { predictWithAWS, checkAWSHealth } from '../lib/awsApi';

const StaticSimulation = () => {
  const [electrolyzerType, setElectrolyzerType] = useState('PEM');
  const [parameters, setParameters] = useState({
    temperature: 60,
    pressure: 2.0,
    concentration: 30,
    currentDensity: 1.5,
    electrodeArea: 100,
    voltage: 2.0,
    molality: 6.0 // Adicionado molalidade padrão
  });
  const [results, setResults] = useState(null);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [isCalculating, setIsCalculating] = useState(false);
  const [temperatureData, setTemperatureData] = useState(null);
  const [optimalTemp, setOptimalTemp] = useState(null);
  const [awsStatus, setAwsStatus] = useState('checking');
  const [remotePrediction, setRemotePrediction] = useState(null);
  const [isSyncingAws, setIsSyncingAws] = useState(false);
  const [awsError, setAwsError] = useState(null);

  // Atualizar parâmetros quando o tipo de eletrolisador muda
  useEffect(() => {
    const params = ELECTROLYZER_PARAMS[electrolyzerType];
    if (params) {
      setParameters(prev => ({
        ...prev,
        temperature: (params.minTemp + params.maxTemp) / 2,
        currentDensity: (params.minCurrentDensity + params.maxCurrentDensity) / 2
      }));
    }
  }, [electrolyzerType]);

  useEffect(() => {
    let isMounted = true;

    checkAWSHealth()
      .then(() => {
        if (isMounted) {
          setAwsStatus('online');
        }
      })
      .catch(() => {
        if (isMounted) {
          setAwsStatus('offline');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleParameterChange = (key, value) => {
    const numValue = parseFloat(value.replace(
      /,/g, "."
    ));
    setParameters(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? (key === 'temperature' ? 60 : 0) : numValue // Default para 60 se temperatura, senão 0
    }));
  };

  const calculateResults = () => {
    setIsCalculating(true);
    
    try {
      // Validar parâmetros
      const validationResult = validateParameters({
        electrolyzerType,
        temperature: parameters.temperature,
        pressure: parameters.pressure,
        currentDensity: parameters.currentDensity,
        area: parameters.electrodeArea,
        voltage: parameters.voltage,
        molality: parameters.molality
      });
      setValidation(validationResult);

      if (validationResult.isValid) {
        // Calcular resultados
        const simulationResults = simulateElectrolyzer({
          electrolyzerType,
          temperature: parameters.temperature,
          pressure: parameters.pressure,
          currentDensity: parameters.currentDensity,
          area: parameters.electrodeArea,
          voltage: parameters.voltage,
          molality: parameters.molality
        });
        setResults(simulationResults);

        // Calcular efeitos da temperatura
        calculateTemperatureEffects(parameters.temperature, electrolyzerType);
        
        // Gerar dados do gráfico de temperatura
        const electrolyzerParams = ELECTROLYZER_PARAMS[electrolyzerType];
        const tempChartData = generateTemperatureChartData(electrolyzerType, {
          minTemp: electrolyzerParams.minTemp,
          maxTemp: electrolyzerParams.maxTemp
        });
        setTemperatureData(tempChartData);

        // Calcular temperatura ótima
        const optimal = calculateOptimalTemperature(electrolyzerType, {
          minTemp: electrolyzerParams.minTemp,
          maxTemp: electrolyzerParams.maxTemp
        });
        setOptimalTemp(optimal);
      } else {
        setResults(null);
        setTemperatureData(null);
        setOptimalTemp(null);
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      setValidation({
        isValid: false,
        errors: [error.message],
        warnings: []
      });
      setResults(null);
      setTemperatureData(null);
      setOptimalTemp(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = () => {
    if (!results) return;

    const csvData = [
      ['Parâmetro', 'Valor', 'Unidade'],
      ['Tipo de Eletrolisador', electrolyzerType, '-'],
      ['Temperatura', parameters.temperature, '°C'],
      ['Pressão', parameters.pressure, 'bar'],
      ['Densidade de Corrente', parameters.currentDensity, 'A/cm²'],
      ['Área do Eletrodo', parameters.electrodeArea, 'cm²'],
      ['Tensão', parameters.voltage, 'V'],
      ['', '', ''],
      ['Resultados', '', ''],
      ["Produção de H₂", results.production.kgPerHour.toFixed(6).replace(".", ","), "kg/h"],
      ["Eficiência", results.efficiency.value.toFixed(2).replace(".", ","), "%"],
      ["Consumo Específico", results.energy.specificConsumption.toFixed(2).replace(".", ","), "kWh/kg H₂"],
      ["Potência Total", results.energy.totalConsumption.toFixed(3).replace(".", ","), "kW"],
      ["Custo por kg", results.economics.costPerKg.toFixed(2).replace(".", ","), "R$/kg"],
      ["Sobretensão Total", (results.overpotentials.total * 1000).toFixed(1).replace(".", ","), "mV"]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacao_estatica_${electrolyzerType}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = results ? [
    { name: 'Ativação', value: results.overpotentials.activation, color: '#ef4444' },
    { name: 'Ôhmica', value: results.overpotentials.ohmic, color: '#f97316' },
    { name: 'Concentração', value: results.overpotentials.concentration, color: '#eab308' }
  ] : [];

  const featureVector = [
    Number(parameters.temperature) || 0,
    Number(parameters.pressure) || 0,
    Number(parameters.currentDensity) || 0,
    Number(parameters.electrodeArea) || 0,
    Number(parameters.voltage) || 0,
    Number(parameters.molality) || 0
  ];

  const handleSyncWithAws = async () => {
    setIsSyncingAws(true);
    setAwsError(null);
    try {
      const response = await predictWithAWS(featureVector, electrolyzerType);
      setRemotePrediction(response);
      setAwsStatus('online');
    } catch (error) {
      setRemotePrediction(null);
      setAwsStatus('offline');
      setAwsError(error.message);
    } finally {
      setIsSyncingAws(false);
    }
  };

  const statusBadgeStyles = {
    checking: 'bg-blue-100 text-blue-800',
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800'
  };

  const awsStatusLabel = {
    checking: 'Verificando',
    online: 'Online',
    offline: 'Offline'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Simulação Estática</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Entrada */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Parâmetros de Entrada
              </CardTitle>
              <CardDescription>
                Configure os parâmetros operacionais do eletrolisador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Eletrolisador */}
              <div className="space-y-2">
                <Label htmlFor="electrolyzer-type">Tipo de Eletrolisador</Label>
                <Select value={electrolyzerType} onValueChange={setElectrolyzerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ELECTROLYZER_PARAMS).map(([key, params]) => (
                      <SelectItem key={key} value={key}>
                        {params.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  <p>Eletrólito: {ELECTROLYZER_PARAMS[electrolyzerType]?.electrolyte}</p>
                  <p>Eletrodos: {ELECTROLYZER_PARAMS[electrolyzerType]?.electrodes}</p>
                </div>
              </div>

              <Separator />

              {/* Parâmetros Operacionais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={parameters.temperature}
                    onChange={(e) => handleParameterChange('temperature', e.target.value)}
                    min={ELECTROLYZER_PARAMS[electrolyzerType]?.minTemp}
                    max={ELECTROLYZER_PARAMS[electrolyzerType]?.maxTemp}
                  />
                  <div className="text-xs text-muted-foreground">
                    {ELECTROLYZER_PARAMS[electrolyzerType]?.minTemp}°C - {ELECTROLYZER_PARAMS[electrolyzerType]?.maxTemp}°C
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pressure">Pressão (bar)</Label>
                  <Input
                    id="pressure"
                    type="number"
                    step="0.1"
                    value={parameters.pressure}
                    onChange={(e) => handleParameterChange('pressure', e.target.value)}
                    min="1"
                    max="30"
                  />
                  <div className="text-xs text-muted-foreground">1 - 30 bar</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentDensity">Densidade de Corrente (A/cm²)</Label>
                  <Input
                    id="currentDensity"
                    type="number"
                    step="0.1"
                    value={parameters.currentDensity}
                    onChange={(e) => handleParameterChange('currentDensity', e.target.value)}
                    min={ELECTROLYZER_PARAMS[electrolyzerType]?.minCurrentDensity}
                    max={ELECTROLYZER_PARAMS[electrolyzerType]?.maxCurrentDensity}
                  />
                  <div className="text-xs text-muted-foreground">
                    {ELECTROLYZER_PARAMS[electrolyzerType]?.minCurrentDensity} - {ELECTROLYZER_PARAMS[electrolyzerType]?.maxCurrentDensity} A/cm²
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="electrodeArea">Área do Eletrodo (cm²)</Label>
                  <Input
                    id="electrodeArea"
                    type="number"
                    value={parameters.electrodeArea}
                    onChange={(e) => handleParameterChange('electrodeArea', e.target.value)}
                    min="1"
                    max="10000"
                  />
                  <div className="text-xs text-muted-foreground">1 - 10000 cm²</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voltage">Tensão (V)</Label>
                  <Input
                    id="voltage"
                    type="number"
                    step="0.1"
                    value={parameters.voltage}
                    onChange={(e) => handleParameterChange('voltage', e.target.value)}
                    min="1.2"
                    max="3.0"
                  />
                  <div className="text-xs text-muted-foreground">1.2 - 3.0 V</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concentration">Concentração (%)</Label>
                  <Input
                    id="concentration"
                    type="number"
                    value={parameters.concentration}
                    onChange={(e) => handleParameterChange("concentration", e.target.value)}
                    min="10"
                    max="50"
                  />
                  <div className="text-xs text-muted-foreground">10 - 50%</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="molality">Molalidade KOH (mol/kg)</Label>
                  <Input
                    id="molality"
                    type="number"
                    step="0.1"
                    value={parameters.molality}
                    onChange={(e) => handleParameterChange("molality", e.target.value)}
                    min="2"
                    max="18"
                  />
                  <div className="text-xs text-muted-foreground">2 - 18 mol/kg</div>
                </div>
              </div>

              <Button 
                onClick={calculateResults} 
                className="w-full" 
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculando...' : 'Calcular Resultados'}
              </Button>

              {/* Validação */}
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2">
          {results ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="detailed">Detalhado</TabsTrigger>
                <TabsTrigger value="temperature">Temperatura</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
              </TabsList>

              <Card className="border-dashed">
                <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg">Integração AWS Lambda</CardTitle>
                    <CardDescription>
                      Valide este cenário diretamente na API pública implantada em AWS Lambda + API Gateway.
                    </CardDescription>
                  </div>
                  <Badge className={statusBadgeStyles[awsStatus] || statusBadgeStyles.checking}>
                    {awsStatusLabel[awsStatus]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="secondary" onClick={handleSyncWithAws} disabled={isSyncingAws}>
                      {isSyncingAws ? 'Enviando...' : 'Enviar cenário para AWS'}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Endpoint: <span className="font-mono text-xs break-all">{import.meta.env.VITE_AWS_API_URL || 'https://fcxzn6pkr1.execute-api.us-east-1.amazonaws.com/prod'}</span>
                    </div>
                  </div>
                  {remotePrediction && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Classe Prevista</p>
                        <p className="text-lg font-semibold">{remotePrediction.prediction}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Probabilidades</p>
                        <p className="text-lg font-semibold">
                          {remotePrediction.probability?.map((value, index) => `Class ${index}: ${(value * 100).toFixed(1)}%`).join(' | ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Atualizado em</p>
                        <p className="text-lg font-semibold">
                          {remotePrediction.timestamp ? new Date(remotePrediction.timestamp * 1000).toLocaleString('pt-BR') : '--'}
                        </p>
                      </div>
                    </div>
                  )}
                  {awsError && (
                    <p className="text-sm text-red-600">
                      {awsError}
                    </p>
                  )}
                </CardContent>
              </Card>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Produção H₂</p>
                          <p className="text-lg font-bold">{results.production.kgPerHour.toFixed(4).replace(".", ",")} kg/h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Eficiência</p>
                          <p className="text-lg font-bold">{results.efficiency.value.toFixed(1).replace(".", ",")}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Potência</p>
                          <p className="text-lg font-bold">{results.energy.totalConsumption.toFixed(2).replace(".", ",")} kW</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-700" />
                        <div>
                          <p className="text-sm text-muted-foreground">Custo por kg H₂</p>
                          <p className="text-lg font-bold">{results.economics.costPerKg.toFixed(2).replace(".", ",")} R$/kg</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tensão Teórica vs. Real</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: 'Teórica', value: results.energy.theoreticalVoltage, color: '#3b82f6' },
                          { name: 'Real', value: results.energy.actualVoltage, color: '#ef4444' }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Tensão (V)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => `${value.toFixed(2).replace('.', ',')} V`} />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Sobretensões (mV)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Tensão (mV)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => `${(value * 1000).toFixed(1).replace('.', ',')} mV`} />
                          <Legend />
                          <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={exportResults} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Resultados para CSV
                </Button>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Simulação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Produção de Hidrogênio:</strong> {results.production.kgPerHour.toFixed(6).replace('.', ',')} kg/h ({results.production.molesPerSecond.toFixed(4).replace('.', ',')} mol/s)</p>
                    <p><strong>Eficiência Energética:</strong> {results.efficiency.value.toFixed(2).replace('.', ',')}% (Teórica: {results.efficiency.theoretical.toFixed(2).replace('.', ',')}%)</p>
                    <p><strong>Consumo Específico de Energia:</strong> {results.energy.specificConsumption.toFixed(2).replace('.', ',')} kWh/kg H₂</p>
                    <p><strong>Potência Total Consumida:</strong> {results.energy.totalConsumption.toFixed(3).replace('.', ',')} kW</p>
                    <p><strong>Custo por kg de H₂:</strong> {results.economics.costPerKg.toFixed(2).replace('.', ',')} R$/kg</p>
                    <p><strong>Custo Operacional Horário:</strong> {results.economics.hourlyOperatingCost.toFixed(2).replace('.', ',')} R$/h</p>
                    <p><strong>Tensão Teórica:</strong> {results.energy.theoreticalVoltage.toFixed(3).replace('.', ',')} V</p>
                    <p><strong>Tensão Real Aplicada:</strong> {results.energy.actualVoltage.toFixed(3).replace('.', ',')} V</p>
                    <p><strong>Corrente Total:</strong> {results.parameters.totalCurrent.toFixed(3).replace('.', ',')} A</p>
                    <p><strong>Densidade de Potência:</strong> {results.parameters.powerDensity.toFixed(3).replace('.', ',')} kW/cm²</p>
                    <p><strong>Eficiência de Corrente:</strong> {results.parameters.currentEfficiency.toFixed(2).replace('.', ',')}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sobretensões Detalhadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Ativação (Ânodo):</strong> {(results.overpotentials.activationAnode * 1000).toFixed(1).replace('.', ',')} mV</p>
                    <p><strong>Ativação (Cátodo):</strong> {(results.overpotentials.activationCathode * 1000).toFixed(1).replace('.', ',')} mV</p>
                    <p><strong>Ôhmica:</strong> {(results.overpotentials.ohmic * 1000).toFixed(1).replace('.', ',')} mV</p>
                    <p><strong>Concentração:</strong> {(results.overpotentials.concentration * 1000).toFixed(1).replace('.', ',')} mV</p>
                    <p><strong>Total:</strong> {(results.overpotentials.total * 1000).toFixed(1).replace('.', ',')} mV</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="temperature" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Temperatura</CardTitle>
                    <CardDescription>
                      Impacto da temperatura na eficiência e produção de hidrogênio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {temperatureData && temperatureData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={temperatureData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="temperature" label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: -5 }} />
                          <YAxis yAxisId="left" label={{ value: 'Eficiência (%)', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Produção (kg/h)', angle: 90, position: 'insideRight' }} />
                          <Tooltip formatter={(value, name) => {
                            if (name === 'Eficiência') return [`${value.toFixed(2).replace('.', ',')}%`, name];
                            if (name === 'Produção') return [`${value.toFixed(4).replace('.', ',')} kg/h`, name];
                            return value;
                          }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#82ca9d" name="Eficiência" />
                          <Line yAxisId="right" type="monotone" dataKey="production" stroke="#8884d8" name="Produção" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground">Nenhum dado de temperatura disponível para gráfico.</p>
                    )}

                    {optimalTemp && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          A temperatura ótima para este eletrolisador é de <strong>{optimalTemp.toFixed(1).replace('.', ',')}°C</strong>, maximizando a eficiência e/ou produção.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gráficos de Desempenho</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h4 className="text-md font-semibold">Tensão Teórica vs. Real</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: 'Teórica', value: results.energy.theoreticalVoltage, color: '#3b82f6' },
                        { name: 'Real', value: results.energy.actualVoltage, color: '#ef4444' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Tensão (V)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2).replace('.', ',')} V`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>

                    <h4 className="text-md font-semibold">Sobretensões (mV)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Tensão (mV)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${(value * 1000).toFixed(1).replace('.', ',')} mV`} />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground">
              <Info className="h-12 w-12 mb-4" />
              <p className="text-lg">Nenhuma simulação executada</p>
              <p className="text-sm">Configure os parâmetros e clique em "Calcular Resultados" para ver os resultados da simulação.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaticSimulation;
