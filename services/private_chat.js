import { io } from "..";// Importe seu objeto io se estiver em um arquivo separado

const chatsPrivados = {}; // Armazena informações sobre chats privados

io.on('connection', (socket) => {
  // Evento para iniciar um chat privado com um usuário específico
  socket.on('iniciarChatPrivado', (idUsuario) => {
    // Encontra o socket do usuário com o ID fornecido
    console.log("Usuario entrou no chat privado", idUsuario)
    const usuarioAlvo = io.sockets.sockets.get(idUsuario);
    console.log(usuarioAlvo)
    if (usuarioAlvo) {
      // Cria um chat privado entre os dois usuários
      const chaveChat = `${socket.id}-${usuarioAlvo.id}`;
      const novoChat = io.of(`/chat-private/${chaveChat}`);

      // Registra os sockets associados a este chat privado
      chatsPrivados[chaveChat] = {
        socketA: socket,
        socketB: usuarioAlvo,
      };

      // Adiciona os sockets ao namespace do chat privado
      novoChat.on('connection', (privateSocket) => {
        console.log(`Usuários conectados em chat privado: ${socket.id} e ${usuarioAlvo.id}`);

        // Lógica para manipular mensagens entre os dois usuários
        privateSocket.on('privateMessage', (mensagem) => {
          // Envia a mensagem para o outro usuário no chat privado
          privateSocket.to(chaveChat).emit('mensagemRecebida', mensagem);
        });

        privateSocket.on('disconnect', () => {
          // Lógica para desconexão do chat privado, se necessário
          delete chatsPrivados[chaveChat];
          console.log(`Chat privado encerrado entre ${socket.id} e ${usuarioAlvo.id}`);
        });
      });
    } else {
      // Se o usuário alvo não for encontrado
      socket.emit('usuarioNaoEncontrado');
    }
  });
});