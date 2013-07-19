/*!
 * jquery.tagcloud.js
 * A Simple Tag Cloud Plugin for JQuery
 *
 * https://github.com/addywaddy/jquery.tagcloud.js
 * created by Adam Groves
 */
(function($) {

  /*global jQuery*/
  "use strict";

  var compareWeights = function(a, b)
  {
    return a - b;
  };

  // Converts hex to an RGB array
  var toRGB = function(code) {
    if (code.length === 4) {
      code = code.replace(/(\w)(\w)(\w)/gi, "\$1\$1\$2\$2\$3\$3");
    }
    var hex = /(\w{2})(\w{2})(\w{2})/.exec(code);
    return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
  };

  // Converts an RGB array to hex
  var toHex = function(ary) {
    return "#" + jQuery.map(ary, function(i) {
      var hex =  i.toString(16);
      hex = (hex.length === 1) ? "0" + hex : hex;
      return hex;
    }).join("");
  };

  var colorIncrement = function(color, range) {
    return jQuery.map(toRGB(color.end), function(n, i) {
      return (n - toRGB(color.start)[i])/range;
    });
  };

  var tagColor = function(color, increment, weighting) {
    var rgb = jQuery.map(toRGB(color.start), function(n, i) {
      var ref = Math.round(n + (increment[i] * weighting));
      if (ref > 255) {
        ref = 255;
      } else {
        if (ref < 0) {
          ref = 0;
        }
      }
      return ref;
    });
    return toHex(rgb);
  };

  $.fn.tagcloud = function(options) {

    var opts = $.extend({}, $.fn.tagcloud.defaults, options);
    var tagWeights = this.map(function(){
      return $(this).attr("rel");
    });
    tagWeights = jQuery.makeArray(tagWeights).sort(compareWeights);
    var lowest = tagWeights[0];
    var highest = tagWeights.pop();
    var range = highest - lowest;
    if(range === 0) {range = 1;}
    // Sizes
    var fontIncr, colorIncr;
    if (opts.size) {
      fontIncr = (opts.size.end - opts.size.start)/range;
    }
    // Colors
    if (opts.color) {
      colorIncr = colorIncrement (opts.color, range);
    }
    return this.each(function() {
      var weighting = $(this).attr("rel") - lowest;
      if (opts.size) {
        $(this).css({"font-size": opts.size.start + (weighting * fontIncr) + opts.size.unit});
      }
      if (opts.color) {
        $(this).css({"color": tagColor(opts.color, colorIncr, weighting)});
      }
    });
  };

  $.fn.tagcloud.defaults = {
    size: {start: 14, end: 18, unit: "pt"}
  };

})(jQuery);

var dataToShow;
var fill = d3.scale.category20();
var maxsize = 15;
var minsize = 20;
var upper_bound;
var width = $('#word-cloud').width();
var height = $('#word-cloud').height();
console.log(width);
console.log(height);

function draw_wordcloud(dataset) {
	dataToShow={};
  tmpArray=[];
	upper_bound=1;

	for(var d=0; d<dataset.length; ++d ){
    var wordArray = dataset[d]['words'].split(' ');
		for(var s = 0; s < wordArray.length; s++) {
      if (dataToShow[wordArray[s]] == undefined) {
        dataToShow[wordArray[s]] = {};
        dataToShow[wordArray[s]].text = wordArray[s];
        dataToShow[wordArray[s]].size = 1;
      }
      else {
        dataToShow[wordArray[s]].size++;
      }
      upper_bound = upper_bound > dataToShow[wordArray[s]].size ? upper_bound : dataToShow[wordArray[s]].size;
    }
	}
  console.log(dataToShow);
  for (i in dataToShow) {
    var o = {};
    o.text=dataToShow[i].text;
    o.size=dataToShow[i].size;
    tmpArray.push(o);
  }
  tmpArray.sort(function(d1,d2) {
    return d2.size - d1.size;
  });
  console.log(tmpArray);
  var cnt = 50;
  if (cnt > tmpArray.length) cnt = tmpArray.length;
  d3.select('#word-cloud')
    .selectAll('span')
    .remove();
  for (var i = 0; i < cnt; i ++) {
    d3.select('#word-cloud')
      .append('span')
      .html(function() {
        return ' ' + tmpArray[i].text + ' ';
      })
      .attr('rel', function() {
        return tmpArray[i].size;
      })
      .attr('title', function() {
        return tmpArray[i].size;
      });
  }

  var fontsizeScale = d3.scale.linear()
    .range([minsize, maxsize])
    .domain([tmpArray[cnt-1].size, tmpArray[0].size]);

  $.fn.tagcloud.defaults = {
      size: {start: minsize, end: maxsize, unit: 'pt'},
        color: {start: '#cde', end: '#f52'}
  };

  $('#word-cloud span').tagcloud();

}

