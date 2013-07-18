var rowNumber;
var list, head;
var init=0;
var dataset1 = [{uid:"fff",time:"00",text:"55545",word:"about a story"},{uid:"fffd",time:"00",text:"55545",word:"just do it"},{uid:"fsf",time:"00",text:"5s5545",word:"find way out"},{uid:"fddff",time:"00",text:"55545",word:"about a story"},{uid:"fffffff",time:"00",text:"55545",word:"it is boring"}];
var dataset2 = [{uid:"aaa",time:"11",text:"ssosoosos",word:"ff fddss"},{uid:"aa",time:"111",text:"ssosddddoosos",word:"ffssd fss"},{uid:"a",time:"1111",text:"ssosos",word:"fffdf ds"}];

function draw_list( dataset ) {
	rowNumber=dataset.length;
	d3.select("#twitter-list").select("table").remove("table");

	list = d3.select("#twitter-list").insert("table").attr("id","list-table");
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