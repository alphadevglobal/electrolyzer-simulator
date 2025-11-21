import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Gauge,
  Thermometer,
  Zap,
  Droplets,
  Wind,
  Activity,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

// Dimensões do canvas (constantes globais)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

/**
 * Classe para partículas interativas
 * Movida para fora do componente para evitar recriação a cada render
 */
class Particle {
  constructor(x, y, type, vx = 0, vy = 0) {
    this.x = x;
    this.y = y;
    this.type = type; // 'H2O', 'OH-', 'H+', 'O2', 'H2', 'e-'
    this.vx = vx;
    this.vy = vy;
    this.radius = type === 'e-' ? 2 : type.includes('bubble') ? 8 : 4;
    this.charge = type === 'OH-' ? -1 : type === 'H+' ? 1 : 0;
    this.id = Math.random();
    this.isDraggable = true;
    this.isBeingDragged = false;
    this.age = 0;
    this.lifetime = type.includes('bubble') ? 3000 : Infinity;
  }

  update(dt, electricField, temperature, showElectricField = false) {
    if (this.isBeingDragged) return;

    // Movimento browniano (intensidade depende da temperatura)
    const brownianIntensity = (temperature / 100) * 0.5;
    this.vx += (Math.random() - 0.5) * brownianIntensity;
    this.vy += (Math.random() - 0.5) * brownianIntensity;

    // Força elétrica nos íons
    if (this.charge !== 0 && showElectricField) {
      const fieldStrength = electricField * 0.01;
      this.vx += this.charge * fieldStrength;
    }

    // Gravidade inversa para bolhas
    if (this.type.includes('bubble')) {
      this.vy -= 0.5; // Bolhas sobem
    }

    // Limite de velocidade
    const maxSpeed = 2;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // Atualizar posição
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Reflexão nas bordas
    if (this.x < 20) {
      this.x = 20;
      this.vx *= -0.8;
    }
    if (this.x > CANVAS_WIDTH - 20) {
      this.x = CANVAS_WIDTH - 20;
      this.vx *= -0.8;
    }
    if (this.y < 20) {
      this.y = 20;
      this.vy *= -0.8;
    }
    if (this.y > CANVAS_HEIGHT - 20) {
      this.y = CANVAS_HEIGHT - 20;
      this.vy *= -0.8;
    }

    // Envelhecimento
    this.age += dt * 16.67; // Assumindo 60fps
  }

    draw(ctx, zoom, pan) {
      const x = (this.x + pan.x) * zoom;
      const y = (this.y + pan.y) * zoom;
      const radius = this.radius * zoom;

      ctx.save();

      // Cores e estilos por tipo
      switch (this.type) {
        case 'H2O':
          ctx.fillStyle = showMolecules ? 'rgba(59, 130, 246, 0.7)' : 'transparent';
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
          break;
        case 'OH-':
          ctx.fillStyle = showMolecules ? 'rgba(249, 115, 22, 0.7)' : 'transparent';
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.9)';
          break;
        case 'H+':
          ctx.fillStyle = showMolecules ? 'rgba(34, 197, 94, 0.7)' : 'transparent';
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
          break;
        case 'H2-bubble':
          ctx.fillStyle = showBubbles ? 'rgba(147, 197, 253, 0.5)' : 'transparent';
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          break;
        case 'O2-bubble':
          ctx.fillStyle = showBubbles ? 'rgba(251, 146, 60, 0.5)' : 'transparent';
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
          break;
        case 'e-':
          ctx.fillStyle = showElectrons ? 'rgba(234, 179, 8, 0.9)' : 'transparent';
          ctx.strokeStyle = 'rgba(202, 138, 4, 1)';
          break;
        default:
          ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
      }

      // Desenhar partícula
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label da partícula (apenas se zoom > 1.5)
      if (zoom > 1.5 && this.type !== 'e-') {
        ctx.fillStyle = '#000';
        ctx.font = `${10 * zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.replace('-bubble', ''), x, y);
      }

      // Indicador de carga
      if (this.charge !== 0 && zoom > 1.2) {
        ctx.fillStyle = this.charge > 0 ? '#22c55e' : '#ef4444';
        ctx.font = `bold ${8 * zoom}px Arial`;
        ctx.fillText(this.charge > 0 ? '+' : '-', x + radius, y - radius);
      }

      // Highlight se sendo arrastado
      if (this.isBeingDragged) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    isPointInside(px, py, zoom, pan) {
      const x = (this.x + pan.x) * zoom;
      const y = (this.y + pan.y) * zoom;
      const radius = this.radius * zoom;
      const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
      return dist <= radius + 5;
    }
  }

  // Inicialização de partículas
  useEffect(() => {
    const initParticles = () => {
      const newWaterMolecules = [];
      const newHydroxideIons = [];

      // Criar moléculas de água
      for (let i = 0; i < 40; i++) {
        newWaterMolecules.push(
          new Particle(
            Math.random() * (ANODE_X - CATHODE_X - 100) + CATHODE_X + 50,
            Math.random() * (ELECTRODE_HEIGHT - 100) + ELECTRODE_Y + 50,
            'H2O',
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
          )
        );
      }

      // Criar íons OH-
      const numOH = Math.floor(kOHConcentration / 2);
      for (let i = 0; i < numOH; i++) {
        newHydroxideIons.push(
          new Particle(
            Math.random() * (ANODE_X - CATHODE_X - 100) + CATHODE_X + 50,
            Math.random() * (ELECTRODE_HEIGHT - 100) + ELECTRODE_Y + 50,
            'OH-',
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          )
        );
      }

      setWaterMolecules(newWaterMolecules);
      setHydroxideIons(newHydroxideIons);
    };

    initParticles();
  }, [kOHConcentration]);

  // Loop principal de animação
  useEffect(() => {
    if (!isRunning) return;

    const dt = animationSpeed;
    const electricField = (voltage - 1.23) * 100; // Campo elétrico proporcional ao overpotencial

    const animate = () => {
      setTime(t => t + dt);

      // Atualizar moléculas de água
      setWaterMolecules(prev =>
        prev.map(p => {
          p.update(dt, electricField, temperature);
          return p;
        })
      );

      // Atualizar íons OH-
      setHydroxideIons(prev =>
        prev.map(p => {
          p.update(dt, electricField, temperature);

          // Reação no ânodo: OH- → O2 + e-
          if (p.x > ANODE_X - 40 && Math.random() < 0.002 * current / 10) {
            // Criar bolha de O2
            setOxygenBubbles(bubbles => [
              ...bubbles.slice(-30),
              new Particle(ANODE_X - 15, p.y, 'O2-bubble', 0, -1)
            ]);

            // Criar elétron
            setElectrons(elecs => [
              ...elecs.slice(-50),
              new Particle(ANODE_X, p.y, 'e-', 2, 0)
            ]);

            // Remover íon OH-
            p.lifetime = 0;
          }

          return p;
        }).filter(p => p.lifetime > 0 || p.lifetime === Infinity)
      );

      // Atualizar bolhas de H2 no cátodo
      setWaterMolecules(prev =>
        prev.map(p => {
          // Reação no cátodo: 2H2O + 2e- → H2 + 2OH-
          if (p.x < CATHODE_X + 40 && Math.random() < 0.001 * current / 10) {
            // Criar bolha de H2
            setHydrogenBubbles(bubbles => [
              ...bubbles.slice(-30),
              new Particle(CATHODE_X + 15, p.y, 'H2-bubble', 0, -1)
            ]);

            // Criar íons OH-
            setHydroxideIons(ions => [
              ...ions,
              new Particle(p.x + 10, p.y, 'OH-', -0.5, 0)
            ]);
          }
          return p;
        })
      );

      // Atualizar bolhas de H2
      setHydrogenBubbles(prev =>
        prev
          .map(p => {
            p.update(dt, 0, temperature);
            return p;
          })
          .filter(p => p.age < p.lifetime && p.y > 0)
      );

      // Atualizar bolhas de O2
      setOxygenBubbles(prev =>
        prev
          .map(p => {
            p.update(dt, 0, temperature);
            return p;
          })
          .filter(p => p.age < p.lifetime && p.y > 0)
      );

      // Atualizar elétrons (movem do ânodo para o cátodo pelo circuito externo)
      setElectrons(prev =>
        prev
          .map(p => {
            // Elétrons se movem para a esquerda (circuito externo)
            if (p.x > CATHODE_X) {
              p.x -= 3 * dt * (current / 10);
              // Movimento circular no topo
              if (p.x > ANODE_X - 50 && p.y > ELECTRODE_Y) {
                p.y -= 2 * dt * (current / 10);
              }
              if (p.x < CATHODE_X + 50 && p.y < ELECTRODE_Y + ELECTRODE_HEIGHT) {
                p.y += 2 * dt * (current / 10);
              }
            } else {
              p.lifetime = 0;
            }
            return p;
          })
          .filter(p => p.lifetime > 0 || p.lifetime === Infinity)
      );

      // Calcular métricas em tempo real
      const faradayConstant = 96485; // C/mol
      const hydrogenRate = (current * 3600) / (2 * faradayConstant); // mol/h
      const oxygenRate = hydrogenRate / 2; // mol/h
      const hydrogenKg = (hydrogenRate * 2.016) / 1000; // kg/h
      const oxygenKg = (oxygenRate * 32) / 1000; // kg/h
      const powerW = voltage * current;
      const efficiencyCalc = (33.3 / (powerW / hydrogenKg)) * 100;
      const heatW = powerW * (1 - efficiencyCalc / 100);

      setHydrogenProduction(hydrogenKg);
      setOxygenProduction(oxygenKg);
      setPower(powerW);
      setEfficiency(efficiencyCalc);
      setHeatGenerated(heatW);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, animationSpeed, voltage, current, temperature, showElectricField]);

  // Renderização do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Fundo (solução de KOH)
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, CANVAS_WIDTH / zoom, CANVAS_HEIGHT / zoom);

    // Gradiente de temperatura (se ativado)
    if (showTemperatureGradient) {
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH / zoom, 0);
      const tempNormalized = temperature / 100;
      gradient.addColorStop(0, `rgba(59, 130, 246, ${0.3 - tempNormalized * 0.2})`);
      gradient.addColorStop(1, `rgba(239, 68, 68, ${tempNormalized * 0.3})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH / zoom, CANVAS_HEIGHT / zoom);
    }

    // Linhas de campo elétrico (se ativado)
    if (showElectricField) {
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.lineWidth = 1;
      for (let y = ELECTRODE_Y; y < ELECTRODE_Y + ELECTRODE_HEIGHT; y += 20) {
        ctx.beginPath();
        ctx.moveTo(CATHODE_X + ELECTRODE_WIDTH, y);
        ctx.lineTo(ANODE_X, y);
        ctx.stroke();

        // Setas indicando direção do campo
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
        for (let x = CATHODE_X + ELECTRODE_WIDTH + 50; x < ANODE_X; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 10, y - 3);
          ctx.lineTo(x + 10, y + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Desenhar cátodo (-)
    const cathodeDegradation = Math.min(time / 10000, 0.3);
    ctx.fillStyle = `rgb(${80 + cathodeDegradation * 100}, ${80 - cathodeDegradation * 30}, 80)`;
    ctx.fillRect(CATHODE_X, ELECTRODE_Y, ELECTRODE_WIDTH, ELECTRODE_HEIGHT);

    // Label do cátodo
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CÁTODO (-)', CATHODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y - 10);
    ctx.font = '12px Arial';
    ctx.fillText('2H₂O + 2e⁻ → H₂ + 2OH⁻', CATHODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y + ELECTRODE_HEIGHT + 20);

    // Desenhar ânodo (+)
    const anodeDegradation = Math.min(time / 10000, 0.3);
    ctx.fillStyle = `rgb(${120 + anodeDegradation * 80}, ${100 - anodeDegradation * 40}, 80)`;
    ctx.fillRect(ANODE_X, ELECTRODE_Y, ELECTRODE_WIDTH, ELECTRODE_HEIGHT);

    // Label do ânodo
    ctx.fillText('ÂNODO (+)', ANODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y - 10);
    ctx.fillText('2OH⁻ → H₂O + ½O₂ + 2e⁻', ANODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y + ELECTRODE_HEIGHT + 20);

    // Circuito externo (linha conectando eletrodos)
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CATHODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y);
    ctx.lineTo(CATHODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y - 30);
    ctx.lineTo(ANODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y - 30);
    ctx.lineTo(ANODE_X + ELECTRODE_WIDTH / 2, ELECTRODE_Y);
    ctx.stroke();

    // Fonte de tensão (símbolo)
    ctx.fillStyle = '#404040';
    ctx.fillRect((CATHODE_X + ANODE_X) / 2 - 30, ELECTRODE_Y - 50, 60, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage.toFixed(1)}V`, (CATHODE_X + ANODE_X) / 2, ELECTRODE_Y - 30);

    ctx.restore();

    // Desenhar todas as partículas (sem transformação de zoom/pan - elas já aplicam internamente)
    waterMolecules.forEach(p => p.draw(ctx, zoom, pan));
    hydroxideIons.forEach(p => p.draw(ctx, zoom, pan));
    hydrogenBubbles.forEach(p => p.draw(ctx, zoom, pan));
    oxygenBubbles.forEach(p => p.draw(ctx, zoom, pan));
    electrons.forEach(p => p.draw(ctx, zoom, pan));

    // Medidores visuais (sempre no topo, sem zoom)
    if (showMeasurements) {
      ctx.save();
      // Voltímetro
      drawMeter(ctx, 20, 20, 120, 80, 'V', voltage.toFixed(2), '#eab308', 0, 3);

      // Amperímetro
      drawMeter(ctx, 20, 110, 120, 80, 'A', current.toFixed(1), '#3b82f6', 0, 50);

      // Termômetro
      drawMeter(ctx, 20, 200, 120, 80, '°C', temperature.toFixed(0), '#ef4444', 20, 100);

      // Produção de H2
      drawMeter(ctx, 20, 290, 120, 80, 'H₂', (hydrogenProduction * 1000).toFixed(2) + ' g/h', '#22c55e', 0, 100);

      // Eficiência
      drawMeter(ctx, 20, 380, 120, 80, 'η', efficiency.toFixed(1) + '%', '#8b5cf6', 0, 100);

      ctx.restore();
    }

    // Informações do tempo
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Tempo: ${(time / 10).toFixed(1)}s`, CANVAS_WIDTH - 20, 30);
    ctx.fillText(`Velocidade: ${animationSpeed.toFixed(1)}x`, CANVAS_WIDTH - 20, 50);
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, CANVAS_WIDTH - 20, 70);
    ctx.restore();
  }, [
    waterMolecules,
    hydroxideIons,
    hydrogenBubbles,
    oxygenBubbles,
    electrons,
    zoom,
    pan,
    voltage,
    current,
    temperature,
    time,
    animationSpeed,
    showMolecules,
    showElectrons,
    showBubbles,
    showElectricField,
    showTemperatureGradient,
    showMeasurements,
    hydrogenProduction,
    efficiency
  ]);

  // Função para desenhar medidores
  const drawMeter = (ctx, x, y, width, height, label, value, color, min, max) => {
    ctx.save();

    // Fundo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // Label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y + 18);

    // Valor
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = color;
    ctx.fillText(value, x + width / 2, y + 45);

    // Barra de progresso (se min e max definidos)
    if (max > min) {
      const progress = ((parseFloat(value) - min) / (max - min)) * 100;
      const barWidth = (width - 20) * (progress / 100);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x + 10, y + 55, barWidth, 10);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  };

  // Manipuladores de mouse para interatividade
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verificar se clicou em alguma partícula
    const allParticles = [
      ...waterMolecules,
      ...hydroxideIons,
      ...hydrogenBubbles,
      ...oxygenBubbles
    ];

    for (let p of allParticles) {
      if (p.isPointInside(x, y, zoom, pan) && p.isDraggable) {
        setIsDragging(true);
        setDraggedElement(p);
        p.isBeingDragged = true;
        break;
      }
    }

    setMousePos({ x, y });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedElement) {
      // Mover a partícula arrastada
      const dx = (x - mousePos.x) / zoom;
      const dy = (y - mousePos.y) / zoom;
      draggedElement.x += dx;
      draggedElement.y += dy;
      draggedElement.vx = 0;
      draggedElement.vy = 0;
    }

    setMousePos({ x, y });
  };

  const handleMouseUp = () => {
    if (draggedElement) {
      draggedElement.isBeingDragged = false;
    }
    setIsDragging(false);
    setDraggedElement(null);
  };

  // Controles
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setHydrogenBubbles([]);
    setOxygenBubbles([]);
    setElectrons([]);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    // Reinicializar partículas
    window.location.reload(); // Simplificado para demo
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Simulação Interativa Estilo PhET Colorado:</strong> Arraste partículas, ajuste parâmetros
          em tempo real, controle zoom e velocidade. Visualize processos eletroquímicos ao nível molecular!
        </AlertDescription>
      </Alert>

      {/* Canvas Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Visualização Molecular Interativa
            </span>
            <div className="flex gap-2">
              <Badge variant={isRunning ? 'default' : 'secondary'}>
                {isRunning ? 'Em Execução' : 'Pausado'}
              </Badge>
              <Badge variant="outline">
                {waterMolecules.length + hydroxideIons.length} moléculas
              </Badge>
              <Badge variant="outline">
                {hydrogenBubbles.length + oxygenBubbles.length} bolhas
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={containerRef}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-300 rounded-lg w-full bg-white cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </CardContent>
      </Card>

      {/* Controles Principais */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Controles de Simulação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Controles de Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2"
                variant={isRunning ? 'destructive' : 'default'}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Iniciar
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Resetar
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Velocidade da Animação: {animationSpeed.toFixed(1)}x</Label>
              <Slider
                value={[animationSpeed]}
                onValueChange={([v]) => setAnimationSpeed(v)}
                min={0.1}
                max={5}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Zoom: {(zoom * 100).toFixed(0)}%</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                  className="flex items-center gap-1"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Slider
                  value={[zoom]}
                  onValueChange={([z]) => setZoom(z)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                  className="flex items-center gap-1"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Camadas de Visualização */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-semibold">Camadas de Visualização:</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Button
                  variant={showMolecules ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMolecules(!showMolecules)}
                  className="flex items-center gap-2 justify-start"
                >
                  {showMolecules ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Moléculas
                </Button>
                <Button
                  variant={showBubbles ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowBubbles(!showBubbles)}
                  className="flex items-center gap-2 justify-start"
                >
                  {showBubbles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Bolhas
                </Button>
                <Button
                  variant={showElectrons ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowElectrons(!showElectrons)}
                  className="flex items-center gap-2 justify-start"
                >
                  {showElectrons ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Elétrons
                </Button>
                <Button
                  variant={showElectricField ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowElectricField(!showElectricField)}
                  className="flex items-center gap-2 justify-start"
                >
                  {showElectricField ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Campo Elétrico
                </Button>
                <Button
                  variant={showTemperatureGradient ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowTemperatureGradient(!showTemperatureGradient)}
                  className="flex items-center gap-2 justify-start"
                >
                  {showTemperatureGradient ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Gradiente Térmico
                </Button>
                <Button
                  variant={showMeasurements ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className="flex items-center gap-2 justify-start"
                >
                  {showMeasurements ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Medidores
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parâmetros Físicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Parâmetros Físicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Tensão: {voltage.toFixed(2)} V
              </Label>
              <Slider
                value={[voltage]}
                onValueChange={([v]) => setVoltage(v)}
                min={1.23}
                max={3.0}
                step={0.01}
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500">
                Tensão termodinâmica mínima: 1.23 V
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Corrente: {current.toFixed(1)} A
              </Label>
              <Slider
                value={[current]}
                onValueChange={([c]) => setCurrent(c)}
                min={1}
                max={50}
                step={0.5}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-600" />
                Temperatura: {temperature} °C
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={([t]) => setTemperature(t)}
                min={20}
                max={100}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500">
                Afeta movimento browniano das partículas
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-purple-600" />
                Pressão: {pressure} bar
              </Label>
              <Slider
                value={[pressure]}
                onValueChange={([p]) => setPressure(p)}
                min={1}
                max={50}
                step={1}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                Concentração KOH: {kOHConcentration}%
              </Label>
              <Slider
                value={[kOHConcentration]}
                onValueChange={([c]) => setKOHConcentration(c)}
                min={10}
                max={40}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-gray-500">
                Afeta número de íons OH⁻ disponíveis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {(hydrogenProduction * 1000).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">H₂ (g/h)</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {(oxygenProduction * 1000).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">O₂ (g/h)</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {power.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Potência (W)</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {efficiency.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Eficiência</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {heatGenerated.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Calor (W)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveElectrolyzerPhET;
