/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  arrowParens: 'avoid',
  endOfLine: 'lf',
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  printWidth: 160,
  quoteProps: 'preserve',
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false
};

export default config;
