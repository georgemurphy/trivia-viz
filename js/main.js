Promise.all([
	d3.csv('data/data.csv')
]).then(function(files){
	console.log(files[0]);
});