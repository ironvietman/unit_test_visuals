// Parse the file with papaparse
$(function () {
var url = "data/summary.csv";
var myresults = Papa.parse(url,{download: true, header: false, complete: formatData ,skipEmptyLines:true,dynamicTyping:true});
});

// Function to put the data in an array for Highchart
function formatData(myresults) {
var failedTests = [];
var tests = [];

//Separate the results from summary.csv to different arrays
myresults.data.forEach( function(d,i){
	var splitdate = d[0].split("_");
	var year = Number(splitdate[0]);
	var mon = Number(splitdate[1])-1;
	var day = Number(splitdate[2]);
	var datetime = Date.UTC(year,mon,day);
	tests[i] = [datetime,d[1]];
	failedTests[i] = [datetime,d[2]];
})

// Display the chart
$(function () {
    $('#linePlot').highcharts({
        title: {
            text: 'Running Tests',
            x: -20 //center
        },
		subtitle: {
			text: "Shows the number of tests and number of failed tests"
		},
        xAxis: {
			type: 'datetime'        
		},
        yAxis: {
            title: {
                text: 'Number of Tests'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Failed Tests',
            data: failedTests
        }, {
            name: 'Tests',
            data: tests     
	    }]
    });
});

}

//function to format the points in a tree format for highchart
function getPoints(data) {
var runTimes = {};

//Region = vob
//cause = testcase
//country = lib, bin

var points = [],
		region_p, //vob object
		region_val, //number of tests in vob
		region_colorVal, //average fail color
		region_i, //vob id
		country_p, //lib/bin object
		country_i, //lib/bin id
		country_colorVal, //average fail color
		cause_p, //test object
	cause_i,
		cause_name = [];
	cause_name['Communicable & other Group I'] = 'Communicable diseases';
	cause_name['Noncommunicable diseases'] = 'Non-communicable diseases';
	cause_name['Injuries'] = 'Injuries';
	region_i = 0;
	for (var region in data) {
		var regionRunTimes = 0;
		region_val = 0;
		region_colorVal = 0;
		region_p = {
			id: "id_" + region_i,
			name: region,
		};
		//Working on lib/bin
		country_i = 0; 
		for (var country in data[region]) {
			var countryRunTimes = 0;
			country_colorVal = 0;
			country_p = {
				id: region_p.id + "_" + country_i,
				name: country,
				parent: region_p.id
			};
			//Working on all testcases for a lib/bin
			cause_i = 0;
			for (var cause in data[region][country]) {
				cause_p = {
					id: country_p.id + "_" + cause_i,
					name: cause,
					parent: country_p.id,
					value: 1, 
					colorValue: data[region][country][cause].fail*100
				};
				//summing run times
				runTimes[cause] =  data[region][country][cause].runTime;
				countryRunTimes += runTimes[cause];
				regionRunTimes += runTimes[cause];
				
				//counting the number of tests in vob
				region_val += cause_p.value;

				//Average fail color
				country_colorVal += cause_p.colorValue;
				points.push(cause_p);
				cause_i++;
			}
			//Calculate fail color for lib/bin
			country_p.colorValue = Math.round(country_colorVal/cause_i);
			
			//Get average fail color for vob
			region_colorVal += country_p.colorValue;
			points.push(country_p);

			//save runtime
			runTimes[country] = countryRunTimes;

			country_i++;
		}
		//number of tests in vob
		region_p.value = region_val;
		
		//Calculate fail color for vob
		region_p.colorValue =  Math.round((region_colorVal/country_i));
		points.push(region_p);
		
		//save runtime
		runTimes[region] = regionRunTimes;

		
		region_i++;
	}
return [points, runTimes];
}

var points_jhuapl = getPoints(myjhuapl);
var points_cpp = getPoints(mycpp);

$(function () {
	var chart = new Highcharts.Chart({
		chart: {
			renderTo: 'container',
			backgroundColor:'transparent',
		},
		credits:{
			enabled:false
		},
		colorAxis:{
			stops:[
			       [0, '#3fcb7c'],
		               [0.5, '#fffbbc'],
  		               [1, '#c4463a']
            		],
            		min: 0,
            		max: 100,
        		},
				  navigation: {
            buttonOptions: {
                align: 'center'
            }
				  },
		series: [{
			type: "treemap",
			layoutAlgorithm: 'squarified',
			allowDrillToNode: true,
			dataLabels: {
				enabled: false
			},
			levelIsConstant: false,
			levels: [{
				level: 1,
				dataLabels: {
					enabled: true
				},
				borderWidth: 3
			}],
			data: points_jhuapl[0]
		}],
		 tooltip: {
            formatter: function () {
				if(this.point.value == 1)
				{
                return '<b>' + this.point.name + '</b><br/>' +
                    'Run Time (sec):' + points_jhuapl[1][this.point.name].toFixed(3);
            	}
				else
				{
				return '<b>' + this.point.name + '</b>:' +
                    this.point.value + '<br/>' + 
					'Run Time (sec):' + points_jhuapl[1][this.point.name].toFixed(3);
            	}
				}

		},
		title:{
			text:'Java',
			align:'right'
		}


	});
});

$(function () {
	
	var chart = new Highcharts.Chart({
		chart: {
			renderTo: 'container2',
			backgroundColor:'transparent',
		},
			credits:{
			enabled:false
		},
		colorAxis:{
			stops:[
			       [0, '#3fcb7c'],
		               [0.5, '#fffbbc'],
  		               [1, '#c4463a']
            		],
            		min: 0,
            		max: 100,
        		},

		series: [{
			type: "treemap",
			layoutAlgorithm: 'squarified',
			allowDrillToNode: true,
			dataLabels: {
				enabled: false
			},
			levelIsConstant: false,
			levels: [{
				level: 1,
				dataLabels: {
					enabled: true
				},
				borderWidth: 3
			}],
			data: points_cpp[0]
		}],
		 tooltip: {
            formatter: function () {
				if(this.point.value == 1)
				{
                	return '<b>' + this.point.name + '</b><br/>' +
                    'Run Time (sec):' + points_cpp[1][this.point.name];
            	}
				else
				{
					return '<b>' + this.point.name + '</b>:' +
                    this.point.value + '<br/>' + 
					'Run Time (sec):' + points_cpp[1][this.point.name].toFixed(3);

            	}
				}

		},
		title:{
			text:'C++',
			align:'right'
		}
	
	});
});



