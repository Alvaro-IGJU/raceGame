class Player {
    constructor(playerId, playerName, playerColor) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.x = 50;
        this.y = 110;
        this.width = 30;
        this.height = 30;
        this.speed = 0;
    }

    getX() {
        return this.x
    }
    setX(x) {
        this.x = x;
    }

    getY() {
        return this.y
    }
    setY(y) {
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor(gameId) {
        this.uuid = gameId;
        this.players = [];
        this.obstacles = [];
        this.running = false;
        this.interval = null; // Intervalo para enviar la información del juego a los jugadores
    }

    addPlayer(player) {
        this.players.push(player);
    }

    getPlayers() {
        return this.players;
    }

    getPlayerCount() {
        return this.players.length;
    }

    start() {
        let canvasWidth = 270; // Ancho del canvas (ajústalo según tus necesidades)
        let playerWidth = 30; // Ancho de cada jugador (ajústalo según tus necesidades)
        let playerCount = this.getPlayers().length;
        let spaceBetweenPlayers = (canvasWidth - playerWidth * playerCount) / (playerCount + 1); // Espacio entre cada jugador
    
        // Calcular la posición inicial para el primer jugador
        let initialX = spaceBetweenPlayers + playerWidth / 2;
    
        // Asignar las posiciones a cada jugador
        this.getPlayers().forEach((player, index) => {
            let playerX = initialX + index * (playerWidth + spaceBetweenPlayers);
            player.setX(playerX);
        });
    
        // Iniciar el intervalo para enviar la información del juego a los jugadores
        this.running = true;
        this.interval = setInterval(() => {
            this.sendGameInfo();
        }, 1); // Intervalo de 1 milisegundo (ajústalo según tus necesidades)
    }

    finish() {
        this.running = false;
        // Detener el intervalo cuando finaliza la carrera
        clearInterval(this.interval);
    }

    isRunning() {
        return this.running;
    }

    // Función para enviar la información del juego a todos los jugadores
    sendGameInfo() {
        const gameData = {
            type: 'game_info',
            players: this.getPlayers() // Obtener la información de los jugadores del juego
            // Puedes agregar más información del juego si es necesario
        };

        this.players.forEach(player => {
            const playerConnection = connections.find(conn => conn.playerId === player.playerId);
            if (playerConnection) {
                playerConnection.sendUTF(JSON.stringify(gameData)); // Enviar la información del juego al jugador
            }
        });
    }
}


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
const games = [];

wsServer.on('request', (request) => {
    console.log("Nueva conexión WebSocket aceptada");
    const connectionId = uuidv4();

    const connection = request.accept(null, request.origin);
    connection.playerId = connectionId;
    connections.push(connection);

    connections.forEach(conn => {
        conn.sendUTF(JSON.stringify({ type: 'hola', message: "HOLA" }));
    });

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
            let game = new Game(gameId);
            let playerName = "Jugador 1";
            let playerColor = assignColor(1);
            let newPlayer = new Player(connection.playerId, playerName, playerColor);
            game.addPlayer(newPlayer);

            // Enviar datos de juego al cliente
            connection.sendUTF(JSON.stringify({ type: 'game_id', game_id: gameId, players: game.getPlayers() }));

            // Guardar el objeto de juego en la lista de juegos
            games.push(game);
        } else if (data.type === 'searchRace') {
            let gameId = data.race_id;
            let race = findGameById(gameId);

            if (race) {
                let numPlayers = race.getPlayerCount() + 1;
                if (numPlayers <= 4) {
                    let playerName = "Jugador " + numPlayers;
                    let playerColor = assignColor(numPlayers);
                    let newPlayer = new Player(connection.playerId, playerName, playerColor);
                    race.addPlayer(newPlayer);

                    // Enviar un mensaje a todos los jugadores del juego con la lista actualizada de jugadores
                    const updatedPlayers = race.getPlayers();
                    connections.forEach(conn => {
                        conn.sendUTF(JSON.stringify({ type: 'player_join', players: updatedPlayers }));
                    });

                    // Confirmar al jugador que se ha unido al juego exitosamente
                    connection.sendUTF(JSON.stringify({ type: 'game_join', game_id: gameId, players: updatedPlayers }));
                } else {
                    connection.sendUTF(JSON.stringify({ type: 'game_full' }));
                }
            } else {
                connection.sendUTF(JSON.stringify({ type: 'game_404' }));
            }
        } else if (data.type === 'startRace') {
            let game = findGameById(data.game_id);

            if (game) {
                // Envía un mensaje a todos los jugadores del juego indicando que la carrera ha comenzado
                if (!game.isRunning()) {
                    game.start();
                    const startMessage = { type: 'race_start' };
                    game.players.forEach(player => {
                        const playerConnection = connections.find(conn => conn.playerId === player.playerId);
                        if (playerConnection) {
                            playerConnection.sendUTF(JSON.stringify(startMessage));
                        }
                    });
                }



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
