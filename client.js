const socket = new WebSocket('ws://localhost:8080');
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
            console.log("startRace")
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
        initContainer.style.display = "none";
        waitingPlayersContainer.style.display = "none";
        raceCanvasContainer.style.display = "block";
        canvas = document.getElementById('myCanvas');
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
        data.players.forEach(player => {
        
            ctx.fillStyle = player.playerColor;
            ctx.fillRect(player.x, player.y, player.width, player.height);
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
