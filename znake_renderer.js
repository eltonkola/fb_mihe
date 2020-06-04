const { createCanvas } = require("canvas");
const consts = require("./constz");

//render image
const block_size = 20;
const width = block_size * consts.size_x;
const height = block_size * consts.size_y;

const game_over = "Game Over";
const game_start = "Start Game";
const game_won = "You Won";

function createImage(game) {
  console.log("Znake image");
  //console.log("game:" + JSON.stringify(game));

  consts.logGame(game);

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  //render background
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);

  //render empty cells
  for (var i = 0; i < game.grid.length; i++) {
    for (var j = 0; j < game.grid[i].length; j++) {
      var cell = game.grid[i][j];

      if (cell == consts.APPLE) {
        //apple
        context.fillStyle = "#68a832";
      } else if (cell == consts.HEAD) {
        //snake head
        context.fillStyle = "#8d8f8c";
      } else if (cell.startsWith(consts.BODY) == true) {
        //snake body
        context.fillStyle = "#a4a8a0";
      } else {
        // e = empty
        context.fillStyle = "#f1f5f0";
      }
      context.fillRect(
        j * block_size + 1,
        i * block_size + 1,
        block_size - 2,
        block_size - 2
      );
    }
  }

  //render game state
  if (game.status == consts.STATUS_STARTED) {
    //new game
    console.log("draw game start");
    context.fillStyle = "#336699";
    context.font = "bold 14pt Menlo";
    const textWidth = context.measureText(game_start).width;

    context.fillText(game_start, width / 2 - textWidth / 2, height / 2);
  } else if (game.status == consts.STATUS_ENDED) {
    //game over
    console.log("draw game over");
    context.fillStyle = "#ff0000";
    context.font = "bold 14pt Menlo";
    const textWidth = context.measureText(game_over).width;

    context.fillText(game_over, width / 2 - textWidth / 2, height / 2);
  } else if (game.status == consts.STATUS_WON) {
    //game over
    console.log("draw you won");
    context.fillStyle = "#ff0000";
    context.font = "bold 14pt Menlo";
    const textWidth = context.measureText(game_won).width;

    context.fillText(game_won, width / 2 - textWidth / 2, height / 2);
  } else {
    console.log("game state is playing");
  }

  const buffer = canvas.toBuffer("image/png");
  console.log("buffer:" + buffer.length);
  return buffer;
}

function gametext(game) {
  var result = "";
  // result += "************************\n";
  for (var i = 0; i < game.grid.length; i++) {
    var line = "";
    for (var j = 0; j < game.grid[i].length; j++) {
      var cell = game.grid[i][j];
      if (cell == consts.APPLE) {
        line += consts.RENDER_APPLE;
      } else if (cell == consts.HEAD) {
        line += consts.RENDER_HEAD;
      } else if (cell.startsWith(consts.BODY) == true) {
        line += consts.RENDER_BODY;
      } else {
        line += consts.RENDER_EMPTY;
      }
    }
    result += line + "\n";
  }
  // result += "************************\n";
  return result;
}

exports.createImage = createImage;
exports.gametext = gametext;
