const fs = require('fs');

if (typeof fetch === 'undefined') {
  try {
    global.fetch = require('node-fetch');
  } catch (err) {
    console.error('Global fetch is not available and "node-fetch" is not installed.');
    console.error('Install it with: npm install node-fetch@2');
    console.error('Or upgrade Node to v18+ which includes fetch by default.');
    process.exit(1);
  }
}

const API_KEY = '6AFF15BF-AE20-3C22-9D2B-C505C241960B';

async function fetchCrops() {
  try {
    const res = await fetch(
      `https://quickstats.nass.usda.gov/api/get_param_values/?key=${API_KEY}&param=commodity_desc`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.commodity_desc)) {
      throw new Error('Unexpected API response format');
    }

    const filtered = data.commodity_desc
      .filter(name =>
        !name.includes('ANIMAL') &&
        !name.includes('OPERATOR') &&
        !name.includes('LABOR') &&
        !name.includes('FARM OPERATIONS') &&
        !name.includes('AG LAND') &&
        !name.includes('INCOME')
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 50);

    const crops = filtered.map((name, idx) => [
      idx + 1,
      name,
      Math.floor(Math.random() * 5) + 1,
      'USDA_NASS'
    ]);

    const json = JSON.stringify(crops, null, 2);
    fs.writeFileSync('crops.json', json);

    console.log('crops.json created successfully');
    console.log(json);
    return crops;
  } catch (err) {
    console.error('fetchCrops error:', err);
    throw err;
  }
}

fetchCrops().catch(err => {
  console.error('Top-level error:', err);
  process.exit(1);
});
