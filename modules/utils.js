exports.makeCountyLookup = counties => {
    // transform counties for faster lookup
    return counties.reduce(
        (prev, cur) => {
            prev[cur.fips] = { ...cur };
            return prev;
        }, {}
    )
}

exports.makeCountyDataMap = (data, countyLookup) => {

    // save max value
    let max_val = 0;
    // transform data to lookup by fips
    const countyDataReducer = (prev, cur) => {

        const countyFips = cur.fips;
        if (countyFips in countyLookup) {
            prev[countyFips] = { ...cur, county_name: countyLookup[countyFips].county_name, state_name: countyLookup[countyFips].state_name }
            if (parseFloat(cur.value) > max_val) {
                max_val = parseFloat(cur.value);
            }
        }
        return prev
    }

    const countyDataMap = data.reduce(countyDataReducer, {});
    return { countyDataMap, max_val };
}

exports.getSessionDataJson = sessionRow => {
    return JSON.parse(sessionRow.data);
}

exports.getGeoJson = geojsonRow => {
    return JSON.parse(geojsonRow.geojson);
}

exports.formatGeoJson = (geojson, countyDataMap, max_val) => {
    const features = geojson.features;
    const newFeatures = features.map(feature => {
        return {
            ...feature,
            properties: { ...feature.properties, ...countyDataMap[feature.id] }
        }
    });
    geojson.max_val = max_val;
    geojson.features = newFeatures;
    return geojson;
}

exports.cleanString = string => {
    return string.replace(/[']/gu,'\'\'');
}