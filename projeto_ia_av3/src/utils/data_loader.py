"""
Carregamento de dados SEM pandas
Implementação manual de leitura CSV e splits
"""
import csv
import numpy as np


def load_csv_manual(filepath):
    """
    Carrega arquivo CSV sem usar pandas

    Args:
        filepath: Caminho para o arquivo CSV

    Returns:
        data: Array numpy com os dados
        header: Lista com os nomes das colunas
    """
    data = []
    with open(filepath, 'r') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader)

        for row in csv_reader:
            try:
                # Converte cada valor para float
                numeric_row = [float(val) if val != '' else 0.0 for val in row]
                data.append(numeric_row)
            except ValueError:
                # Ignora linhas com problemas
                continue

    return np.array(data), header


def load_from_openml(dataset_id=46283):
    """
    Baixa dataset do OpenML sem usar pandas

    Args:
        dataset_id: ID do dataset no OpenML

    Returns:
        X: Features
        y: Target
        feature_names: Nomes das features
    """
    try:
        import urllib.request
        import json

        # URL da API do OpenML
        api_url = f"https://www.openml.org/api/v1/json/data/{dataset_id}"

        # Faz request para API
        with urllib.request.urlopen(api_url) as response:
            data_info = json.loads(response.read().decode())

        # Extrai URL do arquivo
        file_url = data_info['data_set_description']['url']

        # Baixa arquivo
        local_filename = f"data_{dataset_id}.arff"
        urllib.request.urlretrieve(file_url, local_filename)

        return local_filename
    except Exception as e:
        print(f"Erro ao baixar do OpenML: {e}")
        print("Use o download manual do site: https://www.openml.org/d/46283")
        return None


def train_val_test_split(X, y, train_size=0.6, val_size=0.2, test_size=0.2, random_seed=42):
    """
    Divide dados em treino, validação e teste SEM sklearn

    Args:
        X: Features
        y: Target
        train_size: Proporção de treino
        val_size: Proporção de validação
        test_size: Proporção de teste
        random_seed: Seed para reprodutibilidade

    Returns:
        X_train, X_val, X_test, y_train, y_val, y_test
    """
    np.random.seed(random_seed)
    n_samples = len(X)

    # Gera índices embaralhados
    indices = np.random.permutation(n_samples)

    # Calcula tamanhos
    n_train = int(n_samples * train_size)
    n_val = int(n_samples * val_size)

    # Divide índices
    train_indices = indices[:n_train]
    val_indices = indices[n_train:n_train + n_val]
    test_indices = indices[n_train + n_val:]

    # Retorna splits
    return (X[train_indices], X[val_indices], X[test_indices],
            y[train_indices], y[val_indices], y[test_indices])


def train_test_split_manual(X, y, test_size=0.2, random_seed=42):
    """
    Split simples treino/teste SEM sklearn

    Args:
        X: Features
        y: Target
        test_size: Proporção de teste
        random_seed: Seed para reprodutibilidade

    Returns:
        X_train, X_test, y_train, y_test
    """
    np.random.seed(random_seed)
    n_samples = len(X)
    n_test = int(n_samples * test_size)

    # Gera índices embaralhados
    indices = np.random.permutation(n_samples)
    test_indices = indices[:n_test]
    train_indices = indices[n_test:]

    return X[train_indices], X[test_indices], y[train_indices], y[test_indices]


def get_basic_statistics(data):
    """
    Calcula estatísticas básicas SEM pandas

    Args:
        data: Array numpy

    Returns:
        dict com estatísticas
    """
    stats = {
        'mean': np.mean(data, axis=0),
        'std': np.std(data, axis=0),
        'min': np.min(data, axis=0),
        'max': np.max(data, axis=0),
        'median': np.median(data, axis=0)
    }
    return stats


def handle_missing_values(X, strategy='mean'):
    """
    Trata valores faltantes SEM sklearn

    Args:
        X: Features com possíveis NaN
        strategy: 'mean', 'median' ou 'zero'

    Returns:
        X processado
    """
    X_copy = X.copy()

    for col in range(X_copy.shape[1]):
        # Identifica valores faltantes
        mask = np.isnan(X_copy[:, col])

        if np.any(mask):
            if strategy == 'mean':
                fill_value = np.nanmean(X_copy[:, col])
            elif strategy == 'median':
                fill_value = np.nanmedian(X_copy[:, col])
            else:  # zero
                fill_value = 0.0

            X_copy[mask, col] = fill_value

    return X_copy
