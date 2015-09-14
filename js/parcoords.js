var colors = d3.scale.category20b();

// Parse the file with papaparse
$(function () {
var url = "data/unit_test_overtime.csv";
var myresults = Papa.parse(url,{download: true, header: true, complete: drawplots ,skipEmptyLines:true,dynamicTyping:true});
});

// Draw plot and table with data from csv
function drawplots(myresults) {
		var data = myresults.data;

		// Hide the loading prompt
		document.getElementById("siteLoader").style.display = "none";
		document.getElementById("example-progressive").style.display = "block";

		// slickgrid needs each data element to have an id
		data.forEach(function(d,i) { d.id = d.id || i; });

		//Get Colors
		var colorgen = d3.scale.ordinal()
		.range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
			"#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
			"#cab2d6","#6a3d9a","#ffff99","#b15928"]);
		
		//Pick column to assign colors to
		var color = function(d) { return colors(d.Day); }; //change d.<COLUMN NAME> for coloring
		
		//Chart setup
		var parcoords = d3.parcoords()("#example-progressive")
		.data(data)
		//.hideAxis(["name"])
		.hideAxis(["Timestamp", "Testcase", "Package"]) //Needs to match the column name or it will error
		.color(color)
		.alpha(0.25)
		.composite("darker")
		.width(1000)
		.margin({ top: 24, left: 0, bottom: 12, right: 0 })
		.mode("queue")
		.render()
		.brushMode("1D-axes")  // enable brushing
		.reorderable(true) // Moving axis around
		.rate(20); //lines per frame rendered

		//Styles
		parcoords.svg.selectAll("text")
			.style("font", "10px sans-serif");

		 // setting up grid
  var column_keys = d3.keys(data[0]);
  var columns = column_keys.map(function(key,i) {
    return {
      id: key,
      name: key,
      field: key,
      sortable: true,
    }
  });

  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false,
	forceFitColumns: true
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;

  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      dataView.fastSort(sortcol, args.sortAsc);
    } else {
      dataView.sort(comparer, args.sortAsc);
    }
  });

  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
    var i = grid.getCellFromEvent(e).row;
    var d = parcoords.brushed() || data;
    parcoords.highlight([d[i]]);
  });
  grid.onMouseLeave.subscribe(function(e,args) {
    parcoords.unhighlight();
  });

  // fill grid with data
  gridUpdate(data);

  // update grid on brush
  parcoords.on("brush", function(d) {
    gridUpdate(d);
  });

  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  };

};

