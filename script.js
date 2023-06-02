const WALL_MIN = { x: 0, y: 0 };
const WALL_MAX = { x: 800, y: 600 };

class Level {
  constructor() {
    this.reset();
  }

  increaseLevel() {
    this.levelNumber++;
    this.enemyCount += 2;
  }

  reset() {
    this.levelNumber = 1;
    this.enemyCount = 6;
  }
}

class Enemy {
  constructor(x, y) {
    let num = Math.floor(Math.random() * 2);
    if (num === 0) {
      num = -1;
    }
    this.x = x;
    this.y = y;
    this.dx = num * 3;
    this.fireCooldown = 0;
  }

  update(allBullets) {
    this.x += this.dx;
    this.fireCooldown += 1;

    if (this.x < WALL_MIN.x || this.x > WALL_MAX.x - 50) {
      this.dx = -this.dx;
    }

    if (this.fireCooldown === 50) {
      this.fireCooldown = 0;
      allBullets.push(new Bullet(this.x + 2, this.y + 42, true));
    }

    for (let i = allBullets.length - 1; i >= 0; i--) {
      const b = allBullets[i];
      if (
        !b.isEnemyBullet &&
        b.x >= this.x &&
        b.x + 10 <= this.x + 50 &&
        b.y >= this.y &&
        b.y + 10 <= this.y + 42
      ) {
        return true;
      }
    }

    return false;
  }
}

class Bullet {
  constructor(x, y, isEnemyBullet) {
    this.x = x;
    this.y = y;
    this.isEnemyBullet = isEnemyBullet;
    this.speed = this.isEnemyBullet ? (Math.floor(Math.random() * (5 - 2 + 1)) + 5) : 10 

    this.fireCooldown = 0;
  }

  update() {
    if (this.fireCooldown > 0) {
      this.fireCooldown--;
    }

    if (this.isEnemyBullet) {
      this.y += this.speed;
    } else {
      this.y -= this.speed;
    }

    return this.y > WALL_MIN.y || this.y + 10 > WALL_MAX.y;
  }

  draw(ctx) {
    ctx.fillStyle = this.isEnemyBullet ? "red" : "blue";
    ctx.fillRect(this.x, this.y, 5, 10);
  }

  canFire() {
    return this.fireCooldown === 0;
  }

  setFireCooldown(cooldown) {
    this.fireCooldown = cooldown;
  }
}


class Player {
  constructor() {
    this.x = 100;
    this.y = 525;
    this.w = 50;
    this.h = 64;
    this.dx = 8;
    this.fireCooldown = 0;
    this.lives = 10;
    this.level = new Level();
  }

  update(allBullets) {
    if (allEnemies.length === 0) {
      this.level.increaseLevel();
      this.spawnEnemies();
    }

    if (isKeyPressed("ArrowLeft") || isKeyPressed("a")) {
      this.x -= this.dx;
    }
    if (isKeyPressed("ArrowRight") || isKeyPressed("d")) {
      this.x += this.dx;
    }
  
    if (this.x < WALL_MIN.x) {
      this.x = WALL_MIN.x;
    }
    if (this.x > WALL_MAX.x - this.w) {
      this.x = WALL_MAX.x - this.w;
    }
  
    if (isKeyPressed(" ") && this.fireCooldown === 0) {
      allBullets.push(new Bullet(this.x + this.w / 2 - 2, 525, false));
      this.fireCooldown = 20;
    }
  
    for (let i = allBullets.length - 1; i >= 0; i--) {
      const b = allBullets[i];

      if (b.isEnemyBullet && this.checkCollision(b)) {
        this.lives -= 1;
        allBullets.splice(i, 1);
        
        if (this.lives <= 0) {
          this.reset();
        }
      }
    }
  
    if (this.fireCooldown > 0) {
      this.fireCooldown--;
    }
  }

  spawnEnemies() {
    allEnemies.length = 0;

    for (let i = 0; i < this.level.enemyCount; i++) {
      allEnemies.push(new Enemy(Math.floor(Math.random() * 751), 62));
    }
  }

  reset() {
    this.lives = 10;
    score = 0;
    this.level.reset();
    this.spawnEnemies();
  }

  checkCollision(bullet) {
    return (
      bullet.x >= this.x &&
      bullet.x <= this.x + this.w &&
      bullet.y >= this.y &&
      bullet.y <= this.y + this.h
    );
  }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = new Player();
const allBullets = [];
const allEnemies = [];

const backgroundImg = new Image();
const playerImg = new Image();
const enemyImg = new Image();

let score = 0;

backgroundImg.src = "space.png";
playerImg.src = "spaceship.png";
enemyImg.src = "enemy.png";

for (let i = 0; i < 6; i++) {
  allEnemies.push(new Enemy(Math.floor(Math.random() * 751), 62));
}

function update() {
  player.update(allBullets);

  allBullets.forEach((bullet, index) => {
    if (!bullet.update()) {
      allBullets.splice(index, 1);
    }
  });

  for (let i = allEnemies.length - 1; i >= 0; i--) {
    const enemy = allEnemies[i];
    if (enemy.update(allBullets)) {
      score += 1;
      allEnemies.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, 0);

  ctx.drawImage(playerImg, player.x, player.y);

  allBullets.forEach((b) => b.draw(ctx));

  allEnemies.forEach((e) => {
    ctx.drawImage(enemyImg, e.x, e.y);
  });

  ctx.fillStyle = "white";
  ctx.font = "24px sans-serif";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Level: " + player.level.levelNumber, 10, 56);
  ctx.fillText("Health:", 150, 30);

  ctx.fillRect(150, 40, 200, 15);
      
  ctx.fillStyle = "red";
  ctx.fillRect(150, 40, (player.lives / 10) * 200, 15);

  requestAnimationFrame(loop);
}

function loop() {
  update();
  draw();
}

function isKeyPressed(key) {
  return keyState[key] === true;
}

const keyState = {};

window.addEventListener("keydown", (e) => {
  keyState[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keyState[e.key] = false;
});

loop();
