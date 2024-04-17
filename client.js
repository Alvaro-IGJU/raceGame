// const socket = new WebSocket('ws://localhost:8080');
const socket = new WebSocket('ws://192.168.1.70:8080');
const createRaceButton = document.getElementById('createRace');
const searchRaceButton = document.getElementById('searchRace');
const gameIdElement = document.getElementById('game_id');
const initContainer = document.getElementById('init-container');
const waitingPlayersContainer = document.getElementById('waiting-players-container');
const raceCanvasContainer = document.getElementById('race-canvas-container');
const playersList = document.getElementById('playersList');
const errorSearchMessage = document.getElementById('errorSearch');
var canvas;
var ctx;
let road1Img = new Image();
road1Img.src = 'road1.png';
let road2Img = new Image();
road2Img.src = 'road2.png';

let redCarImg = new Image();
redCarImg.src = 'red.png'; 
let blueCarImg = new Image();
blueCarImg.src = 'blue.png'; 
let greenCarImg = new Image();
greenCarImg.src = 'green.png'; 
let yellowCarImg = new Image();
yellowCarImg.src = 'yellow.png'; 

const keysPressed = {
    'w': false,
    'a': false,
    's': false,
    'd': false
};

socket.onopen = function (evt) {
    console.log("Conectado al servidor WebSocket");
}

socket.onmessage = function (evt) {
    const data = JSON.parse(evt.data)
    if (data.type == "game_id") {
        initContainer.style.display = "none";
        waitingPlayersContainer.style.display = "flex";
        waitingPlayersContainer.style.alignItems = "center";
        gameIdElement.textContent = data.game_id;
        playersList.innerHTML = `<span style="color:${data.players[0].playerColor}; font-weight:bold;">${data.players[0].playerName}</span>`
        let startBtn = document.createElement("button");
        startBtn.textContent = "¡Empezar partida!"
        startBtn.addEventListener("click", () => {
            const dataSend = { type: 'startRace', game_id: data.game_id };
            socket.send(JSON.stringify(dataSend));
        })
        waitingPlayersContainer.appendChild(startBtn)
    } else if (data.type == "game_join") {
        initContainer.style.display = "none";
        waitingPlayersContainer.style.display = "flex";
        waitingPlayersContainer.style.alignItems = "center";
        gameIdElement.textContent = data.game_id;
    } else if (data.type == "player_join") {
        playersList.innerHTML = "";
        data.players.forEach(player => {
            playersList.innerHTML += `<span style="color:${player.playerColor}; font-weight:bold; ">${player.playerName}</span><br>`
        });
    } else if (data.type == "game_404") {
        errorSearchMessage.innerHTML = `<span style="color:red; font-weight:bold;  ">No existe una partida con esa ID</span>`
    } else if (data.type == "game_full") {
        errorSearchMessage.innerHTML = `<span style="color:red; font-weight:bold;  ">La partida está llena</span>`
    } else if (data.type == "race_start") {
        console.log(data)
        
        initContainer.style.display = "none";
        waitingPlayersContainer.style.display = "none";
        raceCanvasContainer.style.display = "block";
        canvas = document.getElementById('myCanvas');
        // canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');
        
        document.addEventListener("keydown", (e) => {
            e.preventDefault();
            // Verificar si la tecla presionada es una de las teclas que deseas enviar al servidor
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                // Marcar la tecla como presionada
                keysPressed[e.key] = true;
                // Si la tecla presionada es válida, enviar los datos al servidor
                const gameData = { type: 'game_action', keysPressed: keysPressed, game_id: data.game_id };
                socket.send(JSON.stringify(gameData));
            }
        });
        
        document.addEventListener("keyup", (e) => {
            e.preventDefault();
            // Verificar si la tecla liberada es una de las teclas que deseas enviar al servidor
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                // Marcar la tecla como no presionada
                keysPressed[e.key] = false;
                // Si la tecla liberada es válida, enviar los datos al servidor
                const gameData = { type: 'game_action', keysPressed: keysPressed, game_id: data.game_id };
                socket.send(JSON.stringify(gameData));
            }
        });
    } else if (data.type == "game_info") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        if(data.roadCount == 1){
            ctx.drawImage(road2Img,0, 0, canvas.width, canvas.height);
        }else{
            ctx.drawImage(road1Img,0, 0, canvas.width, canvas.height);

        }
        
        // Dibujar los obstáculos primero
        data.obstacles.forEach(obstacle => {
            let obstacleImg = new Image();
            // Asignar la ruta de la imagen
            obstacleImg.src = 'obstacle.png'; // Reemplaza 'obstacle.png' por la ruta de tu imagen
            
            // Cuando la imagen termine de cargar, dibujarla en el canvas
            // Dibujar la imagen en el canvas ajustando su tamaño al ancho y alto del obstáculo
            ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Luego, dibujar los jugadores
        data.players.forEach(player => {
            let playerImg;
            if(player.playerColor == "red"){
                playerImg = redCarImg;
            }else if(player.playerColor == "blue"){
                playerImg = blueCarImg;
            }else if(player.playerColor == "green"){
                playerImg = greenCarImg;
            }else if(player.playerColor == "yellow"){
                playerImg = yellowCarImg;
            }
            // Asignar la ruta de la imagen
            
            // Cuando la imagen termine de cargar, dibujarla en el canvas
            
            // Dibujar la imagen en el canvas ajustando su tamaño al ancho y alto del jugador
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        });
    }
    
    
}

// Obtener input por ID
const searchInput = document.getElementById('searchInput');

// Ahora puedes trabajar con estos elementos, por ejemplo, añadir event listeners, etc.
createRaceButton.addEventListener('click', function () {
    console.log('Botón "Crear partida" clickeado');
    const data = { type: 'createRace' };
    socket.send(JSON.stringify(data));
});

searchRaceButton.addEventListener('click', function () {
    let idToSearch = searchInput.value;
    const data = { type: 'searchRace', race_id: idToSearch };
    socket.send(JSON.stringify(data));
});

searchInput.addEventListener('input', function (event) {
    console.log('Input cambiado:', event.target.value);
});
