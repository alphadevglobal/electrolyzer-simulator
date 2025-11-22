import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Play, Pause, RotateCcw, Zap, Droplets } from 'lucide-react';

const AnimatedProcessVisualization = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [solarIntensity, setSolarIntensity] = useState(80);
  const [windSpeed, setWindSpeed] = useState(60);
  const [waterFlow, setWaterFlow] = useState(100);
  const [h2Production, setH2Production] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeElapsed(t => t + 1);
      const production = (solarIntensity + windSpeed + waterFlow) / 300;
      setH2Production(prev => prev + production);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, solarIntensity, windSpeed, waterFlow]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setH2Production(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Visualização Animada do Processo - Hidrogênio Verde
            </span>
            <Badge variant="outline" className="text-lg">
              H₂: {h2Production.toFixed(2)} kg
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2"
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
            <div className="flex-1 flex items-center gap-4 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Tempo: {timeElapsed}s</span>
            </div>
          </div>

          <div className="relative w-full bg-gradient-to-b from-sky-200 via-sky-100 to-green-50 rounded-xl p-8 min-h-[600px]">
            <svg
              width="100%"
              height="600"
              viewBox="0 0 1200 600"
              className="w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#87CEEB', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#E0F2FE', stopOpacity: 1 }} />
                </linearGradient>

                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0EA5E9', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#0284C7', stopOpacity: 0.9 }} />
                </linearGradient>

                <linearGradient id="h2Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#16A34A', stopOpacity: 0.9 }} />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <filter id="shadow">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                </filter>
              </defs>

              <rect width="1200" height="600" fill="url(#skyGradient)" />

              <g id="sun" transform="translate(1050, 80)">
                <circle
                  r="40"
                  fill="#FCD34D"
                  filter="url(#glow)"
                  opacity={solarIntensity / 100}
                >
                  {isRunning && (
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur="60s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1="-50"
                    x2="0"
                    y2="-60"
                    stroke="#FCD34D"
                    strokeWidth="3"
                    transform={`rotate(${i * 30})`}
                    opacity={solarIntensity / 100}
                  />
                ))}
              </g>

              <g id="solarPanels" transform="translate(900, 250)">
                <rect
                  x="0"
                  y="0"
                  width="120"
                  height="80"
                  fill="#1E3A8A"
                  stroke="#1E40AF"
                  strokeWidth="2"
                  rx="4"
                  filter="url(#shadow)"
                />
                <g id="cells">
                  {[0, 1, 2].map(row => (
                    [...Array(3)].map((_, col) => (
                      <rect
                        key={`${row}-${col}`}
                        x={10 + col * 35}
                        y={10 + row * 23}
                        width="30"
                        height="20"
                        fill="#3B82F6"
                        stroke="#60A5FA"
                        strokeWidth="1"
                        opacity={0.8 + (solarIntensity / 500)}
                      />
                    ))
                  ))}
                </g>
                <rect x="0" y="80" width="120" height="8" fill="#4B5563" rx="2" />
                <rect x="58" y="88" width="4" height="40" fill="#6B7280" />

                {isRunning && solarIntensity > 30 && (
                  <g id="solarEnergy">
                    <line
                      x1="60"
                      y1="128"
                      x2="60"
                      y2="200"
                      stroke="#FCD34D"
                      strokeWidth="3"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        values="0,100;100,0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.9;0.3"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </line>
                  </g>
                )}
              </g>

              <g id="windTurbine" transform="translate(150, 180)">
                <rect x="48" y="100" width="4" height="150" fill="#E5E7EB" filter="url(#shadow)" />
                <rect x="44" y="250" width="12" height="30" fill="#9CA3AF" rx="2" />
                <circle cx="50" cy="100" r="12" fill="#374151" />
                <g id="blades">
                  {[0, 120, 240].map((angle, i) => (
                    <ellipse
                      key={i}
                      cx="50"
                      cy="100"
                      rx="4"
                      ry="50"
                      fill="#F3F4F6"
                      stroke="#9CA3AF"
                      strokeWidth="1"
                      transform={`rotate(${angle} 50 100)`}
                      filter="url(#shadow)"
                    >
                      {isRunning && (
                        <animateTransform
                          attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from={`${angle} 50 100`}
                          to={`${angle + 360} 50 100`}
                          dur={`${5 - windSpeed / 30}s`}
                          repeatCount="indefinite"
                        />
                      )}
                    </ellipse>
                  ))}
                </g>

                {isRunning && windSpeed > 30 && (
                  <line
                    x1="50"
                    y1="280"
                    x2="50"
                    y2="350"
                    stroke="#60A5FA"
                    strokeWidth="3"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,100;100,0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </g>

              <g id="waterTank" transform="translate(50, 400)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="120"
                  fill="url(#waterGradient)"
                  stroke="#0369A1"
                  strokeWidth="3"
                  rx="4"
                  filter="url(#shadow)"
                />
                <rect
                  x="0"
                  y={120 - (waterFlow / 100) * 120}
                  width="80"
                  height={(waterFlow / 100) * 120}
                  fill="#0EA5E9"
                  opacity="0.6"
                >
                  {isRunning && (
                    <animate
                      attributeName="y"
                      values={`${120 - (waterFlow / 100) * 120};${120 - (waterFlow / 100) * 120 - 5};${120 - (waterFlow / 100) * 120}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </rect>
                <text x="40" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  H₂O
                </text>

                {isRunning && waterFlow > 30 && (
                  <line
                    x1="80"
                    y1="60"
                    x2="200"
                    y2="60"
                    stroke="#0EA5E9"
                    strokeWidth="4"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,150;150,0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </g>

              <g id="electrolyzer" transform="translate(400, 350)">
                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="180"
                  fill="#1F2937"
                  stroke="#374151"
                  strokeWidth="3"
                  rx="8"
                  filter="url(#shadow)"
                />

                <rect x="10" y="20" width="180" height="60" fill="#374151" rx="4" />
                <text x="100" y="55" textAnchor="middle" fill="#60A5FA" fontSize="16" fontWeight="bold">
                  ELETROLISADOR
                </text>

                <rect x="30" y="100" width="60" height="70" fill="#DC2626" opacity="0.3" rx="4" />
                <text x="60" y="140" textAnchor="middle" fill="#EF4444" fontSize="12">Anodo</text>

                <rect x="110" y="100" width="60" height="70" fill="#3B82F6" opacity="0.3" rx="4" />
                <text x="140" y="140" textAnchor="middle" fill="#60A5FA" fontSize="12">Catodo</text>

                {isRunning && (
                  <>
                    <g id="bubbles">
                      {[...Array(6)].map((_, i) => (
                        <circle
                          key={`o2-${i}`}
                          cx={60 + Math.random() * 20 - 10}
                          cy="170"
                          r="3"
                          fill="#EF4444"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="cy"
                            from="170"
                            to="100"
                            dur={`${1 + Math.random()}s`}
                            repeatCount="indefinite"
                            begin={`${i * 0.2}s`}
                          />
                          <animate
                            attributeName="opacity"
                            from="0.6"
                            to="0"
                            dur={`${1 + Math.random()}s`}
                            repeatCount="indefinite"
                            begin={`${i * 0.2}s`}
                          />
                        </circle>
                      ))}
                      {[...Array(6)].map((_, i) => (
                        <circle
                          key={`h2-${i}`}
                          cx={140 + Math.random() * 20 - 10}
                          cy="170"
                          r="3"
                          fill="#22C55E"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="cy"
                            from="170"
                            to="100"
                            dur={`${1 + Math.random()}s`}
                            repeatCount="indefinite"
                            begin={`${i * 0.2}s`}
                          />
                          <animate
                            attributeName="opacity"
                            from="0.6"
                            to="0"
                            dur={`${1 + Math.random()}s`}
                            repeatCount="indefinite"
                            begin={`${i * 0.2}s`}
                          />
                        </circle>
                      ))}
                    </g>

                    <rect x="95" y="100" width="10" height="70" fill="#FCD34D" opacity="0.4">
                      <animate
                        attributeName="opacity"
                        values="0.2;0.6;0.2"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </rect>
                  </>
                )}

                {isRunning && (
                  <line
                    x1="200"
                    y1="130"
                    x2="300"
                    y2="130"
                    stroke="#22C55E"
                    strokeWidth="6"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,120;120,0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </g>

              <g id="h2Storage" transform="translate(900, 380)">
                <ellipse cx="50" cy="100" rx="50" ry="20" fill="#4B5563" filter="url(#shadow)" />
                <rect x="0" y="20" width="100" height="80" fill="#6B7280" filter="url(#shadow)" />
                <ellipse cx="50" cy="20" rx="50" ry="20" fill="#9CA3AF" />

                <ellipse
                  cx="50"
                  cy={100 - (h2Production / 10) * 60}
                  rx="48"
                  ry="18"
                  fill="url(#h2Gradient)"
                  opacity="0.7"
                />
                <rect
                  x="2"
                  y={100 - (h2Production / 10) * 60}
                  width="96"
                  height={(h2Production / 10) * 60}
                  fill="url(#h2Gradient)"
                  opacity="0.6"
                />

                <text x="50" y="65" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                  H₂
                </text>
                <text x="50" y="85" textAnchor="middle" fill="white" fontSize="11">
                  {h2Production.toFixed(1)} kg
                </text>
              </g>

              {isRunning && (
                <g id="energyFlows">
                  <circle cx="100" cy="350" r="8" fill="#FCD34D" opacity="0.8">
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to="300 0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
                  </circle>

                  <circle cx="960" cy="268" r="8" fill="#FCD34D" opacity="0.8">
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      from="0 0"
                      to="-460 160"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <span className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">☀️</span>
                Intensidade Solar: {solarIntensity}%
              </label>
              <Slider
                value={[solarIntensity]}
                onValueChange={([value]) => setSolarIntensity(value)}
                min={0}
                max={100}
                step={1}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">💨</span>
                Velocidade do Vento: {windSpeed}%
              </label>
              <Slider
                value={[windSpeed]}
                onValueChange={([value]) => setWindSpeed(value)}
                min={0}
                max={100}
                step={1}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Droplets className="w-5 h-5 text-blue-500" />
                Fluxo de Água: {waterFlow} L/h
              </label>
              <Slider
                value={[waterFlow]}
                onValueChange={([value]) => setWaterFlow(value)}
                min={0}
                max={200}
                step={5}
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-3 text-green-800">Como funciona:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex gap-2">
                <span className="text-yellow-600 font-bold">1.</span>
                <span>Painéis solares e turbinas eólicas geram eletricidade renovável</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Água é bombeada para o eletrolisador</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>Corrente elétrica separa H₂O em H₂ (catodo) e O₂ (anodo)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <span>H₂ é coletado, comprimido e armazenado para uso</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimatedProcessVisualization;
