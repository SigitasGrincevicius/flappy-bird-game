import { CONFIG } from "./config.js";
import { GAME_STATE } from "./gameState.js";

const cvs = document.getElementById(CONFIG.cvsId);
const ctx = cvs.getContext("2d");

// Game vars and consts
let frames = 0;
const DEGREE = Math.PI / 180;

// Load sprite image
const sprite = new Image();
sprite.src = CONFIG.spriteImageSrc;

// Load sounds
const DIE = new Audio();
DIE.src = CONFIG.dieAudioSrc;

const FLAP = new Audio();
FLAP.src = CONFIG.flapAudioSrc;

const HIT = new Audio();
HIT.src = CONFIG.hitAudioSrc;

const SCORE_S = new Audio();
SCORE_S.src = CONFIG.scoreAudioSrc;

const SWOOSHING = new Audio();
SWOOSHING.src = CONFIG.swooshingAudioSrc;

// Start button coords
const { startBtn } = CONFIG;

// Game state
let state = GAME_STATE.getReady;

// Background
const bgParams = CONFIG.bg;
const bg = {
   draw: function () {
      ctx.drawImage(sprite, bgParams.sX, bgParams.sY, bgParams.w, bgParams.h, bgParams.x, bgParams.y, bgParams.w, bgParams.h);

      ctx.drawImage(sprite, bgParams.sX, bgParams.sY, bgParams.w, bgParams.h, bgParams.x + bgParams.w, bgParams.y, bgParams.w, bgParams.h);
   }
};

// FOREGROUND
const fgParams = CONFIG.fg;
const fg = {
   x: fgParams.x,

   draw: function () {
      ctx.drawImage(sprite, fgParams.sX, fgParams.sY, fgParams.w, fgParams.h, this.x, fgParams.y, fgParams.w, fgParams.h);

      ctx.drawImage(sprite, fgParams.sX, fgParams.sY, fgParams.w, fgParams.h, this.x + fgParams.w, fgParams.y, fgParams.w, fgParams.h);
   },
   update: function () {
      if (state === GAME_STATE.game) {
         this.x = (this.x - fgParams.dx) % (fgParams.w / 2);
      }
   }
};

// Bird
const birdParams = CONFIG.bird;
const bird = {
   x: birdParams.x,
   y: birdParams.y,
   radius: birdParams.radius,

   frame: 0,
   speed: 0,
   rotation: 0,

   draw: function () {
      let bird = birdParams.animation[this.frame];

      ctx.save();
      ctx.translate(birdParams.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(sprite, bird.sX, bird.sY, birdParams.w, birdParams.h, - birdParams.w / 2, - birdParams.h / 2, birdParams.w, birdParams.h);
      ctx.restore();
   },

   flap: function () {
      this.speed -= birdParams.jump;
   },

   update: function () {
      // If the game is in Get Ready state, the bird must flap slowly
      this.period = state === GAME_STATE.getReady ? 10 : 5;
      // We increment the frame by 1, each period
      this.frame += frames % this.period === 0 ? 1 : 0;
      // Frame goes from 0 To 4, then again to 0
      this.frame = this.frame % birdParams.animation.length;

      if (state === GAME_STATE.getReady) {
         this.y = birdParams.y; // Reset position of the bird after game is over
         this.rotation = 0 * DEGREE;
      } else {
         this.speed += birdParams.gravity;
         this.y += this.speed;
         if (this.y + birdParams.h / 2 <= 0) {
            this.y = birdParams.h / 2;
         }
         if (this.y + birdParams.h / 2 >= cvs.height - fgParams.h) {
            this.y = cvs.height - fgParams.h - birdParams.h / 2;
            if (state == GAME_STATE.game) {
               state = GAME_STATE.over;
               DIE.play();
            }
         }
         if (this.speed >= birdParams.jump) {
            this.rotation = birdParams.fallAngle * DEGREE;
            this.frame = 1;
         } else {
            this.rotation = birdParams.jumpAngle * DEGREE;
         }
      }
   },

   speedReset: function () {
      this.speed = 0;
   }
};

// Get ready message
const getReadyParams = CONFIG.getReady;
const getReady = {
   draw: function () {
      if (state === GAME_STATE.getReady) {
         ctx.drawImage(sprite, getReadyParams.sX, getReadyParams.sY, getReadyParams.w, getReadyParams.h, getReadyParams.x, getReadyParams.y, getReadyParams.w, getReadyParams.h);
      }
   }
};

// Game over message
const gameOverParams = CONFIG.gameOver;
const gameOver = {
   draw: function () {
      if (state === GAME_STATE.over) {
         ctx.drawImage(sprite, gameOverParams.sX, gameOverParams.sY, gameOverParams.w, gameOverParams.h, gameOverParams.x, gameOverParams.y, gameOverParams.w, gameOverParams.h);
      }
   }
};

// Pipes
const pipesParams = CONFIG.pipes;
const pipes = {
   position: [],

   draw: function () {
      for (let i = 0; i < this.position.length; i++) {
         let p = this.position[i];

         let topYPos = p.y;
         let bottomYPos = p.y + pipesParams.h + pipesParams.gap;

         // top pipe
         ctx.drawImage(sprite, pipesParams.top.sX, pipesParams.top.sY, pipesParams.w, pipesParams.h, p.x, topYPos, pipesParams.w, pipesParams.h);

         // bottom pipe
         ctx.drawImage(sprite, pipesParams.bottom.sX, pipesParams.bottom.sY, pipesParams.w, pipesParams.h, p.x, bottomYPos, pipesParams.w, pipesParams.h);
      }
   },

   update: function () {
      if (state !== GAME_STATE.game) return;

      if (frames % pipesParams.distanceBetweenPipes === 0) {
         this.position.push({
            x: cvs.width,
            y: pipesParams.maxYPos * (Math.random() + 1),
            scored: false
         })
      }
      for (let i = 0; i < this.position.length; i++) {
         let p = this.position[i];

         let bottomPipeYPos = p.y + pipesParams.h + pipesParams.gap;

         // Check if the bird has passed the pipe
         if (bird.x > p.x + pipesParams.w / 2 && !p.scored) {
            p.scored = true; // Mark the pipe as scored
            score.value += 1; // Increase the score
            SCORE_S.play();

            score.best = Math.max(score.value, score.best);
            localStorage.setItem("best", score.best);
         }

         // Collision detection
         // Top pipe
         if (bird.x + bird.radius > p.x
            && bird.x - bird.radius < p.x + pipesParams.w
            && bird.y + bird.radius > p.y
            && bird.y - bird.radius < p.y + pipesParams.h) {
            state = GAME_STATE.over;
            HIT.play();
         }

         // Bottom pipe
         if (bird.x + bird.radius > p.x
            && bird.x - bird.radius < p.x + pipesParams.w
            && bird.y + bird.radius > bottomPipeYPos
            && bird.y - bird.radius < bottomPipeYPos + pipesParams.h) {
            state = GAME_STATE.over;
            HIT.play();
         }

         // Move the pipes to the left
         p.x -= pipesParams.dx;

         // If the pipes go beyond canvas, we delete them from the array
         if (p.x + pipesParams.w <= 0) {
            this.position.shift();
         }
      }
   },

   reset: function () {
      this.position = [];
   }
}

const score = {
   best: parseInt(localStorage.getItem("best")) || 0,
   value: 0,

   draw: function () {
      ctx.fillStyle = "#FFF";
      ctx.strokeStyle = "#000";

      if (state === GAME_STATE.game) {
         ctx.lineWidth = 2
         ctx.font = "35px Teko";
         ctx.fillText(this.value, cvs.width / 2, 50);
         ctx.strokeText(this.value, cvs.width / 2, 50);
      } else if (state === GAME_STATE.over) {
         // Score value
         ctx.font = "25px Teko";
         ctx.fillText(this.value, 225, 186);
         ctx.strokeText(this.value, 225, 186);
         // Best score
         ctx.fillText(this.best, 225, 228);
         ctx.strokeText(this.best, 225, 228);
      }
   },
   reset: function () {
      this.value = 0;
   }
}

// Control the game
document.addEventListener("click", function (evt) {
   switch (state) {
      case GAME_STATE.getReady:
         state = GAME_STATE.game;
         SWOOSHING.play();
         break;
      case GAME_STATE.game:
         if (bird.y - bird.radius <= 0) return;
         bird.flap();
         FLAP.play();
         break;
      case GAME_STATE.over:
         let rect = cvs.getBoundingClientRect();
         let clickX = evt.clientX - rect.left;
         let clickY = evt.clientY - rect.top;

         // Check if we clicked on the start button
         if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
            bird.speedReset();
            pipes.reset();
            score.reset();
            state = GAME_STATE.getReady;
         }
         break;
   }
});

// Draw
function draw() {
   ctx.fillStyle = CONFIG.backgroundColor;
   ctx.fillRect(0, 0, cvs.width, cvs.height);

   bg.draw();
   pipes.draw();
   fg.draw();
   bird.draw();
   getReady.draw();
   gameOver.draw();
   score.draw();
}

// Update
function update() {
   bird.update();
   fg.update();
   pipes.update();
}

// Loop
function loop() {
   update();
   draw();
   frames++;
   requestAnimationFrame(loop);
}

loop();