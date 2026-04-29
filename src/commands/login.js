const open = require('open');
const crypto = require('crypto');
const http = require('http');
const url = require('url');
const { setTokens, BACKEND_URL } = require('../api/client');
const chalk = require('chalk');
const ora = require('ora');

function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

async function login() {
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = `${BACKEND_URL}/auth/github?state=${state}&code_challenge=${codeChallenge}`;

  const spinner = ora('Opening browser for GitHub login...').start();
  await open(authUrl);
  spinner.text = 'Waiting for authentication...';

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/callback') {
      const { code, state: returnedState } = parsedUrl.query;
      if (returnedState !== state) {
        res.end('Invalid state parameter');
        server.close();
        return;
      }
      // Exchange code + code_verifier
      try {
        const axios = require('axios');
        const tokenResponse = await axios.post(`${BACKEND_URL}/auth/github/callback`, null, {
          params: { code, code_verifier: codeVerifier }
        });
        const { access_token, refresh_token } = tokenResponse.data;
        setTokens(access_token, refresh_token);
        res.end('Login successful! You can close this window.');
        spinner.succeed(chalk.green('Logged in successfully!'));
        server.close();
      } catch (err) {
        res.end('Login failed. Check console.');
        spinner.fail(chalk.red('Login failed.'));
        server.close();
      }
    }
  });

  server.listen(3001, () => {
    console.log(chalk.blue(`Callback server running on http://localhost:3001`));
  });
}

module.exports = login;