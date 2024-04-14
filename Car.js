// car.js
export default class Car {
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
  