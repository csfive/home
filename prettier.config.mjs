import config from '@mancuoj/prettier-config'

export default {
  ...config,
  plugins: [...config.plugins, 'prettier-plugin-astro'],
}
