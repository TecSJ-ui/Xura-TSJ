import axios, { AxiosRequestConfig } from 'axios';
import getToken from './getToken';

const ERROR_MAPPING: { [key: number]: { statusCode: number, errorMessage: string } } = {
  400: { statusCode: 400, errorMessage: '¡Revisa que los campos sean correctos!' },
  401: { statusCode: 401, errorMessage: '¡Usuario no autorizado!' },
  404: { statusCode: 404, errorMessage: '¡Registro no encontrado!' },
};

interface MakeCallParams {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  query?: string;
}

const makeCall = async ({
  method,
  endpoint,
  data,
  query,
}: MakeCallParams) => {
  const isLoginCall = endpoint === '/sesiones';
  const tokenData = getToken();

  if (!isLoginCall && (!tokenData || !tokenData.token)) {
    return {
      statusCode: 401,
      errorMessage: '¡Usuario no autorizado!',
      data: [],
    };
  }

  const token = isLoginCall ? null : tokenData?.token;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const domain = process.env.NEXT_PUBLIC_URL;
  const url = `${domain}${endpoint}${query || ''}`;

  const config: AxiosRequestConfig = {
    method,
    url,
    headers: {
      api_key: apiKey!,
      ...(token && { Authorization: `Bearer ${token}` }),
      'Content-Type': 'application/json',
    },
    data,
  };

  try {
    const response = await axios(config);

    if (isLoginCall) {
      return {
        statusCode: response.status,
        token: response.data.token,
      };
    }

    return {
      statusCode: response.status,
      data: response.data.data,
    };
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorData = ERROR_MAPPING[statusCode] || {
      statusCode,
      errorMessage: '¡Error Interno del Servidor!',
    };
    return {
      ...errorData,
      data: [],
    };
  }
};

const getData = ({ endpoint, query }: { endpoint: string, query?: string }) => {
  if (!endpoint) {
    return {
      ...ERROR_MAPPING[400],
      data: [],
    };
  }
  return makeCall({ method: 'GET', endpoint, query });
};

const createRecord = ({ data, endpoint }: { data: any, endpoint: string }) => {
  if (!endpoint) {
    return {
      ...ERROR_MAPPING[400],
      data: [],
    };
  }
  return makeCall({ method: 'POST', endpoint, data });
};

const updateRecord = ({ data, endpoint }: { data: any, endpoint: string }) => {
  if (!endpoint) {
    return {
      ...ERROR_MAPPING[400],
      data: [],
    };
  }
  return makeCall({ method: 'PATCH', endpoint, data });
};

const deleteRecord = ({ endpoint }: { endpoint: string }) => {
  if (!endpoint) {
    return {
      ...ERROR_MAPPING[400],
      data: [],
    };
  }
  return makeCall({ method: 'DELETE', endpoint });
};

export {
  getData,
  createRecord,
  updateRecord,
  deleteRecord,
};
