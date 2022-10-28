'use strict'

const socket = {}
let io = null

socket.connect = function (server) {
  const socketIo = require('socket.io')(server)
  io = socketIo
  return this
}

socket.on = function () {
  io.on('connection', (client) => {
    client.on('ADD_TO_ROOM', (data) => {
      client.join(data.userId)
    })
  })
}

socket.getIo = function () {
  return io
}

module.exports = socket
