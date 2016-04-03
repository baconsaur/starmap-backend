var express = require('express');
var router = express.Router();
var http = require('http');
var star_api = require('../star_api');
var db = require('../db/db_api');
var labels = require('../starlabels');

var formattedStarData = [];
var backupData;
var pageCount = 202;

function getPromiseChain() {
	return new Promise(function(resolve, reject) {
		function starPromises(i, starData) {
			if (i >= pageCount) {
				resolve(starData);
				return;
			}
			setTimeout(function() {
				starData.push(star_api.getStarData(i, i+10));
				starPromises(i+10, starData);
			}, 3000);
		}
		starPromises(1, []);
	});
}

function attachViewRecords(tempStarData) {
	return new Promise(function(resolve, reject) {
		db.getViews().then(function(viewCounts) {
			for (var i in tempStarData) {
				for (var j in viewCounts) {
					if (tempStarData[i].id == viewCounts[j].id) {
						if(viewCounts[j].views) {
							tempStarData[i].views = viewCounts[j].views;
						}
						if(viewCounts[j].label) {
							tempStarData[i].name = viewCounts[j].label;	
						}
						break;
					}				
				}	
			}
			resolve(tempStarData);
		});
	});
}

function getExoplanetData() {
	return new Promise(function (resolve, reject) {
		http.get('http://star-api.herokuapp.com/api/v1/exo_planets', function(res) {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function() {
				resolve(JSON.parse(body));
			});
		});
	});
}

console.log('Getting stars...');
init();

function init () {
	getPromiseChain().then(function(starData) {
		Promise.all(starData).then(function(starArray) {
			console.log('formatting ' + starArray.length + ' entries...');
			tempData = starArray.reduce(function(partA, partB){
				console.log(partA.length, partB.length);
				return partA.concat(partB);
			});
			backupData = tempData;
			console.log(tempData.length + ' total entries');
			attachViewRecords(tempData).then(function(dataWithViews) {
				console.log(dataWithViews.length + ' entries after views attached');
				getExoplanetData().then(function(exoplanets){
					for (var i in dataWithViews) {
						for (var j in exoplanets) {
							var entryName = dataWithViews[i].name.toLowerCase().replace(' ', '');
							var planetName = exoplanets[j].label.toLowerCase().replace(' ', '');
							if (entryName == planetName) {
								dataWithViews[i].exoplanets = exoplanets[j].numplanets;
								break;
							}
						}	
					}
					console.log(dataWithViews.length + ' entries after exoplanets attached');
					formattedStarData = dataWithViews;
					console.log('final data: ' + formattedStarData.length);
					console.log('Star data complete');
				});
			});
		});
	}).catch(function(error) {
		console.log(error);
	});
}

//router.get('/backup', function(req, res, next) {
//	db.backup(backupData);
//});


router.get('/stars', function(req, res, next) {
	if (formattedStarData.length > 0) {
		res.json(formattedStarData);
	} else {
		init();
		res.end('Server error, try again in a few minutes');
	}
});

router.get('/stars/:id', function(req, res, next) {
	db.addView(req.params.id);
	if (formattedStarData) {
		var requestStar;
		for (var i in formattedStarData) {
			if (formattedStarData[i].id == req.params.id) {
				formattedStarData[i].views++;
				res.json(formattedStarData[i]);
				break;
			}
		}
	}
	res.end('No star data available');	
});

/*router.get('/addlabels', function(req, res, next) {
	for (var i in labels) {
	db.addLabels(labels[i]);	
	}
	res.end('labels dumped');
	});*/

module.exports = router;
