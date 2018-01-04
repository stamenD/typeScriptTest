"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameObject = (function () {
    function GameObject(symbol, coord, area) {
        this.symbol = symbol;
        this.coord = coord;
        this.area = area;
        this.timeToMove = 5;
        this.bombs;
        this.explodedBombs;
        this.storage;
    }
    GameObject.prototype.update = function (beFirst, danger) {
        var _this = this;
        var newX = this.coord.x + this.storage.oldCoord.x;
        var newY = this.coord.y + this.storage.oldCoord.y;
        var myRightX = newX + 40;
        var myTopY = newY - 35;
        var myLeftX = newX;
        var myBottomY = newY + 4;
        var touch = checkTouching(this.area, myRightX, myTopY, myLeftX, myBottomY);
        if (touch === 0) {
            this.coord.x = newX;
            this.coord.y = newY;
            this.storage.oldCoord.x = this.storage.curCoord.x;
            this.storage.oldCoord.y = this.storage.curCoord.y;
        }
        else if (touch === 1) {
            this.coord.x += this.storage.oldCoord.x;
            this.coord.y += this.storage.oldCoord.y;
        }
        else if (touch === 2) {
            this.storage.oldCoord.x = 0;
            this.storage.oldCoord.y = 0;
        }
        if (beFirst && !danger) {
            for (var i = 0; i < 3; i++) {
                var getEl = touchElement(this.area, myRightX, myTopY, myLeftX, myBottomY, i);
                if (getEl !== -1) {
                    if (i == 1) {
                        this.area.score.hero += 400;
                        this.area.NPCsGood[getEl].coord.x = -20;
                        this.area.NPCsGood[getEl].coord.y = -20;
                    }
                    else {
                        this.area.score.hero -= 100;
                    }
                }
            }
            this.explodedBombs.forEach(function (current) {
                for (var i = 0; i < current.explosion.length; i++) {
                    var hit = touchElement(_this.area, current.explosion[i].x + 35, current.explosion[i].y - 35, current.explosion[i].x, current.explosion[i].y, 0);
                    if (hit != -1) {
                        _this.area.score.hero += 300;
                        _this.area.NPCsDanger[hit].coord.x = -20;
                        _this.area.NPCsDanger[hit].coord.y = -20;
                    }
                    hit = touchElement(_this.area, current.explosion[i].x + 35, current.explosion[i].y - 35, current.explosion[i].x, current.explosion[i].y, 4);
                    if (hit != -1) {
                        _this.area.score.enemy -= 500;
                    }
                }
            });
            for (var i = 0; i < 3; i++) {
                var getEl = touchElement(this.area, this.area.enemy.coord.x + 40, this.area.enemy.coord.y - 35, this.area.enemy.coord.x, this.area.enemy.coord.y + 4, i);
                if (getEl !== -1) {
                    if (i == 2) {
                        this.area.score.enemy += 400;
                        this.area.NPCsBad[getEl].coord.x = -20;
                        this.area.NPCsBad[getEl].coord.y = -20;
                    }
                    else {
                        this.area.score.enemy -= 100;
                    }
                }
            }
            this.area.enemy.explodedBombs.forEach(function (current) {
                for (var i = 0; i < current.explosion.length; i++) {
                    var hit = touchElement(_this.area, current.explosion[i].x + 35, current.explosion[i].y - 35, current.explosion[i].x, current.explosion[i].y, 0);
                    if (hit != -1) {
                        console.error("you danger", _this.area.NPCsDanger[hit]);
                        _this.area.score.enemy += 300;
                        _this.area.NPCsDanger[hit].coord.x = -20;
                        _this.area.NPCsDanger[hit].coord.y = -20;
                    }
                    hit = touchElement(_this.area, current.explosion[i].x + 35, current.explosion[i].y - 35, current.explosion[i].x, current.explosion[i].y, 3);
                    if (hit != -1) {
                        console.error("you enemy");
                        _this.area.score.hero -= 500;
                    }
                }
            });
        }
    };
    GameObject.prototype.manageBombs = function () {
        var _this = this;
        var timeNow = new Date().getTime() / 1000;
        this.bombs.forEach(function (bomb) {
            if (bomb.endTime <= timeNow) {
                var bomb_1 = _this.bombs.shift();
                expodeBomb(_this, bomb_1);
            }
            else {
                var ctx = _this.area.context;
                ctx.fillText('\uD83D\uDCA3', bomb.coord.x, bomb.coord.y);
            }
        });
    };
    GameObject.prototype.draw = function () {
        var _this = this;
        var ctx = this.area.context;
        ctx.font = "900 40px Arial";
        ctx.fillText(this.symbol, this.coord.x, this.coord.y);
        this.manageBombs();
        var time = new Date().getTime() / 1000;
        this.explodedBombs.forEach(function (current) {
            if (current.endTime > time) {
                console.log("start");
                for (var i = 0; i < current.explosion.length; i++) {
                    ctx.fillText('\uD83D\uDD25', current.explosion[i].x, current.explosion[i].y);
                    console.log("x:", current.explosion[i].x, "y:", current.explosion[i].y);
                }
            }
            else {
                _this.explodedBombs.shift();
            }
        });
    };
    GameObject.prototype.plantBomb = function () {
        if (this.bombs.length >= 10)
            return;
        var column = Math.floor((this.coord.x + 20) / 90) * 2 - 1 + ((this.coord.x + 20 - Math.floor((this.coord.x + 20) / 90) * 90) > 50 ? 2 : 1);
        var row = Math.floor((this.coord.y - 20) / 90) * 2 - 1 + ((this.coord.y - 20 - Math.floor((this.coord.y - 20) / 90) * 90) > 50 ? 2 : 1);
        var offsetC = Math.round(column / 2);
        var offsetR = Math.round(row / 2);
        var bomb;
        bomb.coord = { x: column * 50 - offsetC * 10 + 5, y: (row + 1) * 50 - offsetR * 10 - 5 };
        bomb.endTime = new Date().getTime() / 1000 + 3;
        var lastBomb = this.bombs.pop();
        if (lastBomb && bomb.coord.x == lastBomb.coord.x && bomb.coord.y == lastBomb.coord.y)
            this.bombs.push(lastBomb);
        else {
            if (lastBomb)
                this.bombs.push(lastBomb);
            this.bombs.push(bomb);
        }
    };
    return GameObject;
}());
exports.default = GameObject;
function checkTouching(area, myRightX, myTopY, myLeftX, myBottomY) {
    for (var i = 0; i < area.enemy.bombs.length; i++) {
        var rightX = area.enemy.bombs[i].coord.x + 40;
        var topY = area.enemy.bombs[i].coord.y - 35;
        var leftX = area.enemy.bombs[i].coord.x;
        var bottomY = area.enemy.bombs[i].coord.y;
        var lt = (leftX <= myLeftX && myLeftX <= rightX && bottomY >= myTopY && myTopY >= topY);
        var lb = (leftX <= myLeftX && myLeftX <= rightX && bottomY >= myBottomY && myBottomY >= topY);
        var rt = (leftX <= myRightX && myRightX <= rightX && bottomY >= myTopY && myTopY >= topY);
        var rb = (leftX <= myRightX && myRightX <= rightX && bottomY >= myBottomY && myBottomY >= topY);
        if (lt || lb || rt || rb) {
            console.log(bottomY, leftX, topY, rightX);
            console.error("touched bomb!!!");
            return 2;
        }
    }
    for (var x = 0; x < 11; x++)
        for (var y = 0; y < 5; y++) {
            var rightX = 50 + 90 * x + 40;
            var topY = 50 + 90 * y;
            var leftX = 50 + 90 * x;
            var bottomY = 50 + 90 * y + 40;
            var lt = (leftX <= myLeftX && myLeftX <= rightX && bottomY >= myTopY && myTopY >= topY);
            var lb = (leftX <= myLeftX && myLeftX <= rightX && bottomY >= myBottomY && myBottomY >= topY);
            var rt = (leftX <= myRightX && myRightX <= rightX && bottomY >= myTopY && myTopY >= topY);
            var rb = (leftX <= myRightX && myRightX <= rightX && bottomY >= myBottomY && myBottomY >= topY);
            if (lt || lb || rt || rb) {
                return 1;
            }
        }
    if (myRightX > this.area.size.x || myLeftX < 1 || myBottomY > this.area.size.y - 4 || myTopY < 4) {
        return 2;
    }
    return 0;
}
function expodeBomb(who, bomb) {
    var explosion;
    for (var i = -2; i <= 2; i++) {
        var coords = { x: bomb.coord.x + i * 45, y: bomb.coord.y };
        var touch = checkTouching(who.area, bomb.coord.x + i * 45 + 40, bomb.coord.y - 40, bomb.coord.x + i * 45, bomb.coord.y);
        if (touch !== 1)
            explosion.push(coords);
        else if (i === -1) {
            console.error("i:", i, "x:", coords.x, "y:", coords.y);
            explosion.pop();
        }
        else if (i === 1) {
            console.error("i:", i, "x:", coords.x, "y:", coords.y);
            break;
        }
    }
    for (var j = -2; j <= 2; j++) {
        if (j == 0)
            continue;
        var coords = { x: bomb.coord.x, y: bomb.coord.y + j * 45 };
        var touch = checkTouching(who.area, bomb.coord.x + 40, bomb.coord.y + j * 45 - 40, bomb.coord.x, bomb.coord.y + j * 45);
        if (touch !== 1)
            explosion.push(coords);
        else if (j === -1) {
            console.error("j:", j, "x:", coords.x, "y:", coords.y);
            explosion.pop();
        }
        else if (j === 1) {
            console.error("j:", j, "x:", coords.x, "y:", coords.y);
            break;
        }
    }
    var time = new Date().getTime() / 1000 + 0.7;
    who.explodedBombs.push({ explosion: explosion, endTime: time });
}
function touchElement(area, myRightX, myTopY, myLeftX, myBottomY, npc) {
    var touch = -1, len;
    if (npc == 3 || npc == 4)
        len = 1;
    else
        len = 11;
    for (var i = 0; i < len; i++) {
        var rightX = void 0, leftX = void 0, topY = void 0, bottomY = void 0;
        if (npc == 1) {
            rightX = area.NPCsGood[i].coord.x + 35;
            topY = area.NPCsGood[i].coord.y - 40;
            leftX = area.NPCsGood[i].coord.x;
            bottomY = area.NPCsGood[i].coord.y;
        }
        else if (npc == 2) {
            rightX = area.NPCsBad[i].coord.x + 35;
            topY = area.NPCsBad[i].coord.y - 40;
            leftX = area.NPCsBad[i].coord.x;
            bottomY = area.NPCsBad[i].coord.y;
        }
        else if (npc == 0) {
            rightX = area.NPCsDanger[i].coord.x + 35;
            topY = area.NPCsDanger[i].coord.y - 40;
            leftX = area.NPCsDanger[i].coord.x;
            bottomY = area.NPCsDanger[i].coord.y;
        }
        else if (npc == 3) {
            rightX = area.hero.coord.x + 35;
            topY = area.hero.coord.y - 40;
            leftX = area.hero.coord.x;
            bottomY = area.hero.coord.y;
        }
        else if (npc == 4) {
            rightX = area.enemy.coord.x + 35;
            topY = area.enemy.coord.y - 40;
            leftX = area.enemy.coord.x;
            bottomY = area.enemy.coord.y;
        }
        var left = (leftX < myRightX && myRightX < rightX && Math.abs(topY - myTopY) < 10);
        var bottom = (bottomY > myTopY && myTopY > topY && Math.abs(leftX - myLeftX) < 10);
        var right = (myLeftX < rightX && leftX < myLeftX && Math.abs(topY - myTopY) < 10);
        var top_1 = (myBottomY > topY + 5 && myBottomY < bottomY && Math.abs(leftX - myLeftX) < 10);
        if (left || bottom || right || top_1) {
            console.log(bottom, left, top_1, right);
            touch = i;
            break;
        }
    }
    return touch;
}
//# sourceMappingURL=gameObject.js.map