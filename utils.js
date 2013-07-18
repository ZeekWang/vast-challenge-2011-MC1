function geoToMap(lat, lng, width, height){
	var y = mapping(lat, 42.1609, 42.3017, height, 0);
	var x = mapping(lng, 93.1923, 93.5673, width, 0);
	return [x, y];
}

function mapToGeo(x, y, width, height){
	var lat = mapping(y, 0, height, 42.3017, 42.1609);
	var lng = mapping(x, 0, width, 93.5673, 93.1923);
	return [lng, lat];
}

function mapping(value, min, max, toMin, toMax){
	value = Math.max(min, value);
	value = Math.min(max, value);
	return (value - min) / (max - min) * (toMax - toMin) + toMin;
}