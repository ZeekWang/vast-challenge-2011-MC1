var rowNumber;
var list, head;
var init=0;


function draw_list( dataset ) {
	rowNumber=dataset.length;

	list = d3.select("#twitter-list")
    .insert("table")
    .attr("id","list-table");
	list.selectAll("tr").data(d3.range(0, rowNumber+1)).enter().append("tr").attr( "class", "content" );
	list.select("tr").attr( "class", "head" );
	for(var i=0; i<3; ++i){
		list.selectAll(".head").append("th");
		list.selectAll(".content").append("td");
	}

	d3.selectAll(".head").selectAll("th")
		.data( function(d) {
			return["uid","time","text"];
		})
		.text( String );
	d3.selectAll(".content").selectAll("td")
		.data( function(d) {
			return [dataset[d-1]["uid"],dataset[d-1]["time"],dataset[d-1]["text"]];
		})
		.text( String );
}
