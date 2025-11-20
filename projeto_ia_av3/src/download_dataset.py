"""
Script para baixar o dataset do OpenML
Appliances Energy Prediction (ID: 46283)
"""
import urllib.request
import urllib.error
import csv
import numpy as np
import os


def download_appliances_energy_dataset(output_dir='data/raw'):
    """
    Baixa o dataset Appliances Energy Prediction do OpenML

    Args:
        output_dir: Diretório para salvar o dataset
    """
    print("=" * 60)
    print("BAIXANDO DATASET DO OPENML")
    print("=" * 60)
    print(f"Dataset: Appliances Energy Prediction (ID: 46283)")
    print(f"Destino: {output_dir}/")
    print()

    # Cria diretório se não existir
    os.makedirs(output_dir, exist_ok=True)

    # URL do dataset (formato ARFF)
    url = "https://www.openml.org/data/get_csv/22102542/file22f16e56c226.arff"

    output_file = os.path.join(output_dir, 'appliances_energy.csv')

    try:
        print("Baixando arquivo...")
        urllib.request.urlretrieve(url, output_file)
        print(f"✓ Dataset baixado com sucesso!")
        print(f"  Salvo em: {output_file}")

        # Verifica o arquivo
        with open(output_file, 'r') as f:
            lines = f.readlines()
            n_lines = len(lines)

        print(f"  Número de linhas: {n_lines}")

        return output_file

    except urllib.error.URLError as e:
        print(f"✗ Erro ao baixar dataset: {e}")
        print("\nInstruções alternativas:")
        print("1. Acesse: https://www.openml.org/d/46283")
        print("2. Clique em 'Download' e salve o arquivo CSV")
        print(f"3. Salve em: {output_file}")
        return None

    except Exception as e:
        print(f"✗ Erro inesperado: {e}")
        return None


def process_arff_to_csv(arff_file, csv_file):
    """
    Converte arquivo ARFF para CSV

    Args:
        arff_file: Caminho do arquivo ARFF
        csv_file: Caminho de saída do CSV
    """
    print("\nProcessando arquivo ARFF para CSV...")

    data_section = False
    data_lines = []

    with open(arff_file, 'r') as f:
        for line in f:
            line = line.strip()

            # Identifica início da seção de dados
            if line.lower().startswith('@data'):
                data_section = True
                continue

            # Captura linhas de dados
            if data_section and line and not line.startswith('%'):
                data_lines.append(line)

    # Salva como CSV
    with open(csv_file, 'w', newline='') as f:
        for line in data_lines:
            f.write(line + '\n')

    print(f"✓ Arquivo CSV criado: {csv_file}")
    print(f"  Número de linhas de dados: {len(data_lines)}")


def load_and_verify_dataset(filepath):
    """
    Carrega e verifica o dataset

    Args:
        filepath: Caminho do arquivo

    Returns:
        data, header
    """
    print("\nVerificando dataset...")

    data = []
    with open(filepath, 'r') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader, None)

        for row in csv_reader:
            try:
                numeric_row = [float(val) if val != '' else 0.0 for val in row]
                data.append(numeric_row)
            except ValueError:
                continue

    data = np.array(data)

    print(f"✓ Dataset carregado com sucesso!")
    print(f"  Shape: {data.shape}")
    print(f"  Features: {data.shape[1]}")
    print(f"  Instâncias: {data.shape[0]}")
    print(f"  Colunas: {header if header else 'N/A'}")

    # Verifica requisitos do projeto
    print("\n" + "=" * 60)
    print("VERIFICAÇÃO DOS REQUISITOS DO PROJETO")
    print("=" * 60)

    meets_requirements = True

    # Requisito 1: > 10 atributos
    n_features = data.shape[1] - 1  # Subtrai 1 (target)
    if n_features > 10:
        print(f"✓ Atributos: {n_features} (requisito: > 10)")
    else:
        print(f"✗ Atributos: {n_features} (requisito: > 10)")
        meets_requirements = False

    # Requisito 2: > 1000 instâncias
    n_samples = data.shape[0]
    if n_samples > 1000:
        print(f"✓ Instâncias: {n_samples} (requisito: > 1000)")
    else:
        print(f"✗ Instâncias: {n_samples} (requisito: > 1000)")
        meets_requirements = False

    print("=" * 60)

    if meets_requirements:
        print("✓ Dataset atende a TODOS os requisitos!")
    else:
        print("✗ Dataset NÃO atende aos requisitos!")

    return data, header


if __name__ == "__main__":
    # Determina diretório correto
    if os.path.exists('data'):
        output_dir = 'data/raw'
    else:
        output_dir = '../data/raw'

    # Baixa dataset
    arff_file = download_appliances_energy_dataset(output_dir)

    if arff_file:
        # Processa ARFF para CSV se necessário
        if arff_file.endswith('.arff'):
            csv_file = arff_file.replace('.arff', '.csv')
            process_arff_to_csv(arff_file, csv_file)
        else:
            csv_file = arff_file

        # Verifica dataset
        load_and_verify_dataset(csv_file)

        print("\n✓ Dataset pronto para uso!")
        print(f"  Localização: {csv_file}")
    else:
        print("\n✗ Falha ao baixar dataset. Tente o download manual.")
