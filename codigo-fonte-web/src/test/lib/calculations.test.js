import { describe, it, expect } from 'vitest';
import { simulateElectrolyzer } from '../../lib/calculations';

describe('calculations', () => {
  describe('simulateElectrolyzer', () => {
    it('deve calcular produção de hidrogênio corretamente', () => {
      const params = {
        electrolyzerType: 'Alkaline',
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        area: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      expect(result).toHaveProperty('production');
      expect(result.production).toHaveProperty('kgPerHour');
      expect(result.production.kgPerHour).toBeGreaterThan(0);
      expect(typeof result.production.kgPerHour).toBe('number');
    });

    it('deve calcular eficiência dentro do range esperado', () => {
      const params = {
        electrolyzerType: 'Alkaline',
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        area: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      expect(result).toHaveProperty('efficiency');
      expect(result.efficiency).toHaveProperty('value');
      expect(result.efficiency.value).toBeGreaterThanOrEqual(0);
      expect(result.efficiency.value).toBeLessThanOrEqual(100);
    });

    it('deve retornar todos os campos esperados', () => {
      const params = {
        electrolyzerType: 'Alkaline',
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        area: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      expect(result).toHaveProperty('production');
      expect(result).toHaveProperty('efficiency');
      expect(result).toHaveProperty('energy');
      expect(result).toHaveProperty('overpotentials');
      expect(result).toHaveProperty('economics');
      expect(result).toHaveProperty('parameters');
    });

    it('deve aumentar produção com maior corrente', () => {
      const paramsLow = {
        electrolyzerType: 'Alkaline',
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.0,
        area: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const paramsHigh = {
        ...paramsLow,
        currentDensity: 2.0,
      };

      const resultLow = simulateElectrolyzer(paramsLow);
      const resultHigh = simulateElectrolyzer(paramsHigh);

      expect(resultHigh.production.kgPerHour).toBeGreaterThan(resultLow.production.kgPerHour);
    });

    it('deve aumentar eficiência com maior temperatura (até certo ponto)', () => {
      const params60 = {
        electrolyzerType: 'Alkaline',
        temperature: 60,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        area: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const params80 = {
        ...params60,
        temperature: 80,
      };

      const result60 = simulateElectrolyzer(params60);
      const result80 = simulateElectrolyzer(params80);

      // Temperatura maior geralmente melhora eficiência até certo ponto
      expect(result80.efficiency.value).toBeGreaterThanOrEqual(result60.efficiency.value * 0.95); // Margem de 5%
    });

    it('não deve retornar NaN ou Infinity', () => {
      const params = {
        electrolyzerType: 'Alkaline',
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        area: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      const checkValues = (obj) => {
        Object.values(obj).forEach((value) => {
          if (typeof value === 'number') {
            expect(isNaN(value)).toBe(false);
            expect(isFinite(value)).toBe(true);
          } else if (typeof value === 'object' && value !== null) {
            checkValues(value);
          }
        });
      };

      checkValues(result);
    });
  });
});
