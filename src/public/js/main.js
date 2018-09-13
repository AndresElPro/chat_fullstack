$(function () {
    
    const socket = io() // Ejecutando socket.io, conectando el cliente con el server

    // Obteniendo los elementos del DOM desde la interface
    const $messageForm = $('#message-form')
    const $messageBox = $('#message')
    const $chat = $('#chat')

    // Obteniendo los elementos del DOM desde el nicknameForm
    const $nickForm = $('#nickForm')
    const $nickError = $('#nickError')
    const $nickname = $('#nickname')
    
    const $users = $('#usernames')

    // Cuando nickForm trate de enviar algo al servidor vamos a capturar ese evento y prevenimos que refresque la pantalla
    $nickForm.submit(e => {
        e.preventDefault()
        // validandolo y enviandolo al servidor, cuando obtenga este evento de enviar datos al servidor, ejecutando socket, voy a enviarle un dato utilizando la conexión de web socket, y el evento emitido se llamara 'new user' y le enviamos el valor o los datos del nombre, del input
        socket.emit('new user', $nickname.val(), data => {
            if(data){
                $('#nickWrap').hide()
                $('#headerWrap').hide()
                $('#cardsWrap').hide()
                $('#aboutWrap').hide()
                $('#accordionWrap').hide() 
                $('#contactWrap').hide()               
                $('#contentWrap').show()
            }else{
                $nickError.html(`
                    <div class="alert alert-danger">
                        Usuario ya existente
                    </div>
                `)
            }
            $nickname.val('')
        }) // después de enviar este valor, recibimos una respuesta que es un callback, que se encarga de ver si la respuesta es correcta o no
    })

    // Eventos
    $messageForm.submit( e => {
        e.preventDefault()
        socket.emit('send message', $messageBox.val(), data => { // Capturamos el valor y lo enviamos a travéz del nombre 'send message' y después de emitir el mensaje vamos accionar un callback que recibira datos
            $chat.append(`<p class="error">${data}</p>`)
        }) 
        $messageBox.val('')
    })

    // escuchamos el evento que viene del servidor y mostramos los datos en el cuerpo de $chat, con append que los posiciona ahí y con la etiqueta </br> cada una se queda en una linea diferente
    socket.on('new message', function(data) {
        $chat.append('<b>' + data.nick + '</b>: ' + data.msg + '<br/>')
    })

    // vamos mostrando los usuarios
    socket.on('usernames', data => {
        let html = ''
        for (let i = 0; i < data.length; i++){
            html += `<p><i class="fas fa-user"></i> ${data[i]}</p>`
        }
        $users.html(html)
    }) // cuando recivamos los datos vamos a crear una variable, que empieze a almacenar etiquetas p y estás se iran agregando a medida que recorra el arreglo que hemos recibido, desde el servidor una vez listas las mostraremos por pantalla

    socket.on('whisper', data => {
        $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}<p>`)
    }) // Escuchando los mensajes privados

    socket.on('load old msgs', msgs => {
        for (let i = 0; i < msgs.length; i++){ // Los mensajes vienen en un arreglo, por lo tanto se pueden recorrer
            displayMsg(msgs[i])
        }
    })

    function displayMsg(data) {
        $chat.append(`<p class="whisper"><b>${data.nick}:</b> ${data.msg}<p>`)
    } // Para evitar repetir codigo y lo que hará es agregar texto cada vez que se lo demos entonces como parametro va a recibir datos
})