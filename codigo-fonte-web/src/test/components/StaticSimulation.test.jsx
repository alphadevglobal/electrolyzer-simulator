import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaticSimulation from '../../components/StaticSimulation';

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

// Mock do AWS API
vi.mock('../../lib/awsApi', () => ({
  sendToAWS: vi.fn(() => Promise.resolve({ success: true })),
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
    expect(screen.getByLabelText(/Concentração de KOH/i)).toBeInTheDocument();
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
    expect(screen.getByLabelText(/Gap entre Eletrodos/i)).toBeInTheDocument();
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
