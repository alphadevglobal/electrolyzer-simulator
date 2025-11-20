"""
Métricas de avaliação implementadas manualmente
SEM uso de scikit-learn
"""
import numpy as np


def accuracy_score(y_true, y_pred):
    """
    Calcula acurácia manualmente

    Args:
        y_true: Labels verdadeiros
        y_pred: Labels preditos

    Returns:
        Acurácia (float entre 0 e 1)
    """
    correct = 0
    for i in range(len(y_true)):
        if y_true[i] == y_pred[i]:
            correct += 1
    return correct / len(y_true)


def confusion_matrix_manual(y_true, y_pred, n_classes=None):
    """
    Calcula matriz de confusão manualmente

    Args:
        y_true: Labels verdadeiros
        y_pred: Labels preditos
        n_classes: Número de classes

    Returns:
        Matriz de confusão (numpy array)
    """
    if n_classes is None:
        n_classes = max(max(y_true), max(y_pred)) + 1

    cm = np.zeros((n_classes, n_classes), dtype=int)

    for true, pred in zip(y_true, y_pred):
        cm[int(true), int(pred)] += 1

    return cm


def precision_score(y_true, y_pred, average='binary', zero_division=0):
    """
    Calcula precisão manualmente

    Args:
        y_true: Labels verdadeiros
        y_pred: Labels preditos
        average: 'binary', 'macro', 'micro', 'weighted'
        zero_division: Valor quando divisão por zero

    Returns:
        Precisão (float)
    """
    cm = confusion_matrix_manual(y_true, y_pred)
    n_classes = cm.shape[0]

    if average == 'binary':
        # Para classificação binária
        tp = cm[1, 1]
        fp = cm[0, 1]
        if tp + fp == 0:
            return zero_division
        return tp / (tp + fp)

    elif average == 'macro':
        # Média não ponderada das precisões por classe
        precisions = []
        for i in range(n_classes):
            tp = cm[i, i]
            fp = cm[:, i].sum() - tp
            if tp + fp == 0:
                precisions.append(zero_division)
            else:
                precisions.append(tp / (tp + fp))
        return np.mean(precisions)

    elif average == 'micro':
        # Calcula globalmente
        tp_sum = np.trace(cm)
        fp_sum = cm.sum() - tp_sum
        if tp_sum + fp_sum == 0:
            return zero_division
        return tp_sum / (tp_sum + fp_sum)

    elif average == 'weighted':
        # Média ponderada pelo número de amostras por classe
        precisions = []
        weights = []
        for i in range(n_classes):
            tp = cm[i, i]
            fp = cm[:, i].sum() - tp
            weight = cm[i, :].sum()
            weights.append(weight)
            if tp + fp == 0:
                precisions.append(zero_division)
            else:
                precisions.append(tp / (tp + fp))
        return np.average(precisions, weights=weights)


def recall_score(y_true, y_pred, average='binary', zero_division=0):
    """
    Calcula recall (sensibilidade) manualmente

    Args:
        y_true: Labels verdadeiros
        y_pred: Labels preditos
        average: 'binary', 'macro', 'micro', 'weighted'
        zero_division: Valor quando divisão por zero

    Returns:
        Recall (float)
    """
    cm = confusion_matrix_manual(y_true, y_pred)
    n_classes = cm.shape[0]

    if average == 'binary':
        # Para classificação binária
        tp = cm[1, 1]
        fn = cm[1, 0]
        if tp + fn == 0:
            return zero_division
        return tp / (tp + fn)

    elif average == 'macro':
        # Média não ponderada dos recalls por classe
        recalls = []
        for i in range(n_classes):
            tp = cm[i, i]
            fn = cm[i, :].sum() - tp
            if tp + fn == 0:
                recalls.append(zero_division)
            else:
                recalls.append(tp / (tp + fn))
        return np.mean(recalls)

    elif average == 'micro':
        # Calcula globalmente
        tp_sum = np.trace(cm)
        fn_sum = cm.sum() - tp_sum
        if tp_sum + fn_sum == 0:
            return zero_division
        return tp_sum / (tp_sum + fn_sum)

    elif average == 'weighted':
        # Média ponderada pelo número de amostras por classe
        recalls = []
        weights = []
        for i in range(n_classes):
            tp = cm[i, i]
            fn = cm[i, :].sum() - tp
            weight = cm[i, :].sum()
            weights.append(weight)
            if tp + fn == 0:
                recalls.append(zero_division)
            else:
                recalls.append(tp / (tp + fn))
        return np.average(recalls, weights=weights)


def f1_score(y_true, y_pred, average='binary', zero_division=0):
    """
    Calcula F1-Score manualmente

    Args:
        y_true: Labels verdadeiros
        y_pred: Labels preditos
        average: 'binary', 'macro', 'micro', 'weighted'
        zero_division: Valor quando divisão por zero

    Returns:
        F1-Score (float)
    """
    precision = precision_score(y_true, y_pred, average=average, zero_division=zero_division)
    recall = recall_score(y_true, y_pred, average=average, zero_division=zero_division)

    if precision + recall == 0:
        return zero_division

    return 2 * (precision * recall) / (precision + recall)


def mean_squared_error(y_true, y_pred):
    """
    Calcula MSE manualmente

    Args:
        y_true: Valores verdadeiros
        y_pred: Valores preditos

    Returns:
        MSE (float)
    """
    return np.mean((y_true - y_pred) ** 2)


def mean_absolute_error(y_true, y_pred):
    """
    Calcula MAE manualmente

    Args:
        y_true: Valores verdadeiros
        y_pred: Valores preditos

    Returns:
        MAE (float)
    """
    return np.mean(np.abs(y_true - y_pred))


def r2_score(y_true, y_pred):
    """
    Calcula R² manualmente

    Args:
        y_true: Valores verdadeiros
        y_pred: Valores preditos

    Returns:
        R² (float)
    """
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)

    if ss_tot == 0:
        return 0.0

    return 1 - (ss_res / ss_tot)


def classification_report(y_true, y_pred, class_names=None):
    """
    Gera relatório de classificação completo

    Args:
        y_true: Labels verdadeiros
        y_pred: Labels preditos
        class_names: Nomes das classes

    Returns:
        String formatada com métricas
    """
    cm = confusion_matrix_manual(y_true, y_pred)
    n_classes = cm.shape[0]

    if class_names is None:
        class_names = [f"Class {i}" for i in range(n_classes)]

    report = "Classification Report\n"
    report += "=" * 60 + "\n"
    report += f"{'Class':<20} {'Precision':<12} {'Recall':<12} {'F1-Score':<12}\n"
    report += "-" * 60 + "\n"

    for i in range(n_classes):
        # Calcula métricas por classe
        tp = cm[i, i]
        fp = cm[:, i].sum() - tp
        fn = cm[i, :].sum() - tp

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

        report += f"{class_names[i]:<20} {precision:<12.4f} {recall:<12.4f} {f1:<12.4f}\n"

    # Métricas globais
    accuracy = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average='macro')

    report += "=" * 60 + "\n"
    report += f"Accuracy: {accuracy:.4f}\n"
    report += f"Macro F1-Score: {macro_f1:.4f}\n"

    return report
