"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameArea = (function () {
    function GameArea() {
        this.score = { hero: 0, enemy: 0 };
        this.size = { x: 1040, y: 500 };
    }
    GameArea.prototype.loadBoard = function () {
        var canvas = document.getElementById("mainCanvas");
        this.context = canvas.getContext("2d");
        canvas.width = this.size.x;
        canvas.height = this.size.y;
    };
    ;
    GameArea.prototype.clear = function () {
        this.context.clearRect(0, 0, 1040, 500);
    };
    ;
    GameArea.prototype.draw = function () {
        document.getElementById("scoreHero").children[1].innerHTML = this.score.hero.toString();
        document.getElementById("scoreEnemy").children[1].innerHTML = this.score.enemy.toString();
        this.context.fillStyle = 'rgba(204, 196, 196, 0.938)';
        this.context.beginPath();
        this.context.moveTo(3, 3);
        this.context.lineTo(1037, 9);
        this.context.lineTo(1037, 497);
        this.context.lineTo(3, 497);
        this.context.lineTo(3, 3);
        this.context.stroke();
        for (var x = 0; x < 11; x++)
            for (var y = 0; y < 5; y++)
                this.context.fillRect(50 + 90 * x, 50 + 90 * y, 40, 40);
    };
    ;
    GameArea.prototype.endGame = function (winner) {
        var text;
        if (winner == 1)
            text = "Hero win";
        else
            text = "Enemy win";
        this.context.font = "900 70px Arial";
        this.context.fillText(text, 450, 250);
        document.getElementById("newGame").hidden = false;
    };
    return GameArea;
}());
exports.GameArea = GameArea;
//# sourceMappingURL=gameArea.js.map