import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { crearChatHandler } from './server/chat.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'GEMINI_');
  const conectarChat = (server) => {
    const handler = crearChatHandler({ apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL });
    server.middlewares.use('/api/chat', handler);
  };
  return {
  base: './',
  plugins: [react(), { name: 'biker-chat-local', configureServer: conectarChat, configurePreviewServer: conectarChat }],
  };
})
