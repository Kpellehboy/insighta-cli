const { request } = require('../api/client');
const Table = require('cli-table3');
const chalk = require('chalk');
const ora = require('ora');

async function list(options) {
  const spinner = ora('Fetching profiles...').start();
  try {
    const query = {};
    if (options.gender) query.gender = options.gender;
    if (options.country) query.country_id = options.country;
    if (options.ageGroup) query.age_group = options.ageGroup;
    if (options.minAge) query.min_age = options.minAge;
    if (options.maxAge) query.max_age = options.maxAge;
    if (options.sortBy) query.sort_by = options.sortBy;
    if (options.order) query.order = options.order;
    if (options.page) query.page = options.page;
    if (options.limit) query.limit = options.limit;

    const data = await request('GET', '/api/profiles', null, query);
    spinner.stop();
    const table = new Table({ head: ['ID', 'Name', 'Gender', 'Age', 'Country', 'Created At'] });
    data.data.forEach(p => {
      table.push([p.id.slice(0,8), p.name, p.gender, p.age, p.country_id, new Date(p.created_at).toLocaleDateString()]);
    });
    console.log(table.toString());
    console.log(chalk.gray(`Page ${data.page} of ${data.total_pages} | Total: ${data.total}`));
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || err.message));
  }
}

module.exports = list;