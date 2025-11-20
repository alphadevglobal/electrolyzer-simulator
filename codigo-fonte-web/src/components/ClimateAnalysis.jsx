import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Snowflake,
  MapPin,
  BarChart3,
  TrendingUp,
  Info,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { simulateElectrolyzer } from '@/lib/calculations';

const ClimateAnalysis = () => {
  const [selectedRegion, setSelectedRegion] = useState('fortaleza');
  const [selectedMonth, setSelectedMonth] = useState('annual');
  const [electrolyzerType, setElectrolyzerType] = useState('Alkaline');
  const [currentDensity, setCurrentDensity] = useState(1.5);
  const molality = 6.0;
  const [area, setArea] = useState(100);
  const [analysisData, setAnalysisData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  // Dados climáticos das regiões (valores médios baseados em dados reais)
  const climateData = useMemo(() => ({
    fortaleza: {
      name: "Fortaleza, Brasil",
      type: "Tropical Costeiro",
      coordinates: "3.7°S, 38.5°W",
      description: "Clima tropical quente e úmido com pouca variação sazonal",
      months: [
        { month: 'Jan', temp: 28.5, humidity: 78, pressure: 1013, solar: 6.2, wind: 4.8 },
        { month: 'Fev', temp: 28.8, humidity: 76, pressure: 1012, solar: 6.5, wind: 4.2 },
        { month: 'Mar', temp: 28.2, humidity: 82, pressure: 1011, solar: 5.8, wind: 3.9 },
        { month: 'Abr', temp: 27.8, humidity: 85, pressure: 1012, solar: 5.4, wind: 3.5 },
        { month: 'Mai', temp: 27.2, humidity: 83, pressure: 1014, solar: 5.1, wind: 3.8 },
        { month: 'Jun', temp: 26.8, humidity: 81, pressure: 1015, solar: 4.9, wind: 4.2 },
        { month: 'Jul', temp: 26.5, humidity: 79, pressure: 1016, solar: 5.2, wind: 4.6 },
        { month: 'Ago', temp: 26.8, humidity: 77, pressure: 1016, solar: 5.8, wind: 5.1 },
        { month: 'Set', temp: 27.5, humidity: 75, pressure: 1015, solar: 6.1, wind: 5.3 },
        { month: 'Out', temp: 28.2, humidity: 74, pressure: 1014, solar: 6.4, wind: 5.0 },
        { month: 'Nov', temp: 28.8, humidity: 76, pressure: 1013, solar: 6.3, wind: 4.7 },
        { month: 'Dez', temp: 28.6, humidity: 77, pressure: 1013, solar: 6.0, wind: 4.5 }
      ],
      annual: { temp: 27.8, humidity: 78, pressure: 1013.7, solar: 5.8, wind: 4.5 }
    },
    germany: {
      name: "Alemanha (Norte)",
      type: "Temperado Oceânico",
      coordinates: "53.5°N, 10.0°E",
      description: "Clima temperado com variações sazonais significativas",
      months: [
        { month: 'Jan', temp: 2.1, humidity: 85, pressure: 1018, solar: 1.2, wind: 6.2 },
        { month: 'Fev', temp: 3.2, humidity: 82, pressure: 1016, solar: 2.1, wind: 6.0 },
        { month: 'Mar', temp: 6.8, humidity: 78, pressure: 1015, solar: 3.5, wind: 5.8 },
        { month: 'Abr', temp: 11.2, humidity: 72, pressure: 1014, solar: 4.8, wind: 5.2 },
        { month: 'Mai', temp: 16.1, humidity: 68, pressure: 1015, solar: 6.2, wind: 4.8 },
        { month: 'Jun', temp: 19.5, humidity: 70, pressure: 1016, solar: 6.8, wind: 4.5 },
        { month: 'Jul', temp: 21.8, humidity: 72, pressure: 1016, solar: 6.5, wind: 4.2 },
        { month: 'Ago', temp: 21.2, humidity: 74, pressure: 1015, solar: 5.8, wind: 4.4 },
        { month: 'Set', temp: 17.5, humidity: 76, pressure: 1016, solar: 4.2, wind: 5.0 },
        { month: 'Out', temp: 12.8, humidity: 80, pressure: 1017, solar: 2.8, wind: 5.5 },
        { month: 'Nov', temp: 7.2, humidity: 84, pressure: 1018, solar: 1.5, wind: 6.0 },
        { month: 'Dez', temp: 3.8, humidity: 86, pressure: 1019, solar: 1.0, wind: 6.2 }
      ],
      annual: { temp: 12.0, humidity: 77, pressure: 1016.3, solar: 3.9, wind: 5.3 }
    },
    australia: {
      name: "Austrália (Pilbara)",
      type: "Desértico Quente",
      coordinates: "20.7°S, 116.8°E",
      description: "Clima desértico árido com altas temperaturas e baixa umidade",
      months: [
        { month: 'Jan', temp: 36.8, humidity: 45, pressure: 1008, solar: 8.5, wind: 3.2 },
        { month: 'Fev', temp: 37.2, humidity: 48, pressure: 1009, solar: 8.2, wind: 3.0 },
        { month: 'Mar', temp: 35.5, humidity: 52, pressure: 1011, solar: 7.8, wind: 2.8 },
        { month: 'Abr', temp: 31.8, humidity: 55, pressure: 1013, solar: 6.9, wind: 2.5 },
        { month: 'Mai', temp: 26.2, humidity: 58, pressure: 1016, solar: 5.8, wind: 2.8 },
        { month: 'Jun', temp: 22.5, humidity: 62, pressure: 1018, solar: 5.2, wind: 3.2 },
        { month: 'Jul', temp: 21.8, humidity: 60, pressure: 1019, solar: 5.5, wind: 3.5 },
        { month: 'Ago', temp: 24.2, humidity: 56, pressure: 1017, solar: 6.8, wind: 3.8 },
        { month: 'Set', temp: 28.5, humidity: 50, pressure: 1015, solar: 7.5, wind: 3.5 },
        { month: 'Out', temp: 32.8, humidity: 46, pressure: 1012, solar: 8.1, wind: 3.2 },
        { month: 'Nov', temp: 35.2, humidity: 44, pressure: 1010, solar: 8.4, wind: 3.0 },
        { month: 'Dez', temp: 36.5, humidity: 43, pressure: 1008, solar: 8.6, wind: 3.1 }
      ],
      annual: { temp: 30.8, humidity: 52, pressure: 1013.0, solar: 7.3, wind: 3.1 }
    },
    norway: {
      name: "Noruega (Oeste)",
      type: "Subártico Oceânico",
      coordinates: "60.4°N, 5.3°E",
      description: "Clima subártico com invernos frios e verões amenos",
      months: [
        { month: 'Jan', temp: -2.8, humidity: 88, pressure: 1015, solar: 0.5, wind: 7.2 },
        { month: 'Fev', temp: -1.5, humidity: 85, pressure: 1013, solar: 1.8, wind: 6.8 },
        { month: 'Mar', temp: 2.1, humidity: 82, pressure: 1012, solar: 3.2, wind: 6.5 },
        { month: 'Abr', temp: 6.8, humidity: 78, pressure: 1013, solar: 4.8, wind: 5.8 },
        { month: 'Mai', temp: 12.5, humidity: 72, pressure: 1014, solar: 6.2, wind: 5.2 },
        { month: 'Jun', temp: 16.2, humidity: 70, pressure: 1015, solar: 6.8, wind: 4.8 },
        { month: 'Jul', temp: 18.5, humidity: 72, pressure: 1015, solar: 6.5, wind: 4.5 },
        { month: 'Ago', temp: 17.8, humidity: 75, pressure: 1014, solar: 5.2, wind: 4.8 },
        { month: 'Set', temp: 13.2, humidity: 78, pressure: 1013, solar: 3.8, wind: 5.5 },
        { month: 'Out', temp: 8.5, humidity: 82, pressure: 1014, solar: 2.2, wind: 6.2 },
        { month: 'Nov', temp: 3.8, humidity: 85, pressure: 1015, solar: 1.0, wind: 6.8 },
        { month: 'Dez', temp: -0.5, humidity: 87, pressure: 1015, solar: 0.3, wind: 7.0 }
      ],
      annual: { temp: 7.9, humidity: 79, pressure: 1014.0, solar: 3.5, wind: 5.9 }
    },
    chile: {
      name: "Chile (Atacama)",
      type: "Desértico Árido",
      coordinates: "24.5°S, 69.2°W",
      description: "Deserto mais árido do mundo com condições extremas",
      months: [
        { month: 'Jan', temp: 22.8, humidity: 25, pressure: 1015, solar: 9.2, wind: 4.2 },
        { month: 'Fev', temp: 22.5, humidity: 28, pressure: 1014, solar: 8.8, wind: 4.0 },
        { month: 'Mar', temp: 21.2, humidity: 32, pressure: 1015, solar: 8.2, wind: 3.8 },
        { month: 'Abr', temp: 18.8, humidity: 35, pressure: 1016, solar: 7.2, wind: 3.5 },
        { month: 'Mai', temp: 15.5, humidity: 38, pressure: 1018, solar: 6.1, wind: 3.2 },
        { month: 'Jun', temp: 12.8, humidity: 42, pressure: 1020, solar: 5.5, wind: 3.0 },
        { month: 'Jul', temp: 12.2, humidity: 40, pressure: 1021, solar: 5.8, wind: 3.2 },
        { month: 'Ago', temp: 14.5, humidity: 36, pressure: 1019, solar: 6.8, wind: 3.5 },
        { month: 'Set', temp: 17.2, humidity: 32, pressure: 1017, solar: 7.8, wind: 3.8 },
        { month: 'Out', temp: 19.8, humidity: 28, pressure: 1016, solar: 8.5, wind: 4.0 },
        { month: 'Nov', temp: 21.5, humidity: 26, pressure: 1015, solar: 9.0, wind: 4.2 },
        { month: 'Dez', temp: 22.2, humidity: 24, pressure: 1015, solar: 9.3, wind: 4.3 }
      ],
      annual: { temp: 18.4, humidity: 32, pressure: 1016.8, solar: 7.7, wind: 3.7 }
    }
  }), []);

  // Função para calcular desempenho do eletrolisador
  const calculatePerformance = (temperature, humidity, pressure, electrolyzerType, currentDensity, area, molality) => {
    try {
      // Ajustar temperatura para efeitos de tropicalização
      const adjustedTemp = temperature + (humidity > 70 ? 2 : 0); // Efeito da umidade alta
      
      const results = simulateElectrolyzer({
        electrolyzerType,
        temperature: adjustedTemp,
        currentDensity,
        pressure: pressure / 1013.25, // Converter para atm
        molality,
        area,
        voltage: 2.0
      });

      return {
        temperature: adjustedTemp,
        humidity,
        pressure,
        efficiency: results.efficiency.theoretical,
        hydrogenProduction: results.production.kgPerHour,
        energyConsumption: results.energy.specificConsumption,
        voltage: results.energy.actualVoltage,
        power: results.energy.actualVoltage * currentDensity * area
      };
    } catch (error) {
      console.error('Erro no cálculo:', error);
      return null;
    }
  };

  // Função para executar análise
  const runAnalysis = useCallback(() => {
    const region = climateData[selectedRegion];
    
    if (selectedMonth === 'annual') {
      // Análise anual
      const data = region.months.map(monthData => {
        const performance = calculatePerformance(
          monthData.temp,
          monthData.humidity,
          monthData.pressure,
          electrolyzerType,
          currentDensity,
          area,
          molality
        );
        
        return {
          month: monthData.month,
          ...monthData,
          ...performance
        };
      });
      
      setAnalysisData(data);
    } else {
      // Análise de mês específico
      const monthData = region.months.find(m => m.month === selectedMonth);
      if (monthData) {
        const performance = calculatePerformance(
          monthData.temp,
          monthData.humidity,
          monthData.pressure,
          electrolyzerType,
          currentDensity,
          area,
          molality
        );
        
        setAnalysisData([{
          month: monthData.month,
          ...monthData,
          ...performance
        }]);
      }
    }
  }, [selectedRegion, selectedMonth, climateData, electrolyzerType, currentDensity, area, molality]);

  // Função para comparar regiões
  const compareRegions = useCallback(() => {
    const comparison = Object.keys(climateData).map(regionKey => {
      const region = climateData[regionKey];
      const performance = calculatePerformance(
        region.annual.temp,
        region.annual.humidity,
        region.annual.pressure,
        electrolyzerType,
        currentDensity,
        area,
        molality
      );
      
      return {
        region: region.name,
        type: region.type,
        ...region.annual,
        ...performance
      };
    });
    
    setComparisonData(comparison);
  }, [climateData, electrolyzerType, currentDensity, area, molality]);

  // Executar análise inicial
  useEffect(() => {
    runAnalysis();
    compareRegions();
  }, [runAnalysis, compareRegions]);

  // Função para exportar dados
  const exportData = () => {
    const dataToExport = analysisData.length > 0 ? analysisData : comparisonData;
    if (dataToExport.length === 0) return;

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_climatica_${selectedRegion}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentRegion = climateData[selectedRegion];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Análise Climática Regional</h2>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta análise considera os efeitos de tropicalização e variações climáticas regionais no desempenho de eletrolisadores. 
          Fortaleza apresenta condições únicas de alta umidade e temperatura constante que afetam significativamente a operação.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure os parâmetros para análise climática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="region">Região</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fortaleza">Fortaleza, Brasil</SelectItem>
                    <SelectItem value="germany">Alemanha (Norte)</SelectItem>
                    <SelectItem value="australia">Austrália (Pilbara)</SelectItem>
                    <SelectItem value="norway">Noruega (Oeste)</SelectItem>
                    <SelectItem value="chile">Chile (Atacama)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="month">Período</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Análise Anual</SelectItem>
                    <SelectItem value="Jan">Janeiro</SelectItem>
                    <SelectItem value="Fev">Fevereiro</SelectItem>
                    <SelectItem value="Mar">Março</SelectItem>
                    <SelectItem value="Abr">Abril</SelectItem>
                    <SelectItem value="Mai">Maio</SelectItem>
                    <SelectItem value="Jun">Junho</SelectItem>
                    <SelectItem value="Jul">Julho</SelectItem>
                    <SelectItem value="Ago">Agosto</SelectItem>
                    <SelectItem value="Set">Setembro</SelectItem>
                    <SelectItem value="Out">Outubro</SelectItem>
                    <SelectItem value="Nov">Novembro</SelectItem>
                    <SelectItem value="Dez">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="electrolyzerType">Tipo de Eletrolisador</Label>
                <Select value={electrolyzerType} onValueChange={setElectrolyzerType}>
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
                <Label htmlFor="currentDensity">Densidade de Corrente (A/cm²)</Label>
                <Input
                  id="currentDensity"
                  type="number"
                  value={currentDensity}
                  onChange={(e) => setCurrentDensity(Number(e.target.value))}
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="area">Área (cm²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                />
              </div>

              <Button onClick={exportData} variant="outline" className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
            </CardContent>
          </Card>

          {/* Informações da Região */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {currentRegion.name}
              </CardTitle>
              <CardDescription>
                {currentRegion.coordinates}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="mb-2">{currentRegion.type}</Badge>
              <p className="text-sm text-gray-600">{currentRegion.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  <span>{currentRegion.annual.temp.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span>{currentRegion.annual.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sun className="h-3 w-3" />
                  <span>{currentRegion.annual.solar} h/dia</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  <span>{currentRegion.annual.wind} m/s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de Resultados */}
        <div className="lg:col-span-3 space-y-6">
          {/* Gráfico de Variação Anual */}
          {analysisData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Variação Anual - {currentRegion.name}</CardTitle>
                <CardDescription>
                  Desempenho do eletrolisador ao longo do ano considerando variações climáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="hydrogenProduction" stroke="#22c55e" name="Produção H₂ (kg/h)" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#3b82f6" name="Eficiência (%)" />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" name="Temperatura (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Comparação Regional */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação Regional</CardTitle>
              <CardDescription>
                Desempenho médio anual dos eletrolisadores em diferentes regiões climáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparisonData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={comparisonData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="region" />
                    <PolarRadiusAxis />
                    <Radar name="Eficiência (%)" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Produção H₂" dataKey="hydrogenProduction" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Região/Mês</th>
                      <th className="text-left p-2">Temp (°C)</th>
                      <th className="text-left p-2">Umidade (%)</th>
                      <th className="text-left p-2">Eficiência (%)</th>
                      <th className="text-left p-2">Produção H₂ (kg/h)</th>
                      <th className="text-left p-2">Consumo (kWh/kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analysisData.length > 0 ? analysisData : comparisonData).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{row.month || row.region}</td>
                        <td className="p-2">{row.temperature?.toFixed(1) || row.temp?.toFixed(1)}</td>
                        <td className="p-2">{row.humidity}</td>
                        <td className="p-2">{row.efficiency?.toFixed(1)}</td>
                        <td className="p-2">{row.hydrogenProduction?.toFixed(4)}</td>
                        <td className="p-2">{row.energyConsumption?.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Insights de Tropicalização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights de Tropicalização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Thermometer className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fortaleza:</strong> A alta umidade (78%) e temperatura constante (27.8°C) criam condições únicas que afetam 
                    a transferência de calor e podem requerer sistemas de resfriamento mais eficientes.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Vantagens do Clima Tropical</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Temperatura operacional elevada naturalmente</li>
                      <li>• Menor necessidade de aquecimento inicial</li>
                      <li>• Operação mais estável ao longo do ano</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Desafios a Considerar</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Corrosão acelerada pela umidade</li>
                      <li>• Necessidade de resfriamento adicional</li>
                      <li>• Manutenção mais frequente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClimateAnalysis;
