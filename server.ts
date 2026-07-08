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

// Helper to update versions only when image URLs actually changed
function updateConfigImageVersions(oldConfig: any, newConfig: any) {
  const timestamp = Date.now();
  
  // 1. Hero Image
  if (newConfig.heroImage) {
    const oldHero = oldConfig?.heroImage || "";
    // Check if the base URL actually changed (ignoring existing ?v= query parameter)
    const cleanOld = oldHero.split("?")[0];
    const cleanNew = newConfig.heroImage.split("?")[0];
    if (cleanOld !== cleanNew) {
      newConfig.heroImage = cleanNew.startsWith("data:") ? cleanNew : `${cleanNew}?v=${timestamp}`;
    }
  }

  // 2. Logo Image
  if (newConfig.logoImage) {
    const oldLogo = oldConfig?.logoImage || "";
    const cleanOld = oldLogo.split("?")[0];
    const cleanNew = newConfig.logoImage.split("?")[0];
    if (cleanOld !== cleanNew) {
      newConfig.logoImage = cleanNew.startsWith("data:") ? cleanNew : `${cleanNew}?v=${timestamp}`;
    }
  }

  // 3. Product Images
  if (newConfig.products && Array.isArray(newConfig.products)) {
    newConfig.products.forEach((prod: any, idx: number) => {
      const oldProd = oldConfig?.products?.[idx];
      const oldImg = oldProd?.image || "";
      if (prod.image) {
        const cleanOld = oldImg.split("?")[0];
        const cleanNew = prod.image.split("?")[0];
        if (cleanOld !== cleanNew) {
          prod.image = cleanNew.startsWith("data:") ? cleanNew : `${cleanNew}?v=${timestamp}`;
        }
      }
    });
  }
}

// Helper to save site configuration (Firestore + local backup)
async function saveConfig(config: any) {
  // Load existing config to apply differential versioning to changed images
  let oldConfig: any = null;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      oldConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch (err) {
    // ignore
  }

  // Inject a unique version/lastUpdated timestamp
  config.lastUpdated = Date.now();

  // Apply differential image versioning to auto-invalidate browser and CDN caches
  updateConfigImageVersions(oldConfig, config);

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
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload to Catbox failed with status ${response.status}`);
  }

  const url = await response.text();
  return url.trim();
}

// Robust fallback to tmpfiles.org temporary file hosting (expires in 24 hours, perfect for live previews)
async function uploadToTmpFiles(base64Data: string, fileName = "image.jpg"): Promise<string> {
  const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 string format");
  }
  const mimeType = matches[1];
  const base64String = matches[2];
  const buffer = Buffer.from(base64String, "base64");

  const blob = new Blob([buffer], { type: mimeType });
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload to TmpFiles failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data && data.status === "success" && data.data && data.data.url) {
    // Standard URL: https://tmpfiles.org/12345/image.jpg
    // Direct displayable URL: https://tmpfiles.org/dl/12345/image.jpg
    const originalUrl = data.data.url;
    return originalUrl.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
  }
  throw new Error("Invalid response format from TmpFiles API");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing with larger size limit for custom base64 logos or images
  app.use(express.json({ limit: "20mb" }));

  // API endpoints must go FIRST
  app.get("/api/site-config", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    const config = await loadConfig();
    res.json({ config });
  });

  app.post("/api/site-config", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    const { config } = req.body;
    if (config) {
      await saveConfig(config);
      res.json({ success: true, config });
    } else {
      res.status(400).json({ error: "Missing config object" });
    }
  });

  // Dedicated Enterprise-Level Banner APIs
  app.get("/api/banner", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    try {
      const config = await loadConfig();
      res.json({
        heroImage: config.heroImage,
        lastUpdated: config.lastUpdated || Date.now()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch banner" });
    }
  });

  app.put("/api/banner", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    try {
      const { heroImage } = req.body;
      if (!heroImage) {
        return res.status(400).json({ error: "Missing heroImage URL" });
      }

      const config = await loadConfig();
      config.heroImage = heroImage;
      await saveConfig(config);

      res.json({ success: true, heroImage: config.heroImage, lastUpdated: config.lastUpdated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update banner" });
    }
  });

  app.delete("/api/banner", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    try {
      const config = await loadConfig();
      // Reset to default premium banner
      config.heroImage = "https://images.unsplash.com/photo-1544126592-807adc21510d?auto=format&fit=crop&w=2000&q=80";
      await saveConfig(config);

      res.json({ success: true, heroImage: config.heroImage, lastUpdated: config.lastUpdated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to reset banner" });
    }
  });

  app.post("/api/upload", async (req, res) => {
    try {
      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data" });
      }

      console.log(`Uploading received image '${name || "unnamed"}' to online storage...`);
      let onlineUrl: string | null = null;
      let catboxError: any = null;

      try {
        onlineUrl = await uploadToCatbox(image, name || "image.jpg");
        console.log(`Image uploaded successfully to Catbox: ${onlineUrl}`);
      } catch (err: any) {
        catboxError = err;
        console.log(`Note: Upload to Catbox failed (${err.message || err}), trying TmpFiles as a reliable fallback...`);
        try {
          onlineUrl = await uploadToTmpFiles(image, name || "image.jpg");
          console.log(`Image uploaded successfully to TmpFiles: ${onlineUrl}`);
        } catch (fallbackErr: any) {
          console.log("All online image upload targets failed!");
          throw new Error(`Catbox error: ${catboxError.message || catboxError}. TmpFiles error: ${fallbackErr.message || fallbackErr}`);
        }
      }

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

