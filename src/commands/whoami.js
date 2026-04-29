const { loadTokens } = require('../auth/tokenManager');
const { request } = require('../api/client');
const chalk = require('chalk');
const ora = require('ora');

async function whoami() {
  const tokens = loadTokens();
  if (!tokens) {
    console.log(chalk.red('Not logged in. Run `insighta login` first.'));
    return;
  }
  const spinner = ora('Fetching user info...').start();
  try {
    const data = await request('GET', '/api/users/me');
    spinner.stop();
    console.log(chalk.green(`Logged in as: ${data.username} (${data.role})`));
    console.log(`Email: ${data.email}`);
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || err.message));
  }
}

module.exports = whoami;