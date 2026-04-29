const { request } = require('../api/client');
const Table = require('cli-table3');
const chalk = require('chalk');
const ora = require('ora');

async function search(query, options) {
  const spinner = ora('Searching...').start();
  try {
    const params = { q: query };
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    const data = await request('GET', '/api/profiles/search', null, params);
    spinner.stop();
    const table = new Table({ head: ['ID (short)', 'Name', 'Gender', 'Age', 'Country'] });
    data.data.forEach(p => {
      table.push([p.id.slice(0, 8), p.name, p.gender, p.age, p.country_id]);
    });
    console.log(table.toString());
    console.log(chalk.gray(`Page ${data.page} of ${data.total_pages} | Found: ${data.total}`));
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || err.message));
  }
}

module.exports = search;