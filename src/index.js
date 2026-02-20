import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import { searchProducts } from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  // Calculate column widths
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    // Cap column width at 50
    widths[col.key] = Math.min(widths[col.key], 50);
  });

  // Header
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  // Rows
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('klarnaai')
  .description(chalk.bold('Klarna AI CLI') + ' - Search Klarna products from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'API Key (optional for public endpoint)')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API Key set');
    } else {
      printError('No options provided. Use --api-key');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');

    console.log(chalk.bold('\nKlarna AI CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.green('*'.repeat(8)) : chalk.yellow('not set (optional for public endpoint)'));
    console.log('');
  });

// ============================================================
// PRODUCTS
// ============================================================

const productsCmd = program.command('products').description('Search and discover products');

productsCmd
  .command('search <query>')
  .description('Search for products on Klarna')
  .option('--size <n>', 'Number of products to return', '10')
  .option('--budget <amount>', 'Maximum price filter')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const result = await withSpinner('Searching products...', () =>
        searchProducts({
          query,
          size: options.size ? parseInt(options.size) : undefined,
          budget: options.budget ? parseInt(options.budget) : undefined
        })
      );

      if (options.json) {
        printJson(result);
        return;
      }

      const products = result.products || [];

      if (products.length === 0) {
        console.log(chalk.yellow('\nNo products found for: ') + chalk.bold(query));
        return;
      }

      console.log(chalk.bold(`\nFound ${products.length} products for: `) + chalk.cyan(query) + '\n');

      printTable(products, [
        { key: 'name', label: 'Product Name' },
        { key: 'price', label: 'Price' },
        { key: 'url', label: 'URL', format: (v) => v ? v.substring(0, 40) + '...' : '' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// SHOPPING (alias for products)
// ============================================================

const shoppingCmd = program.command('shopping').description('Shopping and product discovery (alias for products)');

shoppingCmd
  .command('find <query>')
  .description('Find products by search query')
  .option('--size <n>', 'Number of results', '10')
  .option('--max-price <amount>', 'Maximum price')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const result = await withSpinner('Finding products...', () =>
        searchProducts({
          query,
          size: options.size ? parseInt(options.size) : undefined,
          budget: options.maxPrice ? parseInt(options.maxPrice) : undefined
        })
      );

      if (options.json) {
        printJson(result);
        return;
      }

      const products = result.products || [];

      console.log(chalk.bold('\nSearch Results\n'));

      products.forEach((product, idx) => {
        console.log(chalk.cyan(`${idx + 1}. ${product.name || 'Unnamed'}`));
        if (product.price) console.log(`   Price: ${chalk.green(product.price)}`);
        if (product.url) console.log(`   URL: ${chalk.dim(product.url)}`);
        console.log('');
      });

      console.log(chalk.dim(`${products.length} results`));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// RECOMMENDATIONS
// ============================================================

const recommendCmd = program.command('recommendations').description('Get product recommendations');

recommendCmd
  .command('get <category>')
  .description('Get product recommendations for a category')
  .option('--budget <amount>', 'Budget constraint')
  .option('--count <n>', 'Number of recommendations', '5')
  .option('--json', 'Output as JSON')
  .action(async (category, options) => {
    try {
      const result = await withSpinner('Fetching recommendations...', () =>
        searchProducts({
          query: category,
          size: options.count ? parseInt(options.count) : 5,
          budget: options.budget ? parseInt(options.budget) : undefined
        })
      );

      if (options.json) {
        printJson(result);
        return;
      }

      const products = result.products || [];

      console.log(chalk.bold(`\nTop recommendations for: `) + chalk.cyan(category) + '\n');

      products.forEach((product, idx) => {
        console.log(chalk.bold.green(`${idx + 1}. ${product.name || 'Product'}`));
        if (product.price) console.log(`   ${product.price}`);
        if (product.attributes && product.attributes.length > 0) {
          console.log(`   ${chalk.dim(product.attributes.slice(0, 3).join(', '))}`);
        }
        console.log('');
      });
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
