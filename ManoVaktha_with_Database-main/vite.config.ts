import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    console.log('🔍 Loaded environment variables:', Object.keys(env).filter(key => key.includes('VITE')));
    console.log('🔑 VITE_API_KEY:', env.VITE_API_KEY ? `${env.VITE_API_KEY.substring(0, 5)}...${env.VITE_API_KEY.substring(env.VITE_API_KEY.length - 5)}` : 'Not found');
    
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
        'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Add environment variables to the build
      envDir: '.',
      envPrefix: 'VITE_'
    };
});