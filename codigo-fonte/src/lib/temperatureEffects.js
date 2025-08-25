import { simulateElectrolyzer, ELECTROLYZER_PARAMS } from "./calculations";

/**
 * Calcula os efeitos da temperatura na eficiência e produção de hidrogênio.
 * @param {number} temperature - Temperatura em °C.
 * @param {string} electrolyzerType - Tipo do eletrolisador.
 * @returns {object} Objeto com eficiência e produção.
 */
export function calculateTemperatureEffects(temperature, electrolyzerType) {
  const params = ELECTROLYZER_PARAMS[electrolyzerType];
  if (!params) {
    return { efficiency: 0, production: 0 };
  }

  // Simulação com a temperatura fornecida
  const simulationResult = simulateElectrolyzer({
    electrolyzerType,
    temperature,
    pressure: 2.0, // Assumindo pressão padrão para esta análise
    currentDensity: params.minCurrentDensity + (params.maxCurrentDensity - params.minCurrentDensity) / 2, // Média
    area: 100, // Assumindo área padrão
    voltage: 2.0, // Assumindo tensão padrão
    molality: 6.0, // Assumindo molalidade padrão
  });

  return {
    efficiency: simulationResult.efficiency.value,
    production: simulationResult.production.kgPerHour,
  };
}

/**
 * Gera dados para o gráfico de temperatura.
 * @param {string} electrolyzerType - Tipo do eletrolisador.
 * @param {object} tempRange - Objeto com minTemp e maxTemp.
 * @returns {Array} Array de dados para o gráfico.
 */
export function generateTemperatureChartData(electrolyzerType, tempRange) {
  const data = [];
  for (let t = tempRange.minTemp; t <= tempRange.maxTemp; t += 5) {
    const { efficiency, production } = calculateTemperatureEffects(t, electrolyzerType);
    data.push({
      temperature: t,
      efficiency: efficiency,
      production: production,
    });
  }
  return data;
}

/**
 * Calcula a temperatura ótima para o eletrolisador.
 * @param {string} electrolyzerType - Tipo do eletrolisador.
 * @param {object} tempRange - Objeto com minTemp e maxTemp.
 * @returns {number} Temperatura ótima em °C.
 */
export function calculateOptimalTemperature(electrolyzerType, tempRange) {
  let maxEfficiency = -1;
  let optimalTemp = tempRange.minTemp;

  for (let t = tempRange.minTemp; t <= tempRange.maxTemp; t += 1) {
    const { efficiency } = calculateTemperatureEffects(t, electrolyzerType);
    if (efficiency > maxEfficiency) {
      maxEfficiency = efficiency;
      optimalTemp = t;
    }
  }
  return optimalTemp;
}


