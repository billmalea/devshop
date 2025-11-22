require('dotenv').config({ path: '.env.local' });
const { getPickupMtaaniAPI } = require('./lib/pickupmtaani');

async function debug() {
    try {
        const api = getPickupMtaaniAPI();
        console.log('Fetching areas...');
        const areas = await api.getAreas();
        if (areas.length > 0) {
            const areaId = areas[0].id;
            console.log(`Fetching locations for area: ${areas[0].name} (${areaId})`);
            const locations = await api.getAgentLocations(areaId);
            if (locations.length > 0) {
                console.log('First location object:', JSON.stringify(locations[0], null, 2));
            } else {
                console.log('No locations found for this area.');
            }
        } else {
            console.log('No areas found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
