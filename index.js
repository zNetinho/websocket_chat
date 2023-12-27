const express = require('express');
const { resolve } = require('path');

const app = express();
const port = 3010;

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const { socketService } = require('./services/sockets');
const io = new Server(server);

app.use(express.static('static'));

const salas = ["sala 1", "sala 2", "sala 3", "sala 4", "sala 5",] 

    const chatNamespace = io.of("/chat")
    let usersConnected = []
    
    chatNamespace.on('connection', async (socket) => {
      console.log(chatNamespace.adapter.rooms)
      const nameuser = socket.handshake.auth.nomeUser
      const room = socket.handshake.auth.room_name;
      console.log("room", room)
      const userConnected = {
        id: socket.id,
        nome: nameuser,
        room: room
      }
      usersConnected.push(userConnected)
      console.log(room)
      const namespace_name = room
        socket.join(namespace_name)
        console.log(`a user connected ${namespace_name}`, nameuser);
        
        async function registerTimeouts() {
          
          console.log(nameuser)
          const sockets = await chatNamespace.fetchSockets();
          const ids = await chatNamespace.to(namespace_name).allSockets();
          chatNamespace.emit('onlineUser', {user_active: sockets.length, id: [...ids], usersConnected})
        }
      registerTimeouts();
      socketService.listenerSendMsg(socket, namespace_name)

      socket.on('sendMsg', (dataMsg) => {
        if(dataMsg.message == '') {
          console.log("Olha a mensagem", dataMsg)
          io.to(room).emit('postMsg', dataMsg);
          return
        }
      });

      socket.emit("nomear_sala", (userConnected.room))

      // socketService.listenerSendMsg(socket)
  
      socket.on('disconnect', async (reason) => {
        console.log('a user disconnected :( ', socket.id, reason);
        usersConnected = usersConnected.filter((UserSocket) => UserSocket.id !== socket.id)
        console.log("desligado", usersConnected)
      });
      
    })

    const lobby = io.of("/rooms") 
    lobby.on("connection", async (socket) => {
      // emiti um evento para o front-end, receber as salas disponível.
      socket.emit("listerRooms", (salas))
      console.log("user connected:", socket.id)
    })


app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/chat/lobby.html'));
});

app.get('/chat-private', (req, res) => {
  res.sendFile(resolve(__dirname, "pages/room.html"));
})

app.get('/rooms', (req, res) => {
  res.sendFile(resolve(__dirname, "pages/room_sala.html"));
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = { io }
