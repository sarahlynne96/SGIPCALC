// geo.js - Validate DAC, Fire Threat Zone, and Utility Service Area from ArcGIS

let inDAC = false;
let inFire = false;
let matchedUtility = null;

const arcgisQuery = async (url, lat, lon) => {
  const geometry = `${lon},${lat}`;
  const params = new URLSearchParams({
    f: 'json',
    geometry,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    outFields: '*'
  });

  const res = await fetch(`${url}?${params.toString()}`);
  const data = await res.json();
  return data.features && data.features.length > 0 ? data.features[0] : null;
};

export async function checkLocationDACFire(lat, lon) {
  const statusBox = document.getElementById("map-status");
  statusBox.textContent = "Querying CPUC maps...";
  try {
    const dacFeature = await arcgisQuery(
      'https://services.arcgis.com/kn47g1qkqAJgi4fT/arcgis/rest/services/SB_535_Disadvantaged_Communities/FeatureServer/0/query',
      lat,
      lon
    );
    const fireFeature = await arcgisQuery(
      'https://services3.arcgis.com/7T4PWXQXpCk0U1vT/arcgis/rest/services/CAPUC_Map_View/FeatureServer/3/query',
      lat,
      lon
    );
    const utilityFeature = await arcgisQuery(
      'https://services3.arcgis.com/7T4PWXQXpCk0U1vT/arcgis/rest/services/CPUC_Territories/FeatureServer/0/query',
      lat,
      lon
    );

    inDAC = !!dacFeature;
    inFire = !!fireFeature;
    matchedUtility = utilityFeature?.attributes?.Utility || null;

    const results = [
      inDAC ? '✅ DAC Eligible' : '❌ Not DAC',
      inFire ? '✅ Fire Threat Zone' : '❌ Not Fire Zone',
      matchedUtility ? `🔌 Utility: ${matchedUtility}` : '⚠ Utility unknown'
    ];
    statusBox.textContent = results.join(' | ');
  } catch (e) {
    console.error("Geo eligibility check failed:", e);
    statusBox.textContent = "Eligibility check error.";
  }
}

export { inDAC, inFire, matchedUtility };
