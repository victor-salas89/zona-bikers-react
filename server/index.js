import { createServer } from 'node:http';
import { crearChatHandler } from './chat.js';

const chat = crearChatHandler({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL });
createServer((req, res) => {
  const origen = process.env.CHAT_ALLOWED_ORIGIN;
  if (origen) {
    res.setHeader('Vary', 'Origin');
    if (req.headers.origin === origen) {
      res.setHeader('Access-Control-Allow-Origin', origen);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } else if (req.headers.origin) {
      res.writeHead(403);
      return res.end();
    }
  }
  if (req.url === '/api/chat' && req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }
  if (req.url === '/api/chat') return chat(req, res);
  res.writeHead(404);
  res.end();
}).listen(Number(process.env.PORT || 3001), process.env.HOST || '127.0.0.1', () => console.log('API de Biker IA iniciada'));
