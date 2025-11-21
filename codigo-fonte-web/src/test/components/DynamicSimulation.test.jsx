import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DynamicSimulation from '../../components/DynamicSimulation';

// Mock do módulo de cálculos
vi.mock('../../lib/calculations', () => ({
  simulateElectrolyzer: vi.fn((params) => ({
    hydrogenProduction: 0.0075,
    efficiency: 65.5,
    voltage: params.voltage || 2.0,
    current: params.currentDensity * params.electrodeArea,
    powerConsumption: 150,
    temperature: params.temperature,
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
    expect(screen.getByText(/Simulação Dinâmica/i)).toBeInTheDocument();
  });

  it('deve ter controles de simulação', () => {
    render(<DynamicSimulation />);

    expect(screen.getByRole('button', { name: /Iniciar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Duração/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passo de tempo/i)).toBeInTheDocument();
  });

  it('deve ter parâmetros geométricos configuráveis', () => {
    render(<DynamicSimulation />);

    expect(screen.getByLabelText(/Área Membrana/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Células/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gap entre Eletrodos/i)).toBeInTheDocument();
  });

  it('deve iniciar simulação ao clicar em Iniciar', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    const startButton = screen.getByRole('button', { name: /Iniciar/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pausar/i })).toBeInTheDocument();
    });
  });

  it('deve pausar e retomar simulação', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    // Iniciar
    const startButton = screen.getByRole('button', { name: /Iniciar/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pausar/i })).toBeInTheDocument();
    });

    // Pausar
    const pauseButton = screen.getByRole('button', { name: /Pausar/i });
    await user.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retomar/i })).toBeInTheDocument();
    });
  });

  it('deve parar simulação ao clicar em Parar', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    // Iniciar
    const startButton = screen.getByRole('button', { name: /Iniciar/i });
    await user.click(startButton);

    await waitFor(() => {
      const stopButton = screen.getByRole('button', { name: /Parar/i });
      return user.click(stopButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Iniciar/i })).toBeInTheDocument();
    });
  });

  it('deve exibir gráficos de resultados durante simulação', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    const startButton = screen.getByRole('button', { name: /Iniciar/i });
    await user.click(startButton);

    // Avançar tempo
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/Produção de H₂/i)).toBeInTheDocument();
      expect(screen.getByText(/Eficiência/i)).toBeInTheDocument();
    });
  });

  it('não deve permitir alterar parâmetros durante simulação', async () => {
    const user = userEvent.setup({ delay: null });
    render(<DynamicSimulation />);

    const startButton = screen.getByRole('button', { name: /Iniciar/i });
    await user.click(startButton);

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
