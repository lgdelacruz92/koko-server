create table GeographicFeatures(
	id integer primary key AUTOINCREMENT,
    title text,
    description text
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

create table GeoJSONs(
    state text,
    geojson text,
    foreign key(state) references state(fips)
);

create table SessionTokens(
    token text unique,
    data text,
    created datetime default current_timestamp,
	last_activity datetime default current_timestamp
);
