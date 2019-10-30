import Redis from 'ioredis';
import config from './config';

const clients = [];
function createClient() {
  if (config.get('redis')) {
    const client = new Redis(config.get('redis'), {
      retryStrategy(times) {
        return Math.min(Math.exp(times), 20000);
      },
    });

    clients.push(client);
    return client;
  }
  return null;
}

export const pubClient = createClient();
export const subClient = createClient();
