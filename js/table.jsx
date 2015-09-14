/*
* Functions for table
*
*/
function completeFn(myresults){
React.render(<Griddle results={myresults.data} tableClassName="table" showFilter={true} showSettings={true} columns={["TESTCASE", "RUNTIME(sec)"]} />, document.getElementById("mygriddle"));
}
$(function () {
var url = "data/unit_test_data.csv";
var myresults = Papa.parse(url,{download: true, header: true, complete: completeFn,skipEmptyLines:true,dynamicTyping:true});
});

