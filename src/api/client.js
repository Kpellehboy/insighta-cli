const axios = require('axios');
const { loadTokens, saveTokens } = require('../auth/tokenManager');

const BACKEND_URL = process.env.INSIGHTA_API_URL || 'https://stage-1-task-data-persistence-api-d.vercel.app';

let currentTokens = loadTokens();

async function request(method, endpoint, data = null, query = null) {
  if (!currentTokens) throw new Error('Not logged in. Run `insighta login` first.');

  const url = `${BACKEND_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${currentTokens.accessToken}`,
    'X-API-Version': '1',
    'Content-Type': 'application/json'
  };
  const config = { method, url, headers, data, params: query };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Try to refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${currentTokens.accessToken}`;
        const retryResponse = await axios({ ...config, headers });
        return retryResponse.data;
      }
    }
    throw error;
  }
}

async function refreshToken() {
  if (!currentTokens || !currentTokens.refreshToken) return false;
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/refresh`, { refresh_token: currentTokens.refreshToken });
    const { access_token, refresh_token } = response.data;
    saveTokens(access_token, refresh_token);
    currentTokens = { accessToken: access_token, refreshToken: refresh_token };
    return true;
  } catch (error) {
    return false;
  }
}

function setTokens(accessToken, refreshToken) {
  saveTokens(accessToken, refreshToken);
  currentTokens = { accessToken, refreshToken };
}

function clearStoredTokens() {
  const { clearTokens } = require('../auth/tokenManager');
  clearTokens();
  currentTokens = null;
}

module.exports = { request, setTokens, clearStoredTokens, BACKEND_URL };