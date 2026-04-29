const axios = require('axios');
const { loadTokens, saveTokens } = require('../auth/tokenManager');

const BACKEND_URL = process.env.INSIGHTA_API_URL || 'http://localhost:3000';

let currentTokens = loadTokens();

async function request(method, endpoint, data = null, query = null) {
  if (!currentTokens || !currentTokens.accessToken) {
    throw new Error('Not logged in. Run `insighta login` first.');
  }

  const url = `${BACKEND_URL}${endpoint}`;
  let config = {
    method,
    url,
    headers: {
      'Authorization': `Bearer ${currentTokens.accessToken}`,
      'X-API-Version': '1',
      'Content-Type': 'application/json'
    },
    params: query,
    data
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        config.headers.Authorization = `Bearer ${currentTokens.accessToken}`;
        const retryResponse = await axios(config);
        return retryResponse.data;
      }
    }
    throw error;
  }
}

async function refreshToken() {
  if (!currentTokens || !currentTokens.refreshToken) return false;
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/refresh`, {
      refresh_token: currentTokens.refreshToken
    });
    const { access_token, refresh_token } = response.data;
    saveTokens(access_token, refresh_token);
    currentTokens = { accessToken: access_token, refreshToken: refresh_token };
    return true;
  } catch (err) {
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

module.exports = { request, setTokens, clearStoredTokens };