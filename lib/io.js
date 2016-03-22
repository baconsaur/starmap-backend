var io = require('socket.io')();

var activeUsers = {};

io.on('connection', function(socket) {
	socket.on('new', function(userData) {
		activeUsers[socket.id] = {
			position: userData.position,
			rotation: userData.rotation
		};
	});

	socket.on('update', function(userData) {
		activeUsers[socket.id] = {
			position: userData.position,
			rotation: userData.rotation
		};
	});

	socket.on('disconnect', function(){
		delete activeUsers[socket.id];
	});
});

setInterval(updatePositions, 300);

function updatePositions() {
	io.sockets.emit('update', activeUsers);
}

module.exports = io;
