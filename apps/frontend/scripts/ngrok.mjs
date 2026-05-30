import ngrok from '@ngrok/ngrok';

const port = Number(process.argv[2] ?? process.env.PORT ?? 3000);

try {
  const listener = await ngrok.forward({
    addr: port,
    authtoken_from_env: true,
  });

  console.log(`ngrok tunnel started: ${listener.url()}`);
  console.log(`forwarding to: http://localhost:${port}`);
  console.log('press Ctrl+C to stop');

  process.stdin.resume();

  const close = async () => {
    await listener.close();
    process.exit(0);
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
