currR = 1;
currQ = 1;
r = 10;
colors = ['',
		'#1484ff', // winter
		'#0dd286', // spring
		'#d96fd9', // bonus 1
		'#ff6f4b', // summer
		'#c8da04', // bonus 2
		'#6445ea', // fall
		'#fff' // not yet
		];

rounds = [
		'winter',
		'spring',
		'bonus',
		'summer',
		'bonus',
		'fall'
		];

// wait until everything on page loads
document.addEventListener("DOMContentLoaded", function() {
	
	// read data files
	Promise.all([
		d3.csv('data/data-placeholder.csv')
	]).then(function(files){

		// munge data
		files[0].forEach(function(d){
			d.Q = +d.Q;
			d.round = +d.round;
			if (d.correct == 'Y') {
				d.point = 1;
			} else {
				d.point = 0;
			}
		});

		teams = d3.groups(files[0], d => d.team);
		teams.forEach(function(t){
			t[1].sort(function(a,b){
				return a.round - b.round || b.point - a.point;
				// return a.round - b.round || a.Q - b.Q;
			});
		})
		
		// dimensions
		margin = {top: 52, right: 10, bottom: 0, left: 46};
		width = 1140;
		height = 630;

		// scales
		yScale = d3.scaleBand()
			.domain(d3.range(teams.length))
			.range([0, height]);

		svg = d3.select('#viz').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

		svg.append('line')
			.attr('class', 'header')
			.attr('x1', -r)
			.attr('x2', r * 2 * 56 - r)
			.attr('y1', -30)
			.attr('y2', -30);

		roundLabels = svg.selectAll('text')
			.data(rounds)
			.enter()
			.append('text')
			.attr('class','labelsRounds')
			.text(d => d)
			.attr('dx', function(d,i) { 
				var abbreviatedR = 0;
				if (i > 2 && i < 5) { abbreviatedR = r * 4 }
				if (i == 5) { abbreviatedR = r * 8 }
				return i * r * 20 - r - abbreviatedR;
			})
			.attr('dy', -37)
			.attr('fill', function(d,i){
				return colors[i+1];
			});

		teamGs = svg.selectAll('g.team')
			.data(teams, function(d){ return d.team; })
			.enter()
			.append('g')
			.attr('class', 'team')
			.attr('transform', function(d,i) {
				return 'translate(0,' + yScale(i) + ')';
			});

		teamGs.append('text')
			.text(d => d[0])
			.attr('class','teamName')
			.attr('dy', 0)
			.attr('dx', -r);

		circles = teamGs.selectAll('circle')
			.data(d => d[1])
			.enter()
			.append('circle')
			.attr('r', r)
			.attr('cx', function(d,i){ return i * 20; })
			.attr('cy', 18)
			.attr('fill', function(d){ return colors[d.round]; });

		revealRound = function(round) {
			// sort teams based on their score for the round
			teamGs.sort(function(a,b){
					
					aTotal = d3.sum(a[1], function(d){
						return d.round == round ? d.point : 0;
					});

					bTotal = d3.sum(b[1], function(d){
						return d.round == round ? d.point : 0;
					});

					return bTotal - aTotal;
				})
				.transition()
				.duration(750)
				.attr('transform', function(d,i) {
					return 'translate(0,' + yScale(i) + ')';
				});

			// change opacity of circles based on if they got it right/wrong
			// show questions in future rounds as gray
			circles.sort(function(a,b){
					if (a.round == b.round) {
						if (a.correct == 'Y' && b.correct == 'Y') { return 0; }
						if (a.correct == 'Y') { return -1; }
						if (b.correct == 'Y') { return 1; }
					}
					return a.round - b.round;
				})	
				.attr('cx', function(d,i){ return i * 20; })
				.attr('opacity', function(d,i){
					if (round >= d.round) {
						return d.correct == 'Y' ? '1' : .3;
					} else {
						return 1;
					}
				})
				.attr('fill', function(d,i){
					return round >= d.round ? colors[d.round] : '#efefef'
				});

			// hide rounds in the future
			roundLabels.attr('opacity', function(d,i){
				return i < round ? 1 : 0;
			});

		}

		revealOverall = function(round) {

			// fade out incorrect circles
			circles.filter(function(d){
					return d.point == 0;
				})
				.transition()
				.duration(200)
				.attr('opacity', 0);

			// fade out circles in future rounds
			circles.filter(function(d){
					return d.round > round;
				})
				.transition()
				.duration(200)
				.attr('opacity', 0);

			// move correct circles
			circles.filter(function(d){
					return d.point == 1;
				})
				.transition()
				.delay(200)
				.duration(600)
				.attr('cx', function(d,i){ return i * 20; })

			// rearrange teams based on overall score
			teamGs.sort(function(a,b){
					
					aTotal = d3.sum(a[1], function(d){
						return d.round <= round ? d.point : 0;
					});

					bTotal = d3.sum(b[1], function(d){
						return d.round <= round ? d.point : 0;
					});

					return bTotal - aTotal;
				})
				.transition()
				.delay(1000)
				.duration(750)
				.attr('transform', function(d,i) {
					return 'translate(0,' + yScale(i) + ')';
				});

			// hide round labels
			roundLabels.transition().duration(200).attr('opacity', 0);

		}

		revealRound(1);

	});

});
