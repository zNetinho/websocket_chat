const socketService = {

  // listenerAny: (socket) => {
  //   socket.onAny((event, ...args) => {
  //     registerTimeouts();
  //   });
  // },

  listenerSendMsg: (socket, room) => {
    
    socket.on('sendMsg', (dataMsg) => {
      socket.emit('postMsg', dataMsg);
      //socket.broadcast.emit - emiti para geral exceto a conexão
      if( room ) {
        socket.to(`${room}`).emit("postMsg",dataMsg)
      } else {
        socket.to("Geral").emit('postMsg', dataMsg);
      }
    });
  },

}

module.exports = { socketService }