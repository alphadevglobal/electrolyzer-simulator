"""
Perceptron implementado do zero
SEM uso de scikit-learn ou outras bibliotecas de ML
"""
import numpy as np


class Perceptron:
    """
    Perceptron de Rosenblatt implementado manualmente

    Algoritmo de aprendizado supervisionado para classificação binária
    """

    def __init__(self, learning_rate=0.01, n_epochs=100, random_seed=42):
        """
        Inicializa o Perceptron

        Args:
            learning_rate: Taxa de aprendizado
            n_epochs: Número de épocas de treinamento
            random_seed: Seed para inicialização de pesos
        """
        self.learning_rate = learning_rate
        self.n_epochs = n_epochs
        self.random_seed = random_seed
        self.weights = None
        self.bias = None
        self.errors_per_epoch = []

    def activation_function(self, x):
        """
        Função de ativação degrau (step function)

        Args:
            x: Valor de entrada

        Returns:
            1 se x >= 0, 0 caso contrário
        """
        return 1 if x >= 0 else 0

    def predict_single(self, x):
        """
        Prediz a classe de uma única amostra

        Args:
            x: Vetor de features

        Returns:
            Classe predita (0 ou 1)
        """
        # Calcula soma ponderada: w^T * x + b
        linear_output = np.dot(self.weights, x) + self.bias

        # Aplica função de ativação
        prediction = self.activation_function(linear_output)
        return prediction

    def fit(self, X, y):
        """
        Treina o Perceptron

        Args:
            X: Features de treino (n_samples, n_features)
            y: Labels de treino (n_samples,)
        """
        n_samples, n_features = X.shape

        # Inicializa pesos e bias
        np.random.seed(self.random_seed)
        self.weights = np.random.randn(n_features) * 0.01
        self.bias = 0.0

        # Converte labels para 0 e 1 se necessário
        unique_labels = np.unique(y)
        if len(unique_labels) > 2:
            raise ValueError("Perceptron suporta apenas classificação binária")

        # Mapeia labels para 0 e 1
        self.label_map = {unique_labels[0]: 0, unique_labels[1]: 1}
        self.inverse_label_map = {0: unique_labels[0], 1: unique_labels[1]}
        y_binary = np.array([self.label_map[label] for label in y])

        # Treinamento por épocas
        self.errors_per_epoch = []

        for epoch in range(self.n_epochs):
            errors = 0

            # Para cada amostra
            for i in range(n_samples):
                x_i = X[i]
                y_i = y_binary[i]

                # Predição
                y_pred = self.predict_single(x_i)

                # Calcula erro
                error = y_i - y_pred

                if error != 0:
                    errors += 1

                    # Atualiza pesos: w = w + lr * error * x
                    self.weights += self.learning_rate * error * x_i

                    # Atualiza bias: b = b + lr * error
                    self.bias += self.learning_rate * error

            self.errors_per_epoch.append(errors)

            # Early stopping se não houver erros
            if errors == 0:
                break

        return self

    def predict(self, X):
        """
        Prediz classes para múltiplas amostras

        Args:
            X: Features (n_samples, n_features)

        Returns:
            Array de predições
        """
        predictions = []
        for x in X:
            pred_binary = self.predict_single(x)
            pred_original = self.inverse_label_map[pred_binary]
            predictions.append(pred_original)
        return np.array(predictions)

    def score(self, X, y):
        """
        Calcula acurácia

        Args:
            X: Features
            y: Labels verdadeiros

        Returns:
            Acurácia
        """
        predictions = self.predict(X)
        accuracy = np.mean(predictions == y)
        return accuracy

    def get_params(self):
        """
        Retorna parâmetros do modelo
        """
        return {
            'learning_rate': self.learning_rate,
            'n_epochs': self.n_epochs,
            'random_seed': self.random_seed
        }


class MultiClassPerceptron:
    """
    Perceptron para classificação multiclasse
    Usa estratégia One-vs-Rest (OvR)
    """

    def __init__(self, learning_rate=0.01, n_epochs=100, random_seed=42):
        """
        Inicializa Perceptron multiclasse

        Args:
            learning_rate: Taxa de aprendizado
            n_epochs: Número de épocas
            random_seed: Seed
        """
        self.learning_rate = learning_rate
        self.n_epochs = n_epochs
        self.random_seed = random_seed
        self.classifiers = {}
        self.classes = None

    def fit(self, X, y):
        """
        Treina classificadores One-vs-Rest

        Args:
            X: Features
            y: Labels
        """
        self.classes = np.unique(y)

        # Treina um perceptron para cada classe
        for cls in self.classes:
            # Cria labels binárias: 1 se pertence à classe, 0 caso contrário
            y_binary = (y == cls).astype(int)

            # Treina perceptron binário
            perceptron = Perceptron(
                learning_rate=self.learning_rate,
                n_epochs=self.n_epochs,
                random_seed=self.random_seed
            )

            # Hack para fazer funcionar com labels 0 e 1
            perceptron.label_map = {0: 0, 1: 1}
            perceptron.inverse_label_map = {0: 0, 1: 1}

            n_samples, n_features = X.shape
            np.random.seed(self.random_seed)
            perceptron.weights = np.random.randn(n_features) * 0.01
            perceptron.bias = 0.0

            # Treina
            for epoch in range(self.n_epochs):
                for i in range(n_samples):
                    x_i = X[i]
                    y_i = y_binary[i]

                    y_pred = perceptron.predict_single(x_i)
                    error = y_i - y_pred

                    if error != 0:
                        perceptron.weights += self.learning_rate * error * x_i
                        perceptron.bias += self.learning_rate * error

            self.classifiers[cls] = perceptron

        return self

    def predict(self, X):
        """
        Prediz classe com maior score

        Args:
            X: Features

        Returns:
            Predições
        """
        n_samples = X.shape[0]
        predictions = []

        for i in range(n_samples):
            x = X[i]
            scores = {}

            # Calcula score para cada classe
            for cls, perceptron in self.classifiers.items():
                score = np.dot(perceptron.weights, x) + perceptron.bias
                scores[cls] = score

            # Escolhe classe com maior score
            predicted_class = max(scores, key=scores.get)
            predictions.append(predicted_class)

        return np.array(predictions)
