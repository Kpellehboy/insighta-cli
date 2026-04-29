const chalk = require('chalk');
const { clearStoredTokens } = require('../api/client');
const axios = require('axios');
const { loadTokens } = require('../auth/tokenManager');

async function logout() {
  const tokens = loadTokens();
  if (tokens && tokens.refreshToken) {
    try {
      await axios.post(`${process.env.INSIGHTA_API_URL || 'http://localhost:3000'}/auth/logout`, {
        refresh_token: tokens.refreshToken
      });
    } catch (err) {
      // ignore backend errors
    }
  }
  clearStoredTokens();
  console.log(chalk.green('Logged out successfully.'));
}

module.exports = logout;