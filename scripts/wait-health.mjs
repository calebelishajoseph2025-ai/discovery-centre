async function wait() {
  for (let i = 0; i < 30; i += 1) {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/health');
      const text = await res.text();
      console.log('up', res.status, text);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.log('still down');
}
await wait();
