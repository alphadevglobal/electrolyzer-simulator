"""
Naive Bayes implementado do zero
Versões Univariada e Multivariada
SEM uso de scikit-learn
"""
import numpy as np


class GaussianNaiveBayes:
    """
    Naive Bayes Gaussiano implementado manualmente

    Assume que as features seguem distribuição normal
    """

    def __init__(self, variant='multivariate'):
        """
        Inicializa Naive Bayes

        Args:
            variant: 'univariate' ou 'multivariate'
        """
        self.variant = variant
        self.classes = None
        self.class_priors = {}
        self.class_means = {}
        self.class_stds = {}
        self.class_covariances = {}

    def gaussian_pdf(self, x, mean, std):
        """
        Função densidade de probabilidade Gaussiana (univariada)

        Args:
            x: Valor
            mean: Média
            std: Desvio padrão

        Returns:
            Probabilidade
        """
        exponent = np.exp(-((x - mean) ** 2) / (2 * std ** 2 + 1e-10))
        return (1 / (np.sqrt(2 * np.pi) * std + 1e-10)) * exponent

    def multivariate_gaussian_pdf(self, x, mean, cov):
        """
        Função densidade de probabilidade Gaussiana multivariada

        Args:
            x: Vetor de features
            mean: Vetor de médias
            cov: Matriz de covariância

        Returns:
            Probabilidade
        """
        n = len(x)

        # Adiciona regularização para evitar matriz singular
        cov_reg = cov + np.eye(cov.shape[0]) * 1e-6

        try:
            # Calcula determinante e inversa
            det = np.linalg.det(cov_reg)
            inv = np.linalg.inv(cov_reg)

            # Calcula PDF
            diff = x - mean
            exponent = -0.5 * np.dot(np.dot(diff.T, inv), diff)
            coefficient = 1 / (np.sqrt((2 * np.pi) ** n * det))

            return coefficient * np.exp(exponent)

        except np.linalg.LinAlgError:
            # Fallback para versão univariada se houver erro
            return np.prod([self.gaussian_pdf(x[i], mean[i], np.sqrt(cov[i, i]))
                           for i in range(len(x))])

    def fit(self, X, y):
        """
        Treina o classificador

        Args:
            X: Features (n_samples, n_features)
            y: Labels (n_samples,)
        """
        self.classes = np.unique(y)
        n_samples, n_features = X.shape

        # Para cada classe
        for cls in self.classes:
            # Filtra amostras da classe
            X_cls = X[y == cls]

            # Calcula probabilidade a priori
            self.class_priors[cls] = len(X_cls) / n_samples

            # Calcula estatísticas
            self.class_means[cls] = np.mean(X_cls, axis=0)
            self.class_stds[cls] = np.std(X_cls, axis=0) + 1e-10  # Evita divisão por zero

            # Para versão multivariada, calcula matriz de covariância
            if self.variant == 'multivariate':
                self.class_covariances[cls] = np.cov(X_cls.T) + np.eye(n_features) * 1e-6

        return self

    def predict_log_proba_univariate(self, x):
        """
        Calcula log-probabilidade usando modelo univariado

        Args:
            x: Vetor de features

        Returns:
            Dict com log-probabilidades por classe
        """
        log_probas = {}

        for cls in self.classes:
            # Log da probabilidade a priori
            log_prior = np.log(self.class_priors[cls])

            # Log-likelihood (assume independência das features)
            log_likelihood = 0
            for i in range(len(x)):
                prob = self.gaussian_pdf(x[i], self.class_means[cls][i], self.class_stds[cls][i])
                log_likelihood += np.log(prob + 1e-10)

            log_probas[cls] = log_prior + log_likelihood

        return log_probas

    def predict_log_proba_multivariate(self, x):
        """
        Calcula log-probabilidade usando modelo multivariado

        Args:
            x: Vetor de features

        Returns:
            Dict com log-probabilidades por classe
        """
        log_probas = {}

        for cls in self.classes:
            # Log da probabilidade a priori
            log_prior = np.log(self.class_priors[cls])

            # Log-likelihood (considera correlação entre features)
            prob = self.multivariate_gaussian_pdf(
                x, self.class_means[cls], self.class_covariances[cls]
            )
            log_likelihood = np.log(prob + 1e-10)

            log_probas[cls] = log_prior + log_likelihood

        return log_probas

    def predict_single(self, x):
        """
        Prediz classe de uma única amostra

        Args:
            x: Vetor de features

        Returns:
            Classe predita
        """
        if self.variant == 'univariate':
            log_probas = self.predict_log_proba_univariate(x)
        else:  # multivariate
            log_probas = self.predict_log_proba_multivariate(x)

        # Retorna classe com maior probabilidade
        return max(log_probas, key=log_probas.get)

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
            pred = self.predict_single(x)
            predictions.append(pred)
        return np.array(predictions)

    def predict_proba(self, X):
        """
        Prediz probabilidades

        Args:
            X: Features

        Returns:
            Matriz de probabilidades
        """
        n_samples = X.shape[0]
        n_classes = len(self.classes)
        probas = np.zeros((n_samples, n_classes))

        for i, x in enumerate(X):
            if self.variant == 'univariate':
                log_probas = self.predict_log_proba_univariate(x)
            else:
                log_probas = self.predict_log_proba_multivariate(x)

            # Converte log-probas para probabilidades
            log_proba_values = np.array([log_probas[cls] for cls in self.classes])

            # Normaliza usando log-sum-exp trick
            max_log_proba = np.max(log_proba_values)
            exp_probas = np.exp(log_proba_values - max_log_proba)
            normalized_probas = exp_probas / np.sum(exp_probas)

            probas[i] = normalized_probas

        return probas

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
            'variant': self.variant
        }


# Aliases para facilitar uso
class UnivariateNaiveBayes(GaussianNaiveBayes):
    """Naive Bayes Univariado"""
    def __init__(self):
        super().__init__(variant='univariate')


class MultivariateNaiveBayes(GaussianNaiveBayes):
    """Naive Bayes Multivariado"""
    def __init__(self):
        super().__init__(variant='multivariate')
