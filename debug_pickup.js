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

if (!apiKey) {
    console.error('API Key not found in .env.local');
    process.exit(1);
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
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
        }
        return response.json();
    } catch (e) {
        console.error("Fetch error:", e);
        throw e;
    }
}

async function debug() {
    try {
        console.log(`API Key Length: ${apiKey.length}`);
        console.log('Fetching areas...');
        const areas = await request('/locations/areas');
        console.log('Areas response:', JSON.stringify(areas, null, 2));

        let areaId;
        if (Array.isArray(areas) && areas.length > 0) {
            areaId = areas[0].id;
        } else if (areas.data && Array.isArray(areas.data) && areas.data.length > 0) {
            areaId = areas.data[0].id;
            console.log('Areas are wrapped in "data" property.');
        }

        if (areaId) {
            console.log(`Fetching locations for area ID: ${areaId}`);
            const locations = await request(`/locations?areaId=${areaId}`);
            console.log('Locations response:', JSON.stringify(locations, null, 2));
        } else {
            console.log('No areas found or unexpected structure. Trying to fetch all locations...');
            const locations = await request('/locations');
            console.log('All Locations response:', JSON.stringify(locations, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
