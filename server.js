const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve static files from 'public' folder

let users = []
let chats = []

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('name', (user) => {
        user.id = socket.id;
        users.push(user);
    
        socket.emit('allMessages', chats); // Send chat history to the new user
    });

    socket.on('chatMessage', (msg) => {
        const chatData = { 
            message: msg.message, 
            name: users.find(user => user.id === socket.id)?.name || 'Anonymous', 
            time: msg.time 
        };
    
        chats.push(chatData); // Add the message to the history
        io.emit('message', chatData); // Broadcast the new message
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        console.log('User disconnected', socket.id);
    });
    
});

server.listen(80, () => {
    console.log('Server running on http://localhost:80');
});
