var express = require('express');
var router = express.Router();
var http = require('http');
var star_api = require('../star_api');
var db = require('../db/db_api');

var formattedStarData = [];

console.log('Getting stars...');

function attachViewRecords() {
	return new Promise(function(resolve, reject) {
		db.getViews().then(function(viewCounts) {
			for (var i in viewCounts) {
				for (var j in formattedStarData) {
					if (formattedStarData[j].id == viewCounts[i].id) {
						formattedStarData[j].views = viewCounts[i].views;
						break;
					}
				}
			}
			resolve(formattedStarData);
		});
	});
}

function getPromiseChain() {
	return new Promise(function(resolve, reject) {
		function starPromises(i, starData) {
			if (i >= 80) {
				resolve(starData);
				return;
			}
			setTimeout(function() {
				starData.push(star_api.getStarData(i, i+10));
				starPromises(i+10, starData);
			}, 3000);
		}
		starPromises(0, []);
	});
}

getPromiseChain().then(function(starData) {
	Promise.all(starData).then(function(starArray) {
		console.log('formatting ' + starArray.length + ' entries...');
		formattedStarData = starArray.reduce(function(partA, partB){
			return partA.concat(partB);
		});
		attachViewRecords().then(function() {
			console.log('Star data complete');
		}).catch(function(error) {
			console.log(error);
		});
	});
}).catch(function(error) {
	console.log(error);
});

router.get('/stars', function(req, res, next) {
	if (formattedStarData.length > 0) {
		res.json(formattedStarData);
	} else {
		res.end('No star data available');
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

module.exports = router;
