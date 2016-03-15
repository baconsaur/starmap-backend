var express = require('express');
var router = express.Router();
var http = require('http');

var starData = [];
var formattedStarData = [];

function getAndFormatData() {
	return new Promise(function (resolve, reject) {
		for (var i=0;i<50;i++) {
			starData.push(getStars(i));
		}

		Promise.all(starData).then(function(starPages) {
			var allStars = starPages.reduce(function(pageA, pageB){
				return pageA.concat(pageB);
			});
			formattedStarData = formatStarData(allStars);
			resolve(formattedStarData);
		});
	});
}

function getStars(page) {
	return new Promise(function (resolve, reject) {
		http.get('http://star-api.herokuapp.com/api/v1/stars?page=' + page, function(res) {
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

function formatStarData(data) {
	var starData = [];
	for (var i in data) {
		var size = formatSize(data[i].absmag);
		starData.push({
			id: data[i].id,
			name: data[i].label,
			x: data[i].x,
			y: data[i].y,
			z: data[i].z,
			h: data[i].colorb_v <= 0 ? 180 : 15,
			s: Math.floor(data[i].colorb_v * 100),
			l: Math.floor(size)
		});
	}
	return starData;
}

function formatSize(starSize) {
	var offset = 16;
	var total = 12;
	var scale = 100;
	return Math.abs((starSize - offset) / total) * scale;
}

router.get('/stars', function(req, res, next) {
	if (!formattedStarData.length) {
		getAndFormatData().then(function() {
			res.json(formattedStarData);
		});
	} else {

		res.json(formattedStarData);
	}
});

module.exports = router;
