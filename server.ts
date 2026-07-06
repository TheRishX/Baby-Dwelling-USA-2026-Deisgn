import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const CONFIG_FILE = path.join(process.cwd(), "site-config.json");
const FIREBASE_CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");

let db: any = null;

// Initialize Firebase if the configuration is available
if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
  try {
    const fbConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, "utf-8"));
    const firebaseConfig = {
      apiKey: fbConfig.apiKey,
      authDomain: fbConfig.authDomain,
      projectId: fbConfig.projectId,
      storageBucket: fbConfig.storageBucket,
      messagingSenderId: fbConfig.messagingSenderId,
      appId: fbConfig.appId,
    };
    
    const app = initializeApp(firebaseConfig);
    // Use the custom database ID if specified, otherwise default
    db = getFirestore(app, fbConfig.firestoreDatabaseId || "(default)");
    console.log("Firebase Firestore successfully initialized for project:", fbConfig.projectId);
  } catch (error) {
    console.error("Failed to initialize Firebase Firestore:", error);
  }
} else {
  console.warn("firebase-applet-config.json not found. Running with local fallback only.");
}

// Helper to load site configuration (Firestore with local fallback)
async function loadConfig() {
  if (db) {
    try {
      const docRef = doc(db, "siteConfigs", "baby_dwelling");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Backup the firestore data locally
        try {
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
        } catch (err) {
          console.error("Failed to write local backup of Firestore config:", err);
        }
        return data;
      }
    } catch (error) {
      console.error("Error fetching config from Firestore, falling back to local file:", error);
    }
  }

  // Fallback to local site-config.json
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading site-config.json fallback:", error);
  }
  return null;
}

// Helper to save site configuration (Firestore + local backup)
async function saveConfig(config: any) {
  if (db) {
    try {
      const docRef = doc(db, "siteConfigs", "baby_dwelling");
      await setDoc(docRef, config);
      console.log("Configuration saved to Firestore successfully!");
    } catch (error) {
      console.error("Error saving config to Firestore:", error);
    }
  }

  // Always write locally as a persistent local backup
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing site-config.json locally:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing with larger size limit for custom base64 logos or images
  app.use(express.json({ limit: "20mb" }));

  // API endpoints must go FIRST
  app.get("/api/site-config", async (req, res) => {
    const config = await loadConfig();
    res.json({ config });
  });

  app.post("/api/site-config", async (req, res) => {
    const { config } = req.body;
    if (config) {
      await saveConfig(config);
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

