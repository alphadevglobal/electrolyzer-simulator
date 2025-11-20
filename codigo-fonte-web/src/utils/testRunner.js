// Sistema de testes robusto para o simulador
import { simulateElectrolyzer } from '../lib/calculations.js';

export class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };
  }

  // Executar teste individual
  runTest(testName, testFunction) {
    try {
      console.log(` Executando: ${testName}`);
      const result = testFunction();
      
      if (result.success) {
        this.results.passed++;
        console.log(`✅ ${testName}: PASSOU`);
        this.results.details.push({
          name: testName,
          status: 'PASSOU',
          data: result.data
        });
      } else {
        this.results.failed++;
        console.log(`❌ ${testName}: FALHOU - ${result.error}`);
        this.results.errors.push(`${testName}: ${result.error}`);
        this.results.details.push({
          name: testName,
          status: 'FALHOU',
          error: result.error
        });
      }
    } catch (error) {
      this.results.failed++;
      console.error(` ${testName}: ERRO - ${error.message}`);
      this.results.errors.push(`${testName}: ${error.message}`);
      this.results.details.push({
        name: testName,
        status: 'ERRO',
        error: error.message
      });
    }
  }

  // Teste básico de simulação
  testBasicSimulation() {
    return this.runTest('Simulação Básica PEM', () => {
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
      
      // Verificações detalhadas
      const checks = [
        { name: 'Estrutura do resultado', check: () => result && typeof result === 'object' },
        { name: 'Produção válida', check: () => result.production && result.production.kgPerHour > 0 },
        { name: 'Eficiência válida', check: () => result.efficiency && result.efficiency.theoretical > 0 && result.efficiency.theoretical <= 100 },
        { name: 'Energia válida', check: () => result.energy && result.energy.specificConsumption > 0 },
        { name: 'Sobretensões válidas', check: () => result.overpotentials && result.overpotentials.total > 0 }
      ];

      for (const check of checks) {
        if (!check.check()) {
          return { success: false, error: `Falha em: ${check.name}` };
        }
      }

      return { 
        success: true, 
        data: {
          produção: result.production.kgPerHour.toFixed(6) + ' kg/h',
          eficiência: result.efficiency.theoretical.toFixed(2) + '%',
          consumo: result.energy.specificConsumption.toFixed(1) + ' kWh/kg',
          tensão: result.energy.actualVoltage.toFixed(3) + ' V'
        }
      };
    });
  }

  // Teste de variação de temperatura
  testTemperatureVariation() {
    return this.runTest('Variação de Temperatura', () => {
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
      const results = [];

      for (const temp of temperatures) {
        const result = simulateElectrolyzer({ ...baseParams, temperature: temp });
        
        if (!result || !result.production || result.production.kgPerHour <= 0) {
          return { success: false, error: `Falha na temperatura ${temp}°C` };
        }

        results.push({
          temp,
          produção: result.production.kgPerHour,
          eficiência: result.efficiency.theoretical
        });
      }

      // Verificar tendência (produção deve aumentar com temperatura)
      const firstProduction = results[0].produção;
      const lastProduction = results[results.length - 1].produção;
      
      if (lastProduction <= firstProduction) {
        return { success: false, error: 'Tendência de temperatura incorreta' };
      }

      return { success: true, data: results };
    });
  }

  // Teste de diferentes tipos de eletrolisadores
  testElectrolyzerTypes() {
    return this.runTest('Tipos de Eletrolisadores', () => {
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
      const results = [];

      for (const type of types) {
        const result = simulateElectrolyzer({ ...baseParams, electrolyzerType: type });
        
        if (!result || !result.production || result.production.kgPerHour <= 0) {
          return { success: false, error: `Falha no tipo ${type}` };
        }

        results.push({
          tipo: type,
          produção: result.production.kgPerHour,
          eficiência: result.efficiency.theoretical,
          consumo: result.energy.specificConsumption
        });
      }

      return { success: true, data: results };
    });
  }

  // Teste de consistência de unidades
  testUnitConsistency() {
    return this.runTest('Consistência de Unidades', () => {
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
      
      const checks = [
        { name: 'Produção em kg/h', check: () => result.production.kgPerHour > 0 && result.production.kgPerHour < 10 },
        { name: 'Eficiência em %', check: () => result.efficiency.theoretical > 0 && result.efficiency.theoretical <= 100 },
        { name: 'Consumo em kWh/kg', check: () => result.energy.specificConsumption > 0 && result.energy.specificConsumption < 100 },
        { name: 'Tensão em V', check: () => result.energy.actualVoltage > 1 && result.energy.actualVoltage < 5 },
        { name: 'Custo positivo', check: () => result.economics.costPerKg > 0 }
      ];

      for (const check of checks) {
        if (!check.check()) {
          return { success: false, error: `Unidade inválida: ${check.name}` };
        }
      }

      return { success: true, data: 'Todas as unidades estão consistentes' };
    });
  }

  // Teste de parâmetros extremos
  testExtremeParameters() {
    return this.runTest('Parâmetros Extremos', () => {
      const extremeParams = [
        {
          name: 'Mínimos',
          params: {
            electrolyzerType: 'PEM',
            temperature: 25,
            pressure: 1,
            currentDensity: 0.5,
            voltage: 1.2,
            concentration: 10,
            molality: 2.0,
            area: 10
          }
        },
        {
          name: 'Máximos',
          params: {
            electrolyzerType: 'SOEC',
            temperature: 80,
            pressure: 30,
            currentDensity: 3,
            voltage: 3.0,
            concentration: 50,
            molality: 18.0,
            area: 1000
          }
        }
      ];

      const results = [];

      for (const test of extremeParams) {
        const result = simulateElectrolyzer(test.params);
        
        if (!result || !result.production || result.production.kgPerHour <= 0) {
          return { success: false, error: `Falha nos parâmetros ${test.name}` };
        }

        results.push({
          caso: test.name,
          produção: result.production.kgPerHour,
          eficiência: result.efficiency.theoretical
        });
      }

      return { success: true, data: results };
    });
  }

  // Executar todos os testes
  runAllTests() {
    console.log(' Iniciando bateria completa de testes...\n');
    
    this.testBasicSimulation();
    this.testTemperatureVariation();
    this.testElectrolyzerTypes();
    this.testUnitConsistency();
    this.testExtremeParameters();

    console.log('\n Resumo dos Testes:');
    console.log(`✅ Passou: ${this.results.passed}`);
    console.log(`❌ Falhou: ${this.results.failed}`);
    console.log(` Taxa de Sucesso: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n Erros Encontrados:');
      this.results.errors.forEach(error => console.log(`- ${error}`));
    }

    return this.results;
  }

  // Gerar relatório detalhado
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1) + '%'
      },
      details: this.results.details,
      errors: this.results.errors
    };

    return report;
  }
}

// Função para executar testes no console
export function runTests() {
  const runner = new TestRunner();
  const results = runner.runAllTests();
  
  // Disponibilizar globalmente para debug
  window.testResults = runner.generateReport();
  
  return results;
}

// Função para testar interface
export function testInterface() {
  console.log('️ Testando interface...');
  
  // Verificar se elementos existem
  const tests = [
    { name: 'Botão Simulação Dinâmica', selector: 'button:contains("Simulação Dinâmica")' },
    { name: 'Botão Iniciar Simulação', selector: 'button:contains("Iniciar")' },
    { name: 'Área de resultados', selector: '[data-testid="simulation-results"]' }
  ];

  tests.forEach(test => {
    const element = document.querySelector(test.selector);
    if (element) {
      console.log(`✅ ${test.name}: Encontrado`);
    } else {
      console.log(`❌ ${test.name}: Não encontrado`);
    }
  });
}

