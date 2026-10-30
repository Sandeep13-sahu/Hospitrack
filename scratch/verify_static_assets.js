const http = require("http");

const paths = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/config.js",
  "/js/authService.js",
  "/js/store.js",
  "/favicon.ico"
];

async function checkPaths() {
  console.log("=== FRONTEND ASSET SERVING VERIFICATION ===");
  for (const p of paths) {
    await new Promise((resolve) => {
      http.get("http://localhost:8000" + p, (res) => {
        const ct = res.headers["content-type"] || "unknown";
        console.log(`${p.padEnd(20)} HTTP ${res.statusCode} [${ct}]`);
        res.resume();
        resolve();
      }).on("error", (e) => {
        console.error(`${p.padEnd(20)} ERROR: ${e.message}`);
        resolve();
      });
    });
  }
}

checkPaths();

