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

// Helper to load site configuration (Firestore with local fallback and automatic high-res Unsplash migration)
async function loadConfig() {
  let config: any = null;
  if (db) {
    try {
      const docRef = doc(db, "siteConfigs", "baby_dwelling");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        config = docSnap.data();
        // Backup the firestore data locally
        try {
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
        } catch (err) {
          console.error("Failed to write local backup of Firestore config:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching config from Firestore, falling back to local file:", error);
    }
  }

  // Fallback to local site-config.json
  if (!config) {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, "utf-8");
        config = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading site-config.json fallback:", error);
    }
  }

  // Migrate old banner image and placeholders to stunning high-resolution Unsplash alternatives
  if (config) {
    let changed = false;
    if (!config.heroImage || config.heroImage.includes("aida-public") || config.heroImage.includes("logoImage")) {
      config.heroImage = "https://images.unsplash.com/photo-1544126592-807adc21510d?auto=format&fit=crop&w=2000&q=80";
      changed = true;
    }
    
    // Check if product images are using local placeholder urls and upgrade them
    if (config.products && Array.isArray(config.products)) {
      const unsplashProducts = [
        "https://images.unsplash.com/photo-1544126592-807adc21510d?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=1000&q=80",
      ];
      config.products.forEach((prod: any, index: number) => {
        if (!prod.image || prod.image.includes("aida-public")) {
          prod.image = unsplashProducts[index % unsplashProducts.length];
          changed = true;
        }
        if (prod.images && Array.isArray(prod.images)) {
          prod.images = prod.images.map((img: string, imgIdx: number) => {
            if (!img || img.includes("aida-public")) {
              changed = true;
              return unsplashProducts[(index + imgIdx) % unsplashProducts.length];
            }
            return img;
          });
        }
      });
    }

    if (changed) {
      console.log("Config upgraded with beautiful high-res Unsplash images.");
      await saveConfig(config);
    }
  }

  return config;
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

// Helper to upload images online to catbox.moe anonymously
async function uploadToCatbox(base64Data: string, fileName = "image.jpg"): Promise<string> {
  // Extract pure base64 data and mime type
  const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 string format");
  }
  const mimeType = matches[1];
  const base64String = matches[2];
  const buffer = Buffer.from(base64String, "base64");

  const blob = new Blob([buffer], { type: mimeType });
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, fileName);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload to Catbox failed with status ${response.status}`);
  }

  const url = await response.text();
  return url.trim();
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

  app.post("/api/upload", async (req, res) => {
    try {
      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data" });
      }
      console.log(`Uploading received image '${name || "unnamed"}' to online storage...`);
      const onlineUrl = await uploadToCatbox(image, name || "image.jpg");
      console.log(`Image uploaded successfully. Permanent online URL: ${onlineUrl}`);
      res.json({ success: true, url: onlineUrl });
    } catch (err: any) {
      console.error("Error uploading image online:", err);
      res.status(500).json({ error: err.message || "Failed to upload image online" });
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

