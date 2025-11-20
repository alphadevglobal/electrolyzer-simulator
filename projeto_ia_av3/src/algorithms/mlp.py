"""
Multi-Layer Perceptron (MLP) implementado do zero
Com backpropagation manual
SEM uso de frameworks de deep learning
"""
import numpy as np


class MLP:
    """
    Rede Neural Multi-Layer Perceptron implementada manualmente

    Arquitetura: Input -> Hidden Layer(s) -> Output
    Treinamento: Backpropagation + Gradient Descent
    """

    def __init__(self, input_size, hidden_sizes=[64], output_size=2,
                 learning_rate=0.01, n_epochs=100, activation='relu',
                 random_seed=42, batch_size=32):
        """
        Inicializa o MLP

        Args:
            input_size: Número de features de entrada
            hidden_sizes: Lista com tamanhos das camadas ocultas
            output_size: Número de classes de saída
            learning_rate: Taxa de aprendizado
            n_epochs: Número de épocas
            activation: 'relu', 'sigmoid' ou 'tanh'
            random_seed: Seed
            batch_size: Tamanho do batch para mini-batch GD
        """
        self.input_size = input_size
        self.hidden_sizes = hidden_sizes
        self.output_size = output_size
        self.learning_rate = learning_rate
        self.n_epochs = n_epochs
        self.activation = activation
        self.random_seed = random_seed
        self.batch_size = batch_size

        # Inicializa pesos e biases
        self.weights = []
        self.biases = []
        self.loss_history = []

        self._initialize_weights()

    def _initialize_weights(self):
        """
        Inicializa pesos usando Xavier/He initialization
        """
        np.random.seed(self.random_seed)

        # Camadas: input -> hidden1 -> hidden2 -> ... -> output
        layer_sizes = [self.input_size] + self.hidden_sizes + [self.output_size]

        for i in range(len(layer_sizes) - 1):
            # Xavier initialization
            limit = np.sqrt(6 / (layer_sizes[i] + layer_sizes[i + 1]))
            W = np.random.uniform(-limit, limit, (layer_sizes[i], layer_sizes[i + 1]))
            b = np.zeros((1, layer_sizes[i + 1]))

            self.weights.append(W)
            self.biases.append(b)

    def sigmoid(self, x):
        """Função sigmoid"""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

    def sigmoid_derivative(self, x):
        """Derivada da sigmoid"""
        s = self.sigmoid(x)
        return s * (1 - s)

    def relu(self, x):
        """Função ReLU"""
        return np.maximum(0, x)

    def relu_derivative(self, x):
        """Derivada da ReLU"""
        return (x > 0).astype(float)

    def tanh(self, x):
        """Função tanh"""
        return np.tanh(x)

    def tanh_derivative(self, x):
        """Derivada da tanh"""
        return 1 - np.tanh(x) ** 2

    def apply_activation(self, x):
        """Aplica função de ativação"""
        if self.activation == 'relu':
            return self.relu(x)
        elif self.activation == 'sigmoid':
            return self.sigmoid(x)
        elif self.activation == 'tanh':
            return self.tanh(x)
        else:
            return x

    def apply_activation_derivative(self, x):
        """Aplica derivada da função de ativação"""
        if self.activation == 'relu':
            return self.relu_derivative(x)
        elif self.activation == 'sigmoid':
            return self.sigmoid_derivative(x)
        elif self.activation == 'tanh':
            return self.tanh_derivative(x)
        else:
            return np.ones_like(x)

    def softmax(self, x):
        """
        Função softmax para camada de saída

        Args:
            x: Logits

        Returns:
            Probabilidades
        """
        exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)

    def forward_propagation(self, X):
        """
        Forward pass pela rede

        Args:
            X: Input (batch_size, input_size)

        Returns:
            activations: Lista de ativações de cada camada
            z_values: Lista de valores pré-ativação
        """
        activations = [X]
        z_values = []

        current_activation = X

        # Forward através das camadas
        for i in range(len(self.weights)):
            # Linear: z = Wx + b
            z = np.dot(current_activation, self.weights[i]) + self.biases[i]
            z_values.append(z)

            # Ativação
            if i < len(self.weights) - 1:
                # Camadas ocultas
                activation = self.apply_activation(z)
            else:
                # Camada de saída: softmax
                activation = self.softmax(z)

            activations.append(activation)
            current_activation = activation

        return activations, z_values

    def backward_propagation(self, X, y, activations, z_values):
        """
        Backward pass (backpropagation)

        Args:
            X: Input
            y: Labels one-hot encoded
            activations: Ativações do forward pass
            z_values: Valores pré-ativação

        Returns:
            gradients_w: Gradientes dos pesos
            gradients_b: Gradientes dos biases
        """
        m = X.shape[0]
        n_layers = len(self.weights)

        gradients_w = [None] * n_layers
        gradients_b = [None] * n_layers

        # Erro na camada de saída
        delta = activations[-1] - y

        # Backpropagation das camadas
        for i in reversed(range(n_layers)):
            # Gradientes
            gradients_w[i] = np.dot(activations[i].T, delta) / m
            gradients_b[i] = np.sum(delta, axis=0, keepdims=True) / m

            # Propaga erro para camada anterior
            if i > 0:
                delta = np.dot(delta, self.weights[i].T) * self.apply_activation_derivative(z_values[i - 1])

        return gradients_w, gradients_b

    def fit(self, X, y):
        """
        Treina o MLP

        Args:
            X: Features (n_samples, n_features)
            y: Labels (n_samples,)
        """
        # Converte labels para one-hot
        unique_labels = np.unique(y)
        self.classes_ = unique_labels
        self.n_classes = len(unique_labels)

        if self.n_classes != self.output_size:
            self.output_size = self.n_classes
            self._initialize_weights()

        label_to_idx = {label: idx for idx, label in enumerate(unique_labels)}
        y_indices = np.array([label_to_idx[label] for label in y])

        y_one_hot = np.zeros((len(y), self.n_classes))
        y_one_hot[np.arange(len(y)), y_indices] = 1

        # Treinamento
        n_samples = X.shape[0]
        self.loss_history = []

        for epoch in range(self.n_epochs):
            # Shuffle dos dados
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y_one_hot[indices]

            # Mini-batch gradient descent
            epoch_loss = 0
            n_batches = 0

            for i in range(0, n_samples, self.batch_size):
                X_batch = X_shuffled[i:i + self.batch_size]
                y_batch = y_shuffled[i:i + self.batch_size]

                # Forward pass
                activations, z_values = self.forward_propagation(X_batch)

                # Backward pass
                gradients_w, gradients_b = self.backward_propagation(
                    X_batch, y_batch, activations, z_values
                )

                # Atualiza pesos
                for j in range(len(self.weights)):
                    self.weights[j] -= self.learning_rate * gradients_w[j]
                    self.biases[j] -= self.learning_rate * gradients_b[j]

                # Calcula loss (cross-entropy)
                predictions = activations[-1]
                batch_loss = -np.mean(np.sum(y_batch * np.log(predictions + 1e-8), axis=1))
                epoch_loss += batch_loss
                n_batches += 1

            avg_loss = epoch_loss / n_batches
            self.loss_history.append(avg_loss)

        return self

    def predict_proba(self, X):
        """
        Prediz probabilidades

        Args:
            X: Features

        Returns:
            Probabilidades de cada classe
        """
        activations, _ = self.forward_propagation(X)
        return activations[-1]

    def predict(self, X):
        """
        Prediz classes

        Args:
            X: Features

        Returns:
            Array de predições
        """
        probas = self.predict_proba(X)
        class_indices = np.argmax(probas, axis=1)
        predictions = np.array([self.classes_[idx] for idx in class_indices])
        return predictions

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
        return np.mean(predictions == y)

    def get_params(self):
        """Retorna parâmetros do modelo"""
        return {
            'input_size': self.input_size,
            'hidden_sizes': self.hidden_sizes,
            'output_size': self.output_size,
            'learning_rate': self.learning_rate,
            'n_epochs': self.n_epochs,
            'activation': self.activation,
            'batch_size': self.batch_size
        }
