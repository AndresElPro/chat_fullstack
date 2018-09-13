const mongoose = require('mongoose') // Lo vamos a utilizar para modelar mi chat
const { Schema } = mongoose // Utilizamos un esquema para modelarlos

const ChatSchema = new Schema({
    nick: String,
    msg: String,
    created_at: {
        type: Date,
        default: Date.now
    }
}) // Cuando cree un nuevo dato se va a guardar con la fecha actual cuando se ah creado

module.exports = mongoose.model('Chat', ChatSchema) // Exportando el un modelo de mongoose, con el nombre de 'chat' con el cual se va a guardar en la bd y vamos a utilizar este esquema para guardar datos en la bd