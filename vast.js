var fullData = [];
var weatherData = [];
var statusesData = [];
var idStatusMap = [];
var filterStatuses = [];
var timelineBinLength = 20;
var timelineBinCount = 30240 / timelineBinLength;
var startTimeOfData = 1304092800000;
var timelineBinStatics = [];

var mapWidth, mapHeight, mapSVG;

$(document).ready(function(){
	$("#heatmap-compare").hide();
	$("#cancle-heatmap-button").click(function(){
		$("#heatmap-compare").hide();
	})
	$("#create-heatmap-button").click(function(){
		toCreateComapreHeatmap();
	})

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
			readWeatherData();

			 draw_list( statusesData );
			 draw_wordcloud( statusesData );
		});


	});
});

function readWeatherData(){
	d3.csv("weather.csv", function(d) {
		d.forEach(function(d){
			weatherData.push({
				date: new Date(d.Date),
				weather: d.Weather,
				windSpeed: parseInt(d.Average_Wind_Speed),
				windDirection: parseInt(d.Wind_Angle)  + 180
			});
		});
		drawWeather();
	});

}

function receiveData(data){

}

function drawWeather(){
	console.log("draw weather");
	var svg = d3.select("#timeline-context");
	console.log(svg.attr("width"));
	var w = $($("#timeline-context .brush rect")[0]).attr("width");
	console.log(w / 21);
	var group = svg.selectAll("g .weather-logo")
		.data(weatherData)
		.enter()
		.append("g")
		.attr("transform", function(d){
			return "translate(" + ((new Date(d.date).getTime() - startTimeOfData) / 86400000 * w / 21) + ", -10)"
		});

	group.append("image")
		.attr("xlink:href", function(d){return "images/" + d.weather + ".png"})
		.attr("width", 18)
		.attr("height", 18);
	group.append("image")
		.attr("xlink:href", function(d){return "images/arrow-up.png"})
		.attr("width", 18)
		.attr("height", 18)
		.attr("transform", function(d){
			return "translate(20, 0) rotate(" + d.windDirection + ", 10, 10)"
		});
}

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

  var statusList = [];
	d3.selectAll(".status-node").each(
		function(d){
			if (brushNW[0] >= d.lng && d.lng >= brushSE[0]
				&& brushNW[1] >= d.lat && d.lat >= brushSE[1]){
          statusList.push(d);
			}
	})
  draw_wordcloud(statusList);
}

function readData(json){
	for (var d in json){
		statusesData.push(json[d]);
		idStatusMap[json[d].id] = json[d];
	}
	selectData();
}

function selectData(){
	var temp = [];
	var step = Math.round(statusesData.length / 8000);
	for (var i = 0; i < statusesData.length; i += step)
		temp.push(statusesData[i]);
	statusesData = temp;
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

function drawTimeline(){
	var margin = {top: 10, right: 10, bottom: 90, left: 40},
	margin2 = {top: 150, right: 10, bottom: 20, left: 40},
	width = mapWidth - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom,
	height2 = 200 - margin2.top - margin2.bottom;


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

	var svg = d3.select("body #left-part").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("id", "timeline");

	svg.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", height);

	var focus = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.attr("id", "timeline-focus");

	var context = svg.append("g")
	.attr("transform", "translate(" + margin2.left + "," + margin2.top+ ")")
	.attr("id", "timeline-context");


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
		var beginTime = brush.extent()[0].getTime();
		var endTime = brush.extent()[1].getTime();
		if (beginTime == endTime){
			beginTime = 0;
			endTime = new Date("2013-01-01").getTime();
		}
    var selectedData  = [];
		$("#map-wrapper circle").each(function(d){
			var time = $(this)[0].__data__.time;
			if (time < beginTime || time > endTime)
				$(this).hide();
			else{
				$(this).show();
        selectedData.push($(this)[0].__data__);
      }
		});
    // Refresh the word-cloud.
    draw_wordcloud(selectedData);
	}

}


function renderTipHtml(data){
	var html = "<div class='tip'>" +
	"<b>uid:" + data.uid + "</b>" + "<span class='tip-time'>" + data.time_str + "</span></br>" +
	"" + data.text + "</br>" +
	"</div>";
	return html;
}

function toCreateComapreHeatmap(){
	createCompareImage(statusesData);
}
