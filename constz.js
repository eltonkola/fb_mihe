function logGame(game) {
  console.log("-----------------------------");
  for (var i = 0; i < game.grid.length; i++) {
    var line = "";
    for (var j = 0; j < game.grid[i].length; j++) {
      line += game.grid[i][j];
    }
    console.log(line);
  }
  console.log("-----------------------------");
}

exports.size_x = 9;
exports.size_y = 6;

exports.EMPTY = "=";
exports.BODY = "o";
exports.HEAD = "0";
exports.APPLE = "x";

exports.STATUS_STARTED = "started";
exports.STATUS_PLAYING = "playing";
exports.STATUS_ENDED = "ended";
exports.STATUS_WON = "won";

exports.logGame = logGame;

exports.CMD_UI = "i love ui";
exports.CMD_UI_CHEAT = "i love cheating in ui";
exports.CMD_CHEAT = "i love cheating";

exports.RENDER_EMPTY = "=";
exports.RENDER_BODY = "o";
exports.RENDER_HEAD = "0";
exports.RENDER_APPLE = "x";
