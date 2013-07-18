var dataToShow;
var fill = d3.scale.category20();
var maxsize = 40;
var minsize = 5;
var upper_bound;
var width = 500;
var height = 500;

function draw_wordcloud(dataset) {
	dataToShow=[];
	upper_bound=1;

	for( var d=0; d<dataset.length; ++d ){
		for( var s=0; s<dataset[d]["word"].split(" ").length; ++s ) {
			for( var a=0; a<dataToShow.length; ++a ) {
				if( dataset[d]["word"].split(" ")[s] == dataToShow[a]["text"] ) {
					dataToShow[a]["size"]++;
					upper_bound=upper_bound>dataToShow[a]["size"]?upper_bound:dataToShow[a]["size"];
					break;
				}
			}
			if( a==dataToShow.length )
				dataToShow.push({text: dataset[d]["word"].split(" ")[s], size: 1.0});
		}
	}

	d3.layout.cloud().size([width, height])
      .words(dataToShow)
      .padding(0)
      .rotate(0)
      .font("Impact")
      .fontSize(function(d) { return (d.size/upper_bound)*(d.size/upper_bound)*(maxsize-minsize)+minsize; })
      .on("end", draw)
      .start();

      function draw(words) {
	      d3.select("#word-cloud").append("svg")
        	.attr("width", width)
        	.attr("height", height)
	      .append("g")
	      	.attr( "transform", "translate("+width/2+","+height/2+")" )
	      .selectAll("text")
	        .data(words)
	      .enter().append("text")
	        .style("font-size", function(d) { return d.size + "px"; })
	        .style("font-family", "Impact")
	        .style("fill", function(d, i) { return fill(i%20); })
	        .attr("text-anchor", "middle")
	        .attr("transform", function(d) {
	          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	        })
	        .text(function(d) { return d.text; });
	}
}