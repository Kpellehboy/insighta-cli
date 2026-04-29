const crypto = require('crypto');
const axios = require('axios');
const { setTokens } = require('../api/client');
const chalk = require('chalk');
const ora = require('ora');
const opener = require('opener');

const BACKEND_URL = process.env.INSIGHTA_API_URL || 'http://localhost:3000';

function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

async function login() {
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = `${BACKEND_URL}/auth/github?state=${state}&code_challenge=${codeChallenge}&code_verifier=${codeVerifier}&cli=1`;

  const spinner = ora('Opening browser for GitHub login...').start();
  opener(authUrl);
  spinner.text = 'Waiting for authentication (polling)...';

  // Poll for token every 2 seconds for 2 minutes
  let attempts = 0;
  const pollInterval = setInterval(async () => {
    attempts++;
    if (attempts > 60) { // 2 minutes
      clearInterval(pollInterval);
      spinner.fail(chalk.red('Login timeout. Please try again.'));
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/auth/token?state=${state}`);
      if (response.data.status === 'success') {
        clearInterval(pollInterval);
        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
        spinner.succeed(chalk.green('Logged in successfully!'));
      }
    } catch (err) {
      // ignore 404 – token not ready yet
    }
  }, 2000);
}

module.exports = login;