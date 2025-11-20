import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Info, Zap, Droplet, Wind } from 'lucide-react';

/**
 * Componente de Visualização Eletroquímica Interativa
 * Baseado em simulações educacionais estilo PhET Colorado
 *
 * Referências Científicas:
 * 1. BI et al. (2025) - Efeito da temperatura na eletrólise alcalina
 * 2. EL-SHAFIE (2023) - Tecnologias de produção de hidrogênio
 * 3. Nature (2025) - Degradação de eletrodos de níquel
 */
const ElectrochemicalVisualization = () => {
  // Estados para parâmetros de operação
  const [voltage, setVoltage] = useState(2.0);
  const [temperature, setTemperature] = useState(80);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Estados para degradação do eletrodo
  const [electrodeDegradation, setElectrodeDegradation] = useState(0);
  const [bubbleCount, setBubbleCount] = useState(0);
  const [hydroxideLayer, setHydroxideLayer] = useState(100);

  // Estados para visualização
  const [h2Molecules, setH2Molecules] = useState([]);
  const [o2Molecules, setO2Molecules] = useState([]);
  const [ohIons, setOhIons] = useState([]);
  const [waterMolecules, setWaterMolecules] = useState([]);

  const canvasRef = useRef(null);

  // Inicializa moléculas de água
  useEffect(() => {
    const initialWater = [];
    for (let i = 0; i < 30; i++) {
      initialWater.push({
        id: `h2o_${i}`,
        x: Math.random() * 350 + 25,
        y: Math.random() * 250 + 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        type: 'H2O'
      });
    }
    setWaterMolecules(initialWater);

    // Inicializa íons OH-
    const initialOH = [];
    for (let i = 0; i < 10; i++) {
      initialOH.push({
        id: `oh_${i}`,
        x: Math.random() * 350 + 25,
        y: Math.random() * 250 + 50,
        vx: 0,
        vy: 0,
        type: 'OH-'
      });
    }
    setOhIons(initialOH);
  }, []);

  // Animação principal
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime(t => t + 0.1);

      // Simula degradação progressiva do eletrodo
      // Baseado em: Nature (2025) - "Degradation of nickel electrodes"
      // Fatores: formação de bolhas, oxidação, redução de transferência de O2
      const degradationRate = calculateDegradationRate(voltage, temperature, time);
      setElectrodeDegradation(d => Math.min(100, d + degradationRate));

      // Atualiza camada de hidróxido
      // Referência: Nature (2025) - "More stable hydroxide layer formation"
      const hydroxideStability = calculateHydroxideStability(temperature, electrodeDegradation);
      setHydroxideLayer(hydroxideStability);

      // Simula produção de bolhas
      // Referência: BI et al. (2025) - "Bubble formation in alkaline electrolysis"
      const bubbleRate = calculateBubbleProduction(voltage, temperature);
      setBubbleCount(prev => prev + bubbleRate);

      // Gera novas moléculas de H2 e O2
      if (Math.random() < 0.3) {
        // Cátodo: 2H2O + 2e- → H2 + 2OH-
        setH2Molecules(prev => [...prev, {
          id: `h2_${Date.now()}`,
          x: 50, // Posição do cátodo
          y: 150,
          vy: -1, // Move para cima
          vx: (Math.random() - 0.5) * 0.3,
          size: 1
        }].slice(-20)); // Mantém apenas últimas 20
      }

      if (Math.random() < 0.15) {
        // Ânodo: 2OH- → H2O + 1/2O2 + 2e-
        setO2Molecules(prev => [...prev, {
          id: `o2_${Date.now()}`,
          x: 350, // Posição do ânodo
          y: 150,
          vy: -1,
          vx: (Math.random() - 0.5) * 0.3,
          size: 1.2
        }].slice(-20));
      }

    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, voltage, temperature, time, electrodeDegradation]);

  // Cálculo da taxa de degradação do eletrodo
  // Baseado em: Nature (2025) e ScienceDirect (2024)
  const calculateDegradationRate = (V, T, t) => {
    // Fatores de degradação:
    // 1. Tensão elevada acelera oxidação
    // 2. Temperatura alta aumenta stress térmico
    // 3. Tempo acumula danos
    const voltageStress = Math.max(0, (V - 1.8) * 0.01);
    const thermalStress = (T - 70) / 1000;
    const timeAccumulation = t / 10000;

    return voltageStress + thermalStress + timeAccumulation;
  };

  // Estabilidade da camada de hidróxido
  // Referência: Nature (2025) - "Stable hydroxide layer formation"
  const calculateHydroxideStability = (T, degradation) => {
    // Temperatura ótima: 70-80°C
    const tempFactor = 1 - Math.abs(T - 75) / 100;
    const degradationFactor = 1 - (degradation / 100);
    return Math.max(0, Math.min(100, tempFactor * degradationFactor * 100));
  };

  // Taxa de produção de bolhas
  // Referência: BI et al. (2025) - "Bubble dynamics in electrolysis"
  const calculateBubbleProduction = (V, T) => {
    // Lei de Faraday: produção proporcional à corrente
    // Temperatura aumenta cinética
    const voltageEffect = (V - 1.23) * 0.5; // 1.23V = tensão termodinâmica
    const temperatureEffect = (T / 80);
    return voltageEffect * temperatureEffect * 0.1;
  };

  // Desenha visualização no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha eletrólito (solução KOH)
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, 400, 300);

    // Desenha cátodo (-) - esquerda
    const cathodeDegradation = electrodeDegradation / 100;
    ctx.fillStyle = `rgb(${80 + cathodeDegradation * 100}, ${80 - cathodeDegradation * 30}, 80)`;
    ctx.fillRect(30, 50, 20, 200);

    // Mostra degradação no cátodo
    if (electrodeDegradation > 0) {
      ctx.fillStyle = 'rgba(180, 60, 60, 0.3)';
      ctx.fillRect(30, 50 + (1 - cathodeDegradation) * 200, 20, cathodeDegradation * 200);
    }

    // Label do cátodo
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Cátodo (-)', 25, 35);
    ctx.font = '10px Arial';
    ctx.fillText('2H₂O + 2e⁻ → H₂ + 2OH⁻', 5, 265);

    // Desenha ânodo (+) - direita
    ctx.fillStyle = `rgb(${120 + cathodeDegradation * 80}, ${100 - cathodeDegradation * 40}, 80)`;
    ctx.fillRect(350, 50, 20, 200);

    // Mostra degradação no ânodo
    if (electrodeDegradation > 0) {
      ctx.fillStyle = 'rgba(180, 60, 60, 0.3)';
      ctx.fillRect(350, 50 + (1 - cathodeDegradation) * 200, 20, cathodeDegradation * 200);
    }

    // Label do ânodo
    ctx.fillText('Ânodo (+)', 335, 35);
    ctx.font = '10px Arial';
    ctx.fillText('2OH⁻ → H₂O + ½O₂ + 2e⁻', 305, 265);

    // Desenha camada de hidróxido nos eletrodos
    if (hydroxideLayer > 50) {
      ctx.strokeStyle = `rgba(100, 200, 100, ${hydroxideLayer / 100})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 48, 24, 204);
      ctx.strokeRect(348, 48, 24, 204);
    }

    // Desenha moléculas de água (H2O)
    waterMolecules.forEach(molecule => {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(molecule.x, molecule.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Atualiza posição (movimento browniano)
      molecule.x += molecule.vx + (Math.random() - 0.5) * 0.2;
      molecule.y += molecule.vy + (Math.random() - 0.5) * 0.2;

      // Mantém dentro dos limites
      if (molecule.x < 55) molecule.x = 55;
      if (molecule.x > 345) molecule.x = 345;
      if (molecule.y < 55) molecule.y = 55;
      if (molecule.y > 245) molecule.y = 245;
    });

    // Desenha íons OH-
    ohIons.forEach(ion => {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Íons movem em direção ao ânodo (campo elétrico)
      if (isRunning) {
        ion.x += 0.2;
        if (ion.x > 345) ion.x = 60;
      }
    });

    // Desenha bolhas de H2 (cátodo)
    h2Molecules.forEach((molecule, index) => {
      // Bolhas sobem e aumentam
      molecule.y += molecule.vy;
      molecule.x += molecule.vx;
      molecule.size += 0.02;

      // Desenha bolha
      ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
      ctx.beginPath();
      ctx.arc(molecule.x, molecule.y, molecule.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Remove se sair da tela
      if (molecule.y < 0) {
        h2Molecules.splice(index, 1);
      }
    });

    // Desenha bolhas de O2 (ânodo)
    o2Molecules.forEach((molecule, index) => {
      molecule.y += molecule.vy;
      molecule.x += molecule.vx;
      molecule.size += 0.02;

      ctx.fillStyle = 'rgba(251, 146, 60, 0.6)';
      ctx.beginPath();
      ctx.arc(molecule.x, molecule.y, molecule.size * 3, 0, Math.PI * 2);
      ctx.fill();

      if (molecule.y < 0) {
        o2Molecules.splice(index, 1);
      }
    });

    // Desenha fluxo de elétrons (cátodo para ânodo pelo circuito externo)
    if (isRunning) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      // Linha superior (circuito externo)
      ctx.beginPath();
      ctx.moveTo(50, 40);
      ctx.lineTo(350, 40);
      ctx.stroke();

      // Setas indicando direção do fluxo de elétrons
      ctx.fillStyle = '#eab308';
      for (let i = 100; i < 350; i += 50) {
        const offset = (time * 50) % 50;
        ctx.beginPath();
        ctx.moveTo(i + offset, 35);
        ctx.lineTo(i + offset + 5, 40);
        ctx.lineTo(i + offset, 45);
        ctx.fill();
      }

      ctx.setLineDash([]);
    }

  }, [h2Molecules, o2Molecules, ohIons, waterMolecules, electrodeDegradation, hydroxideLayer, isRunning, time]);

  const resetSimulation = () => {
    setTime(0);
    setElectrodeDegradation(0);
    setHydroxideLayer(100);
    setBubbleCount(0);
    setH2Molecules([]);
    setO2Molecules([]);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Visualização Científica Interativa</strong> - Baseada em simulações educacionais
          estilo PhET Colorado. Esta visualização demonstra os processos eletroquímicos da eletrólise
          alcalina da água, incluindo degradação progressiva dos eletrodos.
        </AlertDescription>
      </Alert>

      {/* Canvas de Visualização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Visualização Eletroquímica em Tempo Real
          </CardTitle>
          <p className="text-sm text-gray-600">
            Observe as reações nos eletrodos, movimento de íons OH⁻ e formação de bolhas de H₂ e O₂
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border-2 border-gray-300 rounded-lg w-full bg-white"
            />

            {/* Legenda */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Moléculas H₂O</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Íons OH⁻</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-300 opacity-60"></div>
                <span>Bolhas H₂</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-300 opacity-60"></div>
                <span>Bolhas O₂</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de Operação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tensão Aplicada: {voltage.toFixed(2)} V</Label>
            <Slider
              value={[voltage]}
              onValueChange={([v]) => setVoltage(v)}
              min={1.23}
              max={3.0}
              step={0.01}
              disabled={isRunning}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Tensão termodinâmica mínima: 1.23 V (25°C)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Temperatura: {temperature}°C</Label>
            <Slider
              value={[temperature]}
              onValueChange={([t]) => setTemperature(t)}
              min={25}
              max={90}
              step={1}
              disabled={isRunning}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Faixa operacional típica: 70-80°C (Alcalino)
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2"
            >
              {isRunning ? 'Pausar' : 'Iniciar'} Simulação
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
            >
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitoramento de Degradação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-red-500" />
            Monitoramento de Degradação do Eletrodo
          </CardTitle>
          <p className="text-sm text-gray-600">
            Baseado em estudos recentes sobre degradação de eletrodos de níquel em eletrólise alcalina
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Degradação Acumulada:</span>
              <span className="font-semibold">{electrodeDegradation.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2.5 rounded-full transition-all"
                style={{ width: `${electrodeDegradation}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              <strong>Fatores:</strong> Formação de bolhas, oxidação superficial, stress térmico
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Estabilidade da Camada de Hidróxido:</span>
              <span className="font-semibold">{hydroxideLayer.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${hydroxideLayer}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              <strong>Referência:</strong> Nature (2025) - Camada mais estável em campos magnéticos
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {bubbleCount.toFixed(1)}
              </div>
              <p className="text-xs text-gray-600">Bolhas Produzidas</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {time.toFixed(1)}s
              </div>
              <p className="text-xs text-gray-600">Tempo de Operação</p>
            </div>
          </div>

          {electrodeDegradation > 80 && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Atenção!</strong> Nível crítico de degradação detectado.
                Redução significativa na eficiência de transferência de O₂ e aumento
                de perdas ôhmicas esperadas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informações Científicas */}
      <Card>
        <CardHeader>
          <CardTitle>Embasamento Científico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">Reações Eletroquímicas:</p>
            <ul className="mt-2 space-y-1 text-blue-800 list-disc list-inside">
              <li><strong>Cátodo:</strong> 2H₂O + 2e⁻ → H₂ + 2OH⁻</li>
              <li><strong>Ânodo:</strong> 2OH⁻ → H₂O + ½O₂ + 2e⁻</li>
              <li><strong>Global:</strong> H₂O → H₂ + ½O₂</li>
            </ul>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="font-semibold text-orange-900">Mecanismos de Degradação:</p>
            <ul className="mt-2 space-y-1 text-orange-800 text-xs list-disc list-inside">
              <li><strong>Formação de bolhas:</strong> Stress mecânico na superfície do eletrodo</li>
              <li><strong>Oxidação:</strong> Degradação química por radicais e H₂O₂</li>
              <li><strong>Corrosão:</strong> Dissolução de material do eletrodo</li>
              <li><strong>Limitações de transporte:</strong> Espessura da camada catalítica impede transferência</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectrochemicalVisualization;
