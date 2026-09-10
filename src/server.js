import { createApp } from './app.js';
const port = Number(process.env.PORT || 3500);
createApp({ databasePath: process.env.DATABASE_PATH || './data/evidence-hub.db' }).server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ level: 'info', message: 'listening', port })));
