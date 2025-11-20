const DEFAULT_API_URL = 'https://fcxzn6pkr1.execute-api.us-east-1.amazonaws.com/prod';

const API_URL = import.meta.env.VITE_AWS_API_URL || DEFAULT_API_URL;
const API_TOKEN = import.meta.env.VITE_AWS_API_TOKEN || '';

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  return headers;
}

export async function checkAWSHealth() {
  const response = await fetch(`${API_URL}/health`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar status da API AWS');
  }

  return response.json();
}

export async function predictWithAWS(features, model = 'mlp') {
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ features, model }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao consultar API AWS');
  }

  return response.json();
}
