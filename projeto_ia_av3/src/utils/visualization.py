"""
Visualização de resultados
Gera gráficos e tabelas para análise
"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Para salvar sem display


def plot_confusion_matrix(cm, class_names, save_path=None):
    """
    Plota matriz de confusão

    Args:
        cm: Matriz de confusão
        class_names: Nomes das classes
        save_path: Caminho para salvar figura
    """
    fig, ax = plt.subplots(figsize=(10, 8))

    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)

    ax.set(xticks=np.arange(cm.shape[1]),
           yticks=np.arange(cm.shape[0]),
           xticklabels=class_names,
           yticklabels=class_names,
           ylabel='True label',
           xlabel='Predicted label')

    # Rotaciona labels
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    # Adiciona valores nas células
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], 'd'),
                   ha="center", va="center",
                   color="white" if cm[i, j] > thresh else "black")

    fig.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_metrics_comparison(results_dict, save_path=None):
    """
    Plota comparação de métricas entre classificadores

    Args:
        results_dict: Dict com resultados de cada classificador
        save_path: Caminho para salvar
    """
    classifiers = list(results_dict.keys())
    metrics = ['accuracy_mean', 'f1_score_mean', 'precision_mean']
    metric_names = ['Acurácia', 'F1-Score', 'Precisão']

    x = np.arange(len(classifiers))
    width = 0.25

    fig, ax = plt.subplots(figsize=(14, 6))

    for i, (metric, name) in enumerate(zip(metrics, metric_names)):
        values = [results_dict[clf][metric] for clf in classifiers]
        errors = [results_dict[clf][metric.replace('_mean', '_std')] for clf in classifiers]
        ax.bar(x + i * width, values, width, label=name, yerr=errors, capsize=5)

    ax.set_xlabel('Classificadores', fontsize=12)
    ax.set_ylabel('Score', fontsize=12)
    ax.set_title('Comparação de Métricas entre Classificadores', fontsize=14, fontweight='bold')
    ax.set_xticks(x + width)
    ax.set_xticklabels(classifiers, rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)

    fig.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_training_times(results_dict, save_path=None):
    """
    Plota tempos de treinamento e teste

    Args:
        results_dict: Dict com resultados
        save_path: Caminho para salvar
    """
    classifiers = list(results_dict.keys())
    train_times = [results_dict[clf]['train_time_mean'] for clf in classifiers]
    test_times = [results_dict[clf]['test_time_mean'] for clf in classifiers]

    x = np.arange(len(classifiers))
    width = 0.35

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.bar(x - width/2, train_times, width, label='Tempo de Treino', alpha=0.8)
    ax.bar(x + width/2, test_times, width, label='Tempo de Teste', alpha=0.8)

    ax.set_xlabel('Classificadores', fontsize=12)
    ax.set_ylabel('Tempo (segundos)', fontsize=12)
    ax.set_title('Comparação de Tempos de Execução', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(classifiers, rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)

    fig.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_performance_vs_time(results_dict, save_path=None):
    """
    Scatter plot: Performance vs Tempo de Execução

    Args:
        results_dict: Dict com resultados
        save_path: Caminho para salvar
    """
    classifiers = list(results_dict.keys())
    accuracies = [results_dict[clf]['accuracy_mean'] for clf in classifiers]
    total_times = [results_dict[clf]['train_time_mean'] + results_dict[clf]['test_time_mean']
                   for clf in classifiers]

    fig, ax = plt.subplots(figsize=(10, 8))

    colors = plt.cm.viridis(np.linspace(0, 1, len(classifiers)))

    for i, clf in enumerate(classifiers):
        ax.scatter(total_times[i], accuracies[i], s=200, c=[colors[i]],
                  alpha=0.6, edgecolors='black', linewidth=2)
        ax.annotate(clf, (total_times[i], accuracies[i]),
                   xytext=(10, 10), textcoords='offset points',
                   fontsize=9, bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.3))

    ax.set_xlabel('Tempo Total (Treino + Teste) [s]', fontsize=12)
    ax.set_ylabel('Acurácia', fontsize=12)
    ax.set_title('Relação Desempenho vs Eficiência Computacional',
                fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)

    fig.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def generate_results_table(results_dict, save_path=None):
    """
    Gera tabela de resultados em formato LaTeX

    Args:
        results_dict: Dict com resultados
        save_path: Caminho para salvar arquivo .tex
    """
    table = "\\begin{table}[h]\n"
    table += "\\centering\n"
    table += "\\begin{tabular}{|l|c|c|c|c|c|}\n"
    table += "\\hline\n"
    table += "\\textbf{Classificador} & \\textbf{Acurácia} & \\textbf{Precisão} & "
    table += "\\textbf{F1-Score} & \\textbf{Tempo Treino (s)} & \\textbf{Tempo Teste (s)} \\\\\n"
    table += "\\hline\n"

    for clf_name, results in results_dict.items():
        acc_mean = results['accuracy_mean']
        acc_std = results['accuracy_std']
        prec_mean = results['precision_mean']
        prec_std = results['precision_std']
        f1_mean = results['f1_score_mean']
        f1_std = results['f1_score_std']
        train_mean = results['train_time_mean']
        train_std = results['train_time_std']
        test_mean = results['test_time_mean']
        test_std = results['test_time_std']

        table += f"{clf_name} & "
        table += f"{acc_mean:.2f} $\\pm$ {acc_std:.2f} & "
        table += f"{prec_mean:.2f} $\\pm$ {prec_std:.2f} & "
        table += f"{f1_mean:.2f} $\\pm$ {f1_std:.2f} & "
        table += f"{train_mean:.2f} $\\pm$ {train_std:.2f} & "
        table += f"{test_mean:.2f} $\\pm$ {test_std:.2f} \\\\\n"

    table += "\\hline\n"
    table += "\\end{tabular}\n"
    table += "\\caption{Análise comparativa do desempenho dos classificadores}\n"
    table += "\\label{tab:results}\n"
    table += "\\end{table}\n"

    if save_path:
        with open(save_path, 'w') as f:
            f.write(table)

    return table


def generate_markdown_table(results_dict, save_path=None):
    """
    Gera tabela de resultados em Markdown

    Args:
        results_dict: Dict com resultados
        save_path: Caminho para salvar
    """
    table = "| Classificador | Acurácia | Precisão | F1-Score | Tempo Treino (s) | Tempo Teste (s) |\n"
    table += "|--------------|----------|----------|----------|------------------|------------------|\n"

    for clf_name, results in results_dict.items():
        acc_mean = results['accuracy_mean']
        acc_std = results['accuracy_std']
        prec_mean = results['precision_mean']
        prec_std = results['precision_std']
        f1_mean = results['f1_score_mean']
        f1_std = results['f1_score_std']
        train_mean = results['train_time_mean']
        train_std = results['train_time_std']
        test_mean = results['test_time_mean']
        test_std = results['test_time_std']

        table += f"| {clf_name} | "
        table += f"{acc_mean:.2f} ± {acc_std:.2f} | "
        table += f"{prec_mean:.2f} ± {prec_std:.2f} | "
        table += f"{f1_mean:.2f} ± {f1_std:.2f} | "
        table += f"{train_mean:.2f} ± {train_std:.2f} | "
        table += f"{test_mean:.2f} ± {test_std:.2f} |\n"

    if save_path:
        with open(save_path, 'w') as f:
            f.write(table)

    return table


def plot_learning_curve(model_name, train_scores, val_scores, save_path=None):
    """
    Plota curva de aprendizado

    Args:
        model_name: Nome do modelo
        train_scores: Scores de treino por época
        val_scores: Scores de validação por época
        save_path: Caminho para salvar
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    epochs = np.arange(1, len(train_scores) + 1)

    ax.plot(epochs, train_scores, 'b-', label='Treino', linewidth=2)
    ax.plot(epochs, val_scores, 'r-', label='Validação', linewidth=2)

    ax.set_xlabel('Época', fontsize=12)
    ax.set_ylabel('Score', fontsize=12)
    ax.set_title(f'Curva de Aprendizado - {model_name}', fontsize=14, fontweight='bold')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)

    fig.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
