module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'vue/no-v-html': 'off',
    'vue/v-slot-style': 'off',
    'vue/valid-v-slot': 'off',
    'no-underscore-dangle': 'off',
    'consistent-return': 'off',
    'no-cond-assign': 'off',
  },
};
