var fullData = [];
var statusesData = [];
var idStatusMap = [];
var filterStatuses = [];
var timelineBinLength = 20;
var timelineBinCount = 30240 / timelineBinLength;
var startTimeOfData = 1304092800000;
var timelineBinStatics = [];

var mapWidth, mapHeight, mapSVG;

$(document).ready(function(){

	$("#map-img").load(function(){
		mapWidth = $("#map-img").width();
		mapHeight = $("#map-img").height();
		mapSVG = d3.select("#map-wrapper")
		.append("svg")
		.attr("id", "map-svg")
		.attr("width", mapWidth)
		.attr("height", mapHeight);

		$("#map-svg")
		.css("left", $("#map-img").position().left)
		.css("top", $("#map-img").position().top);

		enableMapBrushed();
		d3.json("data.json", function(json) {
			readData(json);
			timelineBinStatics = computeTimeline(statusesData);
			drawDataOnMap(statusesData);
			drawTimeline();
		});
	});
	//debug
	var dataset = [{uid:"fff",time:"00",text:"55545",word:"about a story"},{uid:"fffd",time:"00",text:"55545",word:"just do it"},{uid:"fsf",time:"00",text:"5s5545",word:"find way out"},{uid:"fddff",time:"00",text:"55545",word:"believe yourself"},{uid:"fffffff",time:"00",text:"55545",word:"it is boring"}];
	draw_list( dataset );
	draw_wordcloud( dataset );
	//debug
})

function enableMapBrushed(){
	mapSVG.append("g")
	.attr("class", "brush")
	.call(
		d3.svg.brush()
			.x(d3.scale.linear().range([0, mapWidth]))
			.y(d3.scale.linear().range([0, mapHeight]))
			.on("brushend", brushOnMap)
	);
}

function brushOnMap(){
	var e = d3.event.target.extent();
	brushNW = mapToGeo(e[0][0], e[0][1], 1, 1),
	brushSE = mapToGeo(e[1][0], e[1][1], 1, 1);

	d3.selectAll(".status-node").each(

		function(d){
			if (brushNW[0] >= d.lng && d.lng >= brushSE[0]
	        && brushNW[1] >= d.lat && d.lat >= brushSE[1]){

	        }

		})
	// console.log(brushNW);
	// console.log(brushSE);
	// d3.selectAll(".status-node").classed("selected", function(d) {
	//     return brushNW[0] >= d.lng && d.lng >= brushSE[0]
	//         && brushNW[1] >= d.lat && d.lat >= brushSE[1];
 //  	});

	// console.log(d3.event.target.extent());
}

function readData(json){
	for (var d in json){
		statusesData.push(json[d]);
		idStatusMap[json[d].id] = json[d];
	}
	statusesData = statusesData.slice(0, 1000);
}

function computeTimeline(data){

	var binCount = [];
	for (var i = 0; i < timelineBinCount; i++)
		binCount[i] = 0;
	for (var i in data){
		var d = data[i];
		var binId = Math.floor((d.time - startTimeOfData) / 60000 / timelineBinLength);
		binCount[binId]++;
	}
	return binCount;
	
}

function drawDataOnMap(data){
	mapSVG.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
	.attr("class", "status-node")
	.attr("r", 5)
	.attr("transform", function(d){
		var pos = geoToMap(d.lat, d.lng, mapWidth, mapHeight);
		return "translate(" + pos[0] + "," + pos[1] + ")";
	})
	.each(function(d){
		$(this).tipsy({
			gravity: "e", 
			html: true,
			opacity: 1,
			title: function() {
				var d = this.__data__;
				return renderTipHtml(d);
			}
		})
	});
	

}

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

function drawTimeline(){
	var margin = {top: 10, right: 10, bottom: 90, left: 40},
	margin2 = {top: 190, right: 10, bottom: 20, left: 40},
	width = mapWidth - margin.left - margin.right,
	height = 250 - margin.top - margin.bottom,
	height2 = 250 - margin2.top - margin2.bottom;


	var x = d3.time.scale()
	.range([0, width]);

	var x2 = d3.time.scale()
	.range([0, width]);

	var y = d3.scale.linear()
	.range([height, 0]);

	var y2 = d3.scale.linear()
	.range([height2, 0]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom")
		.ticks(d3.time.hours, 12).tickFormat(d3.time.format("%m.%d %H%p")),
	xAxis2 = d3.svg.axis().scale(x2).orient("bottom")
		.ticks(d3.time.days, 1).tickFormat(d3.time.format("%m.%d")),
	yAxis = d3.svg.axis().scale(y).orient("left");

	var brush = d3.svg.brush()
	.x(x2)
	.on("brush", brush);

	var area = d3.svg.area()
	.interpolate("monotone")
	.x(function(d) { return x(d.time); })
	.y0(height)
	.y1(function(d) { return y(d.value); });

	var area2 = d3.svg.area()
	.interpolate("monotone")
	.x(function(d) { return x2(d.time); })
	.y0(height2)
	.y1(function(d) { return y2(d.value); });

	var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("id", "timeline");

	svg.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", height);

	var focus = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var context = svg.append("g")
	.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


	var data = [];
	for (var i = 0; i < timelineBinStatics.length; i++){
		var dd = {};
		dd.time = new Date(i * 60000 * timelineBinLength + startTimeOfData);
		dd.value = timelineBinStatics[i];
		data.push(dd);
	}


	x.domain(d3.extent(data.map(function(d) {return d.time; })));
	y.domain([0, d3.max(data.map(function(d) { return d.value; }))]);
	x2.domain(x.domain());
	y2.domain(y.domain());

	focus.append("path")
	.data([data])
	.attr("clip-path", "url(#clip)")
	.attr("d", area);

	focus.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

	focus.append("g")
	.attr("class", "y axis")
	.call(yAxis);

	context.append("path")
	.data([data])
	.attr("d", area2);

	context.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height2 + ")")
	.call(xAxis2);

	context.append("g")
	.attr("class", "x brush")
	.call(brush)
	.selectAll("rect")
	.attr("y", -6)
	.attr("height", height2 + 7);

	svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(" + margin.left + "," + (margin2.top + height2) + ")")
    .call(d3.svg.axis().scale(x).tickSubdivide(1).tickSize(-height2));



	function brush() {
		x.domain(brush.empty() ? x2.domain() : brush.extent());
		focus.select("path").attr("d", area);
		focus.select(".x.axis").call(xAxis);
		console.log(brush.extent());
		var beginTime = brush.extent()[0].getTime();
		var endTime = brush.extent()[1].getTime();
		$("#map-wrapper circle").each(function(d){
			var time = $(this)[0].__data__.time;
			if (time < beginTime || time > endTime)
				$(this).hide();
			else
				$(this).show();
		});

	}

}


function renderTipHtml(data){
	var html = "<div class='tip'>" +
		"<p><b>”√ªßid:" + data.uid + "</b></p>" + 
		"<p>" + data.text + "</p>" +
		"<p><span>" + data.time_str + "</span></p>" +
		"</div>";
	return html;
}