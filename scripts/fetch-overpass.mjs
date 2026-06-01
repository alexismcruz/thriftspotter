/**
 * Fetches US thrift stores from OpenStreetMap Overpass API.
 * Run: node scripts/fetch-overpass.mjs
 * Output: scripts/data/overpass.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const QUERY = `
[out:json][timeout:120];
area["ISO3166-1"="US"]->.us;
(
  node["shop"="second_hand"](area.us);
  node["shop"="charity"](area.us);
  node["shop"="thrift"](area.us);
  node["shop"="vintage"](area.us);
  node["shop"="consignment"](area.us);
  way["shop"="second_hand"](area.us);
  way["shop"="charity"](area.us);
  way["shop"="thrift"](area.us);
  way["shop"="vintage"](area.us);
  way["shop"="consignment"](area.us);
);
out center tags;
`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fetchOverpass() {
  const encodedQuery = encodeURIComponent(QUERY);
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`Trying ${endpoint}…`);
      const result = execSync(
        `curl -s --max-time 150 --retry 2 -X POST "${endpoint}" --data-urlencode "data=${QUERY.replace(/"/g, '\\"')}" -H "User-Agent: ThriftSpotter/1.0"`,
        { maxBuffer: 100 * 1024 * 1024, timeout: 160000 }
      );
      const text = result.toString();
      if (!text || text.startsWith("<")) throw new Error("Got HTML response (likely error page)");
      const data = JSON.parse(text);
      if (!data.elements) throw new Error("No elements in response");
      console.log(`Got ${data.elements.length} elements.`);
      mkdirSync(join(__dirname, "data"), { recursive: true });
      writeFileSync(join(__dirname, "data/overpass.json"), JSON.stringify(data, null, 2));
      console.log("Saved to scripts/data/overpass.json");
      return;
    } catch (err) {
      console.error(`Failed: ${err.message}`);
    }
  }
  throw new Error("All endpoints failed.");
}

fetchOverpass().catch((e) => { console.error(e); process.exit(1); });
