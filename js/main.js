// wait until everything on page loads
document.addEventListener("DOMContentLoaded", function() {
	
	// read data files
	Promise.all([
		d3.csv('data/data.csv')
	]).then(function(files){
		console.log(files[0]);
	});

});
