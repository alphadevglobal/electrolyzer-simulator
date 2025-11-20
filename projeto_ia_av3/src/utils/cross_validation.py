"""
Validação cruzada implementada manualmente
SEM uso de scikit-learn
"""
import numpy as np
import time
from .metrics import accuracy_score, precision_score, f1_score


def k_fold_split(X, y, n_folds=5, shuffle=True, random_seed=42):
    """
    Divide dados em K folds para validação cruzada
    Implementação manual SEM sklearn

    Args:
        X: Features
        y: Target
        n_folds: Número de folds
        shuffle: Se True, embaralha antes de dividir
        random_seed: Seed para reprodutibilidade

    Yields:
        train_indices, val_indices para cada fold
    """
    n_samples = len(X)
    indices = np.arange(n_samples)

    if shuffle:
        np.random.seed(random_seed)
        np.random.shuffle(indices)

    fold_sizes = np.full(n_folds, n_samples // n_folds, dtype=int)
    fold_sizes[:n_samples % n_folds] += 1

    current = 0
    for fold_size in fold_sizes:
        start, stop = current, current + fold_size
        val_indices = indices[start:stop]
        train_indices = np.concatenate([indices[:start], indices[stop:]])
        yield train_indices, val_indices
        current = stop


def cross_validate(model, X, y, n_folds=5, metrics=['accuracy', 'f1'], verbose=True):
    """
    Realiza validação cruzada k-fold manualmente

    Args:
        model: Modelo com métodos fit() e predict()
        X: Features
        y: Target
        n_folds: Número de folds
        metrics: Lista de métricas a calcular
        verbose: Se True, imprime progresso

    Returns:
        Dictionary com resultados: médias, desvios padrão e tempos
    """
    results = {
        'accuracy': [],
        'precision': [],
        'f1_score': [],
        'train_time': [],
        'test_time': []
    }

    fold_num = 0
    for train_idx, val_idx in k_fold_split(X, y, n_folds=n_folds):
        fold_num += 1

        if verbose:
            print(f"  Fold {fold_num}/{n_folds}...", end=' ')

        # Separa dados
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        # Treina modelo
        start_time = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - start_time

        # Testa modelo
        start_time = time.time()
        y_pred = model.predict(X_val)
        test_time = time.time() - start_time

        # Calcula métricas
        acc = accuracy_score(y_val, y_pred)
        prec = precision_score(y_val, y_pred, average='macro', zero_division=0)
        f1 = f1_score(y_val, y_pred, average='macro', zero_division=0)

        results['accuracy'].append(acc)
        results['precision'].append(prec)
        results['f1_score'].append(f1)
        results['train_time'].append(train_time)
        results['test_time'].append(test_time)

        if verbose:
            print(f"Acc: {acc:.4f}, F1: {f1:.4f}")

    # Calcula estatísticas finais
    summary = {}
    for key in results:
        values = np.array(results[key])
        summary[f'{key}_mean'] = np.mean(values)
        summary[f'{key}_std'] = np.std(values)
        summary[f'{key}_all'] = values

    return summary


def stratified_k_fold_split(X, y, n_folds=5, random_seed=42):
    """
    Validação cruzada estratificada (mantém proporção de classes)
    Implementação manual

    Args:
        X: Features
        y: Target
        n_folds: Número de folds
        random_seed: Seed

    Yields:
        train_indices, val_indices para cada fold
    """
    np.random.seed(random_seed)
    n_samples = len(y)
    unique_classes = np.unique(y)

    # Separa índices por classe
    class_indices = {}
    for cls in unique_classes:
        class_indices[cls] = np.where(y == cls)[0]
        np.random.shuffle(class_indices[cls])

    # Divide cada classe em folds
    class_folds = {}
    for cls in unique_classes:
        indices = class_indices[cls]
        n_class_samples = len(indices)
        fold_sizes = np.full(n_folds, n_class_samples // n_folds, dtype=int)
        fold_sizes[:n_class_samples % n_folds] += 1

        folds = []
        current = 0
        for fold_size in fold_sizes:
            folds.append(indices[current:current + fold_size])
            current += fold_size
        class_folds[cls] = folds

    # Combina folds de todas as classes
    for fold_idx in range(n_folds):
        val_indices = []
        train_indices = []

        for cls in unique_classes:
            # Fold atual é validação
            val_indices.extend(class_folds[cls][fold_idx])

            # Outros folds são treino
            for other_fold in range(n_folds):
                if other_fold != fold_idx:
                    train_indices.extend(class_folds[cls][other_fold])

        yield np.array(train_indices), np.array(val_indices)


def cross_validate_stratified(model, X, y, n_folds=5, verbose=True):
    """
    Validação cruzada estratificada

    Args:
        model: Modelo com métodos fit() e predict()
        X: Features
        y: Target
        n_folds: Número de folds
        verbose: Se True, imprime progresso

    Returns:
        Dictionary com resultados
    """
    results = {
        'accuracy': [],
        'precision': [],
        'f1_score': [],
        'train_time': [],
        'test_time': []
    }

    fold_num = 0
    for train_idx, val_idx in stratified_k_fold_split(X, y, n_folds=n_folds):
        fold_num += 1

        if verbose:
            print(f"  Fold {fold_num}/{n_folds}...", end=' ')

        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        # Treina
        start_time = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - start_time

        # Testa
        start_time = time.time()
        y_pred = model.predict(X_val)
        test_time = time.time() - start_time

        # Métricas
        acc = accuracy_score(y_val, y_pred)
        prec = precision_score(y_val, y_pred, average='macro', zero_division=0)
        f1 = f1_score(y_val, y_pred, average='macro', zero_division=0)

        results['accuracy'].append(acc)
        results['precision'].append(prec)
        results['f1_score'].append(f1)
        results['train_time'].append(train_time)
        results['test_time'].append(test_time)

        if verbose:
            print(f"Acc: {acc:.4f}, F1: {f1:.4f}")

    # Estatísticas
    summary = {}
    for key in results:
        values = np.array(results[key])
        summary[f'{key}_mean'] = np.mean(values)
        summary[f'{key}_std'] = np.std(values)
        summary[f'{key}_all'] = values

    return summary


def leave_one_out_cv(model, X, y, verbose=False):
    """
    Leave-One-Out Cross-Validation
    Implementação manual (pode ser lento para datasets grandes)

    Args:
        model: Modelo
        X: Features
        y: Target
        verbose: Mostrar progresso

    Returns:
        Dictionary com resultados
    """
    n_samples = len(X)
    predictions = []
    y_true_list = []

    for i in range(n_samples):
        if verbose and i % 100 == 0:
            print(f"  Sample {i}/{n_samples}")

        # Leave one out
        train_idx = np.concatenate([np.arange(0, i), np.arange(i + 1, n_samples)])
        val_idx = [i]

        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        # Treina e prediz
        model.fit(X_train, y_train)
        y_pred = model.predict(X_val)

        predictions.append(y_pred[0])
        y_true_list.append(y_val[0])

    # Calcula métricas finais
    predictions = np.array(predictions)
    y_true_list = np.array(y_true_list)

    acc = accuracy_score(y_true_list, predictions)
    prec = precision_score(y_true_list, predictions, average='macro', zero_division=0)
    f1 = f1_score(y_true_list, predictions, average='macro', zero_division=0)

    return {
        'accuracy': acc,
        'precision': prec,
        'f1_score': f1
    }
