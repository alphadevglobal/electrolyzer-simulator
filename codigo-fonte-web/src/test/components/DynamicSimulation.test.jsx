import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicSimulation from '../../components/DynamicSimulation';

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
}));

describe('DynamicSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve renderizar o componente corretamente', () => {
    render(<DynamicSimulation />);
    expect(screen.getAllByText(/Simulação Dinâmica/i).length).toBeGreaterThan(0);
  });

  it('deve ter controles de simulação', () => {
    render(<DynamicSimulation />);

    expect(screen.getAllByRole('button', { name: /Iniciar/i }).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Duração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passo de tempo/i)).toBeInTheDocument();
  });

  it('deve ter parâmetros geométricos configuráveis', () => {
    render(<DynamicSimulation />);

    expect(screen.getByLabelText(/Área Membrana/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Células/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gap Eletrodos/i)).toBeInTheDocument();
  });

  it('deve iniciar simulação ao clicar em Iniciar', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    const startButtons = screen.getAllByRole('button', { name: /Iniciar/i });
    const startButton = startButtons[0]; // Get the first "Iniciar" button (from DynamicSimulation controls)
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Pausar/i }).length).toBeGreaterThan(0);
    });
  });

  it('deve pausar e retomar simulação', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    // Iniciar
    const startButtons = screen.getAllByRole('button', { name: /Iniciar/i });
    await user.click(startButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Pausar/i }).length).toBeGreaterThan(0);
    });

    // Pausar
    const pauseButtons = screen.getAllByRole('button', { name: /Pausar/i });
    await user.click(pauseButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Retomar/i }).length).toBeGreaterThan(0);
    });
  });

  it('deve parar simulação ao clicar em Parar', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    // Iniciar
    const startButtons = screen.getAllByRole('button', { name: /Iniciar/i });
    await user.click(startButtons[0]);

    await waitFor(() => {
      const stopButtons = screen.getAllByRole('button', { name: /Parar/i });
      return user.click(stopButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Iniciar/i }).length).toBeGreaterThan(0);
    });
  });

  it('deve exibir gráficos de resultados durante simulação', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    const startButtons = screen.getAllByRole('button', { name: /Iniciar/i });
    await user.click(startButtons[0]);

    // Avançar tempo
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getAllByText(/Produção de H₂/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Eficiência/i).length).toBeGreaterThan(0);
    });
  });

  it('não deve permitir alterar parâmetros durante simulação', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    const startButtons = screen.getAllByRole('button', { name: /Iniciar/i });
    await user.click(startButtons[0]);

    await waitFor(() => {
      const areaInput = screen.getByLabelText(/Área Membrana/i);
      expect(areaInput).toBeDisabled();
    });
  });

  it('deve renderizar simulação interativa PhET', () => {
    render(<DynamicSimulation />);

    expect(screen.getByText(/Simulação Interativa Estilo PhET Colorado/i)).toBeInTheDocument();
  });
});
