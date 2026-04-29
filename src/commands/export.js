const { requestWithRawResponse } = require('../api/client'); // we'll add helper
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

async function exportCmd(options) {
  if (options.format !== 'csv') {
    console.log(chalk.red('Only CSV export is supported.'));
    return;
  }
  const spinner = ora('Exporting profiles...').start();
  try {
    const query = {};
    if (options.gender) query.gender = options.gender;
    if (options.country) query.country_id = options.country;
    if (options.ageGroup) query.age_group = options.ageGroup;
    if (options.minAge) query.min_age = options.minAge;
    if (options.maxAge) query.max_age = options.maxAge;
    if (options.sortBy) query.sort_by = options.sortBy;
    if (options.order) query.order = options.order;

    const url = new URL(`${process.env.INSIGHTA_API_URL || 'http://localhost:3000'}/api/profiles/export`);
    url.search = new URLSearchParams(query).toString();
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${require('../auth/tokenManager').loadTokens().accessToken}`,
        'X-API-Version': '1'
      }
    });
    const blob = await response.text();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profiles_${timestamp}.csv`;
    fs.writeFileSync(path.join(process.cwd(), filename), blob);
    spinner.succeed(chalk.green(`Exported to ${filename}`));
  } catch (err) {
    spinner.fail(chalk.red(err.message));
  }
}

module.exports = exportCmd;