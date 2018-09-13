const http = require('http') // modulo de nodejs
const path = require('path') // modulo que se encarga de unir directorios
const express = require('express')
const socketio = require('socket.io')
const mongoose = require('mongoose')

const app = express()
const server = http.createServer(app) // Creando server con modulo http y lo guardamos en una constante
const io = socketio.listen(server) // socketio escucha en el servidor que e creado, y ahora tengo conexión en tiempo real, ahora lo guardamos en io y gracias a este io vamos a poder recibir y enviar mensajes

// Conectandome a la bd
mongoose.connect('mongodb://localhost/chat-database') // Ya que estoy en local lo configuro de esta manera, no hay que tener la bd ya creado mongo lo hace por nosotros
    .then(db => console.log('Base de Datos conectada')) // después que haga esto...
    .catch(err => console.log(err)) // Si existe un error lo mostrara por pantalla

// Configuraciones
app.set('port', process.env.PORT || 3000) // Configuracion de puerto de app si el sv tiene un puerto configurado por defecto usalo sino usa el 3000

require('./sockets')(io) // requerimos los sockets y la ejecutamos ya que importa una función

// Enviando archivos estaticos
app.use(express.static(path.join(__dirname, 'public'))) // join() recive los directorios que va a unir

// Iniciando el servidor
server.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'))
})