// Constants for rates by program category
import { checkLocationDACFire, inDAC, inFire } from './maps.js';

const RATES = {
  equityResiliency: 1.00,
  residentialEquity: 1.10,
  solarRate: 3100,
  smallRes: 0.15,
  largeScale: 0.25,
  nonResEquity: 0.85,
  sjv: 1.10,
  generation: 2.00
};

const KW_PER_SQFT = 0.0035;

let lat = null;
let lon = null;

// Initialize Google Autocomplete
function initAutocomplete() {
  const input = document.getElementById("address");
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      lat = place.geometry.location.lat();
      lon = place.geometry.location.lng();
      checkLocationDACFire(lat, lon);
    }
  });
}

// Main calculation
function calculateIncentives() {
  const cust = document.getElementById("customerType").value;
  const program = document.getElementById("programs").value;
  const sqft = parseFloat(document.getElementById("squareFootage").value) || 0;
  const utility = document.getElementById("utility").value;

  let capacity = parseFloat(document.getElementById("capacity").value);
  if (isNaN(capacity) || capacity <= 0) capacity = 30.6;

  let solarCap = parseFloat(document.getElementById("solarCapacity").value);
  if (!solarCap && sqft > 0) solarCap = +(Math.max(1, sqft * KW_PER_SQFT)).toFixed(1);

  let budget = "General Market", rate = RATES.largeScale;

  if (cust.startsWith("residential")) {
    if (program === "care" || program === "sash" || program === "income") {
      budget = "Residential Equity";
      rate = RATES.residentialEquity;
    } else if (inDAC || inFire) {
      budget = "Equity Resiliency";
      rate = RATES.equityResiliency;
    } else {
      budget = "Small Residential";
      rate = RATES.smallRes;
    }
  }

  const storageIncentive = capacity * 1000 * rate;
  const solarIncentive = solarCap * RATES.solarRate;
  const total = storageIncentive + solarIncentive;

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = `
    <p><strong>Program Track:</strong> ${budget}</p>
    <p><strong>Storage Incentive:</strong> $${storageIncentive.toLocaleString()} (${capacity} kWh @ $${rate}/Wh)</p>
    <p><strong>Solar Incentive:</strong> $${solarIncentive.toLocaleString()} (${solarCap} kW @ $${RATES.solarRate}/kW)</p>
    <p><strong>Total SGIP Incentive:</strong> $${total.toLocaleString()}</p>
  `;
  resultBox.style.display = "block";
}

// Event listener
window.addEventListener("DOMContentLoaded", () => {
  initAutocomplete();
  document.getElementById("btnCheck").addEventListener("click", calculateIncentives);
});
