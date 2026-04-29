#!/usr/bin/env node
const { program } = require('commander');
const login = require('../src/commands/login');
const logout = require('../src/commands/logout');
const whoami = require('../src/commands/whoami');
const list = require('../src/commands/list');
const get = require('../src/commands/get');
const search = require('../src/commands/search');
const create = require('../src/commands/create');
const exportCmd = require('../src/commands/export');

program
  .name('insighta')
  .description('CLI for Insighta Labs Profile Intelligence System')
  .version('1.0.0');

program.command('login')
  .description('Authenticate with GitHub OAuth')
  .action(login);

program.command('logout')
  .description('Log out and remove stored credentials')
  .action(logout);

program.command('whoami')
  .description('Show current logged-in user')
  .action(whoami);

program.command('profiles-list')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <country>', 'Filter by country code')
  .option('--age-group <group>', 'Filter by age group')
  .option('--min-age <age>', 'Minimum age')
  .option('--max-age <age>', 'Maximum age')
  .option('--sort-by <field>', 'Sort by (age, created_at, gender_probability)')
  .option('--order <order>', 'asc or desc')
  .option('--page <page>', 'Page number')
  .option('--limit <limit>', 'Items per page (max 50)')
  .description('List profiles with filters and pagination')
  .action(list);

program.command('profiles-get <id>')
  .description('Get a single profile by ID')
  .action(get);

program.command('profiles-search <query>')
  .description('Natural language search')
  .option('--page <page>', 'Page number')
  .option('--limit <limit>', 'Items per page')
  .action(search);

program.command('profiles-create --name <name>')
  .description('Create a new profile (admin only)')
  .action(create);

program.command('profiles-export')
  .option('--format <format>', 'Export format (csv only)')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <country>', 'Filter by country')
  .description('Export profiles to CSV')
  .action(exportCmd);

program.parse(process.argv);