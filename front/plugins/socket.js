import io from 'socket.io-client';

const socket = io(window.location.host);

export default (ctx, inject) => {
  const { store } = ctx;

  if (socket.connected) {
    store.dispatch('socket/SOCKET_CONNECT', true);
  }
  socket.on('connect', () => {
    store.dispatch('socket/SOCKET_CONNECT', true);
  });

  if (socket.disconnected) {
    store.dispatch('socket/SOCKET_CONNECT', false);
  }
  socket.on('disconnect', () => {
    store.dispatch('socket/SOCKET_CONNECT', false);
  });

  ctx.$socket = socket;
  inject('socket', socket);
};
