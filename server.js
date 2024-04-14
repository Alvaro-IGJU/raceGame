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
    connections.push(connection); // Almacenar la conexión junto con su UUID
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
            let playerName = "Jugador " + numPlayers;
            players.push({ connectionId: connection.playerId, playerName: playerName, playerColor: assignColor(players.length) });
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
        } else if (data.type === 'searchRace') {
            let gameId = data.race_id;
            let race = findGameById(gameId);

            if (race) {
                let numPlayers = race.players.length + 1;
                console.log(numPlayers,4, numPlayers > 4)
                if (numPlayers -1 < 4) {
                    let playerName = "Jugador " + numPlayers;
                    let playerColor = assignColor(numPlayers);

                    // Agregar el nuevo jugador al juego
                    race.players.push({ connectionId: connection.playerId, playerName: playerName, playerColor: playerColor });

                    // Enviar un mensaje a todos los jugadores del juego con la lista actualizada de jugadores
                    const updatedPlayers = race.players;
                    race.players.forEach(player => {
                        const playerConnection = connections.find(conn => conn.playerId === player.connectionId);
                        if (playerConnection) {
                            playerConnection.sendUTF(JSON.stringify({ type: 'player_join', players: updatedPlayers }));
                        }
                    });

                    // Confirmar al jugador que se ha unido al juego exitosamente
                    connection.sendUTF(JSON.stringify({ type: 'game_join', game_id: gameId, players: updatedPlayers }));
                }else{
                    connection.sendUTF(JSON.stringify({ type: 'game_full' }));
                }
            } else {
                connection.sendUTF(JSON.stringify({ type: 'game_404' }));
            }
        }
    });



});

function findGameById(gameId) {
    // Iterar sobre la lista de juegos
    for (let i = 0; i < games.length; i++) {
        // Verificar si el ID del juego coincide con el ID buscado
        if (games[i].uuid === gameId) {
            // Si hay coincidencia, devolver el juego encontrado
            return games[i];
        }
    }
    // Si no se encuentra ningún juego con el ID buscado, devolver null
    return null;
}

function assignColor(numPlayers) {
    switch (numPlayers) {
        case 2:
            return "blue";
        case 3:
            return "green";
        case 4:
            return "yellow";
        default:
            return "red";
    }
}
