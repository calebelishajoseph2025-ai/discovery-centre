const ports = [3000, 5173, 4173, 8080, 5000];
for (const port of ports) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    const text = await res.text();
    console.log(`PORT ${port} ${res.status} ${text.slice(0, 200)}`);
  } catch (error) {
    console.log(`PORT ${port} down ${error instanceof Error ? error.message : String(error)}`);
  }
}
