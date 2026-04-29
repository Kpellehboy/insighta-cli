const { request } = require('../api/client');
const chalk = require('chalk');
const ora = require('ora');

async function create(opts) {
  if (!opts.name) {
    console.log(chalk.red('Error: --name is required'));
    return;
  }
  const spinner = ora('Creating profile...').start();
  try {
    const data = await request('POST', '/api/profiles', { name: opts.name });
    spinner.stop();
    console.log(chalk.green('Profile created successfully:'));
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || err.message));
  }
}

module.exports = create;