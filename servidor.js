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

const isValidJwt = (header) => {
  const token = header.split(' ')[1];
  if (token === 'abc') {
    return true;
  } else {
    return false;
  }
};


    const chatPrivateNamespace = io.of("/chat-private")
    chatPrivateNamespace.on("connection", (socket) => {
        const namespace_name = "Private"
        socket.join("Private");
        console.log(`Usuario entrou no canal privado ${socket.id}`)
        // chatNamespace.to("Geral").emit("Olá")
        async function registerTimeouts() {
            const sockets = await chatPrivateNamespace.fetchSockets();
            const ids = await chatPrivateNamespace.allSockets();
            socket.emit('onlineUser', {user_active: sockets.length, id: [...ids]})
        }

      registerTimeouts();


        socketService.listenerSendMsg(socket, namespace_name)
    })
    
    const chatNamespace = io.of("/chat")

    chatNamespace.on('connection', async (socket) => {
      io.use((socket, next) => {
        const header = socket.handshake.headers['authorization'];
        console.log(header);
        if (isValidJwt(header)) {
          return next();
        }
        return next(new Error('authentication error'));
      });
      const namespace_name = "Geral"
        socket.join(namespace_name)
        console.log('a user connected Geral', socket);
      


        async function registerTimeouts() {
            const sockets = await chatNamespace.fetchSockets();
            const ids = await chatNamespace.allSockets();
            socket.emit('onlineUser', {user_active: sockets.length, id: [...ids]})
        }

      registerTimeouts();

      socket.on("login", (dataUser) => {
        socket.nameUser = dataUser.name,
        socket.nameRoom = dataUser.room
        if(socket.nameRoom) {
          socket.join(socket.nameRoom)
        } else if(socket.nameUser && !socket.nameRoom){
          socket.join("Geral")
          console.log(`O usuario ${socket.nameUser} entrou na sala geral`)
        } else {
          socket.disconnect()
        }
        next
      });

      socketService.listenerSendMsg(socket)
  
      socket.on('disconnect', async (reason) => {
        console.log('a user disconnected :( ', socket.id, reason);
      });
      
      socket.onAny((event, ...args) => {
          registerTimeouts();
        });
    })


app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/lobby.html'));
});

app.get('/chat-private', (req, res) => {
  res.sendFile(resolve(__dirname, "pages/room.html"));
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = { io }
