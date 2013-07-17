var rowNumber;
var list;
var init=0;

function draw_list( dataset ) {
	rowNumber=dataset.length;
	list = d3.select("#twitter-list").select("table");
	if(!init) {
		list = d3.select("#twitter-list").append("table").attr("id","list-table");
		list.selectAll("tr").data(d3.range(0, rowNumber+1)).enter().append("tr");
		for(var i=0; i<3; ++i){
			list.selectAll("tr").append("td");
		}
		init=1;
	}
	d3.selectAll("tr").selectAll("td")
		.data( function(d) {
			if(d==0) return ["uid","time","text"];
			else return [dataset[d-1]["uid"],dataset[d-1]["time"],dataset[d-1]["text"]];
		})
		.text( String );
}