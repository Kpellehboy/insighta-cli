const { request } = require('../api/client');
const chalk = require('chalk');
const ora = require('ora');

async function get(id) {
  const spinner = ora('Fetching profile...').start();
  try {
    const data = await request('GET', `/api/profiles/${id}`);
    spinner.stop();
    console.log(chalk.green(JSON.stringify(data, null, 2)));
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || err.message));
  }
}

module.exports = get;