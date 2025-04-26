// js/game.js - Fully fixed version

const gameArea     = document.getElementById('gameArea');
const seal         = document.getElementById('seal');
const startButton  = document.getElementById('startButton');
const scoreDisplay = document.getElementById('score');

let velocityX = 0;
let velocityY = 0;
const ballSpeed = 5;

let score         = 0;
let gameRunning   = false;
let activeBubble  = null;
let bubbles       = [];
let roundCount    = 0;

const colors      = ['red','blue','green','yellow','purple'];
const bubbleSize  = 20;
const sealSpeed   = 20;
const bubbleSpeed = 5;

// Aiming state
let aimAngle      = -Math.PI/2;  // straight up
let nextColor     = pickColor();
let previewBubble = null;

startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  resetGame();
  spawnBubbleWall();
  createPreview();
});

document.addEventListener('keydown', e => {
  if (!gameRunning) return;
  if (e.code === 'ArrowLeft' && seal.offsetLeft > 10) {
    seal.style.left = seal.offsetLeft - sealSpeed + 'px';
  } else if (e.code === 'ArrowRight' && seal.offsetLeft < gameArea.clientWidth - seal.clientWidth - 10) {
    seal.style.left = seal.offsetLeft + sealSpeed + 'px';
  } else if (e.code === 'Space') {
    shootBubble();
  }
});

// Mouse-based aiming
gameArea.addEventListener('mousemove', (e) => {
  if (!gameRunning) return;
  const rect = gameArea.getBoundingClientRect();
  const centerX = seal.offsetLeft + seal.clientWidth/2;
  const centerY = seal.offsetTop;
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  let angle = Math.atan2(my - centerY, mx - centerX);
  // Clamp to upward shooting only
  angle = Math.max(angle, -Math.PI + 0.01);
  angle = Math.min(angle, -0.01);
  aimAngle = angle;

  updatePreview();
});

function resetGame() {
  score = 0; 
  updateScore();
  gameRunning = true;
  roundCount = 0;
  activeBubble = null;
  bubbles.forEach(b => b.remove());
  bubbles = [];
  if (previewBubble) previewBubble.remove();
}

function pickColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function createPreview() {
  previewBubble = document.createElement('div');
  previewBubble.classList.add('bubble');
  previewBubble.style.opacity = '0.5';
  previewBubble.style.backgroundColor = nextColor;
  previewBubble.style.pointerEvents = 'none';
  gameArea.appendChild(previewBubble);
  updatePreview();
}

function updatePreview() {
  let x = seal.offsetLeft + seal.clientWidth/2 - bubbleSize/2;
  let y = seal.offsetTop - bubbleSize;
  let maxX = gameArea.clientWidth - bubbleSize;
  let vx = Math.cos(aimAngle) * bubbleSpeed;
  let vy = Math.sin(aimAngle) * bubbleSpeed;

  for (let i = 0; i < 500; i++) {
    x += vx;
    y += vy;

    if (x <= 0) { x = 0; vx = -vx; }
    if (x >= maxX) { x = maxX; vx = -vx; }
    if (y <= 0) { y = 0; break; }

    for (let ob of bubbles) {
      const or = ob.getBoundingClientRect();
      const oy = or.top - gameArea.getBoundingClientRect().top;
      const ox = or.left - gameArea.getBoundingClientRect().left;
      if (y + bubbleSize > oy && y < oy + bubbleSize && x + bubbleSize > ox && x < ox + bubbleSize) {
        y = parseInt(ob.style.top,10) + bubbleSize;
        x = parseInt(ob.style.left,10);
        break;
      }
    }
  }

  previewBubble.style.left = x + 'px';
  previewBubble.style.top = y + 'px';
}

function shootBubble() {
  if (activeBubble) return;

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.style.backgroundColor = nextColor;
  bubble.style.left = (seal.offsetLeft + seal.clientWidth/2 - bubbleSize/2) + 'px';
  bubble.style.top = (seal.offsetTop - bubbleSize) + 'px';

  gameArea.appendChild(bubble);
  activeBubble = bubble;

  velocityX = ballSpeed * Math.cos(aimAngle);
  velocityY = ballSpeed * Math.sin(aimAngle);

  nextColor = pickColor();
  previewBubble.style.backgroundColor = nextColor;
  updatePreview();
}

setInterval(() => {
  if (activeBubble) {
    moveActiveBubble();
  }
}, 20);

function moveActiveBubble() {
  if (!activeBubble) return;

  activeBubble.style.left = (activeBubble.offsetLeft + velocityX) + 'px';
  activeBubble.style.top = (activeBubble.offsetTop + velocityY) + 'px';

  if (activeBubble.offsetLeft <= 0 || activeBubble.offsetLeft >= (gameArea.clientWidth - bubbleSize)) {
    velocityX *= -1;
  }

  if (activeBubble.offsetTop <= 0) {
    handleBubbleCollision(activeBubble, null);
    return;
  }

  const collided = checkCollision(activeBubble);
  if (collided) {
    handleBubbleCollision(activeBubble, collided);
  }
}

function checkCollision(bubble) {
  const br = bubble.getBoundingClientRect();
  for (let ob of bubbles) {
    const or = ob.getBoundingClientRect();
    if (
      br.bottom > or.top &&
      br.top    < or.bottom &&
      br.right  > or.left &&
      br.left   < or.right
    ) return ob;
  }
  return null;
}

function handleBubbleCollision(bubble, collided) {
  if (collided) {
    const top  = parseInt(collided.style.top,10);
    const left = parseInt(collided.style.left,10);
    bubble.style.top  = top + bubbleSize + 'px';
    bubble.style.left = left + 'px';
  } else {
    bubble.style.top = '0px';
  }

  bubbles.push(bubble);
  activeBubble = null;

  spawnNewLayer();
  roundCount++;
  if (roundCount % 3 === 0) moveBubbleWallDown();
}

function spawnBubbleWall() {
  const cols = Math.floor(gameArea.clientWidth / bubbleSize);
  const rows = 10;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      bubble.style.backgroundColor = pickColor();
      bubble.style.left = (x * bubbleSize) + 'px';
      bubble.style.top = (y * bubbleSize) + 'px';
      gameArea.appendChild(bubble);
      bubbles.push(bubble);
    }
  }
}

function spawnNewLayer() {
  const cols = Math.floor(gameArea.clientWidth / bubbleSize);
  for (let x = 0; x < cols; x++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.style.backgroundColor = pickColor();
    bubble.style.left = (x * bubbleSize) + 'px';
    bubble.style.top = '0px';
    gameArea.appendChild(bubble);
    bubbles.push(bubble);
  }
}

function moveBubbleWallDown() {
  bubbles.forEach(b => {
    const t = parseInt(b.style.top,10) + bubbleSize;
    b.style.top = t + 'px';
  });

  if (bubbles.some(b => parseInt(b.style.top,10) + bubbleSize >= gameArea.clientHeight)) {
    endGame();
  }
}

function endGame() {
  alert("Game Over! Bubbles reached the bottom.");
  gameRunning = false;
  startButton.style.display = 'block';
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}
