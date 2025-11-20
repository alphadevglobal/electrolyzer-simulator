import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Building2,
  Sparkles,
  Ruler,
  TrendingUp,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BusinessModel = () => {
  // Estados para configuração geométrica
  const [membraneArea, setMembraneArea] = useState(100); // cm²
  const [numberOfCells, setNumberOfCells] = useState(10);
  const [electrodeGap, setElectrodeGap] = useState(2); // mm
  const [currentDensity, setCurrentDensity] = useState(2.0); // A/cm²
  const [operatingHours, setOperatingHours] = useState(8000); // horas/ano

  // Estados para custos CAPEX
  const [stackCostPerKW, setStackCostPerKW] = useState(800); // USD/kW
  const [bopCostMultiplier, setBopCostMultiplier] = useState(1.5); // % do stack cost
  const [installationCostPercent, setInstallationCostPercent] = useState(20); // % do total
  const [landCost, setLandCost] = useState(50000); // USD

  // Estados para custos OPEX
  const [electricityCost, setElectricityCost] = useState(0.08); // USD/kWh
  const [waterCost, setWaterCost] = useState(2.0); // USD/m³
  const [maintenancePercent, setMaintenancePercent] = useState(3); // % CAPEX/ano
  const [laborCost, setLaborCost] = useState(60000); // USD/ano

  // Estados calculados
  const [results, setResults] = useState({
    geometry: {},
    performance: {},
    capex: {},
    opex: {},
    economics: {}
  });

  // Cálculos principais
  useEffect(() => {
    const calculateAll = () => {
    // 1. Cálculos Geométricos
    const totalActiveArea = membraneArea * numberOfCells; // cm²
    const stackVolume = (membraneArea * electrodeGap * numberOfCells) / 1000; // litros
    const totalCurrent = currentDensity * membraneArea; // A
    const cellVoltage = 1.8; // V (aproximado para eletrólise alcalina)
    const stackPower = (totalCurrent * cellVoltage * numberOfCells) / 1000; // kW

    // 2. Cálculos de Performance
    // Lei de Faraday: n = (I * t) / (z * F)
    const faradayConstant = 96485; // C/mol
    const hydrogenProductionRate = (totalCurrent * 3600) / (2 * faradayConstant); // mol/h
    const hydrogenProductionKgH = (hydrogenProductionRate * 2.016) / 1000; // kg/h
    const annualProduction = hydrogenProductionKgH * operatingHours; // kg/ano

    // Consumo específico de energia
    const specificEnergyConsumption = stackPower / hydrogenProductionKgH; // kWh/kg H2

    // Eficiência termodinâmica (baseado em LHV do H2 = 33.3 kWh/kg)
    const theoreticalEfficiency = (33.3 / specificEnergyConsumption) * 100;

    // Efeitos da geometria na eficiência
    const gapEfficiencyLoss = (electrodeGap - 1.5) * 2; // % loss por mm acima do ideal
    const areaTemperatureBonus = membraneArea > 50 ? Math.min(5, (membraneArea - 50) / 20) : 0;
    const adjustedEfficiency = theoreticalEfficiency - gapEfficiencyLoss + areaTemperatureBonus;

    // 3. Cálculos CAPEX
    const stackCost = stackPower * stackCostPerKW;
    const bopCost = stackCost * bopCostMultiplier;
    const equipmentTotal = stackCost + bopCost;
    const installationCost = equipmentTotal * (installationCostPercent / 100);
    const totalCAPEX = equipmentTotal + installationCost + landCost;

    // 4. Cálculos OPEX
    const annualElectricityCost = specificEnergyConsumption * annualProduction * electricityCost;

    // Água: ~9 litros por kg de H2 produzido (estequiométrico)
    const annualWaterConsumption = annualProduction * 9; // litros
    const annualWaterCost = (annualWaterConsumption / 1000) * waterCost;

    const annualMaintenanceCost = totalCAPEX * (maintenancePercent / 100);
    const totalAnnualOPEX = annualElectricityCost + annualWaterCost + annualMaintenanceCost + laborCost;

    // 5. Cálculos Econômicos
    const lcoh = (totalCAPEX / 20 + totalAnnualOPEX) / annualProduction; // USD/kg (assumindo 20 anos)

    // Receita assumindo preço de venda do H2
    const h2SellingPrice = 5.0; // USD/kg (hidrogênio verde médio)
    const annualRevenue = annualProduction * h2SellingPrice;
    const annualProfit = annualRevenue - totalAnnualOPEX;
    const paybackPeriod = totalCAPEX / annualProfit; // anos
    const roi = (annualProfit / totalCAPEX) * 100; // % ao ano

    // Break-even price
    const breakEvenPrice = totalAnnualOPEX / annualProduction;

    setResults({
      geometry: {
        totalActiveArea,
        stackVolume,
        totalCurrent,
        stackPower,
        powerDensity: stackPower / (stackVolume / 1000), // kW/m³
      },
      performance: {
        hydrogenProductionKgH,
        annualProduction,
        specificEnergyConsumption,
        theoreticalEfficiency,
        adjustedEfficiency,
        gapEfficiencyLoss,
        areaTemperatureBonus,
      },
      capex: {
        stackCost,
        bopCost,
        equipmentTotal,
        installationCost,
        landCost,
        totalCAPEX,
        capexPerKW: totalCAPEX / stackPower,
      },
      opex: {
        annualElectricityCost,
        annualWaterCost,
        annualMaintenanceCost,
        laborCost,
        totalAnnualOPEX,
        opexPerKg: totalAnnualOPEX / annualProduction,
      },
      economics: {
        lcoh,
        h2SellingPrice,
        annualRevenue,
        annualProfit,
        paybackPeriod,
        roi,
        breakEvenPrice,
      }
    });
    };

    calculateAll();
  }, [
    membraneArea, numberOfCells, electrodeGap, currentDensity, operatingHours,
    stackCostPerKW, bopCostMultiplier, installationCostPercent, landCost,
    electricityCost, waterCost, maintenancePercent, laborCost
  ]);

  // Dados para gráficos
  const capexBreakdown = [
    { name: 'Stack', value: results.capex.stackCost || 0, color: '#3b82f6' },
    { name: 'BoP', value: results.capex.bopCost || 0, color: '#8b5cf6' },
    { name: 'Instalação', value: results.capex.installationCost || 0, color: '#f59e0b' },
    { name: 'Terreno', value: results.capex.landCost || 0, color: '#10b981' },
  ];

  const opexBreakdown = [
    { name: 'Eletricidade', value: results.opex.annualElectricityCost || 0, color: '#ef4444' },
    { name: 'Água', value: results.opex.annualWaterCost || 0, color: '#06b6d4' },
    { name: 'Manutenção', value: results.opex.annualMaintenanceCost || 0, color: '#f59e0b' },
    { name: 'Mão de Obra', value: results.opex.laborCost || 0, color: '#8b5cf6' },
  ];

  // Simulação de diferentes geometrias para comparação
  const geometryComparison = [
    { config: 'Pequena (50cm², 5 células)', area: 50, cells: 5, production: 0.012, capex: 45000, opex: 8500 },
    { config: 'Média (100cm², 10 células)', area: 100, cells: 10, production: 0.024, capex: 80000, opex: 15000 },
    { config: 'Grande (200cm², 20 células)', area: 200, cells: 20, production: 0.050, capex: 150000, opex: 28000 },
    { config: 'Industrial (500cm², 50 células)', area: 500, cells: 50, production: 0.125, capex: 350000, opex: 65000 },
  ].map(item => ({
    ...item,
    lcoh: ((item.capex / 20 + item.opex) / (item.production * operatingHours)).toFixed(2),
    roi: ((item.production * operatingHours * 5 - item.opex) / item.capex * 100).toFixed(1)
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <DollarSign className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise de Negócios e Geometria</h2>
          <p className="text-muted-foreground">
            Análise completa de dimensões espaciais, CAPEX, OPEX e viabilidade econômica
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Esta ferramenta considera como as dimensões geométricas (área da membrana,
          distância entre eletrodos, número de células) impactam a temperatura, pressão, eficiência e,
          consequentemente, os custos CAPEX e OPEX do seu projeto de eletrolisador.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="geometry">Geometria</TabsTrigger>
          <TabsTrigger value="capex">CAPEX</TabsTrigger>
          <TabsTrigger value="opex">OPEX</TabsTrigger>
          <TabsTrigger value="economics">Economia</TabsTrigger>
        </TabsList>

        {/* Tab 1: Configuração de Parâmetros */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Parâmetros Geométricos
                </CardTitle>
                <CardDescription>
                  Configure as dimensões físicas do eletrolisador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Área da Membrana: {membraneArea} cm²</Label>
                  <Input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={membraneArea}
                    onChange={(e) => setMembraneArea(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Maior área = melhor distribuição de temperatura, mas maior custo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Número de Células: {numberOfCells}</Label>
                  <Input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={numberOfCells}
                    onChange={(e) => setNumberOfCells(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Stack com mais células = maior produção, maior CAPEX
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Distância entre Eletrodos: {electrodeGap} mm</Label>
                  <Input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={electrodeGap}
                    onChange={(e) => setElectrodeGap(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Gap menor = menor resistência ôhmica, mas dificulta fluxo de gases
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Densidade de Corrente: {currentDensity} A/cm²</Label>
                  <Input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.1"
                    value={currentDensity}
                    onChange={(e) => setCurrentDensity(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Maior corrente = maior produção, mas menor eficiência
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Parâmetros Operacionais e Econômicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Horas de Operação/Ano: {operatingHours}h</Label>
                  <Input
                    type="range"
                    min="1000"
                    max="8760"
                    step="100"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo do Stack: ${stackCostPerKW}/kW</Label>
                  <Input
                    type="number"
                    value={stackCostPerKW}
                    onChange={(e) => setStackCostPerKW(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Multiplicador BoP: {bopCostMultiplier}x</Label>
                  <Input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={bopCostMultiplier}
                    onChange={(e) => setBopCostMultiplier(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instalação: {installationCostPercent}% do Equipamento</Label>
                  <Input
                    type="range"
                    min="10"
                    max="30"
                    step="1"
                    value={installationCostPercent}
                    onChange={(e) => setInstallationCostPercent(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo de Terreno: ${landCost}</Label>
                  <Input
                    type="number"
                    step="1000"
                    value={landCost}
                    onChange={(e) => setLandCost(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo de Eletricidade: ${electricityCost}/kWh</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={electricityCost}
                    onChange={(e) => setElectricityCost(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo de Água: ${waterCost}/m³</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={waterCost}
                    onChange={(e) => setWaterCost(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mão de Obra Anual: ${laborCost}</Label>
                  <Input
                    type="number"
                    step="1000"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Manutenção Anual: {maintenancePercent}% CAPEX</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={maintenancePercent}
                    onChange={(e) => setMaintenancePercent(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Análise Geométrica */}
        <TabsContent value="geometry" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {results.geometry.totalActiveArea?.toFixed(1)} cm²
                </div>
                <p className="text-sm text-gray-600">Área Ativa Total</p>
                <p className="text-xs text-gray-500 mt-2">
                  {membraneArea} cm² × {numberOfCells} células
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600">
                  {results.geometry.stackVolume?.toFixed(2)} L
                </div>
                <p className="text-sm text-gray-600">Volume do Stack</p>
                <p className="text-xs text-gray-500 mt-2">
                  Gap: {electrodeGap} mm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600">
                  {results.geometry.stackPower?.toFixed(2)} kW
                </div>
                <p className="text-sm text-gray-600">Potência do Stack</p>
                <p className="text-xs text-gray-500 mt-2">
                  {results.geometry.powerDensity?.toFixed(1)} kW/m³
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impacto da Geometria na Eficiência</CardTitle>
              <CardDescription>
                Como as dimensões afetam o desempenho do eletrolisador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-sm mb-3">Efeitos Positivos:</h3>
                  <div className="space-y-2 text-sm">
                    {results.performance.areaTemperatureBonus > 0 && (
                      <div className="flex items-start gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Bônus de Área Grande</p>
                          <p className="text-xs">+{results.performance.areaTemperatureBonus?.toFixed(1)}% de eficiência por melhor distribuição térmica</p>
                        </div>
                      </div>
                    )}
                    {electrodeGap <= 1.5 && (
                      <div className="flex items-start gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Gap Otimizado</p>
                          <p className="text-xs">Distância ideal entre eletrodos minimiza perdas ôhmicas</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3">Efeitos Negativos:</h3>
                  <div className="space-y-2 text-sm">
                    {results.performance.gapEfficiencyLoss > 0 && (
                      <div className="flex items-start gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Perda por Gap Elevado</p>
                          <p className="text-xs">-{results.performance.gapEfficiencyLoss?.toFixed(1)}% por resistência ôhmica elevada</p>
                        </div>
                      </div>
                    )}
                    {membraneArea < 50 && (
                      <div className="flex items-start gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Área Pequena</p>
                          <p className="text-xs">Distribuição de temperatura não uniforme pode reduzir eficiência</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Eficiência Teórica:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {results.performance.theoreticalEfficiency?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Eficiência Ajustada (com geometria):</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.performance.adjustedEfficiency?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparação de Configurações Geométricas</CardTitle>
              <CardDescription>
                Análise de diferentes tamanhos e suas implicações econômicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Configuração</th>
                      <th className="p-2 text-right">Produção (kg/h)</th>
                      <th className="p-2 text-right">CAPEX</th>
                      <th className="p-2 text-right">OPEX/ano</th>
                      <th className="p-2 text-right">LCOH ($/kg)</th>
                      <th className="p-2 text-right">ROI (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {geometryComparison.map((item, index) => (
                      <tr key={index} className={
                        item.area === membraneArea && item.cells === numberOfCells
                          ? 'bg-blue-50 font-semibold'
                          : ''
                      }>
                        <td className="p-2">{item.config}</td>
                        <td className="p-2 text-right">{item.production.toFixed(3)}</td>
                        <td className="p-2 text-right">${(item.capex / 1000).toFixed(0)}k</td>
                        <td className="p-2 text-right">${(item.opex / 1000).toFixed(0)}k</td>
                        <td className="p-2 text-right">${item.lcoh}</td>
                        <td className="p-2 text-right">{item.roi}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Configuração atual destacada em azul. LCOH = Levelized Cost of Hydrogen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Análise CAPEX */}
        <TabsContent value="capex" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">
                  ${(results.capex.stackCost / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">Stack</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">
                  ${(results.capex.bopCost / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">BoP</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-600">
                  ${(results.capex.installationCost / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">Instalação</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">
                  ${(results.capex.totalCAPEX / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">CAPEX Total</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${results.capex.capexPerKW?.toFixed(0)}/kW
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição do CAPEX</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={capexBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {capexBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Custos CAPEX</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-blue-50 rounded">
                  <span>Stack do Eletrolisador ({results.geometry.stackPower?.toFixed(1)} kW × ${stackCostPerKW}/kW)</span>
                  <span className="font-semibold">${results.capex.stackCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 rounded">
                  <span>Balance of Plant - BoP (Retificador, Compressor, etc.)</span>
                  <span className="font-semibold">${results.capex.bopCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-orange-50 rounded">
                  <span>Instalação e Comissionamento ({installationCostPercent}% do equipamento)</span>
                  <span className="font-semibold">${results.capex.installationCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded">
                  <span>Terreno e Infraestrutura</span>
                  <span className="font-semibold">${results.capex.landCost?.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between p-3 bg-gray-100 rounded font-bold text-base">
                  <span>CAPEX Total</span>
                  <span className="text-green-600">${results.capex.totalCAPEX?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Análise OPEX */}
        <TabsContent value="opex" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-600">
                  ${(results.opex.annualElectricityCost / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">Eletricidade/ano</p>
                <p className="text-xs text-gray-500">
                  {(results.performance.specificEnergyConsumption * results.performance.annualProduction)?.toFixed(0)} kWh
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-cyan-600">
                  ${results.opex.annualWaterCost?.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">Água/ano</p>
                <p className="text-xs text-gray-500">
                  {(results.performance.annualProduction * 9)?.toFixed(0)} L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-600">
                  ${(results.opex.annualMaintenanceCost / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">Manutenção/ano</p>
                <p className="text-xs text-gray-500">
                  {maintenancePercent}% do CAPEX
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-500">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-600">
                  ${(results.opex.totalAnnualOPEX / 1000)?.toFixed(1)}k
                </div>
                <p className="text-sm text-gray-600">OPEX Total/ano</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${results.opex.opexPerKg?.toFixed(2)}/kg H₂
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição do OPEX Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={opexBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {opexBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produção e Consumo Anual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {results.performance.annualProduction?.toFixed(0)} kg
                  </div>
                  <p className="text-sm text-gray-600">Produção Anual de H₂</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {results.performance.hydrogenProductionKgH?.toFixed(3)} kg/h × {operatingHours}h
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.performance.specificEnergyConsumption?.toFixed(1)} kWh/kg
                  </div>
                  <p className="text-sm text-gray-600">Consumo Específico</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Teórico ideal: 33.3 kWh/kg (LHV)
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {results.performance.adjustedEfficiency?.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Eficiência do Sistema</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Incluindo efeitos geométricos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Análise Econômica */}
        <TabsContent value="economics" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-500">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600">
                  ${results.economics.lcoh?.toFixed(2)}/kg
                </div>
                <p className="text-sm text-gray-600">LCOH (Custo Nivelado)</p>
                <p className="text-xs text-gray-500 mt-2">
                  Inclui amortização CAPEX (20 anos) + OPEX
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600">
                  {results.economics.paybackPeriod?.toFixed(1)} anos
                </div>
                <p className="text-sm text-gray-600">Período de Payback</p>
                <p className="text-xs text-gray-500 mt-2">
                  Tempo para recuperar investimento inicial
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600">
                  {results.economics.roi?.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">ROI Anual</p>
                <p className="text-xs text-gray-500 mt-2">
                  Retorno sobre investimento
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Viabilidade Econômica</CardTitle>
              <CardDescription>
                Assumindo venda de H₂ a ${results.economics.h2SellingPrice}/kg (hidrogênio verde)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Receitas e Custos Anuais</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-green-50 rounded">
                      <span>Receita Anual</span>
                      <span className="font-semibold text-green-600">
                        ${(results.economics.annualRevenue / 1000)?.toFixed(1)}k
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-50 rounded">
                      <span>OPEX Anual</span>
                      <span className="font-semibold text-red-600">
                        -${(results.opex.totalAnnualOPEX / 1000)?.toFixed(1)}k
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span className="font-semibold">Lucro Operacional Anual</span>
                      <span className={`font-bold ${results.economics.annualProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(results.economics.annualProfit / 1000)?.toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Indicadores de Viabilidade</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {results.economics.roi > 15 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : results.economics.roi > 8 ? (
                        <Info className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {results.economics.roi > 15 ? 'Excelente ROI' :
                           results.economics.roi > 8 ? 'ROI Moderado' :
                           'ROI Baixo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {results.economics.roi > 15 ? 'Projeto muito atrativo para investidores' :
                           results.economics.roi > 8 ? 'Projeto viável mas com retorno moderado' :
                           'Projeto pode não ser atrativo financeiramente'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {results.economics.paybackPeriod < 7 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : results.economics.paybackPeriod < 12 ? (
                        <Info className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {results.economics.paybackPeriod < 7 ? 'Payback Rápido' :
                           results.economics.paybackPeriod < 12 ? 'Payback Aceitável' :
                           'Payback Longo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {results.economics.paybackPeriod < 7 ? 'Recuperação de investimento em tempo excelente' :
                           results.economics.paybackPeriod < 12 ? 'Recuperação em tempo razoável' :
                           'Recuperação pode levar muito tempo'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ponto de Equilíbrio:</strong> O preço mínimo de venda do H₂ para cobrir
                  apenas os custos operacionais (sem amortizar CAPEX) é ${results.economics.breakEvenPrice?.toFixed(2)}/kg.
                  Para ter lucro, o preço de venda deve estar acima do LCOH de ${results.economics.lcoh?.toFixed(2)}/kg.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Sensibilidade: Impacto do Preço de Venda</CardTitle>
              <CardDescription>
                Como variações no preço do H₂ afetam a viabilidade do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { price: 3, profit: (3 * results.performance.annualProduction - results.opex.totalAnnualOPEX) / 1000 },
                      { price: 4, profit: (4 * results.performance.annualProduction - results.opex.totalAnnualOPEX) / 1000 },
                      { price: 5, profit: (5 * results.performance.annualProduction - results.opex.totalAnnualOPEX) / 1000 },
                      { price: 6, profit: (6 * results.performance.annualProduction - results.opex.totalAnnualOPEX) / 1000 },
                      { price: 7, profit: (7 * results.performance.annualProduction - results.opex.totalAnnualOPEX) / 1000 },
                      { price: 8, profit: (8 * results.performance.annualProduction - results.opex.totalAnnualOPEX) / 1000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="price"
                      label={{ value: 'Preço de Venda H₂ ($/kg)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      label={{ value: 'Lucro Anual ($k)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip formatter={(value) => `$${value?.toFixed(1)}k`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Lucro Operacional"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Gráfico mostra apenas lucro operacional (não inclui amortização do CAPEX).
                Linha verde acima de zero indica operação lucrativa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações para Otimização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                {results.economics.lcoh > 5 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>LCOH Elevado:</strong> Considere aumentar o número de células ou
                      otimizar a geometria para aumentar produção e diluir custos fixos.
                    </AlertDescription>
                  </Alert>
                )}

                {results.performance.adjustedEfficiency < 70 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Baixa Eficiência:</strong> Reduza o gap entre eletrodos e otimize
                      a área da membrana para melhorar distribuição térmica.
                    </AlertDescription>
                  </Alert>
                )}

                {results.economics.roi < 10 && results.economics.roi > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>ROI Moderado:</strong> Considere negociar melhor preço de venda do H₂
                      ou buscar financiamento subsidiado para reduzir custo de capital.
                    </AlertDescription>
                  </Alert>
                )}

                {membraneArea < 100 && numberOfCells < 20 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Escala Pequena:</strong> Sistemas maiores tendem a ter melhor economia de escala.
                      Considere aumentar capacidade se houver demanda.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessModel;
