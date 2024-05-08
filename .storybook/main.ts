import type { StorybookConfig } from '@storybook/nextjs';
import TsPaths from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  stories: [
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  staticDirs: [
    {
      from: '../fonts',
      to: 'fonts',
    },
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    if (!config.resolve) {
      return config;
    }
    config.resolve.plugins = [...(config.resolve.plugins || []), new TsPaths()];
    return config;
  },
};
export default config;
