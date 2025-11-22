import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaticSimulation from '../../components/StaticSimulation';

// Mock do módulo de cálculos
vi.mock('../../lib/calculations', () => ({
  simulateElectrolyzer: vi.fn((params) => ({
    production: {
      kgPerHour: 0.0075,
      molesPerSecond: 0.001,
      totalMass: 0.01,
      totalMoles: 0.005,
    },
    efficiency: {
      value: 65.5,
      theoretical: 70.0,
    },
    overpotentials: {
      activationAnode: 0.15,
      activationCathode: 0.12,
      activation: 0.27,
      ohmic: 0.08,
      concentration: 0.05,
      total: 0.4,
    },
    energy: {
      specificConsumption: 50.5,
      totalConsumption: 150,
      theoreticalVoltage: 1.23,
      actualVoltage: params.voltage || 2.0,
      inputVoltage: params.voltage || 2.0,
    },
    economics: {
      costPerKg: 5.0,
      hourlyOperatingCost: 0.0375,
    },
    parameters: {
      totalCurrent: params.currentDensity * params.area,
      powerDensity: 2.0,
      currentEfficiency: 95.0,
    },
  })),
  validateParameters: vi.fn(() => ({ isValid: true, errors: [] })),
  ELECTROLYZER_PARAMS: {
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
      electrodes: 'Níquel',
      asr: 0.00045
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
      electrodes: 'Pt/Ir',
      asr: 0.00025
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
      electrodes: 'Cerâmicos',
      asr: 0.00012
    }
  }
}));

// Mock do AWS API
vi.mock('../../lib/awsApi', () => ({
  sendToAWS: vi.fn(() => Promise.resolve({ success: true })),
  checkAWSHealth: vi.fn(() => Promise.resolve({ healthy: true })),
  predictWithAWS: vi.fn(() => Promise.resolve({ prediction: 0.0075 })),
}));

// Mock dos efeitos de temperatura
vi.mock('../../lib/temperatureEffects', () => ({
  calculateTemperatureEffects: vi.fn(() => ({})),
  generateTemperatureChartData: vi.fn(() => []),
  calculateOptimalTemperature: vi.fn(() => ({ temperature: 70, efficiency: 80 })),
}));

describe('StaticSimulation', () => {
  it('deve renderizar o componente corretamente', () => {
    render(<StaticSimulation />);
    expect(screen.getByText(/Simulação Estática/i)).toBeInTheDocument();
  });

  it('deve ter todos os campos de parâmetros', () => {
    render(<StaticSimulation />);

    expect(screen.getByLabelText(/Temperatura/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pressão/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Concentração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Densidade de Corrente/i)).toBeInTheDocument();
  });

  it('deve permitir alterar valores dos parâmetros', async () => {
    const user = userEvent.setup();
    render(<StaticSimulation />);

    const tempInput = screen.getByLabelText(/Temperatura/i);
    await user.clear(tempInput);
    await user.type(tempInput, '80');

    expect(tempInput).toHaveValue(80);
  });

  it('deve executar cálculo ao clicar em Calcular', async () => {
    const user = userEvent.setup();
    render(<StaticSimulation />);

    const calcButton = screen.getByRole('button', { name: /Calcular/i });
    await user.click(calcButton);

    await waitFor(() => {
      expect(screen.getByText(/Produção de H₂/i)).toBeInTheDocument();
    });
  });

  it('deve exibir parâmetros geométricos', () => {
    render(<StaticSimulation />);

    expect(screen.getByText(/Geometria do Eletrolizador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Área da Membrana/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Células/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gap Eletrodos/i)).toBeInTheDocument();
  });

  it('deve calcular área total corretamente', async () => {
    const user = userEvent.setup();
    render(<StaticSimulation />);

    const areaInput = screen.getByLabelText(/Área da Membrana/i);
    const cellsInput = screen.getByLabelText(/Número de Células/i);

    await user.clear(areaInput);
    await user.type(areaInput, '100');

    await user.clear(cellsInput);
    await user.type(cellsInput, '10');

    await waitFor(() => {
      expect(screen.getByText(/Área total ativa: 1000 cm²/i)).toBeInTheDocument();
    });
  });

  it('deve validar ranges de parâmetros', async () => {
    const user = userEvent.setup();
    render(<StaticSimulation />);

    const tempInput = screen.getByLabelText(/Temperatura/i);

    // Tentar valor acima do máximo
    await user.clear(tempInput);
    await user.type(tempInput, '150');

    // Verificar se está dentro do range permitido
    expect(tempInput.value).toBe('100'); // Max é 100
  });

  it('deve exportar dados para CSV', async () => {
    const user = userEvent.setup();
    render(<StaticSimulation />);

    // Primeiro calcular
    const calcButton = screen.getByRole('button', { name: /Calcular/i });
    await user.click(calcButton);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /Exportar CSV/i });
      expect(exportButton).toBeInTheDocument();
    });
  });
});
