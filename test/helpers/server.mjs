import next from 'next';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

export async function startServer({ dev = false } = {}) {
  const app = next({ dev, dir: fileURLToPath(new URL('../../', import.meta.url)), quiet: true, hostname: '127.0.0.1' });
  await app.prepare();
  const server = createServer(app.getRequestHandler());
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await app.close();
    },
  };
}
