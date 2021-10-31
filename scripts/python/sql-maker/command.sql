select * from GeoSelections 
	join State_GeoSelection on State_GeoSelection.geoselection_id = GeoSelections.id
	where GeoSelections.id = 40;