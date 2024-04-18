const canvasWidth = 730; // Ancho del canvas (ajústalo según tus necesidades)
const canvasHeight = 700; // Altura del canvas (ajústalo según tus necesidades)
let general_player_speed = 7;

class Player {
    constructor(playerId, playerName, playerColor) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.x = 50;
        this.y = 90;
        this.width = 76;
        this.height = 125;
        this.speed =general_player_speed;
        this.points = 0;
        this.position = 0;
        this.gameId = null;
        this.isCollidingTop = false;
        this.lost = false;
    }
    
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
    }
    
    getY() {
        return this.y;
    }
    setY(y) {
        this.y = y;
    }
    getGameId(){
        return this.gameId;
    }
    setGameId(gameId){
        this.gameId = gameId;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Road {
    constructor(y) {
        this.y = y;
    }
}

class Obstacle {
    constructor(x,color,speed) {
        
        this.color = color;
        this.x = x;
        this.y = -1000;
        this.width = 76;
        this.height = 125;
        this.speed = speed;
    }
    
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
    }
    
    getY() {
        return this.y;
    }
    setY(y) {
        this.y = y;
    }
    move() {
        // Mover el obstáculo hacia abajo
        this.y += this.speed;
    }
}

class Game {
    constructor(gameId) {
        this.uuid = gameId;
        console.log(gameId)
        this.players = [];
        this.obstacles = [];
        this.running = false;
        this.interval = null; // Intervalo para enviar la información del juego a los jugadores
        this.roadInterval = null;
        this.obstacleInterval = null;
        this.phaseInterval = null;
        this.phase = 1;
        this.roads = []
        this.velocity = 3;
    }
    clearIntervals() {
        if (this.interval !== null) {

            clearInterval(this.interval);
            this.interval = null;

        }
        if (this.roadInterval !== null) {

            clearInterval(this.roadInterval);
            this.roadInterval = null;

        }
        if (this.obstacleInterval !== null) {
 
            clearInterval(this.obstacleInterval);
            this.obstacleInterval = null;
        }
        if (this.phaseInterval !== null) {

            clearInterval(this.phaseInterval);
            this.phaseInterval = null;

        }
    }
    sortPlayersByPosition() {
        this.players.sort((a, b) => a.getY() - b.getY());
        // Actualizar la posición de cada jugador después de ordenar
        this.players.forEach((player, index) => {
            player.position = index + 1;
        });
    }
    addPlayer(player) {
        player.setGameId(this.uuid)
        this.players.push(player);
    }
    removePlayer(player) {
        const index = this.players.indexOf(player);
        if (index !== -1) {
            this.players.splice(index, 1);
            
            // Verificar si no quedan más jugadores en el juego
            if (this.players.length === 0) {
                // Buscar el índice del juego en el array de juegos
             
                const gameIndex = games.indexOf(this);
                if (gameIndex !== -1) {
                    games[gameIndex].clearIntervals()                    // Eliminar el juego del array de juegos
                    games.splice(gameIndex, 1);
                }
            }
        }
    }
    addRandomObstacle() {
        // Generar una posición aleatoria para el obstáculo
        const x = Math.floor(Math.random() * canvasWidth);
        
        // Agregar el obstáculo al array de obstáculos
        // const obstacle = new Obstacle(x, "black",10 /this.velocity*2);
        const obstacle = new Obstacle(x, "black",this.velocity*1.5);
        this.obstacles.push(obstacle);
    }
    destroyObstacle(obstacle) {
        // Buscar el índice del obstáculo en el array de obstáculos
        const index = this.obstacles.indexOf(obstacle);
        if (index !== -1) {
            // Eliminar el obstáculo del array de obstáculos
            this.obstacles.splice(index, 1);
        }
    }
    getObstacles() {
        return this.obstacles;
    }
    
    getPlayers() {
        return this.players;
    }
    
    getPlayerCount() {
        return this.players.length;
    }
    
    start() {
       
        general_player_speed = 7;
        this.phase = 1;
        this.velocity = 3;
        this.obstacles = [];
        let playerWidth = 30; // Ancho de cada jugador (ajústalo según tus necesidades)
        let playerCount = this.getPlayers().length;
        let spaceBetweenPlayers = (canvasWidth - playerWidth * playerCount) / (playerCount + 1); // Espacio entre cada jugador
        // Calcular la posición inicial para el primer jugador
        let initialX = spaceBetweenPlayers + playerWidth / 2;
        let initialY = 400;
        let road_1 = new Road(0);
        let road_2 = new Road( - canvasHeight);
        let road_3 = new Road( - 2*canvasHeight);
        this.roads.push(road_1);
        this.roads.push(road_2);
        this.roads.push(road_3);
        // Asignar las posiciones a cada jugador
        this.getPlayers().forEach((player, index) => {
            let playerX = initialX + index * (playerWidth + spaceBetweenPlayers);
            player.setX(playerX);
            player.setY(initialY);
            player.lost = false;
            player.points = 0;
            player.position = 0;
            player.speed =general_player_speed;
        });
        
        // Iniciar el intervalo para enviar la información del juego a los jugadores
        this.running = true;
        this.interval = setInterval(() => {
            this.sendGameInfo();
        }, 16); 

        this.moveRoads();
        
        this.obstacleInterval = setInterval(() => {
            this.addRandomObstacle();
        }, 5000); // Agrega un obstáculo cada 5 segundos

        this.phaseInterval = setInterval(() => {
            this.phase++;
            this.velocity++;
            this.getPlayers().forEach((player, index) => {
                general_player_speed+=0.1
            });
        }, 15000/this.velocity); // Agrega un obstáculo cada 5 segundos

    }
    moveRoads() {
        this.roadInterval = setInterval(()=>{
            this.roads.forEach(road => {
                // Mover la carretera hacia abajo
                road.y += this.velocity;
                // Si la posición y de la carretera es mayor que la altura del lienzo,
                // mover la carretera al final del array de carreteras
                if (road.y > canvasHeight) {
                    // Eliminar la carretera del principio del array y agregarla al final
                    const shiftedRoad = this.roads.shift();
                    shiftedRoad.y = this.roads[this.roads.length - 1].y - canvasHeight;
                    this.roads.push(shiftedRoad);
                }
            });
        }, 10 /this.velocity*2)
    }
    isFinished(){
        let allfinished = true;
        this.players.forEach(player => {
            if(allfinished){
                allfinished = player.lost;
            }
                    
        })

        return allfinished;
    }
    finish() {
        this.running = false;
        // Detener el intervalo cuando finaliza la carrera
     
    }
    
    isRunning() {
        return this.running;
    }
    
    // Función para enviar la información del juego a todos los jugadores
    sendGameInfo() {
        // console.log("general_player_speed",general_player_speed)
        // console.log("this.velocity",this.velocity)
        this.sortPlayersByPosition();
        if(this.isFinished()){
            this.running = false;
            this.velocity = 0.3;
            for (let i = 0; i < this.obstacles.length; i++) {
               let obstacle = this.obstacles[i];
               obstacle.speed = this.velocity;
            }
        }
        const gameData = {
            type: 'game_info',
            players: this.getPlayers(), // Obtener la información de los jugadores del juego
            obstacles: this.getObstacles(), // Obtener la información de los jugadores del juego
            phase: this.phase,
            roads: this.roads,
            finished: this.isFinished()
            // Puedes agregar más información del juego si es necesario
        };
        
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            if(obstacle.getY() < canvasHeight){
                // obstacle.speed = this.velocity;

                obstacle.move();
                
            }else{
                this.destroyObstacle(obstacle)
            }
        }
        
        this.players.forEach(player => {
            if(!player.lost){

                if(player.getY() < canvasHeight){
                    if(player.position == 1){
                        player.points+=this.phase*this.velocity*10;
                    }else  if(player.position == 2){
                        player.points+=this.velocity*10;
                    }else  if(player.position == 3){
                        player.points+=this.velocity*7;
                    }else  if(player.position == 4){
                        player.points+=this.velocity*5;
                    }
                    checkCollision(this,player)
                }else{
                    player.lost = true;
                    player.y = player.position * 1000
                }
                
                
            }
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
const { count } = require('console');

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
        
        // Buscar el jugador que se desconecta
        let game = findGameByConnection(connection);
        if(game){
            const disconnectedPlayer = game.getPlayers().find(player => player.playerId === connection.playerId);
            
            // Si se encontró al jugador desconectado
            if (disconnectedPlayer) {
                // Iniciar un intervalo para mover gradualmente al jugador hacia abajo
                const descentInterval = setInterval(() => {
                    // Mover al jugador hacia abajo
                    disconnectedPlayer.setY(disconnectedPlayer.getY() + 10); // Ajusta la velocidad de descenso según tus necesidades
                    
                    // Enviar la información actualizada del juego a todos los jugadores
                    game.sendGameInfo();
                    
                    // Si el jugador ha alcanzado la parte inferior del canvas, detener el intervalo
                    if (disconnectedPlayer.getY() >= canvasHeight) {
                        clearInterval(descentInterval);
                        game.removePlayer(disconnectedPlayer);
                        
                        
                    }
                }, 50); // Ajusta el intervalo según la velocidad deseada de descenso
            }
        }
        
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
        } else if (data.type === 'startRace' || data.type === 'game_restart' ) {
            let game = findGameById(data.game_id);
            
            if (game) {
                // Envía un mensaje a todos los jugadores del juego indicando que la carrera ha comenzado
                if (!game.isRunning()) {


                       game.clearIntervals()
                    
                   
                    game.start();
                    const startMessage = { type: 'race_start' , game_id: data.game_id, color:'red'};
                    game.players.forEach(player => {
                        const playerConnection = connections.find(conn => conn.playerId === player.playerId);
                        if (playerConnection) {
                            startMessage.color = player.playerColor;
                            playerConnection.sendUTF(JSON.stringify(startMessage));
                        }
                    });
                }
            }
        }
       
            
        else if (data.type === 'game_action') {
            let game = findGameById(data.game_id);
            let player = game.getPlayers().find(player => player.playerId === connection.playerId);
            
            if (game && player) {
                // Envía un mensaje a todos los jugadores del juego indicando que la carrera ha comenzado
                if (game.isRunning()) {
                    handleGameAction(game, player, data.keysPressed);
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

function findGameByConnection(connection) {
    // Iterar sobre la lista de juegos
    for (let i = 0; i < games.length; i++) {
        // Verificar si la conexión del jugador está asociada con alguno de los juegos
        const gamePlayers = games[i].getPlayers();
        for (let j = 0; j < gamePlayers.length; j++) {
            // Verificar si la conexión del jugador coincide con algún jugador en el juego actual
            if (gamePlayers[j].playerId === connection.playerId) {
                // Si hay coincidencia, devolver el juego encontrado
                return games[i];
            }
        }
    }
    // Si no se encuentra ningún juego asociado con la conexión del jugador, devolver null
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

function handleGameAction(game, player, keysPressed) {
    // Aquí implementa la lógica para manejar las acciones del juego según las teclas presionadas
    if(!player.lost){
        if (keysPressed['w'] || keysPressed['ArrowUp']) {
            movePlayer(game,player, 'up');
        }
        if (keysPressed['a'] || keysPressed['ArrowLeft']) {
            movePlayer(game,player, 'left');
        }
        if (keysPressed['s'] || keysPressed['ArrowDown']) {
            movePlayer(game,player, 'down');
        }
        if (keysPressed['d'] || keysPressed['ArrowRight']) {
            movePlayer(game,player, 'right');
        }
    }
    // Envía la información actualizada del juego a todos los jugadores
}

function movePlayer(game,player, direction) {
    // Verificar la dirección y ajustar la posición del jugador en consecuencia
    switch (direction) {
        case 'up':
        if (player.getY() - player.speed >= 0 && !checkCollision(game,player, 'up')) {
            player.setY(player.getY() - player.speed);
        }
        break;
        case 'down':
        if (player.getY() + player.speed <= canvasHeight - player.height && !checkCollision(game,player, 'down')) {
            player.setY(player.getY() + player.speed);
        }
        break;
        case 'left':
        if (player.getX() - player.speed >= 0 && !checkCollision(game,player, 'left')) {
            player.setX(player.getX() - player.speed);
        }
        break;
        case 'right':
        if (player.getX() + player.speed <= canvasWidth && !checkCollision(game,player, 'right')) {
            player.setX(player.getX() + player.speed);
        }
        break;
        default:
        break;
    }
}

function checkCollision(game, player, direction = null) {
    // Calcular la posición futura del jugador según la dirección y la velocidad
    let futureX = player.getX();
    let futureY = player.getY();
    switch (direction) {
        case 'up':
        futureY -= player.speed;
        break;
        case 'down':
        futureY += player.speed;
        break;
        case 'left':
        futureX -= player.speed;
        break;
        case 'right':
        futureX += player.speed;
        break;
        default:
        break;
    }
    // Verificar la colisión del jugador con otros jugadores en el juego
    const otherPlayers = game.getPlayers().filter(otherPlayer => otherPlayer.playerId !== player.playerId);
    for (let j = 0; j < otherPlayers.length; j++) {
        const otherPlayer = otherPlayers[j];
        if (
            futureX < otherPlayer.getX() + otherPlayer.width &&
            futureX + player.width > otherPlayer.getX() &&
            futureY < otherPlayer.getY() + otherPlayer.height &&
            futureY + player.height > otherPlayer.getY()
            ) {
                if (player.getY() < otherPlayer.getY() + otherPlayer.height ) {
                    player.isCollidingTop = true;
                    if(otherPlayer.isCollidingTop){
                        if(direction == null)
                        player.setY(player.getY() + otherPlayer.speed );
                    }
                }else{
                    player.isCollidingTop = false;
                    
                }
                // Hay colisión con otro jugador
                return true;
            }
        }
        
        // Verificar la colisión del jugador con los obstáculos en el juego
        const obstacles = game.getObstacles();
        for (let j = 0; j < obstacles.length; j++) {
            const obstacle = obstacles[j];
            
            if (
                futureX < obstacle.x + obstacle.width &&
                futureX + player.width > obstacle.x &&
                futureY < obstacle.y + obstacle.height &&
                futureY + player.height > obstacle.y
                ) {
                    // Hay colisión con un obstáculo
                    // Si el jugador está colisionando por debajo del obstáculo, moverlo hacia abajo
                    if (player.getY() < obstacle.y + obstacle.height && direction == null) {
                        player.isCollidingTop = true;
                        player.speed = obstacle.speed;
                        player.setY(player.getY() + obstacle.speed);
                    }else{
                        player.isCollidingTop = false;
                        player.speed = general_player_speed;

                    }
                    return true;
                }
            }
            
            // No hay colisión con otros jugadores ni con obstáculos
            return false;
        }
        
        