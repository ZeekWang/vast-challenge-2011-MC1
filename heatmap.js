/*!
 * Heatmap JavaScript Library v1.1
 *
 * Usage:
 * 	1. Initialize. You need to create a object with these fields: 
 * 		width, height, sigma, radius, context.
 *		Then, execute heatmap(object).
 *
 *		For example, 
 *			var config = {
 *				width: 1000, //width of the canvas
 *  			height: 800, //height of the canvas
 * 				sigma: 8, // sigma of Gauss Kernel
 * 				radius: 60, // raidus of Gauss kernel
 * 				context: $(canvas).getContext('2d')  //the context of the canvas
 *			}
 *			heatmap(config);
 *
 *	2. Call heatmap.draw(nodes) to update and render the heatmap,
 * 		nodes is an array with objects like {x: _x, y: _y}.
 *		For example,
 *			var nodes = [{x:100, y:20}, {x:400, y:30}, {x:70, y:340}];
 *			heatmap.draw(nodes);
 *    node can also formed as [{x:100, y:20, count:3}];
 *
 *	3. Each time the size of the canvas	is changed, 
 * 		please call heatmap.setSize(newWidth, newHeight).
 *
 *  4. Use heatmap.fixMaxDensity() or heatmap.releaseMaxDensity() 
 * 		to fix or release the max density value. You need to execute 
 * 		fixMaxDensity after drawing and execute releaseMaxDensity before drawing.
 *		
 *	AUTHOR: Wang Zhenhuang
 *  Date: 2013/03/09
 */

(function(){

	var heatmap = function(config){
		init(config);
	};

	var config = {};
	var cellSize = 1, colorizeThreshold = 30;
	var colorR = [], colorG = [], colorB = [], colorA = [];
	var width, height, sigma, radius, halfRadius, ctx;
	var kernel, density;
	var maxDensityValue = -1, tempDensityValue = -1;
	var ismaxDensityFixed = false;
	var tnodes = null;

	function init(userConfig){
		if (!userConfig.width || !userConfig.height || 
			!userConfig.sigma || !userConfig.radius ||
			!userConfig.context)

			console.log("Missing Parameters in Heatmap");
		config = userConfig;
		width = Math.round(userConfig.width / cellSize);
		height = Math.round(userConfig.height / cellSize);
		sigma = userConfig.sigma / cellSize;
		radius = Math.round(userConfig.radius / cellSize);
		if (radius % 2 == 0)
			radius ++;
		halfRadius = Math.floor(radius / 2);
		ctx = userConfig.context;
		createColorScheme();
		createKernel();
	}

	function createKernel(){
		kernel = [];
		for (var i = 0; i < radius; i++)
			for (var j = 0; j < radius; j++){
				kernel[i * radius + j] = 1 / (2 * Math.PI * sigma * sigma) * 
					Math.exp( -((i-halfRadius)*(i-halfRadius) 
						+ (j-halfRadius)*(j-halfRadius))/(2*sigma*sigma) );
			}

	}

	function createColorScheme(){
		for (var i = 0; i < 256; i++){
			colorR[i] = Math.max(Math.round(128 * Math.sin((i / 256 - 0.5 )* Math.PI) + 127), 0);
			colorG[i] = Math.max(Math.round(128 * Math.sin((i / 128 - 0.5 )* Math.PI) + 127), 0);
			colorB[i] = Math.max(Math.round(128 * Math.sin((i / 256 + 0.5 )* Math.PI) + 127), 0);
			colorA[i] = Math.max(  Math.abs(Math.round(256 * Math.sin((i / 256 + 0.5)* Math.PI) )), 0);
		}
	}

	heatmap.setSize = function(tWidth, tHeight){
		config.width = tWidth;
		config.height = tHeight;
		width = Math.round(tWidth / cellSize);
		height = Math.round(tHeight / cellSize);

		/**************ATTENTION***************
		heatmap.draw(tnodes);
		***************************************/
	}

	heatmap.getSize = function(){
		var size = { 
			width:width, 
			height:height 
		};
		return size;
	}

	heatmap.setRadius = function(tRadius){
		config.radius = tRadius;
		radius = Math.round(tRadius / cellSize);
		if (radius % 2 == 0)
			radius ++;
		halfRadius = Math.floor(radius / 2);
	}

	heatmap.setSigma = function(tSigma){
		config.sigma = tSigma;
		sigma = tSigma / cellSize;
		createKernel();
	}

	heatmap.computeDensity = function(nodes){
		tnodes = nodes;
		var begin = new Date().getTime();
		density = [];
		for (var i = 0; i < height; i++)
			for (var j = 0; j < width; j++){
				density[i * width + j] = 0;
			}
		console.log(density.length);
		var maxValue = 0;
		for (var ni = 0; ni < nodes.length; ni++){
			var n = nodes[ni];
			var x = Math.round(n.x / cellSize - halfRadius);
				y = Math.round(n.y / cellSize - halfRadius);
      		var count = (n.count == null) ? 1 : n.count;
      		var t = 0;
			for (var i = 0; i < radius; i++)
				for (var j = 0; j < radius; j++){
					var p = x + i, q = y + j;
					if (p > 0 && p < width && q > 0 && q < height){
						density[q * width + p] += count * kernel[j * radius + i];
						if (density[q * width + p] > maxValue)
							maxValue = density[q * width + p];
					}				
				}
			tempDensityValue = maxValue;
		}
		if (ismaxDensityFixed)
			maxValue = maxDensityValue;
		return [density, maxValue];
	}

	heatmap.unifyDensity = function(density, maxValue){
		for (var i = 0; i < density.length; i++)
			density[i] /= maxValue;
		return density;
	}

	heatmap.drawByDensity = function(density){

		var image = ctx.createImageData(width * cellSize, height * cellSize);
		var imageData = image.data;
		var w = width * cellSize, h = height * cellSize;
		var count = 0;
		for (var i = 0; i < width; i++)
			for (var j = 0; j < height; j++){
				//var d = Math.round(simpleMap(Math.pow(density[j * width + i], 0.4), Math.pow(maxValue, 0.4), 255));
				var d = Math.round(density[j * width + i] * 128 + 128);
				// if (d < colorizeThreshold)
				// 	continue;
				count++;
				for (var m = 0; m < cellSize; m++)
					for (var n = 0; n < cellSize; n++){
						var index = ((j * cellSize + n) * w + (i * cellSize + m)) * 4;
						imageData[index] = colorR[d];
						imageData[index + 1] = colorG[d];
						imageData[index + 2] = colorB[d];
						imageData[index + 3] = colorA[d];
					}
			}
		ctx.putImageData(image, 0, 0);

	}

	heatmap.draw = function(nodes){
		//**********ATTENTION****************
		heatmap.setSize($("#heatmap-canvas")[0].width, $("#heatmap-canvas")[0].height);
		//*************************************
		var res = heatmap.computeDensity(nodes);
		var density = res[0];
		var maxValue = res[1];

		var image = ctx.createImageData(width * cellSize, height * cellSize);
		var imageData = image.data;
		var w = width * cellSize, h = height * cellSize;
		var count = 0;
		for (var i = 0; i < width; i++)
			for (var j = 0; j < height; j++){
				var d = Math.round(simpleMap(Math.pow(density[j * width + i], 0.4), Math.pow(maxValue, 0.4), 255));

				if (d < colorizeThreshold)
					continue;
				count++;
				for (var m = 0; m < cellSize; m++)
					for (var n = 0; n < cellSize; n++){
						var index = ((j * cellSize + n) * w + (i * cellSize + m)) * 4;
						imageData[index] = colorR[d];
						imageData[index + 1] = colorG[d];
						imageData[index + 2] = colorB[d];
						imageData[index + 3] = colorA[d];
					}
			}

		console.log(new Date().getTime() - begin);
		ctx.putImageData(image, 0, 0);

	}

	heatmap.fixMaxDensity = function(maxDensity){
		ismaxDensityFixed = true;
		if (maxDensity)
			maxDensityValue = maxDensity;
		else
			maxDensityValue = tempDensityValue;
	}



	heatmap.releaseMaxDensity = function(){
		ismaxDensityFixed = false;
	}

	function map(value, min, max, toMin, toMax){
		var v = (value - min) / (max - min) * (toMax - toMin) + toMin;
		return v;
	}

	function simpleMap(value, max, toMax){
		if (max < 0.00001)
			return 0;
		
		if (value < 0)
			value = 0;
		if (value > max)
			value = max;

		return v = value / max * toMax;
	}
	
	function sqrt(value){
		return Math.sqrt(value);
	}

	window['heatmap'] = heatmap;
})();