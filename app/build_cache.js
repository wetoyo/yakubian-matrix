const fs = require('fs');

const API_KEY = '6AFF15BF-AE20-3C22-9D2B-C505C241960B';

async function fetchCrops() {
  const res = await fetch(
    `https://quickstats.nass.usda.gov/api/get_param_values/?key=${API_KEY}&param=commodity_desc`
  );

  const data = await res.json();
  const filtered = data.commodity_desc
    .filter(name => !name.includes('ANIMAL') &&
                 !name.includes('OPERATOR') &&
                 !name.includes('LABOR') &&
                 !name.includes('FARM OPERATIONS') &&
                 !name.includes('AG LAND') &&
                 !name.includes('INCOME'))
    .sort(() => Math.random() - 0.5)
    .slice(0, 50);

  const crops = filtered.map((name, idx) => [idx + 1, name, Math.floor(Math.random() * 5) + 1, 'USDA_NASS']);

  const json = JSON.stringify(crops, null, 2);
  fs.writeFileSync('crops.json', json);

  console.log('crops.json created successfully');
  console.log(json);
  return crops;
}

fetchCrops();
