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
const buttonX = 50; // Posición X del botón
const buttonY = 50; // Posición Y del botón
const buttonWidth = 100; // Ancho del botón
const buttonHeight = 50; // Alto del botón
const buttonText = 'Reiniciar'; // Texto del botón

var ctx;
const road1Img = new Image();
road1Img.src = 'road1.png';
const road2Img = new Image();
road2Img.src = 'road2.png';
const obstacleImg = new Image();
// Asignar la ruta de la imagen
obstacleImg.src = 'obstacle.png'; // Reemplaza 'obstacle.png' por la ruta de tu imagen
const redCarImg = new Image();
redCarImg.src = 'red.png';
const blueCarImg = new Image();
blueCarImg.src = 'blue.png';
const greenCarImg = new Image();
greenCarImg.src = 'green.png';
const yellowCarImg = new Image();
yellowCarImg.src = 'yellow.png';
let finished = false;
let final_message = false;
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
        finished = false;
        final_message = false;
        initContainer.style.display = "none";
        waitingPlayersContainer.style.display = "none";
        raceCanvasContainer.style.display = "block";
        canvas = document.getElementById('myCanvas');
        canvas.width = 800;
        canvas.height = 700;
        // canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');

        canvas.addEventListener('click', function (event) {
            // Obtener la posición del clic en relación con el canvas
            if (finished) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Verificar si se hizo clic en el área del botón
                if (mouseX >= canvas.width / 3 && mouseX <= canvas.width / 3 + canvas.width / 3 &&
                    mouseY >= canvas.height / 1.7 && mouseY <= canvas.height / 1.7 + buttonHeight) {
                    // Lógica para reiniciar la partida aquí
                    finished = false;
                    final_message = false;
                    const restartData = { type: 'game_restart', game_id: data.game_id };
                    socket.send(JSON.stringify(restartData));
                }
            }

        });
        document.addEventListener("keydown", (e) => {
            e.preventDefault();
            // Verificar si la tecla presionada es una de las teclas que deseas enviar al servidor
            if (['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                // Marcar la tecla como presionada
                let key = e.key
                if (key == 'W' || key == 'A' || key == 'S' || key == 'D') {
                    key = key.toLowerCase();
                }
                keysPressed[key] = true;
                // Si la tecla presionada es válida, enviar los datos al servidor
                const gameData = { type: 'game_action', keysPressed: keysPressed, game_id: data.game_id };
                socket.send(JSON.stringify(gameData));
            }
        });

        document.addEventListener("keyup", (e) => {
            e.preventDefault();
            // Verificar si la tecla presionada es una de las teclas que deseas enviar al servidor
            if (['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                // Marcar la tecla como presionada
                let key = e.key
                if (key == 'W' || key == 'A' || key == 'S' || key == 'D') {
                    key = key.toLowerCase();
                }
                keysPressed[key] = false;
                // Si la tecla presionada es válida, enviar los datos al servidor
                const gameData = { type: 'game_action', keysPressed: keysPressed, game_id: data.game_id };
                socket.send(JSON.stringify(gameData));
            }
        });
    } else if (data.type == "game_info") {
        canvas.width = 800;
        canvas.height = 700;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        data.roads.forEach(road => {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(road1Img, 0, road.y, canvas.width, canvas.height);
        })
        // if (data.roadCount == 1) {

        // } else {
        //     ctx.drawImage(road1Img, 0, 0, canvas.width, canvas.height);

        // }

        // Dibujar los obstáculos primero
        data.obstacles.forEach(obstacle => {

            if (obstacle.y < 0) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(obstacle.x + (obstacle.width / 2), 5, 7, 17);
                ctx.fillRect(obstacle.x + (obstacle.width / 2), 15 + 17, 7, 7);
            }
            // Cuando la imagen termine de cargar, dibujarla en el canvas
            // Dibujar la imagen en el canvas ajustando su tamaño al ancho y alto del obstáculo
            ctx.imageSmoothingEnabled = false;

            ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.font = '10px Arial';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        // Luego, dibujar los jugadores
        data.players.forEach(player => {
            let x;
            let y = canvas.height - 9;
            let color = player.playerColor;

            if (player.playerColor == "red") {
                playerImg = redCarImg;
                x = (canvas.width / 4) - 110;
            } else if (player.playerColor == "blue") {
                playerImg = blueCarImg;
                x = 2 * canvas.width / 4 - 110;
            } else if (player.playerColor == "green") {
                playerImg = greenCarImg;
                x = 3 * canvas.width / 4 - 110;
            } else if (player.playerColor == "yellow") {
                playerImg = yellowCarImg;
                x = 4 * canvas.width / 4 - 110;
            }
            if (player.position == 1) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
                ctx.fillRect(0, player.y, canvas.width, 10);
                ctx.font = '20px Arial';
                ctx.fillStyle = 'yellow';
                ctx.fillText('x' + data.phase, 110, player.y + 28);

            }
            ctx.imageSmoothingEnabled = false;

            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

            ctx.fillStyle = player.playerColor;

            ctx.fillText(player.points, x, y);

        });
        console.log(data.finished)
        if (data.finished && !finished && !final_message) {
            finished = true;

            // Aplicar el filtro de escala de grises inmediatamente
            canvas.style.filter = 'grayscale(100%)';

            const fadeOutDuration = 2000; // Duración de la desaparición gradual de la escala de grises en milisegundos
            const framesPerSecond = 60; // Número de cuadros por segundo para la animación
            const frameIncrement = 1 / (fadeOutDuration / 1000 * framesPerSecond); // Incremento de la escala de grises por cuadro

            // Función para desvanecer gradualmente la escala de grises
            const fadeOutGrayscale = () => {
                // Obtener el valor actual de la escala de grises
                let currentGrayscale = parseFloat(canvas.style.filter.replace('grayscale(', '').replace('%)', '')) / 100;

                // Reducir gradualmente la escala de grises
                currentGrayscale -= frameIncrement;

                // Limitar el valor de la escala de grises entre 0 y 1
                currentGrayscale = Math.max(0, currentGrayscale);

                // Aplicar el filtro de escala de grises al canvas
                canvas.style.filter = `grayscale(${currentGrayscale * 100}%)`;

                // Verificar si la animación ha terminado
                if (currentGrayscale > 0) {
                    // Si la animación no ha terminado, continuar con el siguiente cuadro
                    requestAnimationFrame(fadeOutGrayscale);
                } else {
                    // Si la animación ha terminado, establecer el mensaje final
                    final_message = true;
                }
            };

            // Iniciar la animación de desvanecimiento de la escala de grises
            setTimeout(() => {
                requestAnimationFrame(fadeOutGrayscale);

            }, 2000)
        }

        if (final_message && finished) {

            ctx.fillStyle = "rgba(255, 255, 255, 1)";//Fondo blanco
            ctx.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = "rgba(155, 155, 155, 1)";//Cuadrado gris
            ctx.fillRect(canvas.width / 3, canvas.height / 2.8, canvas.width / 3, canvas.height / 5);
            ctx.fillStyle = "rgba(255, 255, 255, 1)";//Cuadraditos pequeños
            ctx.fillRect(canvas.width / 3 - 1, canvas.height / 2.8, 80, 60);
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';

            ctx.fillText(1, canvas.width / 3 + 130, canvas.height / 2.4);//Number 1
            ctx.fillText(2, canvas.width / 3 + 35, canvas.height / 2);//Number 2
            ctx.fillText(3, canvas.width / 3 + 220, canvas.height / 2);//Number 3
            ctx.fillStyle = "rgba(255, 255, 255, 1)";//Cuadraditos pequeños

            ctx.fillRect(canvas.width / 3 + 187, canvas.height / 2.8, 80, 60);
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
            // Llamada a la función para dibujar el botón en el canvas
            const sortedPlayers = data.players.sort((a, b) => b.points - a.points);

            // Dibujar los nombres de los jugadores en función de su posición
            sortedPlayers.slice(0, 3).forEach((player, index) => {
                ctx.fillStyle = player.playerColor;
                switch (index) {
                    case 0:
                        ctx.fillText(player.playerName, canvas.width / 3 + 90, canvas.height / 3); // Primer jugador
                        break;
                    case 1:
                        ctx.fillText(player.playerName, canvas.width / 3 - 20, canvas.height / 2.4); // Segundo jugador
                        break;
                    case 2:
                        ctx.fillText(player.playerName, canvas.width / 3 + 195, canvas.height / 2.4); // Tercer jugador
                        break;
                    default:
                        break;
                }
            });
            drawButton(ctx, canvas.width / 3, canvas.height / 1.7, canvas.width / 3, buttonHeight, buttonText);
            // Agregar un event listener para el clic en el canvas

        }
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
function drawButton(ctx, x, y, width, height, text) {
    // Dibujar el botón como un rectángulo
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, width, height);

    // Dibujar el texto en el centro del botón
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
}
