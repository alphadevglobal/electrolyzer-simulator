"""
Pré-processamento de dados SEM sklearn
Normalização e transformações implementadas manualmente
"""
import numpy as np


class MinMaxScaler:
    """
    Normalização Min-Max implementada manualmente
    SEM uso de sklearn
    """

    def __init__(self, feature_range=(0, 1)):
        self.feature_range = feature_range
        self.min_ = None
        self.max_ = None
        self.data_min_ = None
        self.data_max_ = None

    def fit(self, X):
        """
        Calcula min e max de cada feature

        Args:
            X: Array de features
        """
        self.data_min_ = np.min(X, axis=0)
        self.data_max_ = np.max(X, axis=0)
        return self

    def transform(self, X):
        """
        Aplica normalização

        Args:
            X: Array de features

        Returns:
            X normalizado
        """
        X_std = (X - self.data_min_) / (self.data_max_ - self.data_min_ + 1e-8)
        X_scaled = X_std * (self.feature_range[1] - self.feature_range[0]) + self.feature_range[0]
        return X_scaled

    def fit_transform(self, X):
        """
        Fit e transform em um passo
        """
        return self.fit(X).transform(X)

    def inverse_transform(self, X):
        """
        Reverte normalização
        """
        X_std = (X - self.feature_range[0]) / (self.feature_range[1] - self.feature_range[0])
        X_original = X_std * (self.data_max_ - self.data_min_) + self.data_min_
        return X_original


class StandardScaler:
    """
    Normalização Z-Score implementada manualmente
    SEM uso de sklearn
    """

    def __init__(self):
        self.mean_ = None
        self.std_ = None

    def fit(self, X):
        """
        Calcula média e desvio padrão de cada feature

        Args:
            X: Array de features
        """
        self.mean_ = np.mean(X, axis=0)
        self.std_ = np.std(X, axis=0)
        return self

    def transform(self, X):
        """
        Aplica normalização Z-Score

        Args:
            X: Array de features

        Returns:
            X normalizado
        """
        return (X - self.mean_) / (self.std_ + 1e-8)

    def fit_transform(self, X):
        """
        Fit e transform em um passo
        """
        return self.fit(X).transform(X)

    def inverse_transform(self, X):
        """
        Reverte normalização
        """
        return X * self.std_ + self.mean_


def normalize_manual(X, method='minmax'):
    """
    Função auxiliar para normalização

    Args:
        X: Features
        method: 'minmax' ou 'standard'

    Returns:
        X normalizado, scaler usado
    """
    if method == 'minmax':
        scaler = MinMaxScaler()
    elif method == 'standard':
        scaler = StandardScaler()
    else:
        raise ValueError(f"Método {method} não suportado")

    X_normalized = scaler.fit_transform(X)
    return X_normalized, scaler


def binarize_target(y, threshold=None):
    """
    Binariza variável target para classificação

    Args:
        y: Target contínuo
        threshold: Limiar (se None, usa mediana)

    Returns:
        y binarizado (0 ou 1)
    """
    if threshold is None:
        threshold = np.median(y)

    y_binary = (y > threshold).astype(int)
    return y_binary


def encode_labels(y):
    """
    Codifica labels em valores numéricos

    Args:
        y: Labels (podem ser strings ou números)

    Returns:
        y_encoded, label_mapping
    """
    unique_labels = np.unique(y)
    label_mapping = {label: idx for idx, label in enumerate(unique_labels)}

    y_encoded = np.array([label_mapping[label] for label in y])
    return y_encoded, label_mapping


def one_hot_encode(y, n_classes=None):
    """
    One-hot encoding manual

    Args:
        y: Labels numéricos
        n_classes: Número de classes (se None, infere automaticamente)

    Returns:
        Matrix one-hot encoded
    """
    if n_classes is None:
        n_classes = len(np.unique(y))

    n_samples = len(y)
    one_hot = np.zeros((n_samples, n_classes))

    for i, label in enumerate(y):
        one_hot[i, int(label)] = 1

    return one_hot
