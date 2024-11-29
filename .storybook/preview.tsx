import React from 'react';
import type { Preview } from '@storybook/react';
// NOTE: 絶対パスの場合、storybookのbuildが失敗する
import '../app/globals.css';
import './storybook.css';

const customViewports = {
  sampleView: {
    name: 'Sample View',
    styles: {
      width: '1424px',
      height: 'calc(100vh - 43px)',
    },
  },
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
    viewport: { viewports: customViewports },
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