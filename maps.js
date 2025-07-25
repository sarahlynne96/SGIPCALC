// DAC & HFTD map eligibility checker
// Uses CalEnviroScreen 4.0 DAC (SB 535) + CPUC HFTD maps

let inDAC = false;
let inFire = false;

async function fetchGeoJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch GeoJSON");
  return await res.json();
}

function pointInPolygon(point, polygon) {
  let [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeoJSON(point, geojson) {
  const [x, y] = point;
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (geom.type === "Polygon") {
      const coords = geom.coordinates[0];
      if (pointInPolygon(point, coords)) return true;
    } else if (geom.type === "MultiPolygon") {
      for (const polygon of geom.coordinates) {
        if (pointInPolygon(point, polygon[0])) return true;
      }
    }
  }
  return false;
}

async function checkLocationDACFire(lat, lon) {
  const statusBox = document.getElementById("map-status");
  statusBox.textContent = "Checking maps...";

  try {
    const dacUrl = "https://raw.githubusercontent.com/BlackrockDigital/startbootstrap-sb-admin-2/master/maps/sb535-dac.geojson";
    const fireUrl = "https://raw.githubusercontent.com/BlackrockDigital/startbootstrap-sb-admin-2/master/maps/cpuc-fire-threat.geojson";

    const [dacGeo, fireGeo] = await Promise.all([
      fetchGeoJSON(dacUrl),
      fetchGeoJSON(fireUrl)
    ]);

    const point = [lon, lat];
    inDAC = pointInGeoJSON(point, dacGeo);
    inFire = pointInGeoJSON(point, fireGeo);

    let statusText = [];
    if (inDAC) statusText.push("✅ DAC eligible");
    else statusText.push("❌ Not in DAC");

    if (inFire) statusText.push("✅ Fire Threat Zone");
    else statusText.push("❌ Not in Fire Threat Zone");

    statusBox.textContent = statusText.join(" | ");
  } catch (err) {
    console.error(err);
    statusBox.textContent = "Map check failed.";
  }
}

export { checkLocationDACFire, inDAC, inFire };
