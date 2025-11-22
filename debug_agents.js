const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
let apiKey = '';
let apiUrl = 'https://api.pickupmtaani.com/api/v1';

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('PICKUP_MTAANI_API_KEY=')) {
            apiKey = line.split('=')[1].trim().replace(/"/g, '');
        }
        if (line.startsWith('NEXT_PUBLIC_PICKUP_MTAANI_API_URL=')) {
            apiUrl = line.split('=')[1].trim().replace(/"/g, '');
        }
    }
}

async function request(endpoint) {
    const url = `${apiUrl}${endpoint}`;
    const headers = {
        'apikey': apiKey,
        'Content-Type': 'application/json',
    };

    console.log(`Requesting: ${url}`);
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            const text = await response.text();
            console.log(`Error response: ${text}`);
            return null;
        }
        const json = await response.json();
        return json.data || json; // Handle wrapping
    } catch (e) {
        console.error("Fetch error:", e);
        return null;
    }
}

async function debug() {
    try {
        // 1. Fetch Zones
        console.log('\n--- ZONES ---');
        const zones = await request('/locations/zones');
        console.log('Zones:', JSON.stringify(zones, null, 2));

        // 2. Fetch Areas
        console.log('\n--- AREAS ---');
        const areas = await request('/locations/areas');
        // console.log('Areas:', JSON.stringify(areas, null, 2)); // Too big?
        if (areas && areas.length > 0) {
            console.log(`Found ${areas.length} areas.`);
            console.log('First 3 areas:', JSON.stringify(areas.slice(0, 3), null, 2));

            // Pick an area (e.g. Nairobi or the first one)
            const area = areas[0];
            console.log(`\n--- LOCATIONS for Area: ${area.name} (${area.id}) ---`);

            const locations = await request(`/locations?areaId=${area.id}`);
            if (locations && locations.length > 0) {
                console.log(`Found ${locations.length} locations.`);
                console.log('First 3 locations:', JSON.stringify(locations.slice(0, 3), null, 2));

                // 3. Try to fetch "Agents" for a location
                const location = locations[0];
                console.log(`\n--- Exploring Agents for Location: ${location.name} (${location.id}) ---`);

                // Guess endpoints
                const endpoints = [
                    `/locations?parentId=${location.id}`,
                    `/locations?locationId=${location.id}`,
                    `/agents?locationId=${location.id}`,
                    `/locations/${location.id}/agents`,
                    `/locations/agents?locationId=${location.id}`
                ];

                for (const ep of endpoints) {
                    console.log(`Trying ${ep}...`);
                    const res = await request(ep);
                    if (res && (Array.isArray(res) ? res.length > 0 : Object.keys(res).length > 0)) {
                        console.log('SUCCESS! Found data:', JSON.stringify(res, null, 2));
                    } else {
                        console.log('No data or error.');
                    }
                }

            } else {
                console.log('No locations found.');
            }
        } else {
            console.log('No areas found.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
