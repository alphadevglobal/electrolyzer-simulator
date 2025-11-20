"""
K-Nearest Neighbors (KNN) implementado do zero
SEM uso de scikit-learn ou outras bibliotecas de ML
"""
import numpy as np
from collections import Counter


class KNearestNeighbors:
    """
    Classificador K-Nearest Neighbors implementado manualmente

    Suporta diferentes métricas de distância:
    - Euclidiana
    - Manhattan
    - Minkowski
    """

    def __init__(self, k=5, distance_metric='euclidean', p=2):
        """
        Inicializa o classificador KNN

        Args:
            k: Número de vizinhos a considerar
            distance_metric: 'euclidean', 'manhattan' ou 'minkowski'
            p: Parâmetro para distância Minkowski (p=2 é euclidiana)
        """
        self.k = k
        self.distance_metric = distance_metric
        self.p = p
        self.X_train = None
        self.y_train = None

    def fit(self, X, y):
        """
        Treina o modelo (apenas armazena os dados)

        Args:
            X: Features de treino
            y: Labels de treino
        """
        self.X_train = np.array(X)
        self.y_train = np.array(y)
        return self

    def euclidean_distance(self, x1, x2):
        """
        Calcula distância euclidiana entre dois pontos

        Args:
            x1: Ponto 1
            x2: Ponto 2

        Returns:
            Distância euclidiana
        """
        return np.sqrt(np.sum((x1 - x2) ** 2))

    def manhattan_distance(self, x1, x2):
        """
        Calcula distância Manhattan entre dois pontos

        Args:
            x1: Ponto 1
            x2: Ponto 2

        Returns:
            Distância Manhattan
        """
        return np.sum(np.abs(x1 - x2))

    def minkowski_distance(self, x1, x2, p):
        """
        Calcula distância Minkowski entre dois pontos

        Args:
            x1: Ponto 1
            x2: Ponto 2
            p: Parâmetro da distância

        Returns:
            Distância Minkowski
        """
        return np.sum(np.abs(x1 - x2) ** p) ** (1 / p)

    def compute_distance(self, x1, x2):
        """
        Calcula distância usando a métrica especificada

        Args:
            x1: Ponto 1
            x2: Ponto 2

        Returns:
            Distância calculada
        """
        if self.distance_metric == 'euclidean':
            return self.euclidean_distance(x1, x2)
        elif self.distance_metric == 'manhattan':
            return self.manhattan_distance(x1, x2)
        elif self.distance_metric == 'minkowski':
            return self.minkowski_distance(x1, x2, self.p)
        else:
            raise ValueError(f"Métrica {self.distance_metric} não suportada")

    def get_k_nearest_neighbors(self, x):
        """
        Encontra os k vizinhos mais próximos de um ponto

        Args:
            x: Ponto de consulta

        Returns:
            Índices dos k vizinhos mais próximos
        """
        # Calcula distâncias para todos os pontos de treino
        distances = []
        for i, x_train in enumerate(self.X_train):
            dist = self.compute_distance(x, x_train)
            distances.append((dist, i))

        # Ordena por distância e pega os k primeiros
        distances.sort(key=lambda x: x[0])
        k_nearest = [idx for _, idx in distances[:self.k]]

        return k_nearest

    def predict_single(self, x):
        """
        Prediz a classe de um único ponto

        Args:
            x: Ponto a classificar

        Returns:
            Classe predita
        """
        # Encontra k vizinhos mais próximos
        k_nearest_indices = self.get_k_nearest_neighbors(x)

        # Pega as labels dos k vizinhos
        k_nearest_labels = [self.y_train[i] for i in k_nearest_indices]

        # Votação majoritária
        most_common = Counter(k_nearest_labels).most_common(1)
        return most_common[0][0]

    def predict(self, X):
        """
        Prediz classes para múltiplos pontos

        Args:
            X: Array de features

        Returns:
            Array de predições
        """
        predictions = []
        for x in X:
            pred = self.predict_single(x)
            predictions.append(pred)
        return np.array(predictions)

    def predict_proba(self, X):
        """
        Prediz probabilidades de cada classe

        Args:
            X: Array de features

        Returns:
            Array de probabilidades
        """
        probas = []
        unique_classes = np.unique(self.y_train)
        n_classes = len(unique_classes)

        for x in X:
            # Encontra k vizinhos
            k_nearest_indices = self.get_k_nearest_neighbors(x)
            k_nearest_labels = [self.y_train[i] for i in k_nearest_indices]

            # Conta votos para cada classe
            class_counts = Counter(k_nearest_labels)

            # Calcula probabilidades
            proba = np.zeros(n_classes)
            for i, cls in enumerate(unique_classes):
                proba[i] = class_counts.get(cls, 0) / self.k

            probas.append(proba)

        return np.array(probas)

    def get_params(self):
        """
        Retorna parâmetros do modelo
        """
        return {
            'k': self.k,
            'distance_metric': self.distance_metric,
            'p': self.p
        }

    def set_params(self, **params):
        """
        Define parâmetros do modelo
        """
        for key, value in params.items():
            setattr(self, key, value)
        return self


# Aliases para facilitar uso
class KNNEuclidean(KNearestNeighbors):
    """KNN com distância Euclidiana"""
    def __init__(self, k=5):
        super().__init__(k=k, distance_metric='euclidean')


class KNNManhattan(KNearestNeighbors):
    """KNN com distância Manhattan"""
    def __init__(self, k=5):
        super().__init__(k=k, distance_metric='manhattan')
