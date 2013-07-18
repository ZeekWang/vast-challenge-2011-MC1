var dataToShow;
var fill = d3.scale.category20();

function draw_wordcloud(dataset) {
	dataToShow=[];

	for( var d=0; d<dataset.length; ++d ){
		for( var s=0; s<dataset[d]["word"].split(" ").length; ++s ) {
			for( var a=0; a<dataToShow.length; ++a ) {
				if( dataset[d]["word"].split(" ")[s] == dataToShow[a]["text"] ) {
					dataToShow[a]["size"]+=10;
					break;
				}
			}
			dataToShow.push({text: dataset[d]["word"].split(" ")[s], size: 20});
		}
	}

	d3.layout.cloud().size([400, 600])
      .words(dataToShow)
      .padding(5)
      .rotate(0)
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();

      function draw(words) {
	      var debug = d3.select("#wordle");
	      debug.append("g")
	        .attr("transform", "translate(100,100)")
	      .selectAll("text")
	        .data(words)
	      .enter().append("text")
	        .style("font-size", function(d) { return d.size + "px"; })
	        .style("font-family", "Impact")
	        .style("fill", function(d, i) { return fill(i); })
	        .attr("text-anchor", "middle")
	        .attr("transform", function(d) {
	          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	        })
	        .text(function(d) { return d.text; });
	}
}