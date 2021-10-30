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
    id integer,
    params text,
    foreign key(id) references GeoJSONs(id)
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