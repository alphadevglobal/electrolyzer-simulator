import { describe, expect, test } from 'vitest';
import {
  calculateHydrogenProduction,
  calculateEfficiency,
  calculateSpecificEnergyConsumption,
  calculateOverpotentials,
  simulateElectrolyzer,
} from '../calculations.js';

describe('calculations core library', () => {
  test('calculateHydrogenProduction matches Faraday law', () => {
    const result = calculateHydrogenProduction(2, 100);
    expect(result.totalMass).toBeGreaterThan(0);
    expect(result.totalMass).toBeCloseTo(0.00752, 5);
    expect(result.molesPerSecond).toBeCloseTo(result.totalMoles / 3600, 6);
  });

  test('calculateEfficiency reflects energy balance', () => {
    const production = calculateHydrogenProduction(2, 100);
    const efficiency = calculateEfficiency(1.8, 200, production.totalMass);
    expect(efficiency).toBeGreaterThan(40);
    expect(efficiency).toBeLessThan(90);
  });

  test('specific consumption stays within expected physical range', () => {
    const consumption = calculateSpecificEnergyConsumption(1.9, 150, 0.006);
    expect(consumption).toBeGreaterThan(0);
    expect(consumption).toBeLessThan(80);
  });

  test('overpotentials remain bounded and positive', () => {
    const result = calculateOverpotentials('PEM', 1.8, 60, 100, 6);
    expect(result.activation).toBeGreaterThan(0);
    expect(result.ohmic).toBeGreaterThan(0);
    expect(result.concentration).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(20);
  });

  test('simulateElectrolyzer improves efficiency with temperature', () => {
    const cold = simulateElectrolyzer({
      electrolyzerType: 'PEM',
      temperature: 40,
      pressure: 2,
      currentDensity: 1.5,
      area: 120,
      voltage: 1.9,
      molality: 6,
    });

    const hot = simulateElectrolyzer({
      electrolyzerType: 'PEM',
      temperature: 70,
      pressure: 2,
      currentDensity: 1.5,
      area: 120,
      voltage: 1.9,
      molality: 6,
    });

    expect(hot.efficiency.value).toBeGreaterThan(cold.efficiency.value);
    expect(hot.energy.specificConsumption).toBeLessThan(cold.energy.specificConsumption);
  });
});
