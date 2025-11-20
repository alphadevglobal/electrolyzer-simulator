// Constantes físicas
export const CONSTANTS = {
  FARADAY: 96485, // C/mol
  R: 8.314, // J/(mol·K)
  H2_MOLAR_MASS: 0.002016, // kg/mol
  H2_HHV: 141.8, // MJ/kg (poder calorífico superior)
  STANDARD_TEMP: 298.15, // K (25°C)
};

// Parâmetros específicos por tipo de eletrolisador
export const ELECTROLYZER_PARAMS = {
  AEC: {
    name: 'Eletrolisador Alcalino',
    minTemp: 25,
    maxTemp: 80,
    minCurrentDensity: 0.2,
    maxCurrentDensity: 0.8,
    minEfficiency: 60,
    maxEfficiency: 80,
    minConsumption: 50,
    maxConsumption: 60,
    electrolyte: 'KOH',
    electrodes: 'Níquel'
  },
  Alkaline: {
    name: 'Eletrolisador Alcalino',
    minTemp: 25,
    maxTemp: 80,
    minCurrentDensity: 0.2,
    maxCurrentDensity: 0.8,
    minEfficiency: 60,
    maxEfficiency: 80,
    minConsumption: 50,
    maxConsumption: 60,
    electrolyte: 'KOH',
    electrodes: 'Níquel'
  },
  Alcalino: {
    name: 'Eletrolisador Alcalino',
    minTemp: 25,
    maxTemp: 80,
    minCurrentDensity: 0.2,
    maxCurrentDensity: 0.8,
    minEfficiency: 60,
    maxEfficiency: 80,
    minConsumption: 50,
    maxConsumption: 60,
    electrolyte: 'KOH',
    electrodes: 'Níquel'
  },
  PEM: {
    name: 'Membrana de Troca de Prótons',
    minTemp: 25,
    maxTemp: 80,
    minCurrentDensity: 1.0,
    maxCurrentDensity: 2.0,
    minEfficiency: 60,
    maxEfficiency: 80,
    minConsumption: 45,
    maxConsumption: 55,
    electrolyte: 'Nafion',
    electrodes: 'Pt/Ir'
  },
  SOEC: {
    name: 'Eletrolisador de Óxido Sólido',
    minTemp: 700,
    maxTemp: 1000,
    minCurrentDensity: 0.5,
    maxCurrentDensity: 1.5,
    minEfficiency: 80,
    maxEfficiency: 90,
    minConsumption: 35,
    maxConsumption: 45,
    electrolyte: 'YSZ',
    electrodes: 'Cerâmicos'
  }
};

/**
 * Calcula a produção de hidrogênio usando a Lei de Faraday
 * @param {number} currentDensity - Densidade de corrente (A/cm²)
 * @param {number} area - Área do eletrodo (cm²)
 * @param {number} time - Tempo (s), padrão 3600s (1h)
 * @returns {object} Produção em mol/s e kg/h
 */
export function calculateHydrogenProduction(currentDensity, area, time = 3600) {
  const totalCurrent = parseFloat(currentDensity) * parseFloat(area); // A
  
  // Validação para evitar NaN
  if (isNaN(totalCurrent) || totalCurrent <= 0) {
    return {
      molesPerSecond: 0,
      kgPerHour: 0,
      totalMoles: 0,
      totalMass: 0
    };
  }
  
  const molesH2 = (totalCurrent * time) / (2 * CONSTANTS.FARADAY); // mol
  const massH2 = molesH2 * CONSTANTS.H2_MOLAR_MASS; // kg
  
  return {
    molesPerSecond: molesH2 / time,
    kgPerHour: massH2,
    totalMoles: molesH2,
    totalMass: massH2
  };
}

/**
 * Calcula a eficiência energética
 * @param {number} voltage - Tensão aplicada (V)
 * @param {number} current - Corrente total (A)
 * @param {number} hydrogenMass - Massa de hidrogênio produzido (kg)
 * @param {number} time - Tempo (s)
 * @returns {number} Eficiência em %
 */
export function calculateEfficiency(voltage, current, hydrogenMass, time = 3600) {
  // Validação para evitar NaN
  const voltageNum = parseFloat(voltage);
  const currentNum = parseFloat(current);
  const hydrogenMassNum = parseFloat(hydrogenMass);
  
  if (isNaN(voltageNum) || isNaN(currentNum) || isNaN(hydrogenMassNum) || 
      voltageNum <= 0 || currentNum <= 0 || hydrogenMassNum <= 0) {
    return 0;
  }
  
  const energyInput = (voltageNum * currentNum * time) / 3600000; // MWh
  const energyOutput = (hydrogenMassNum * CONSTANTS.H2_HHV) / 3600; // MWh
  
  if (energyInput <= 0) return 0;
  
  return Math.min((energyOutput / energyInput) * 100, 100); // % (limitado a 100%)
}

/**
 * Calcula as sobretensões (overpotentials) usando as equações do artigo científico.
 * @param {string} electrolyzerType - Tipo do eletrolisador
 * @param {number} currentDensity - Densidade de corrente (A/cm²)
 * @param {number} temperature - Temperatura (°C)
 * @param {number} area - Área do eletrodo (cm²)
 * @returns {object} Sobretensões em V
 */
export function calculateOverpotentials(electrolyzerType, currentDensity, temperature, area, molality = 6) {
  const tempK = parseFloat(temperature) + 273.15; // Convertendo para Kelvin
  const j = parseFloat(currentDensity) * 10000; // Convertendo A/cm² para A/m²
  const S = parseFloat(area) / 10000; // Convertendo cm² para m²

  if (isNaN(tempK) || isNaN(j) || isNaN(S) || j <= 0 || S <= 0) {
    return {
      activation: 0,
      ohmic: 0,
      concentration: 0,
      total: 0
    };
  }

  // Equação (23): j0,a (densidade de corrente de troca do ânodo)
  const j0_a = 30.4 - 0.206 * tempK + 0.00035 * Math.pow(tempK, 2);

  // Equação (24): j0,c (densidade de corrente de troca do cátodo)
  const j0_c = 13.72491 - 0.09055 * tempK + 0.09055 * Math.pow(tempK, 2);

  // Equação (25): αa (coeficiente de transferência de carga do ânodo)
  const alpha_a = 0.0675 + 0.00095 * tempK;

  // Equação (26): αc (coeficiente de transferência de carga do cátodo)
  const alpha_c = 0.1175 + 0.00095 * tempK;

  // Equação (21): ηact,a (sobretensão de ativação do ânodo)
  const activationOverpotentialAnode = (2.3 * CONSTANTS.R * tempK) / (alpha_a * CONSTANTS.FARADAY) * Math.log(j / j0_a);

  // Equação (22): ηact,c (sobretensão de ativação do cátodo)
  const activationOverpotentialCathode = (2.3 * CONSTANTS.R * tempK) / (alpha_c * CONSTANTS.FARADAY) * Math.log(j / j0_c);

  // Assumindo valores para La, Lc, Sa, Sc para simplificação (necessário para cálculos reais)
  // Para este modelo, vamos usar valores de exemplo ou considerar que já estão incorporados em constantes
  // Por simplicidade, vamos usar valores fixos para as resistências dos eletrodos por enquanto
  const Ra = 0.0001; // Exemplo
  const Rc = 0.0001; // Exemplo

  // Equação (33): σbf (condutividade do eletrólito sem bolhas)
  // Para esta função, precisamos da molalidade (m) do KOH. Usaremos um valor padrão por enquanto.
  const m_koh = molality; // Molalidade do KOH (mol/kg)
  const sigma_bf = -204.1 * m_koh - 0.28 * Math.pow(m_koh, 2) + 0.5332 * (m_koh * tempK) + 20720 * m_koh / tempK + 0.1043 * Math.pow(m_koh, 3) - 0.00003 * (Math.pow(m_koh, 2) * Math.pow(tempK, 2));

  // Equação (32): Rele,bf (resistência do eletrólito sem bolhas)
  // Assumindo valores para da,m, dc,m, Sa, Sc para simplificação
  const da_m = 0.001; // Exemplo em cm
  const dc_m = 0.001; // Exemplo em cm
  const Sa_cm2 = area; // Usando a área de entrada como área do eletrodo em cm2
  const Sc_cm2 = area; // Usando a área de entrada como área do eletrodo em cm2

  const Rele_bf = (1 / (sigma_bf / 100)) * ((da_m / Sa_cm2) + (dc_m / Sc_cm2)); // Convertendo S/m para S/cm e cm para m

  // Equação (35): ε (coeficiente de bolhas)
  // Assumindo Seff/S = 0.9 (90% da superfície efetiva)
  const epsilon = 1 - 0.9; // Exemplo

  // Equação (34): Rele,b (resistência devido às bolhas)
  const Rele_b = Rele_bf * (1 / Math.pow((1 - epsilon), 1.5) - 1);

  // Equação (31): Rele (resistência total do eletrólito)
  const Rele = Rele_bf + Rele_b;

  // Equação (36): Rmem (resistência da membrana)
  // Assumindo Smem = area (cm2)
  const Smem_cm2 = area;
  const Rmem = (0.060 + 80 * Math.exp(tempK / 50)) / (10000 * Smem_cm2);

  // Equação (27): Rtotal (resistência ôhmica total)
  const Rtotal = Ra + Rc + Rele + Rmem;

  // Sobretensão ôhmica total (V)
  const ohmicOverpotential = Rtotal * (j * S); // j*S é a corrente total em A

  // Sobretensão de concentração (mantida a simplificação anterior por falta de dados mais detalhados no artigo)
  const concentrationOverpotential = j * 50 * Math.exp(j / (ELECTROLYZER_PARAMS[electrolyzerType].maxCurrentDensity * 10000)); // Convertendo para A/m²

  return {
    activationAnode: Math.max(0, activationOverpotentialAnode),
    activationCathode: Math.max(0, activationOverpotentialCathode),
    ohmic: Math.max(0, ohmicOverpotential),
    concentration: Math.max(0, concentrationOverpotential),
    total: (activationOverpotentialAnode + activationOverpotentialCathode + ohmicOverpotential + concentrationOverpotential)
  };
}
/**
 * Calcula o consumo específico de energia
 * @param {number} voltage - Tensão aplicada (V)
 * @param {number} current - Corrente total (A)
 * @param {number} hydrogenMass - Massa de hidrogênio produzido (kg)
 * @param {number} time - Tempo (s)
 * @returns {number} Consumo em kWh/kg H₂
 */
export function calculateSpecificEnergyConsumption(voltage, current, hydrogenMass, time = 3600) {
  const voltageNum = parseFloat(voltage);
  const currentNum = parseFloat(current);
  const hydrogenMassNum = parseFloat(hydrogenMass);

  if (isNaN(voltageNum) || isNaN(currentNum) || isNaN(hydrogenMassNum) || 
      voltageNum <= 0 || currentNum <= 0 || hydrogenMassNum <= 0) {
    return 0;
  }

  const energyConsumed = (voltageNum * currentNum * time) / 3600000; // kWh
  if (hydrogenMassNum === 0) return 0; // Evitar divisão por zero
  return energyConsumed / hydrogenMassNum; // kWh/kg
}

/**
 * Calcula a tensão teórica mínima (tensão termodinâmica) usando as equações do artigo científico.
 * @param {number} temperature - Temperatura (°C)
 * @param {number} pressure - Pressão (bar)
 * @param {number} molality - Molalidade do KOH (mol/kg)
 * @returns {number} Tensão em V
 */
export function calculateTheoreticalVoltage(temperature, pressure = 1, molality = 6) {
  const tempK = parseFloat(temperature) + 273.15; // Convertendo para Kelvin
  const P = parseFloat(pressure); // Pressão em bar
  const m = parseFloat(molality); // Molalidade do KOH

  if (isNaN(tempK) || isNaN(P) || isNaN(m) || P <= 0) {
    return 0; // Retorna 0 ou um valor padrão em caso de entrada inválida
  }

  // Equação (15): Vrev,0,T
  const Vrev_0_T = 1.5184 - 1.5421 * Math.pow(10, -3) * tempK + 9.523 * Math.pow(10, -5) * tempK * Math.log(tempK) + 9.84 * Math.pow(10, -8) * Math.pow(tempK, 2);

  // Equação (19): Pv,H2O (pressão de vapor da água pura)
  const Pv_H2O = Math.exp(81.6179 - 7699.68 / tempK - 10.9 * Math.log(tempK) + 9.5891 * Math.pow(10, -3) * tempK);

  // Equação (17): Coeficiente 'a'
  const a_coeff = -0.0151 * m - 1.6788 * Math.pow(10, -3) * Math.pow(m, 2) + 2.2588 * Math.pow(10, -5) * Math.pow(m, 3);

  // Equação (18): Coeficiente 'b'
  const b_coeff = 1 - 1.2062 * Math.pow(10, -3) * m + 5.6024 * Math.pow(10, -4) * Math.pow(m, 2) - 7.8228 * Math.pow(10, -6) * Math.pow(m, 3);

  // Equação (16): Pv,KOH (pressão de vapor da solução de KOH)
  const Pv_KOH = Math.exp(2.302 * a_coeff + b_coeff * Math.log(Pv_H2O));

  // Equação (20): αH2O (atividade da água)
  const alpha_H2O = Math.exp(-0.05192 * m + 0.003302 * Math.pow(m, 2) + (3.177 * m - 2.131 * Math.pow(m, 2)) / tempK);

  // Equação (14): Vrev (tensão reversível)
  const Vrev = Vrev_0_T + (CONSTANTS.R * tempK / (2 * CONSTANTS.FARADAY)) * Math.log(Math.pow((P - Pv_KOH), 1.5) / alpha_H2O);

  return Math.max(1.0, Vrev); // Mínimo de 1.0V
}
/**
 * Simula o eletrolisador com todos os parâmetros
 * @param {object} params - Parâmetros de entrada
 * @returns {object} Resultados da simulação
 */
export function simulateElectrolyzer(params) {
  const {
    electrolyzerType,
    temperature: temp,
    pressure: press,
    currentDensity: cd,
    area: ar,
    voltage: volt,
    molality: mol
  } = params;

  const temperature = parseFloat(temp);
  const pressure = parseFloat(press);
  const currentDensity = parseFloat(cd);
  const area = parseFloat(ar);
  const voltage = parseFloat(volt);
  const molality = parseFloat(mol);

  // Validações para garantir que os valores são números válidos
  if (isNaN(temperature) || isNaN(pressure) || isNaN(currentDensity) || isNaN(area) || isNaN(voltage)) {
    throw new Error('Todos os parâmetros de entrada devem ser números válidos.');
  }
  
  // Validações básicas
  const electrolyzerParams = ELECTROLYZER_PARAMS[electrolyzerType];
  if (!electrolyzerParams) {
    throw new Error('Tipo de eletrolisador inválido');
  }
  
  // Cálculos principais
  const totalCurrent = parseFloat(currentDensity) * parseFloat(area);
  const production = calculateHydrogenProduction(currentDensity, area);
  const efficiency = calculateEfficiency(voltage, totalCurrent, production.totalMass);
  const overpotentials = calculateOverpotentials(electrolyzerType, currentDensity, temperature, area, molality);
  const specificConsumption = calculateSpecificEnergyConsumption(voltage, totalCurrent, production.totalMass);
  const theoreticalVoltage = calculateTheoreticalVoltage(temperature, pressure, molality);
  
  // Custo estimado (baseado em tarifa elétrica brasileira média: R$ 0,65/kWh)
  const electricityCost = 0.65; // R$/kWh
  const costPerKg = specificConsumption * electricityCost;
  
  return {
    production: {
      kgPerHour: production.kgPerHour,
      molesPerSecond: production.molesPerSecond,
      totalMass: production.totalMass,
      totalMoles: production.totalMoles
    },
    efficiency: {
      value: efficiency,
      theoretical: (theoreticalVoltage / voltage) * 100
    },
    overpotentials: {
      activationAnode: overpotentials.activationAnode,
      activationCathode: overpotentials.activationCathode,
      activation: (overpotentials.activationAnode + overpotentials.activationCathode),
      ohmic: overpotentials.ohmic,
      concentration: overpotentials.concentration,
      total: overpotentials.total
    },
    energy: {
      specificConsumption: specificConsumption,
      totalConsumption: (voltage * totalCurrent) / 1000, // kW
      theoreticalVoltage: theoreticalVoltage,
      actualVoltage: voltage
    },
    economics: {
      costPerKg: costPerKg,
      hourlyOperatingCost: costPerKg * production.kgPerHour
    },
    parameters: {
      totalCurrent: totalCurrent,
      powerDensity: (voltage * currentDensity) / 1000, // kW/cm²
      currentEfficiency: (production.totalMoles * 2 * CONSTANTS.FARADAY) / (totalCurrent * 3600) * 100 // %
    }
  };
}

/**
 * Valida os parâmetros de entrada
 * @param {object} params - Parâmetros a validar
 * @returns {object} Resultado da validação
 */
export function validateParameters(params) {
  const {
    electrolyzerType,
    temperature,
    pressure,
    currentDensity,
    area,
    voltage,
    molality
  } = params;
  
  const errors = [];
  const warnings = [];
  
  const electrolyzerParams = ELECTROLYZER_PARAMS[electrolyzerType];
  if (!electrolyzerParams) {
    errors.push('Tipo de eletrolisador inválido');
    return { isValid: false, errors, warnings };
  }
  
  // Validação de temperatura
  if (temperature < electrolyzerParams.minTemp || temperature > electrolyzerParams.maxTemp) {
    errors.push(`Temperatura deve estar entre ${electrolyzerParams.minTemp}°C e ${electrolyzerParams.maxTemp}°C`);
  }
  
  // Validação de pressão
  if (pressure < 1 || pressure > 30) {
    errors.push('Pressão deve estar entre 1 e 30 bar');
  }
  
  // Validação de densidade de corrente
  if (currentDensity < electrolyzerParams.minCurrentDensity || currentDensity > electrolyzerParams.maxCurrentDensity) {
    warnings.push(`Densidade de corrente recomendada: ${electrolyzerParams.minCurrentDensity}-${electrolyzerParams.maxCurrentDensity} A/cm²`);
  }
  
  // Validação de área
  if (area < 1 || area > 10000) {
    errors.push('Área deve estar entre 1 e 10000 cm²');
  }
  
  // Validação de tensão
  const theoreticalVoltage = calculateTheoreticalVoltage(temperature, pressure, molality);
  if (voltage < theoreticalVoltage) {
    errors.push(`Tensão deve ser maior que a tensão teórica (${theoreticalVoltage.toFixed(2)} V)`);
  }
  if (voltage > 3.0) {
    warnings.push('Tensão muito alta pode reduzir a eficiência');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}





// Função principal para cálculo de performance (alias para simulateElectrolyzer)
export function calculateElectrolyzerPerformance(params) {
  const results = simulateElectrolyzer(params);
  
  return {
    cellVoltage: results.voltage.total,
    efficiency: results.efficiency.voltage,
    hydrogenProduction: results.production.molesPerSecond,
    specificEnergyConsumption: results.energyConsumption.specific,
    theoreticalVoltage: results.voltage.theoretical,
    overpotentials: results.voltage.overpotentials,
    production: results.production,
    cost: results.cost
  };
}
