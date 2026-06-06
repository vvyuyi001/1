const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');

canvas.width = 500;
canvas.height = 700;

let score = 0;
let gameRunning = false;
let animationId;
let keys = {};
let stars = [];

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 60,
    speed: 5,
    color: '#00d4ff'
};

let bullets = [];
let enemies = [];
let explosions = [];

function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 2 + 0.5
        });
    }
}

function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(0, -player.height / 2);
    ctx.lineTo(-player.width / 2, player.height / 2);
    ctx.lineTo(-player.width / 4, player.height / 3);
    ctx.lineTo(player.width / 4, player.height / 3);
    ctx.lineTo(player.width / 2, player.height / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#00a3cc';
    ctx.beginPath();
    ctx.ellipse(0, -5, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(-10, player.height / 2 - 5);
    ctx.lineTo(0, player.height / 2 + 15 + Math.random() * 10);
    ctx.lineTo(10, player.height / 2 - 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function createBullet() {
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 15,
        speed: 8
    });
}

function drawBullets() {
    ctx.fillStyle = '#ffd700';
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;
        
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });
}

function createEnemy() {
    const enemyTypes = [
        { width: 40, height: 40, color: '#ff4757', speed: 2, points: 10 },
        { width: 50, height: 50, color: '#ff6b81', speed: 1.5, points: 15 },
        { width: 30, height: 30, color: '#ff7979', speed: 3, points: 5 }
    ];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({
        x: Math.random() * (canvas.width - type.width),
        y: -type.height,
        ...type
    });
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(0, enemy.height / 2);
        ctx.lineTo(-enemy.width / 2, -enemy.height / 2);
        ctx.lineTo(-enemy.width / 4, -enemy.height / 4);
        ctx.lineTo(enemy.width / 4, -enemy.height / 4);
        ctx.lineTo(enemy.width / 2, -enemy.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(0, 5, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        enemy.y += enemy.speed;
        
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        radius: 5,
        maxRadius: 30,
        growing: true
    });
}

function drawExplosions() {
    explosions.forEach((explosion, index) => {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${1 - explosion.radius / explosion.maxRadius})`;
        ctx.fill();
        
        if (explosion.growing) {
            explosion.radius += 3;
            if (explosion.radius >= explosion.maxRadius) {
                explosions.splice(index, 1);
            }
        }
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += enemy.points;
                scoreElement.textContent = score;
            }
        });
    });
    
    enemies.forEach((enemy) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            gameOver();
        }
    });
}

function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] || keys['w']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y += player.speed;
    }
    
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

let mouseX = canvas.width / 2;
let mouseY = canvas.height - 100;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

function updatePlayerWithMouse() {
    const targetX = mouseX - player.width / 2;
    const targetY = mouseY - player.height / 2;
    
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > player.speed) {
        player.x += (dx / distance) * player.speed;
        player.y += (dy / distance) * player.speed;
    } else {
        player.x = targetX;
        player.y = targetY;
    }
    
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    updatePlayer();
    updatePlayerWithMouse();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawExplosions();
    checkCollisions();
    
    animationId = requestAnimationFrame(gameLoop);
}

let bulletInterval;
let enemyInterval;

function startGame() {
    score = 0;
    scoreElement.textContent = score;
    bullets = [];
    enemies = [];
    explosions = [];
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 100;
    gameRunning = true;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    initStars();
    gameLoop();
    
    bulletInterval = setInterval(createBullet, 200);
    enemyInterval = setInterval(createEnemy, 1000);
}

function gameOver() {
    gameRunning = false;
    clearInterval(bulletInterval);
    clearInterval(enemyInterval);
    cancelAnimationFrame(animationId);
    
    finalScoreElement.textContent = score;
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
