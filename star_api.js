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
			var color = formatColor(data[i].colorb_v);
			starData.push({
				id: data[i].id,
				name: data[i].label,
				views: 0,
				x: data[i].x,
				y: data[i].y,
				z: data[i].z,
				mag: size,
				distance: data[i].distly,
				r: color.r,
				g: color.g,
				b: color.b
			});
		}
	}
	return starData;
}

function formatSize(starSize) {
	var offset = 16;
	var total = 24;
	var scale = 100;
	return Math.abs((starSize - offset) / total) * scale;
}

function formatColor(color) {
	var temp = 4600 * ( (1/((0.92 * color) + 1.7)) + (1/((0.92 * color) + 0.62)) );
	temp = temp/100;
	var red, green, blue;

	if(temp <= 66) {
		red = 255;
	} else {
		red = temp - 60;
		red = 329.698727446 * (Math.pow(red, -0.1332047592));

		if (red < 0) {
			red = 0
		}
		else if (red > 255 ) {
			red = 255
		}
	}

	if(temp <= 66) {
		green = temp;
		green = (99.4708025861 * Math.log(green)) - 161.1195681661;
		if (green < 0) {
			green = 0
		}
		else if (green > 255 ) {
			green = 255
		}
	} else {
		green = temp - 60
		green = 288.1221695283 * (Math.pow(green, -0.0755148492));
		if (green < 0) {
			green = 0
		}
		else if (green > 255 ) {
			green = 255
		}
	}

	if(temp >= 66) {
		blue = 255;
	} else {
		if (temp <= 19) {
			blue = 0;
		} else {
			blue = temp - 10;
			blue = (138.5177312231 * Math.log(blue)) - 305.0447927307;
			if (blue < 0) {
				blue = 0;
			}
			else if (blue > 255 ) {
				blue = 255;
			}
		}
	}
	return ({r: red, g: green, b: blue});
}

module.exports = {
	getStarData: function (start, end) {
		return getAndFormatData(start, end);	
	}
};
