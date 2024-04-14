const WebSocket = require('websocket').server;
const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer((request, response) => {
    response.writeHead(404);
    response.end();
});

server.listen(8080, () => {
    console.log('Servidor HTTP iniciado en el puerto 8080');
});


const wsServer = new WebSocket({ httpServer: server });
const connections = [];
let pendingRequests = {}; // Almacena las solicitudes pendientes
let games = [];
wsServer.on('request', (request) => {
    console.log("Nueva conexión WebSocket aceptada");
    const connectionId = uuidv4();

    const connection = request.accept(null, request.origin);
    connection.playerId = connectionId;
    connections.push( connection ); // Almacenar la conexión junto con su UUID
    connections.forEach(conn => {
        conn.sendUTF(JSON.stringify({ type: 'hola', message: "HOLA" }));
    })

    connection.on('close', () => {
        console.log("Conexión cerrada");

        // Buscar y eliminar la partida en la que se encuentra el jugador que se desconecta

        const index = connections.indexOf(connection);
        if (index !== -1) {
            connections.splice(index, 1);
        }

    });


    connection.on('message', (message) => {
        const data = JSON.parse(message.utf8Data);
        if (data.type === 'createRace') {
            const gameId = uuidv4();
            console.log('ID de partida creado:', gameId);
            let players = [];
            let numPlayers = players.length + 1;
            let playerName = "Jugador "+numPlayers;
            players.push({connection : connection.playerId, playerName: playerName, playerColor : "red"});
            console.log(connection);
    
            // Crear el objeto de juego
            let game = {
                uuid: gameId,
                players: players
            };
    
            // Enviar datos de juego al cliente
            connection.sendUTF(JSON.stringify({ type: 'game_id', game_id: gameId, players: game.players }));
    
            // Guardar el objeto de juego en la lista de juegos
            games.push(game);
        }
    });
    

});
