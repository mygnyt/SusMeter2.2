import localtunnel from 'localtunnel';

const PORT = 3000;
const DESIRED_SUBDOMAIN = 'susmeter-cs';

async function startTunnel() {
  console.log(`[Tunnel] Initializing tunnel for http://localhost:${PORT}...`);

  while (true) {
    try {
      const tunnel = await localtunnel({
        port: PORT,
        subdomain: DESIRED_SUBDOMAIN,
      });

      console.log(`[Tunnel] Public URL: ${tunnel.url}`);

      await new Promise((resolve) => {
        tunnel.on('close', () => {
          console.log('[Tunnel] Connection closed. Reconnecting in 2 seconds...');
          resolve(true);
        });

        tunnel.on('error', (err) => {
          console.error('[Tunnel] Error:', err?.message || err);
          tunnel.close();
          resolve(true);
        });
      });
    } catch (err) {
      console.error('[Tunnel] Failed to establish tunnel, retrying in 3 seconds...', err?.message || err);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
}

startTunnel();
