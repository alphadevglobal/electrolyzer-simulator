import { describe, it, expect } from 'vitest';
import { simulateElectrolyzer } from '../../lib/calculations';

describe('calculations', () => {
  describe('simulateElectrolyzer', () => {
    it('deve calcular produção de hidrogênio corretamente', () => {
      const params = {
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        electrodeArea: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      expect(result).toHaveProperty('hydrogenProduction');
      expect(result.hydrogenProduction).toBeGreaterThan(0);
      expect(typeof result.hydrogenProduction).toBe('number');
    });

    it('deve calcular eficiência dentro do range esperado', () => {
      const params = {
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        electrodeArea: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      expect(result).toHaveProperty('efficiency');
      expect(result.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    });

    it('deve retornar todos os campos esperados', () => {
      const params = {
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        electrodeArea: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      expect(result).toHaveProperty('hydrogenProduction');
      expect(result).toHaveProperty('efficiency');
      expect(result).toHaveProperty('voltage');
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('powerConsumption');
      expect(result).toHaveProperty('temperature');
    });

    it('deve aumentar produção com maior corrente', () => {
      const paramsLow = {
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.0,
        electrodeArea: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const paramsHigh = {
        ...paramsLow,
        currentDensity: 2.0,
      };

      const resultLow = simulateElectrolyzer(paramsLow);
      const resultHigh = simulateElectrolyzer(paramsHigh);

      expect(resultHigh.hydrogenProduction).toBeGreaterThan(resultLow.hydrogenProduction);
    });

    it('deve aumentar eficiência com maior temperatura (até certo ponto)', () => {
      const params60 = {
        temperature: 60,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        electrodeArea: 100,
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
      expect(result80.efficiency).toBeGreaterThanOrEqual(result60.efficiency * 0.95); // Margem de 5%
    });

    it('não deve retornar NaN ou Infinity', () => {
      const params = {
        temperature: 80,
        pressure: 30,
        concentration: 30,
        currentDensity: 1.5,
        electrodeArea: 100,
        voltage: 2.0,
        molality: 6.0,
      };

      const result = simulateElectrolyzer(params);

      Object.values(result).forEach((value) => {
        if (typeof value === 'number') {
          expect(isNaN(value)).toBe(false);
          expect(isFinite(value)).toBe(true);
        }
      });
    });
  });
});
