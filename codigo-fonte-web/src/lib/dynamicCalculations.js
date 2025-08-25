import { simulateElectrolyzer, ELECTROLYZER_PARAMS } from "./calculations";

/**
 * Cria um perfil de tempo padrão para simulação dinâmica.
 * @returns {Array} Array de objetos com parâmetros de simulação para cada ponto no tempo.
 */
export function createDefaultTimeProfile() {
  return [
    {
      time: 0,
      temperature: 60,
      pressure: 2.0,
      currentDensity: 1.5,
      electrodeArea: 100,
      voltage: 2.0,
      molality: 6.0,
    },
    {
      time: 3600, // 1 hora
      temperature: 65,
      pressure: 2.1,
      currentDensity: 1.6,
      electrodeArea: 100,
      voltage: 2.1,
      molality: 6.0,
    },
    {
      time: 7200, // 2 horas
      temperature: 70,
      pressure: 2.2,
      currentDensity: 1.7,
      electrodeArea: 100,
      voltage: 2.2,
      molality: 6.0,
    },
  ];
}

/**
 * Simula o eletrolisador ao longo do tempo com base em um perfil de tempo.
 * @param {string} electrolyzerType - Tipo do eletrolisador.
 * @param {Array} timeProfile - Array de objetos com parâmetros de simulação para cada ponto no tempo.
 * @returns {Array} Resultados da simulação para cada ponto no tempo.
 */
export function simulateElectrolyzerDynamic(electrolyzerType, timeProfile) {
  const results = [];
  let accumulatedHydrogenMass = 0;

  for (let i = 0; i < timeProfile.length; i++) {
    const currentPoint = timeProfile[i];
    const prevPoint = i > 0 ? timeProfile[i - 1] : null;

    // Calcula o delta de tempo entre o ponto atual e o anterior
    const deltaTime = prevPoint ? currentPoint.time - prevPoint.time : currentPoint.time;

    // Simula o eletrolisador para o ponto de tempo atual
    const simulationResult = simulateElectrolyzer({
      electrolyzerType,
      temperature: currentPoint.temperature,
      pressure: currentPoint.pressure,
      currentDensity: currentPoint.currentDensity,
      area: currentPoint.electrodeArea,
      voltage: currentPoint.voltage,
      molality: currentPoint.molality,
    });

    // Acumula a massa de hidrogênio produzida
    // A produção é kg/h, então precisamos ajustar para o deltaTime em segundos
    const hydrogenMassProducedThisInterval = simulationResult.production.kgPerHour * (deltaTime / 3600);
    accumulatedHydrogenMass += hydrogenMassProducedThisInterval;

    results.push({
      time: currentPoint.time,
      parameters: currentPoint,
      simulation: simulationResult,
      accumulatedHydrogenMass: accumulatedHydrogenMass,
    });
  }

  return results;
}

/**
 * Valida um perfil de tempo para simulação dinâmica.
 * @param {Array} timeProfile - Array de objetos com parâmetros de simulação para cada ponto no tempo.
 * @returns {object} Resultado da validação.
 */
export function validateTimeProfile(timeProfile) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(timeProfile) || timeProfile.length === 0) {
    errors.push("O perfil de tempo não pode ser vazio.");
    return { isValid: false, errors, warnings };
  }

  for (let i = 0; i < timeProfile.length; i++) {
    const point = timeProfile[i];
    if (typeof point.time !== "number" || point.time < 0) {
      errors.push(`Ponto de tempo inválido no índice ${i}: o tempo deve ser um número não negativo.`);
    }
    if (i > 0 && point.time <= timeProfile[i - 1].time) {
      errors.push(`Ponto de tempo inválido no índice ${i}: o tempo deve ser maior que o ponto anterior.`);
    }

    // Validações básicas para os parâmetros de cada ponto
    const params = ELECTROLYZER_PARAMS[point.electrolyzerType];
    if (!params) {
      errors.push(`Tipo de eletrolisador inválido no ponto de tempo ${point.time}.`);
    }
    if (point.temperature < params.minTemp || point.temperature > params.maxTemp) {
      warnings.push(`Temperatura no ponto de tempo ${point.time} fora da faixa recomendada.`);
    }
    if (point.currentDensity < params.minCurrentDensity || point.currentDensity > params.maxCurrentDensity) {
      warnings.push(`Densidade de corrente no ponto de tempo ${point.time} fora da faixa recomendada.`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}


