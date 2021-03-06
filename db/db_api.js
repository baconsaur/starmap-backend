require('dotenv').load();
var db = require('monk')(process.env.DB_URI);

var views = db.get('views');
var starBackup = db.get('stars');

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
		},
	addLabels: function(star) {
		return views.update({id: star.id}, {$set: {label: star.label}}, {upsert:true, safe:false}, function(error) {
			if (error) {
				console.log(error);
			}
		});
	},
	backup: function(backupData) {
		return starBackup.insert({stars: backupData}, function(error) {
			if(error) {
				console.log(error);
			}
		});
	}
};

