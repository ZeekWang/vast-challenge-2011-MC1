function createCompareImage(data){
	var step = Math.round(data.length / 1000);
	var tpData = [];
	for (var i = 0; i < data.length; i += step)
		tpData.push(data[i]);
	data = tpData;
	var imgHeight = 300;
	var imgWidth = 590;
	$("#heatmap-compare").show();
	$(".heatmap-compare-img").remove();
	for (var i = 0; i < 7; i++){
		$("#heatmap-compare").append(
			
			"<div id='heatmap-compare-map" + i + "' class='heatmap-compare-map'>" +
			"<canvas id='heatmap-compare-img" + i + "' class='heatmap-compare-img'></canvas>" +
			"<img src='images/map.png' id='heatmap-compare-map-img" + i + "' class='heat-compare-map-img'></img></div>"
		)
		$("#heatmap-compare-img" + i)[0].width = imgWidth;
		$("#heatmap-compare-img" + i)[0].height = imgHeight;
		$("#heatmap-compare-map" + i).css({
			// position: "absolute",
			width: imgWidth, 
			height: imgHeight});
		var offset = $("#heatmap-compare-img" + i).offset();
		$("#heatmap-compare-map-img" + i).css({
			position: "absolute",
			top: offset.top,
			left: offset.left,
			width: imgWidth,
			height: imgHeight,
			"z-index": -1
		})
	}

	$("#heatmap-compare").scroll(function(){
		// console.log("sss");
		// for (var i = 0; i < 7; i++){
		// 	var offset = $("#heatmap-compare-img" + i).offset();
		// 	console.log(offset);
		// 	$("#heatmap-compare-map-img" + i).css({
		// 		position: "absolute",
		// 		top: offset.top,
		// 		left: offset.left,
		// 		width: imgWidth,
		// 		height: imgHeight,
		// 		"z-index": -1
		// 	})
		// }
	})

	var binData =  [];

	var config = {
 		width: imgWidth, //width of the canvas
 		height: imgHeight, //height of the canvas
 		sigma: 8, // sigma of Gauss Kernel
 		radius: 50, // raidus of Gauss kernel
 		context: 1
	}
	heatmap(config);

	var startTime = new Date("2011-05-17").getTime();
	for (var i = 0; i < 8; i++)
		binData[i] = [];
	for (var i = 0; i < data.length; i++){
		if (data[i].time >= startTime){
			var timeId = Math.floor((data[i].time - startTime) / 43200000);
			binData[timeId].push(data[i]);
		}
	}
	var density = [];


	for (var i = 0; i < 8; i++){
		density[i] = [];
		var nodes = []
		for (var j = 0; j < binData[i].length; j++){
			var d = binData[i][j];
			var pos = geoToMap(d.lat, d.lng, imgWidth, imgHeight);
			nodes.push({x: pos[0], y: pos[1]});
		}
		var tpDensity = heatmap.computeDensity(nodes);
		density[i] = heatmap.unifyDensity(tpDensity[0], tpDensity[1]);
	}
	
	for (var i = 0; i < 7; i++){
		var diff = [];
		for (var j = 0; j < density[i].length; j++){
			diff[j] = density[i+1][j] - density[i][j];
		}
		config.context = $("#heatmap-compare-img" + i)[0].getContext("2d")
		heatmap(config);
		heatmap.drawByDensity(diff, 1);
	}
}