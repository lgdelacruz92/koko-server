select * from GeographicFeatures
	join Tag_Feature
	join Tags
	where name in ("How","many","20","to","24","in","florida")
	group by feature_id;