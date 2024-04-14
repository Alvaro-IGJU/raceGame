const socket = new WebSocket('ws://localhost:8080');
const createRaceButton = document.getElementById('createRace');
const searchRaceButton = document.getElementById('searchRace');
const gameIdElement = document.getElementById('game_id');
const initContainer = document.getElementById('init-container');
const waitingPlayersContainer = document.getElementById('waiting-players-container');
const playersList = document.getElementById('playersList');

socket.onopen = function (evt) {
    console.log("Conectado al servidor WebSocket");

}

socket.onmessage = function (evt) {
    const data = JSON.parse(evt.data)
    if(data.type == "game_id"){
        initContainer.style.display = "none";
        waitingPlayersContainer.style.display = "flex";
        waitingPlayersContainer.style.alignItems = "center";
        gameIdElement.textContent = data.game_id;
        console.log(data.players[0])
        playersList.innerHTML = `<span style="color:${data.players[0].playerColor}; font-weight:bold; margin-top: 3%; margin-left: 3%;">${data.players[0].playerName}</span>`

    }
}



// Obtener input por ID
const searchInput = document.getElementById('searchInput');

// Ahora puedes trabajar con estos elementos, por ejemplo, añadir event listeners, etc.
createRaceButton.addEventListener('click', function() {
    console.log('Botón "Crear partida" clickeado');
    const data = { type: 'createRace', message:"create race" };
    socket.send(JSON.stringify(data));
});

searchRaceButton.addEventListener('click', function() {
    console.log('Botón "Buscar partida" clickeado');
});

searchInput.addEventListener('input', function(event) {
    console.log('Input cambiado:', event.target.value);
});