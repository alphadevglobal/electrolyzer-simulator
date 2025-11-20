"""
Deploy automatizado para AWS Lambda (Free Tier)
API serverless para modelos de IA
"""
import json
import base64
import numpy as np


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

        # Converte para numpy array
        X = np.array(features).reshape(1, -1)

        # Carrega modelo (simplificado - em produção carregaria do S3)
        # Aqui fazemos uma predição dummy
        prediction = predict_with_model(X, model_type)

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


def predict_with_model(X, model_type='mlp'):
    """
    Faz predição com modelo especificado

    Args:
        X: Features normalizadas
        model_type: Tipo do modelo

    Returns:
        Predição com probabilidades
    """
    import time

    # Em produção, carregaria modelos salvos do S3
    # Por enquanto, retorna predição dummy

    # Simula predição
    prediction_class = 1 if X[0, 0] > 0 else 0
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
