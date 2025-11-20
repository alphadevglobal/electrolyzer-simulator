"""
Script Principal - Projeto IA AV3
Executa todos os experimentos e gera resultados

Disciplina: Inteligência Artificial Computacional
Aluno: Mateus Macário
"""
import numpy as np
import os
import sys
import csv
import time

# Adiciona src ao path
sys.path.insert(0, os.path.dirname(__file__))

# Imports dos algoritmos
from algorithms.knn import KNNEuclidean, KNNManhattan
from algorithms.perceptron import MultiClassPerceptron
from algorithms.mlp import MLP
from algorithms.naive_bayes import UnivariateNaiveBayes, MultivariateNaiveBayes

# Imports dos utilitários
from utils.preprocessing import StandardScaler, binarize_target
from utils.cross_validation import cross_validate_stratified
from utils.visualization import (plot_metrics_comparison, plot_training_times,
                                 plot_performance_vs_time, generate_markdown_table,
                                 generate_results_table)


def load_dataset_manual(filepath):
    """
    Carrega dataset sem pandas

    Args:
        filepath: Caminho do arquivo CSV

    Returns:
        X, y (features e target)
    """
    print("Carregando dataset...")

    data = []
    with open(filepath, 'r') as file:
        csv_reader = csv.reader(file)
        header = next(csv_reader, None)

        for row in csv_reader:
            try:
                numeric_row = [float(val) if val != '' else 0.0 for val in row]
                data.append(numeric_row)
            except (ValueError, IndexError):
                continue

    data = np.array(data)

    # Separa features e target
    # Assume que última coluna é o target
    X = data[:, :-1]
    y = data[:, -1]

    print(f"  Shape X: {X.shape}")
    print(f"  Shape y: {y.shape}")
    print(f"  Features: {X.shape[1]}")
    print(f"  Instâncias: {X.shape[0]}")

    return X, y


def main():
    """
    Função principal que executa todos os experimentos
    """
    print("=" * 80)
    print(" " * 20 + "PROJETO IA AV3 - CLASSIFICAÇÃO")
    print("=" * 80)
    print("Disciplina: Inteligência Artificial Computacional")
    print("Aluno: Mateus Macário")
    print("Dataset: Appliances Energy Prediction (OpenML ID: 46283)")
    print("=" * 80)
    print()

    # ========== CARREGAMENTO DE DADOS ==========
    print("[1/6] CARREGAMENTO DE DADOS")
    print("-" * 80)

    # Define caminho do dataset
    if os.path.exists('data/raw/appliances_energy.csv'):
        filepath = 'data/raw/appliances_energy.csv'
    elif os.path.exists('../data/raw/appliances_energy.csv'):
        filepath = '../data/raw/appliances_energy.csv'
    else:
        print("✗ Dataset não encontrado!")
        print("Execute: python src/download_dataset.py")
        return

    X, y = load_dataset_manual(filepath)

    # ========== PRÉ-PROCESSAMENTO ==========
    print("\n[2/6] PRÉ-PROCESSAMENTO")
    print("-" * 80)

    # Binariza target (classificação binária)
    print("Convertendo para classificação binária...")
    y_binary = binarize_target(y)
    n_class_0 = np.sum(y_binary == 0)
    n_class_1 = np.sum(y_binary == 1)
    print(f"  Classe 0: {n_class_0} amostras ({n_class_0/len(y_binary)*100:.1f}%)")
    print(f"  Classe 1: {n_class_1} amostras ({n_class_1/len(y_binary)*100:.1f}%)")

    # Normaliza features
    print("Normalizando features (Z-Score)...")
    scaler = StandardScaler()
    X_normalized = scaler.fit_transform(X)
    print(f"  ✓ Normalização concluída")

    # ========== DEFINIÇÃO DOS MODELOS ==========
    print("\n[3/6] DEFINIÇÃO DOS MODELOS")
    print("-" * 80)

    models = {
        'KNN (Euclidiana)': KNNEuclidean(k=5),
        'KNN (Manhattan)': KNNManhattan(k=5),
        'Perceptron': MultiClassPerceptron(learning_rate=0.01, n_epochs=50),
        'MLP': MLP(input_size=X_normalized.shape[1], hidden_sizes=[32, 16],
                   output_size=2, learning_rate=0.01, n_epochs=50,
                   activation='relu', batch_size=64),
        'Naive Bayes (Univariado)': UnivariateNaiveBayes(),
        'Naive Bayes (Multivariado)': MultivariateNaiveBayes()
    }

    print(f"Total de modelos: {len(models)}")
    for name in models.keys():
        print(f"  - {name}")

    # ========== VALIDAÇÃO CRUZADA ==========
    print("\n[4/6] VALIDAÇÃO CRUZADA (K-FOLD, K=5)")
    print("-" * 80)

    results = {}
    n_folds = 5

    for i, (model_name, model) in enumerate(models.items(), 1):
        print(f"\n[{i}/{len(models)}] Avaliando: {model_name}")
        print("-" * 40)

        start_time = time.time()

        # Executa validação cruzada
        cv_results = cross_validate_stratified(
            model, X_normalized, y_binary,
            n_folds=n_folds,
            verbose=True
        )

        elapsed_time = time.time() - start_time

        results[model_name] = cv_results

        # Imprime resumo
        print(f"\nResumo {model_name}:")
        print(f"  Acurácia:  {cv_results['accuracy_mean']:.4f} ± {cv_results['accuracy_std']:.4f}")
        print(f"  Precisão:  {cv_results['precision_mean']:.4f} ± {cv_results['precision_std']:.4f}")
        print(f"  F1-Score:  {cv_results['f1_score_mean']:.4f} ± {cv_results['f1_score_std']:.4f}")
        print(f"  Tempo Treino: {cv_results['train_time_mean']:.2f}s ± {cv_results['train_time_std']:.2f}s")
        print(f"  Tempo Teste:  {cv_results['test_time_mean']:.2f}s ± {cv_results['test_time_std']:.2f}s")
        print(f"  Tempo Total:  {elapsed_time:.2f}s")

    # ========== GERAÇÃO DE RESULTADOS ==========
    print("\n[5/6] GERAÇÃO DE TABELAS E GRÁFICOS")
    print("-" * 80)

    # Cria diretórios de resultados
    os.makedirs('../results/figures', exist_ok=True)
    os.makedirs('../results/tables', exist_ok=True)

    # Gera tabela Markdown
    print("Gerando tabela Markdown...")
    md_table = generate_markdown_table(results, '../results/tables/results.md')
    print("  ✓ Salva em: results/tables/results.md")

    # Gera tabela LaTeX
    print("Gerando tabela LaTeX...")
    latex_table = generate_results_table(results, '../results/tables/results.tex')
    print("  ✓ Salva em: results/tables/results.tex")

    # Gera gráficos
    print("Gerando gráficos...")

    print("  - Comparação de métricas...")
    plot_metrics_comparison(results, '../results/figures/metrics_comparison.png')

    print("  - Tempos de execução...")
    plot_training_times(results, '../results/figures/training_times.png')

    print("  - Performance vs Tempo...")
    plot_performance_vs_time(results, '../results/figures/performance_vs_time.png')

    print("  ✓ Gráficos salvos em: results/figures/")

    # ========== ANÁLISE FINAL ==========
    print("\n[6/6] ANÁLISE COMPARATIVA")
    print("=" * 80)

    # Encontra melhor modelo por métrica
    best_accuracy = max(results.items(), key=lambda x: x[1]['accuracy_mean'])
    best_f1 = max(results.items(), key=lambda x: x[1]['f1_score_mean'])
    fastest_train = min(results.items(), key=lambda x: x[1]['train_time_mean'])

    print("MELHORES CLASSIFICADORES POR CRITÉRIO:")
    print("-" * 80)
    print(f"Melhor Acurácia:  {best_accuracy[0]}")
    print(f"  → {best_accuracy[1]['accuracy_mean']:.4f} ± {best_accuracy[1]['accuracy_std']:.4f}")
    print()
    print(f"Melhor F1-Score:  {best_f1[0]}")
    print(f"  → {best_f1[1]['f1_score_mean']:.4f} ± {best_f1[1]['f1_score_std']:.4f}")
    print()
    print(f"Mais Rápido (Treino): {fastest_train[0]}")
    print(f"  → {fastest_train[1]['train_time_mean']:.2f}s ± {fastest_train[1]['train_time_std']:.2f}s")
    print()

    # Análise de trade-off
    print("ANÁLISE DE TRADE-OFF (Desempenho vs Eficiência):")
    print("-" * 80)

    for model_name, result in results.items():
        acc = result['accuracy_mean']
        time_total = result['train_time_mean'] + result['test_time_mean']
        efficiency_score = acc / (time_total + 0.01)  # Score de eficiência

        print(f"{model_name}")
        print(f"  Acurácia: {acc:.4f} | Tempo Total: {time_total:.2f}s | Score: {efficiency_score:.4f}")

    print("=" * 80)

    # Salva resultados completos em arquivo texto
    with open('../results/summary.txt', 'w') as f:
        f.write("=" * 80 + "\n")
        f.write(" " * 20 + "PROJETO IA AV3 - RESULTADOS\n")
        f.write("=" * 80 + "\n\n")
        f.write("Dataset: Appliances Energy Prediction\n")
        f.write(f"Instâncias: {len(y_binary)}\n")
        f.write(f"Features: {X_normalized.shape[1]}\n")
        f.write(f"Validação Cruzada: {n_folds}-fold\n\n")
        f.write(md_table)
        f.write("\n\n")
        f.write(f"Melhor Modelo (Acurácia): {best_accuracy[0]}\n")
        f.write(f"Melhor Modelo (F1-Score): {best_f1[0]}\n")

    print("\n✓ EXPERIMENTOS CONCLUÍDOS COM SUCESSO!")
    print(f"✓ Resultados salvos em: results/")
    print("=" * 80)


if __name__ == "__main__":
    main()
