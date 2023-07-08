const cvsId = "game-canvas";
const cvs = document.getElementById("game-canvas");

export const CONFIG = {
   cvsId,

   // Paths to files
   spriteImageSrc: "../img/sprite.png",
   dieAudioSrc: "../audio/sfx_die.wav",
   flapAudioSrc: "../audio/sfx_flap.wav",
   hitAudioSrc: "../audio/sfx_hit.wav",
   scoreAudioSrc: "../audio/sfx_point.wav",
   swooshingAudioSrc: "../audio/sfx_swooshing.wav",

   // Color
   backgroundColor: "#70c5ce",

   // Graphical elements coordinates and dimensions
   startBtn: {
      x: 120,
      y: 263,
      w: 83,
      h: 29,
   },
   bg: {
      sX: 0,
      sY: 0,
      w: 275,
      h: 226,
      x: 0,
      y: cvs.height - 226
   },
   fg: {
      sX: 276,
      sY: 0,
      w: 224,
      h: 112,
      x: 0,
      y: cvs.height - 112,
      dx: 2
   },
   bird: {
      animation: [
         { sX: 276, sY: 112 },
         { sX: 276, sY: 139 },
         { sX: 276, sY: 164 },
         { sX: 276, sY: 139 },
      ],
      x: 50,
      y: 150,
      w: 34,
      h: 26,

      radius: 12,
      gravity: 0.25,
      jump: 4.6,
      rotation: 0,
      fallAngle: 90,
      jumpAngle: -25
   },
   getReady: {
      sX: 0,
      sY: 228,
      w: 173,
      h: 152,
      x: cvs.width / 2 - 173 / 2,
      y: 80
   },
   gameOver: {
      sX: 175,
      sY: 228,
      w: 225,
      h: 202,
      x: cvs.width / 2 - 225 / 2,
      y: 90,
   },
   pipes: {
      top: {
         sX: 553,
         sY: 0
      },
      bottom: {
         sX: 502,
         sY: 0
      },
      w: 53,
      h: 400,
      gap: 100,
      maxYPos: -165,
      dx: 2,
      distanceBetweenPipes: 107,
   }
}