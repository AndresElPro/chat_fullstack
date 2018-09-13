const Chat = require('./models/Chat')

// Para recibir las conecciones, enviar eventos, recibirlos y más
// io tiene todos los sockets conectados, todos los usuarios
module.exports = function(io) {

    let users = {} // De este modo estamos utilizando la memoria del servidor en cambio de una bd

    io.on('connection', async socket => {
        console.log('new user connected')

        let messages = await Chat.find({}).limit(8) // Para por cada nueva coneccion traiga los mensajes ya guardados en la bd, await es para evitar más funciones y then, limitado a 8 mensajes
        socket.emit('load old msgs', messages) // nombre del evento: load old msgs y les paso los mensajes messages

        socket.on('new user', (data, cb) => { // Recibe los datos y el call back del cliente
            console.log(data)
            if(data in users){ // Retorna el indice del nombre ingresado, los arreglos van desde 0, si retorna -1 es que no existe
                cb(false)
            }else{
                cb(true)
                socket.nickname = data // En el socket que es un objeto vamos a guardar un propiedad llamada nickname con el valor de data, el usuario intentando entrar al chat
                users[socket.nickname] = socket // Guardamos en el arreglo de nick names si no existe, cada usuario que se conecte va a tener la info completa del socket
                updateNicknames()
            } // Si existe el usuario o no devolvemos un true o un false
        })
    
        // lo que hace: cuando un cliente me envia datos a travéz de send message el servidor va a reenviar estos datos a travéz de un nuevo evento llamado 'new message'
        socket.on('send message', async (data, cb) => { // Enviando texto y un cb=callback 
            var msg = data.trim() // Para eliminar los espacios de más

            if(msg.substr(0,3) === '/w '){ // Si los 3 primeros carácteres del mensaje, son iguales a comando para mensaje privado y espacio
                msg = msg.substr(3) // El mensaje va a ser solo lo que sigue después del indice 3
                const index = msg.indexOf(' ') // Determinamos el indice de donde esta ese espacio en blanco entre el nombre de usuario y el mensaje
                if(index !== -1){ // Significa que si hay un texto, si hay mensaje que enviar
                    const name = msg.substring(0, index) // desde el principio hasta el espacio en blanco para determinar el usuario
                    var msg = msg.substring(index + 1) // lo que sigue después del espacio o sea el mensaje
                    if(name in users){// si el nombre esta dentro del arreglo de usuarios
                        users[name].emit('whisper', {
                            msg, // = msg : msg
                            nick: socket.nickname
                        }) // Evento nuevo llamado whisper tan solo para el usuario, y le enviamos un objeto con su mensaje y quien se lo envia
                    }else{ // si el usuario no esta, al cual se le esta enviando el mensaje
                        cb('Error! Ingresa un usuario existente') // Le enviamos un error
                    }
                }else{ // Por si no a escrito un mensaje
                    cb('Error! Porfavor ingresa tu mensaje')
                }
            }else{ // Si es un mensaje normal
                var newMsg =  new Chat({
                    msg, // = msg:msg
                    nick: socket.nickname 
                }) // Crear el esquema y guardarlo en newMsg
                await newMsg.save() // Guardandolo en la bd y con await ya que la funcion padre es asyncrona y este método nos toma tiempo y esperamos que se ejecute este método para saltar a la linea siguiente

                io.sockets.emit('new message', {
                    msg: data,
                    nick: socket.nickname
                }) // sockets para que lo emita a todos los sockets, enviando un objeto que tiene el mensaje y el nickname 
            } // cuando me manden send message recibire datos (data)
        }) 
        
        socket.on('disconnect', data => {
            if(!socket.nickname) return// Si la conexion no tiene la propiedad nickname entonces solo retorna ya que no existe ese nickname
            delete users[socket.nickname] // de mi objeto users eliminare aquel que tenga como clave el nickname de este socket que se esta desconectando
            updateNicknames()
        }) // Sabremos cuando un usuario se desconecta del chat y eliminarlo de la lista de usuarios
    
        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users)) // Enviamos evento con todos los usuarios almacenados, sockets ya que a así se lo mandamos a todos los usuarios, Object.keys, para obtener solo las claves de los objetos, entonces enviara un arreglo de usuarios
        }
    }) // Ahora io queda escuchando cuando hay una nueva conexión de sockets y cuando se conecte un nuevo cliente o socket vamos a hacer algo
}