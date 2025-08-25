import { simulateElectrolyzer, calculateHydrogenProduction, calculateEfficiency, calculateSpecificEnergyConsumption } from '../lib/calculations.js';

// Testes unitários para validar os cálculos do simulador
describe('Electrolyzer Calculations Tests', () => {
  
  // Teste básico de simulação
  test('simulateElectrolyzer should return valid results for PEM electrolyzer', () => {
    const params = {
      electrolyzerType: 'PEM',
      temperature: 60,
      pressure: 30,
      currentDensity: 2,
      voltage: 1.8,
      concentration: 25,
      molality: 6.0,
      area: 100
    };
    
    const result = simulateElectrolyzer(params);
    
    // Verificar estrutura do resultado
    expect(result).toHaveProperty('production');
    expect(result).toHaveProperty('efficiency');
    expect(result).toHaveProperty('energy');
    expect(result).toHaveProperty('overpotentials');
    expect(result).toHaveProperty('economics');
    
    // Verificar valores válidos
    expect(result.production.kgPerHour).toBeGreaterThan(0);
    expect(result.efficiency.theoretical).toBeGreaterThan(0);
    expect(result.efficiency.theoretical).toBeLessThanOrEqual(100);
    expect(result.energy.specificConsumption).toBeGreaterThan(0);
  });

  // Teste de produção de hidrogênio
  test('calculateHydrogenProduction should calculate correct hydrogen production', () => {
    const currentDensity = 2; // A/cm²
    const area = 100; // cm²
    
    const result = calculateHydrogenProduction(currentDensity, area);
    
    expect(result).toHaveProperty('kgPerHour');
    expect(result).toHaveProperty('molesPerSecond');
    expect(result.kgPerHour).toBeGreaterThan(0);
    expect(result.molesPerSecond).toBeGreaterThan(0);
  });

  // Teste de eficiência
  test('calculateEfficiency should return efficiency between 0 and 100', () => {
    const voltage = 1.8;
    const current = 200; // A
    const hydrogenMass = 0.01; // kg
    
    const efficiency = calculateEfficiency(voltage, current, hydrogenMass);
    
    expect(efficiency).toBeGreaterThan(0);
    expect(efficiency).toBeLessThanOrEqual(100);
  });

  // Teste de consumo específico de energia
  test('calculateSpecificEnergyConsumption should return valid energy consumption', () => {
    const voltage = 1.8;
    const current = 200;
    const hydrogenMass = 0.01;
    
    const consumption = calculateSpecificEnergyConsumption(voltage, current, hydrogenMass);
    
    expect(consumption).toBeGreaterThan(0);
    expect(consumption).toBeLessThan(1000); // Valor razoável em kWh/kg
  });

  // Teste de diferentes tipos de eletrolisadores
  test('simulateElectrolyzer should work for all electrolyzer types', () => {
    const baseParams = {
      temperature: 60,
      pressure: 30,
      currentDensity: 2,
      voltage: 1.8,
      concentration: 25,
      molality: 6.0,
      area: 100
    };

    const types = ['PEM', 'Alkaline', 'SOEC'];
    
    types.forEach(type => {
      const params = { ...baseParams, electrolyzerType: type };
      const result = simulateElectrolyzer(params);
      
      expect(result.production.kgPerHour).toBeGreaterThan(0);
      expect(result.efficiency.theoretical).toBeGreaterThan(0);
    });
  });

  // Teste de variação de temperatura
  test('Temperature effect should show expected trends', () => {
    const baseParams = {
      electrolyzerType: 'PEM',
      pressure: 30,
      currentDensity: 2,
      voltage: 1.8,
      concentration: 25,
      molality: 6.0,
      area: 100
    };

    const temperatures = [40, 50, 60, 70, 80];
    const results = temperatures.map(temp => 
      simulateElectrolyzer({ ...baseParams, temperature: temp })
    );

    // Verificar que todos os resultados são válidos
    results.forEach(result => {
      expect(result.production.kgPerHour).toBeGreaterThan(0);
      expect(result.efficiency.theoretical).toBeGreaterThan(0);
      expect(result.energy.specificConsumption).toBeGreaterThan(0);
    });

    // Verificar tendências esperadas (produção deve aumentar com temperatura)
    const productions = results.map(r => r.production.kgPerHour);
    expect(productions[4]).toBeGreaterThan(productions[0]); // 80°C > 40°C
  });

  // Teste de validação de parâmetros extremos
  test('simulateElectrolyzer should handle edge cases gracefully', () => {
    const extremeParams = {
      electrolyzerType: 'PEM',
      temperature: 25, // Temperatura mínima
      pressure: 1,     // Pressão mínima
      currentDensity: 0.5, // Densidade baixa
      voltage: 1.2,    // Tensão mínima
      concentration: 10, // Concentração mínima
      molality: 2.0,   // Molalidade mínima
      area: 10         // Área pequena
    };

    const result = simulateElectrolyzer(extremeParams);
    
    // Deve retornar resultados válidos mesmo com parâmetros extremos
    expect(result.production.kgPerHour).toBeGreaterThan(0);
    expect(result.efficiency.theoretical).toBeGreaterThan(0);
    expect(result.energy.specificConsumption).toBeGreaterThan(0);
  });

  // Teste de consistência de unidades
  test('Units should be consistent across calculations', () => {
    const params = {
      electrolyzerType: 'PEM',
      temperature: 60,
      pressure: 30,
      currentDensity: 2,
      voltage: 1.8,
      concentration: 25,
      molality: 6.0,
      area: 100
    };

    const result = simulateElectrolyzer(params);
    
    // Verificar unidades esperadas
    expect(typeof result.production.kgPerHour).toBe('number');
    expect(typeof result.efficiency.theoretical).toBe('number');
    expect(typeof result.energy.specificConsumption).toBe('number');
    expect(typeof result.economics.costPerKg).toBe('number');
    
    // Verificar ranges razoáveis
    expect(result.production.kgPerHour).toBeLessThan(10); // kg/h razoável
    expect(result.energy.specificConsumption).toBeLessThan(100); // kWh/kg razoável
    expect(result.economics.costPerKg).toBeGreaterThan(0); // Custo positivo
  });
});

// Função para executar todos os testes
export function runAllTests() {
  console.log('🧪 Executando testes unitários...');
  
  const testResults = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Teste básico de simulação PEM
    const pemResult = simulateElectrolyzer({
      electrolyzerType: 'PEM',
      temperature: 60,
      pressure: 30,
      currentDensity: 2,
      voltage: 1.8,
      concentration: 25,
      molality: 6.0,
      area: 100
    });

    if (pemResult.production.kgPerHour > 0 && pemResult.efficiency.theoretical > 0) {
      testResults.passed++;
      console.log('✅ Teste PEM: PASSOU');
    } else {
      testResults.failed++;
      testResults.errors.push('Teste PEM falhou - valores inválidos');
    }

    // Teste de diferentes temperaturas
    const tempResults = [40, 60, 80].map(temp => 
      simulateElectrolyzer({
        electrolyzerType: 'PEM',
        temperature: temp,
        pressure: 30,
        currentDensity: 2,
        voltage: 1.8,
        concentration: 25,
        molality: 6.0,
        area: 100
      })
    );

    if (tempResults.every(r => r.production.kgPerHour > 0)) {
      testResults.passed++;
      console.log('✅ Teste de temperatura: PASSOU');
    } else {
      testResults.failed++;
      testResults.errors.push('Teste de temperatura falhou');
    }

    // Teste de tipos de eletrolisadores
    const typeResults = ['PEM', 'Alkaline', 'SOEC'].map(type => 
      simulateElectrolyzer({
        electrolyzerType: type,
        temperature: 60,
        pressure: 30,
        currentDensity: 2,
        voltage: 1.8,
        concentration: 25,
        molality: 6.0,
        area: 100
      })
    );

    if (typeResults.every(r => r.production.kgPerHour > 0)) {
      testResults.passed++;
      console.log('✅ Teste de tipos: PASSOU');
    } else {
      testResults.failed++;
      testResults.errors.push('Teste de tipos falhou');
    }

  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Erro durante testes: ${error.message}`);
  }

  console.log(`\n📊 Resultados dos testes:`);
  console.log(`✅ Passou: ${testResults.passed}`);
  console.log(`❌ Falhou: ${testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log(`\n🚨 Erros encontrados:`);
    testResults.errors.forEach(error => console.log(`- ${error}`));
  }

  return testResults;
}

