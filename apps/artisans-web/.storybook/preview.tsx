import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    // Fondo real de la app (gradientes cream de .telar-page) para que el glass se vea como en producción
    (Story) => (
      <div className="telar-page min-h-screen p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;
