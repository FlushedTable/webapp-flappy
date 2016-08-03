// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var height = 400;
var width = 909;
var gameSpeed = 200;
var gameGravity = 400;
var jumpPower = 200;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', stateActions);
var score = 0;
var player;
var pipes = [];
var pipeEnds = [];
var balloons = [];
var weights = [];
var stars = [];
var gapSize = 95;
var gapMargin = 100;
var blockHeight = 50;
var pipeEndHeight = 12;
var pipeEndExtraWidth = 5;
var gapStart = game.rnd.integerInRange(gapMargin, height - gapSize - gapMargin);
/*
 * Loads all resources for the game and gives them names.
 */
function preload() {
  game.load.image("background", "../assets/scrolling background.png");
  game.load.image("playerImg", "../assets/flappy-cropped.png");
  game.load.audio("score", "../assets/point.ogg");
  game.load.image("pipeBlock","../assets/pipe2-body.png");
  game.load.image("pipeEnd", "../assets/pipe2-end.png");
  game.load.image("balloons", "../assets/balloons.png");
  game.load.image("weight", "../assets/weight.png");
  game.load.image("star", "../assets/star.png");
}

/*
 * Initialises the game. This function is only called once.
 */
function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  var backgroundVelocity = gameSpeed / 10;
  var backgroundImage = game.add.tileSprite(0, 0, width, height, "background");
  backgroundImage.autoScroll(-backgroundVelocity, 0);


    // set the background colour of the scene
  game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(spaceHander);

  //alert(score);
  labelScore =  game.add.text(20, 20, score);

  player = game.add.sprite(100, 200, "playerImg");
  player.anchor.setTo(0.5, 0.5);
  player.x = 1.5;
  player.y = 2;
  game.physics.arcade.enable(player);
  player.body.velocity.x = 10;
  player.body.velocity.y = -10;
  player.body.gravity.y = gameGravity;

  game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);

  var pipeInterval = 1.75 * Phaser.Timer.SECOND;
  game.time.events.loop(pipeInterval, generate);
}
/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
  game.physics.arcade.overlap(player, pipes, pipeEnds, gameOver);
  player.rotation = Math.atan(player.body.velocity.y / gameSpeed);
  for(var i = balloons.length - 1; i >= 0; i--) {
    if (balloons[i].body.x < 0) {
      balloons[i].destroy();
      balloons.splice(i, 1);
    } else {
      game.physics.arcade.overlap(player, balloons[i], function() {
        changeGravity(50);
        balloons[i].destroy();
        balloons.splice(i, 1);
    });
  }
  } for(var w = weights.length - 1; w >= 0; w--) {
    if (weights[w].body.x < 0) {
      weights[w].destory();
      weights.splice(w, 1);
    } else {
      game.physics.arcade.overlap(player, balloons[w], function() {
        changeGravity(-50);
        weights[w].destroy();
        weights.splice(w, 1);
    });
  }
  } for (var s = stars.length -1; s >=0; s--) {
    game.physics.arcade.overlap(player, stars[s], function() {
      stars[s].destroy();
      stars.splice(s, 1);
      changeScore();
    });
  }

  if (player.body.y > 400) {
    gameOver();
  }
}

function generate() {
  var diceRoll = game.rnd.integerInRange(1, 10);
  if (diceRoll == 1) {
    generateBalloons();
  } else if (diceRoll  == 2) {
    generateWeights();
  } else {
    generatePipe();
  }
}

function gameOver() {
  registerScore(score);
  game.state.restart();
  score = 0;
  gameGravity = 400;
  stars = [];
}

function playerJump() {
  player.body.velocity.y = -jumpPower;
}

function spaceHander() {
  game.sound.play("score");
}

function changeGravity(g) {
  gameGravity += g;
  player.body.velocity.y = gameGravity;
}

function generateBalloons() {
  var bonus = game.add.sprite(width, height, "balloons");
  balloons.push(bonus);
  game.physics.arcade.enable(bonus);
  bonus.body.velocity.x = -200;
  bonus.body.velocity.y = -game.rnd.integerInRange(60, 100);
}

function generateWeights() {
  var bonus2 = game.add.sprite(width, height,"weight");
  weights.push(bonus2);
  game.physics.arcade.enable(bonus2);
  bonus2.body.velocity.x = -200;
  bonus2.body.velocity.y = game.rnd.integerInRange(60, 100);
}

function addPipeBlock(x, y) {
    // create a new pipe block
    var pipeBlock = game.add.sprite(x, y, "pipeBlock");
    // insert it in the 'pipes' array
    pipes.push(pipeBlock);
    game.physics.arcade.enable(pipeBlock);
    pipeBlock.body.velocity.x = -200;
}

function addPipeEnd(x, y) {
  var pipeEnd = game.add.sprite(x, y, "pipeEnd");
  pipeEnds.push(pipeEnd);
  game.physics.arcade.enable(pipeEnd);
  pipeEnd.body.velocity.x = -200;
}

function generatePipe() {
  addPipeEnd(width - (pipeEndExtraWidth / 2), gapStart - pipeEndHeight);

  for (var bottomOfBlock = gapStart - pipeEndHeight; bottomOfBlock > 0; bottomOfBlock -= blockHeight) {
    addPipeBlock(width, bottomOfBlock - blockHeight);
  }

    addPipeEnd(width - (pipeEndExtraWidth / 2), gapStart + gapSize);

    for (var topOfBlock = gapStart + gapSize + pipeEndHeight; topOfBlock < height; topOfBlock += blockHeight) {
    addPipeBlock(width, topOfBlock);
  }
  addStars(width - (pipeEndExtraWidth / 2), gapStart - pipeEndHeight);
}

function addStars(x, y) {
  var bonus3 = game.add.sprite(width - (pipeEndExtraWidth / 2), gapStart - pipeEndHeight + 25, "star");
  stars.push(bonus3);
  game.physics.arcade.enable(bonus3);
  bonus3.body.velocity.x = -200;
  bonus3.alpha = 0;
}

function changeScore() {
        score = score + 1;
        labelScore.setText(score.toString());
}

function registerScore() {
  var playerName = prompt("What's your name?");
  var scoreEntry = "<li>" + playerName + ":" + score.toString() + "</li>";
  $("#content").append(scoreEntry);
}
