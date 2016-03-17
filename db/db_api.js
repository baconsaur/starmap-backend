require('dotenv').load();
var db = require('monk')(process.env.DB_URI);

var views = db.get('views');

module.exports = {
	getViews: function() {
			return views.find();
		},
	addView: function(star_id) {
			return views.update({id: star_id}, {$inc: {views:1}}, {upsert:true, safe:false}, function(error) {
				if (error) {
					console.log(error);
				} else {
					console.log('record updated');	
				}
			});
		}
};

