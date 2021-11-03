create table GeographicFeatures(
	id integer primary key AUTOINCREMENT,
    title text,
    description text,
    type integer,
    foreign key(type) references FeatureTypes(id)
);

create table Tags(
	id integer primary key AUTOINCREMENT,
	name text);

create table Tag_Feature(
    feature_id int,
    tag_id int,
    FOREIGN KEY(feature_id) REFERENCES GeographicFeatures(id),
    FOREIGN KEY(tag_id) REFERENCES Tags(id),
    UNIQUE(feature_id, tag_id)
)

create table TopoJSONs(
    state text,
    topojson text,
    foreign key(state) references state(fips)
);

create table StateCountyGeoJSONs(
    state text,
    geojson text,
    foreign key(state) references state(fips)
);

create table SessionTokens(
    token text unique,
    data text,
    created datetime default current_timestamp,
	last_activity datetime default current_timestamp,
);

create table CountryCountyGeoJSONs(
    name text unique,
    geojson text
)

create table FeatureTypes(
    id integer primary key auto_increment,
    name text unique
)

create table GeoJSONs(
    id integer primary key autoincrement,
    geojson text,
    type text,
    foreign key(type) references FeatureTypes(id)
)

create table Params(
    id integer primary key autoincrement,
    command text,
    name text
)

create table State(
    state_name text,
    state_abbr text,
    long_name text,
    fips text unique,
    sumlev text,
    region text,
    division text,
    state text unique,
    region_name text,
    division_name text
);

create table GeoSelections(
    id integer primary key autoincrement,
    command text,
    title text,
    type integer,
    scale integer,
    foreign key(type) references FeatureTypes(id)
    foreign key(scale) references Scale(id)
)

create table State_GeoJson(
    id integer primary key autoincrement,
    state_fips text,
    geojson_id integer,
    foreign key(geojson_id) references GeoJSONs(id)
)

create table State_GeoSelection(
    id integer primary key autoincrement,
    geoselection_id integer,
    state_fips text,
    foreign key(geoselection_id) references GeoSelections(id)
)

/* /geo/County/geoid/12/session/073f937d-793e-4848-bb47-12e507d33195 */
select FeatureTypes.name as type, 
    GeoJson.geojson as geojson,
    State_GeoSelection.state_fips as state_fips
from
    GeoSelections join FeatureTypes on FeatureTypes.id = GeoSelections.type
    join State_GeoSelection
    join State_GeoJson
    join GeoJSONs
    where type = 'County' and state_fips = '12';
        