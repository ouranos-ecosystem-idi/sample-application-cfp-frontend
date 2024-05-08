import React from 'react';
import type { Preview } from '@storybook/react';
// NOTE: 絶対パスの場合、storybookのbuildが失敗する
import '../app/globals.css';
import './storybook.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          fontFamily: 'Noto Sans JP',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
