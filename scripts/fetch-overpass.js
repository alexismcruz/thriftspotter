/**
 * Fetches US thrift stores from OpenStreetMap Overpass API.
 * Run: node scripts/fetch-overpass.js
 * Output: scripts/data/overpass.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const QUERY = `
[out:json][timeout:120];
area["ISO3166-1"="US"]->.us;
(
  node["shop"="second_hand"](area.us);
  node["shop"="charity"](area.us);
  node["shop"="thrift"](area.us);
  way["shop"="second_hand"](area.us);
  way["shop"="charity"](area.us);
  way["shop"="thrift"](area.us);
);
out center tags;
`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fetchOverpass() {
  let lastError;
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`Trying ${endpoint}…`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "ThriftSpotter/1.0" },
        body: `data=${encodeURIComponent(QUERY)}`,
        signal: AbortSignal.timeout(130_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log(`Got ${data.elements.length} elements.`);
      mkdirSync(join(__dirname, "data"), { recursive: true });
      writeFileSync(join(__dirname, "data/overpass.json"), JSON.stringify(data, null, 2));
      console.log("Saved to scripts/data/overpass.json");
      return;
    } catch (err) {
      console.error(`Failed: ${err.message}`);
      lastError = err;
    }
  }
  throw lastError;
}

fetchOverpass().catch((e) => { console.error(e); process.exit(1); });
