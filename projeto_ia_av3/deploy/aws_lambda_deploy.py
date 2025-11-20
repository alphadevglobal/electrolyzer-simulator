"""
Deploy automatizado para AWS Lambda (Free Tier)
API serverless para modelos de IA
"""
import json
import time


# Handler principal do Lambda
def lambda_handler(event, context):
    """
    Handler principal da função Lambda
    Processa requisições de predição

    Args:
        event: Evento do API Gateway
        context: Contexto do Lambda

    Returns:
        Response com predição
    """
    try:
        # Parse do body
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event

        # Extrai features
        features = body.get('features', [])
        model_type = body.get('model', 'mlp')

        if not features:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Features não fornecidas'
                })
            }

        # Garante lista bidimensional para simplificar lógica
        if isinstance(features[0], list):
            rows = [[float(val) for val in row] for row in features]
        else:
            rows = [[float(val) for val in features]]

        # Carrega modelo (simplificado - em produção carregaria do S3)
        # Aqui fazemos uma predição dummy
        prediction = predict_with_model(rows, model_type)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            'body': json.dumps({
                'prediction': int(prediction['class']),
                'probability': prediction['probability'],
                'model': model_type,
                'timestamp': prediction['timestamp']
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }


def predict_with_model(features_matrix, model_type='mlp'):
    """
    Faz predição com modelo especificado

    Args:
        X: Features normalizadas
        model_type: Tipo do modelo

    Returns:
        Predição com probabilidades
    """
    # Em produção, carregaria modelos salvos do S3
    # Por enquanto, retorna predição dummy

    # Simula predição
    first_value = features_matrix[0][0] if features_matrix and features_matrix[0] else 0.0
    prediction_class = 1 if first_value > 0 else 0
    probability = [0.3, 0.7] if prediction_class == 1 else [0.8, 0.2]

    return {
        'class': prediction_class,
        'probability': probability,
        'timestamp': int(time.time())
    }


# Health check endpoint
def health_check(event, context):
    """
    Endpoint de health check
    """
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'healthy',
            'service': 'IA Predictor API',
            'version': '1.0.0'
        })
    }
