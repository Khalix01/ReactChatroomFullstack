const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 5000

const router = require('./router');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./users.js')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on('connection', (socket) => {
	console.log('User Connected');

	socket.on('join',({name,room},callback) => {
		const{user,error}=addUser({id:socket.id,name,room});
		if(error) return callback(error);

		socket.emit('message',{user: 'admin', text: `${user.name} welcome to ${user.room}`});// later turn this into a special admin message instead od a message from a user called admin
		socket.broadcast.to(user.room).emit('message',{user: 'admin', text: `${user.name} has joined the chat`}); // later turn this into a special admin message instead od a message from a user called admin

		socket.join(user.room);

		io.to(user.room).emit('roomInfo',{room:user.room, users: getUsersInRoom(user.room)});

		callback();
	 	
	});

	socket.on('sendMessage', (message,callback) => {
		const user = getUser(socket.id);

		io.to(user.room).emit('message',{user:user.name, text: message});

		callback();
	});

	socket.on('disconnect', () =>{
		const user=removeUser(socket.id);
		if (user) io.to(user.room).emit('message',{user:'admin', text: `${user.name} has left`});
		console.log('User Disconnected');
	})
});

server.listen(PORT,() => console.log(`started server on ${PORT}`));