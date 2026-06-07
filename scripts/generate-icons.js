/**
 * Generates icon-192.png and icon-512.png from icon.svg
 * Requires: npm install sharp  (run once)
 */
const fs = require("fs");
const nodePath = require("path");

async function run() {
  let sharp;
  try { sharp = require("sharp"); } catch {
    console.log("Installing sharp...");
    require("child_process").execSync("npm install sharp", { stdio: "inherit" });
    sharp = require("sharp");
  }

  const svgBuf = fs.readFileSync(nodePath.join(__dirname, "..", "public", "icon.svg"));
  for (const size of [192, 512]) {
    await sharp(svgBuf).resize(size, size).png().toFile(nodePath.join(__dirname, "..", "public", `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }
}
run().catch(console.error);
