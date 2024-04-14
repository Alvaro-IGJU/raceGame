

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
class Car {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // update() {
    //   this.y += this.speed;
    // }

    accelerate(acceleration) {
        this.speed += acceleration;
    }

    decelerate(deceleration) {
        this.speed -= deceleration;
        if (this.speed < 0) {
            this.speed = 0;
        }
    }

    steer(direction) {
        // Implementa la lógica de giro aquí
    }
}

class Road {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }


}

class LineRoad {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 2;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }

}


// car.js
class Obstacle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }

    accelerate(acceleration) {
        this.speed += acceleration;
    }

    decelerate(deceleration) {
        this.speed -= deceleration;
        if (this.speed < 0) {
            this.speed = 0;
        }
    }

    steer(direction) {
        // Implementa la lógica de giro aquí
    }
}


const car = new Car(canvas.width / 2, canvas.height - 10, 10, 10, 'red');
const road = new Road(30,0, canvas.width-60, canvas.height, 'rgb(35,35,35)');
let obstaclesArray = []
let roadLinesArray = []
let roadLinesInterval = setInterval(() => {
         roadLinesArray.push(new LineRoad(((road.x + road.width/4)), 0, 5, 15, 'white'));
         roadLinesArray.push(new LineRoad(road.width/4 + (road.x + road.width/4), 0, 5, 15, 'white'));
         roadLinesArray.push(new LineRoad(2*road.width/4 + (road.x + road.width/4), 0, 5, 15, 'white'));

}, 500);

let interval = setInterval(() => {
    // Generar un valor aleatorio entre -10 y 10 para variar la posición del obstáculo
    let randomOffset = Math.random() * 20 - 10;

    // Calcular la posición x del obstáculo basándose en la posición x del coche y el valor aleatorio
    let obstacleX = car.x + randomOffset;

    // Añadir el obstáculo al array
    // obstaclesArray.push(new Obstacle(obstacleX, 0, 20, 20, 'green'));
}, 1000);

function gameLoop() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "green"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    road.draw(ctx)
    // Actualizar y dibujar los obstáculos
    obstaclesArray.forEach(obstacle => {
        if (obstacle.y < canvas.height) {
            obstacle.update();
            obstacle.draw(ctx);
        }
    });
    roadLinesArray.forEach(line => {
        if (line.y < canvas.height) {
            line.update();
            line.draw(ctx);
        }
    });
    // Filtrar los obstáculos que ya no están en pantalla
    obstaclesArray = obstaclesArray.filter(obstacle => {
        return obstacle.y < canvas.height;
    });

    // Dibujar y actualizar el coche
    car.draw(ctx);

    // Volver a llamar a gameLoop en el siguiente frame
    requestAnimationFrame(gameLoop);
}

// Comenzar el bucle del juego
gameLoop();

// Agregar un controlador de eventos para el evento keydown al documento
document.addEventListener('keydown', function (event) {
    // Verificar la tecla presionada utilizando la propiedad 'key' del evento
    if (event.key === 'a' || event.key === 'ArrowLeft') {
        event.preventDefault()
        // La tecla de flecha hacia arriba fue presionada
        if (car.x > road.x) {
            car.x -= 5

        }
        // Agrega aquí la lógica para acelerar el coche o cualquier otra acción que desees realizar
    } else if (event.key === 'd'  || event.key === 'ArrowRight') {
        event.preventDefault()

        // La tecla de flecha hacia abajo fue presionada
        if (car.x + car.width <  road.x + road.width) {

            car.x += 5
        }

        // Agrega aquí la lógica para frenar el coche o cualquier otra acción que desees realizar
    }
    // Puedes agregar más condiciones para otras teclas si lo deseas
});
