const socket = new WebSocket('ws://localhost:8080');
const createRaceButton = document.getElementById('createRace');
const searchRaceButton = document.getElementById('searchRace');
const gameIdElement = document.getElementById('game_id');
const initContainer = document.getElementById('init-container');
const waitingPlayersContainer = document.getElementById('waiting-players-container');
const playersList = document.getElementById('playersList');
const errorSearchMessage = document.getElementById('errorSearch');

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
        startBtn.addEventListener("click" ,()=>{

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
       errorSearchMessage.innerHTML =  `<span style="color:red; font-weight:bold;  ">No existe una partida con esa ID</span>`
    }else if (data.type == "game_full") {
        errorSearchMessage.innerHTML =  `<span style="color:red; font-weight:bold;  ">La partida está llena</span>`
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