"""
Cria um dataset sintético de demonstração
Baseado nas características do Appliances Energy Prediction
"""
import numpy as np
import os
import csv


def create_synthetic_dataset(n_samples=5000, n_features=28, output_file='data/raw/appliances_energy.csv'):
    """
    Cria dataset sintético para demonstração

    Args:
        n_samples: Número de amostras
        n_features: Número de features
        output_file: Arquivo de saída
    """
    print("=" * 60)
    print("CRIANDO DATASET SINTÉTICO DE DEMONSTRAÇÃO")
    print("=" * 60)
    print(f"Amostras: {n_samples}")
    print(f"Features: {n_features}")
    print()

    # Garante diretório
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Gera features aleatórias (temperatura, umidade, etc.)
    np.random.seed(42)

    # Features correlacionadas com consumo de energia
    X = np.random.randn(n_samples, n_features)

    # Simula algumas features importantes
    temperature = np.random.uniform(15, 30, n_samples)  # Temperatura
    humidity = np.random.uniform(20, 80, n_samples)     # Umidade
    lights = np.random.uniform(0, 100, n_samples)       # Iluminação

    X[:, 0] = temperature
    X[:, 1] = humidity
    X[:, 2] = lights

    # Cria target baseado em combinação das features
    # Consumo de energia = função de temperatura, umidade, iluminação + ruído
    y = (0.3 * temperature + 0.2 * humidity + 0.5 * lights +
         np.random.randn(n_samples) * 5)

    # Normaliza target para valores realistas
    y = (y - y.min()) / (y.max() - y.min()) * 100 + 50  # Entre 50 e 150 Wh

    # Salva como CSV
    data = np.column_stack([X, y])

    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)

        # Header
        header = [f'feature_{i}' for i in range(n_features)] + ['energy']
        writer.writerow(header)

        # Dados
        for row in data:
            writer.writerow(row)

    print(f"✓ Dataset sintético criado com sucesso!")
    print(f"  Salvo em: {output_file}")
    print(f"  Shape: ({n_samples}, {n_features + 1})")
    print()
    print("=" * 60)
    print("IMPORTANTE: Este é um dataset SINTÉTICO para demonstração")
    print("Para resultados reais, baixe o dataset oficial do OpenML:")
    print("https://www.openml.org/d/46283")
    print("=" * 60)

    return output_file


if __name__ == "__main__":
    create_synthetic_dataset(n_samples=5000, n_features=28)
