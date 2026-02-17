const { createApp } = require('./app');

function resolvePort() {
  const rawPort = process.env.PORT;
  if (rawPort === undefined || rawPort === null || rawPort === '') {
    return 3000;
  }

  const parsed = Number.parseInt(rawPort, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 65535) {
    console.warn(`Invalid PORT value "${rawPort}". Falling back to 3000.`);
    return 3000;
  }

  return parsed;
}

const port = resolvePort();
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});
