import { checkDbHealth } from "./db";

app.get("/health", async (req, res) => {
  const dbHealthy = await checkDbHealth();

  if (!dbHealthy) {
    return res.status(500).json({ status: "DOWN" });
  }

  res.json({ status: "OK" });
});

import { closeDb } from "./db";

process.on("SIGINT", async () => {
  await closeDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDb();
  process.exit(0);
});