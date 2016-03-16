var http = require('http');

var lostPages = [];
var starData = [];
var formattedStarData = [];

function getAndFormatData(start, end) {
	return new Promise(function (resolve, reject) {
		getPromises(start, end);

		Promise.all(starData).then(function(starPages) {
			var allStars = starPages.reduce(function(pageA, pageB){
				if (pageB) {
					return pageA.concat(pageB);
				} else {
					return pageA;
				}
			});
			formattedStarData = formatStarData(allStars);
			console.log('page set complete');
			resolve(formattedStarData);
		});
	});
}

function getPromises(start, end) {
	for (i=start;i<end;i++) {
		starData.push(getStars(i));
	}
}

function getStars(page) {
	return new Promise(function (resolve, reject) {
		http.get('http://star-api.herokuapp.com/api/v1/stars?page=' + page, function(res) {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function() {
				if (body.charAt(0) != '<') {
					resolve(JSON.parse(body));
				} else {
					console.log('lost page '+page);
					lostPages.push(page);
					resolve();
				}
			});
		});
	});
}

function formatStarData(data) {
	var starData = [];
	for (var i in data) {
		if (data[i]) {
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
	}
	return starData;
}

function formatSize(starSize) {
	var offset = 16;
	var total = 12;
	var scale = 100;
	return Math.abs((starSize - offset) / total) * scale;
}

module.exports = {
	getStarData: function (start, end) {
		return getAndFormatData(start, end);	
	}
};
