const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player settings
const playerSize = { width: 40, height: 40 };
const groundLevel = 360; // Ground y-position

const players = [
  { 
    x: 100, y: groundLevel, color: 'blue', hp: 100, 
    left: 'a', right: 'd', jump: 'w', shoot: 'f', 
    vy: 0, isJumping: false, bullets: [] 
  },
  { 
    x: 660, y: groundLevel, color: 'red', hp: 100, 
    left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', shoot: 'm', 
    vy: 0, isJumping: false, bullets: [] 
  }
];

const bulletSpeed = 5;
const gravity = 0.5;
const jumpForce = -10;

const keys = {};

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function shoot(playerIndex) {
  const player = players[playerIndex];
  const direction = (playerIndex === 0) ? 1 : -1;
  player.bullets.push({ x: player.x + playerSize.width / 2, y: player.y + playerSize.height / 2, dir: direction });
}

function update() {
  players.forEach((player, index) => {
    // Left and right movement
    if (keys[player.left]) player.x -= 3;
    if (keys[player.right]) player.x += 3;

    // Jump
    if (keys[player.jump] && !player.isJumping) {
      player.vy = jumpForce;
      player.isJumping = true;
    }

    // Apply gravity
    player.vy += gravity;
    player.y += player.vy;

    // Landing on ground
    if (player.y >= groundLevel) {
      player.y = groundLevel;
      player.vy = 0;
      player.isJumping = false;
    }

    // Keep players within canvas horizontally
    player.x = Math.max(0, Math.min(canvas.width - playerSize.width, player.x));

    // Shoot bullets
    if (keys[player.shoot]) {
      if (!player.shootCooldown) {
        shoot(index);
        player.shootCooldown = 20; // frames between shots
      }
    }

    if (player.shootCooldown) player.shootCooldown--;

    // Move bullets
    player.bullets.forEach(bullet => bullet.x += bulletSpeed * bullet.dir);

    // Bullet collision
    player.bullets.forEach((bullet, bIndex) => {
      const opponent = players[1 - index];
      if (bullet.x > opponent.x && bullet.x < opponent.x + playerSize.width &&
          bullet.y > opponent.y && bullet.y < opponent.y + playerSize.height) {
        opponent.hp -= 10;
        player.bullets.splice(bIndex, 1);
      }
    });

    // Remove off-screen bullets
    player.bullets = player.bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = 'green';
  ctx.fillRect(0, groundLevel + playerSize.height, canvas.width, canvas.height - groundLevel);

  // Draw players
  players.forEach(player => {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, playerSize.width, playerSize.height);
  });

  // Draw bullets
  players.forEach(player => {
    player.bullets.forEach(bullet => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(bullet.x, bullet.y, 5, 5);
    });
  });

  // Draw health bars
  ctx.fillStyle = 'blue';
  ctx.fillRect(20, 20, players[0].hp * 2, 20);
  ctx.fillStyle = 'red';
  ctx.fillRect(560, 20, players[1].hp * 2, 20);

  // Draw text
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.fillText(`Player 1 HP: ${players[0].hp}`, 20, 60);
  ctx.fillText(`Player 2 HP: ${players[1].hp}`, 560, 60);
}

function gameLoop() {
  update();
  draw();

  // Check win condition
  if (players[0].hp <= 0) {
    alert('Player 2 Wins!');
    window.location.reload();
  } else if (players[1].hp <= 0) {
    alert('Player 1 Wins!');
    window.location.reload();
  } else {
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
