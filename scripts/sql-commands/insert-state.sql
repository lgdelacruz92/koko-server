create table state(
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