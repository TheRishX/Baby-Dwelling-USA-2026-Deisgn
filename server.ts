import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const CONFIG_FILE = path.join(process.cwd(), "site-config.json");

// Helper to load site configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading site-config.json:", error);
  }
  return null;
}

// Helper to save site configuration
function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing site-config.json:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing with larger size limit for custom base64 logos or images
  app.use(express.json({ limit: "20mb" }));

  // API endpoints must go FIRST
  app.get("/api/site-config", (req, res) => {
    const config = loadConfig();
    res.json({ config });
  });

  app.post("/api/site-config", (req, res) => {
    const { config } = req.body;
    if (config) {
      saveConfig(config);
      res.json({ success: true, config });
    } else {
      res.status(400).json({ error: "Missing config object" });
    }
  });

  // Serve static assets or use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
