function Game(Interface) {
    var self = this;

    self.Interface = new Interface;

    self.Interface.on("restart", self.restart.bind(this));
    self.Interface.on("takePoints", self.takePoints.bind(this));
    self.Interface.on("addPoints", self.addPoints.bind(this));
    self.Interface.on("rollDices", self.rollDices.bind(this));
    self.Interface.on("toggleDice", self.toggleDice.bind(this));
    self.Interface.on("toggleCpu", self.toggleCpu.bind(this));

    self.setup();
}


Game.prototype.restart = function() {
    this.Interface.setup();
    this.setup();
};


Game.prototype.setup = function() {
    var self = this;
    self.player = {
        score: 0,
        zilch: 0
    };
    self.cpu = {
        score: 0,
        zilch: 0
    };
    self.dices = []

    for (var i = 0; i < 6; i++) {
        var dice = {};
        dice.value = this.random(6);
        dice.disabled = true;
        self.dices[i] = dice;
    }

    self.history = [];

    self.cpuStarts = self.random(2);

    self.playing = !self.cpuStarts;

    self.points = 0;

    self.animationTime = 500;
    self.messageTime = 1500;
    self.cpuSpeed = 1500;

    self.Interface.setPlaying(self.playing);
    self.Interface.setPoints(self.points);
    self.Interface.setPlayer(self.player);
    self.Interface.setCpu(self.cpu);
    self.Interface.setDices(self.dices);

    if (self.cpuStarts) {
        self.Interface.disableRestart(true);
        self.Interface.showMessage("CPU starts!", self.messageTime, function() {
            setTimeout(function() {
                self.rollDices();
            }, self.cpuSpeed);
        });
    } else {
        self.Interface.showMessage("Player starts!", 0, function() {
            self.Interface.disableRollDices(false);
        });
    }


};

Game.prototype.random = function(int) {
    return Math.floor((Math.random() * int));
};

Game.prototype.rollDices = function(all) {
    var self = this;
    self.Interface.clearMessage();

    if (self.newRound) {
        self.points = 0;
        self.Interface.setPoints(self.points);
        self.newRound = false;
    }

    var rollCount = 0;
    for (var i = 0; i < 6; i++) {
        self.dices[i] = self.dices[i] || {};
        var dice = self.dices[i];
        if (all || !dice.disabled) {
            dice.value = this.random(6);
            if (all) {
                dice.disabled = false;
            }
            dice.selected = false;
            rollCount++;
        }
    }

    if (rollCount == 0) {
        self.rollDices(true);
    } else if (self.calculatePoints(true) == 0) {
        self.Interface.animateDices(self.dices, self.animationTime, function() {
            if (self.playing) {
                self.player.zilch++;

                var history = {};
                history['player'] = 'Zilch';
                self.history.push(history);
                self.points = 0;

                if (self.player.zilch > 2) {
                    if (self.player.score < 500) {
                        self.player.score = 0;
                    } else {
                        self.player.score -= 500;
                    }


                    var history = {};
                    history['player'] = '-500';
                    self.history.push(history);
                    self.points = -500;
                }

                self.Interface.disableTakePoints(true);
                self.Interface.disableRollDices(true);
                self.Interface.setPoints(self.points);
                self.Interface.setPlayer(self.player);

                self.Interface.showMessage("Zilch!", self.messageTime, function() {
                    if (self.player.zilch > 2) {
                        self.player.zilch = 0;
                        self.Interface.setPlayer(self.player);
                    }

                    self.endRound();
                });

            } else {
                self.cpu.zilch++;

                var history = {};
                history['cpu'] = 'Zilch';
                self.history.push(history);
                self.points = 0;

                if (self.cpu.zilch > 2) {
                    if (self.cpu.score < 500) {
                        self.cpu.score = 0;
                    } else {
                        self.cpu.score -= 500;
                    }

                    var history = {};
                    history['cpu'] = '-500';
                    self.history.push(history);
                    self.points = -500;
                }

                self.Interface.disableTakePoints(true);
                self.Interface.disableRollDices(true);
                self.Interface.setPoints(self.points);
                self.Interface.setCpu(self.cpu);

                self.Interface.showMessage("Zilch!", self.messageTime, function() {
                    if (self.cpu.zilch > 2) {
                        self.cpu.zilch = 0;
                        self.Interface.setCpu(self.cpu);
                    }

                    self.endRound();
                });

            }
        });

    } else {
        self.Interface.animateDices(self.dices, self.animationTime);
        self.Interface.disableTakePoints(true);
        self.Interface.disableRollDices(true);
        self.Interface.setDices(self.dices);

        if (!self.playing) {
            self.cpuPlay();
        }
    }
};

Game.prototype.toggleDice = function(diceIndex) {
    var self = this;
    var dice = self.dices[diceIndex];

    if (!dice || dice.disabled) {
        console.error("This should not happen!")
        return;
    }


    dice.selected = !dice.selected;
    var points = self.calculatePoints();
    var valid = true;

    for (var i = 0; i < 6; i++) {
        var toggleDice = self.dices[i];

        if (toggleDice.selected && !toggleDice.disabled) {
            toggleDice.selected = false;
            var togglePoints = self.calculatePoints();
            if (points > togglePoints) {
                toggleDice.invalid = false;
            } else if (togglePoints == points) {
                toggleDice.invalid = true;
            }

            toggleDice.selected = true;
        } else {
            toggleDice.invalid = false;
        }

        valid &= !toggleDice.invalid;
    }

    if (valid && points > 0 && self.playing) {
        self.Interface.disableRollDices(false);
    } else {
        self.Interface.disableRollDices(true);
    }

    if (valid && self.points + points >= 300 && self.playing) {
        self.Interface.disableTakePoints(false);
    } else {
        self.Interface.disableTakePoints(true);
    }


    self.Interface.setDices(self.dices);
    self.Interface.setPoints(self.points + points);
};

Game.prototype.calculatePoints = function(all) {
    var self = this;
    var result = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 6; i++) {
        var dice = self.dices[i];
        if ((all || dice.selected) && !dice.disabled) {
            result[dice.value]++;
        }
    }

    var straight = true;
    var pairs = 0;
    var triple1 = 0;
    var triple2 = 0;
    for (var i = 0; i < 6; i++) {
        straight &= (result[i] == 1);
        if (result[i] == 2) {
            pairs++;
        }
        if (triple1 == 0 && result[i] > 2) {
            triple1 = i + 1;
        } else if (result[i] > 2) {
            triple2 = i + 1;
        }
    }
    var points = 0;

    if (straight) {
        points += 1500;
    } else if (pairs == 3) {
        points += 1500;
    } else if (triple1) {
        var triple1Points = triple1 * (triple1 == 1 ? 1000 : 100);
        for (var i = 0; i < result[triple1 - 1] - 3; i++) {
            triple1Points *= 2;
        }
        points += triple1Points;

        if (triple2) {
            points += triple2 * (triple2 == 1 ? 1000 : 100);
        }
    }

    // left Ones
    if (!straight && pairs < 3 && triple1 != 1 && triple2 != 1) {
        points += result[0] * 100;
    }

    // left Fives
    if (!straight && pairs < 3 && triple1 != 5 && triple2 != 5) {
        points += result[4] * 50;
    }

    return points;
}


Game.prototype.addPoints = function() {
    var self = this;

    self.points += self.calculatePoints();

    for (var i = 0; i < 6; i++) {
        var dice = self.dices[i];
        if (dice.selected) {
            dice.selected = false;
            dice.disabled = true;
        }
    }


    self.Interface.setDices(self.dices);
    self.Interface.setPoints(self.points);
};

Game.prototype.takePoints = function() {
    var self = this;

    self.addPoints();

    if (self.playing) {
        self.player.score += self.points;
        self.player.zilch = 0;
        self.Interface.setPlayer(self.player);
        var history = {};
        history['player'] = self.points;
        self.history.push(history);

    } else {
        self.cpu.score += self.points;
        self.cpu.zilch = 0;
        self.Interface.setCpu(self.cpu);
        var history = {};
        history['cpu'] = self.points;
        self.history.push(history);
    }


    self.Interface.disableTakePoints(true);
    self.Interface.disableRollDices(true);
    self.Interface.setPoints(self.points);

    self.endRound();
};

Game.prototype.endRound = function() {
    var self = this;

    self.newRound = true;

    for (var i = 0; i < 6; i++) {
        var dice = self.dices[i];
        if (dice.disabled) {
            dice.selected = true;
        } else {
            dice.disabled = true;
        }
    }

    self.Interface.disableTakePoints(true);
    self.Interface.disableRollDices(true);
    self.Interface.setDices(self.dices);
    self.Interface.setPoints(self.points);
    self.Interface.setPlayer(self.player);
    self.Interface.setCpu(self.cpu);

    // check score
    var checkScore = self.playing && self.cpuStarts || !self.playing && !self.cpuStarts;

    if (checkScore && self.player.score >= 10000 && self.player.score > self.cpu.score) {
        self.Interface.disableRestart(false);
        self.Interface.showMessage("Player wins!");
    } else if (checkScore && self.cpu.score >= 10000 && self.cpu.score > self.player.score) {
        self.Interface.disableRestart(false);
        self.Interface.showMessage("CPU wins!");
    } else if (self.player.score >= 10000 && self.player.score == self.cpu.score) {
        self.Interface.disableRestart(false);
        self.Interface.showMessage("Remi!");
    } else {
        self.playing = !self.playing;

        self.Interface.setPlaying(self.playing);
        // continue
        if (self.playing) {
            self.Interface.disableRollDices(false);
            self.Interface.disableRestart(false);
        }

        self.Interface.showMessage(self.playing ? "Player's Turn!" : "CPU's turn!", self.messageTime, function() {

            if (!self.playing) {
                setTimeout(function() {
                    self.rollDices();
                }, self.cpuspeed);
            }
        });
    }

}

Game.prototype.cpuPlay = function() {
    var self = this;
    self.Interface.disableRestart(true);
    setTimeout(function() {

        // first select all available dices
        for (var i = 0; i < 6; i++) {
            var dice = self.dices[i];
            if (!dice.disabled) {
                self.toggleDice(i);
            }
        }

        // check if dice gains points
        for (var i = 0; i < 6; i++) {
            var dice = self.dices[i];
            var tmpPoints = self.calculatePoints();
            if (!dice.disabled) {
                self.toggleDice(i);
                if (self.calculatePoints() < tmpPoints) {
                    self.toggleDice(i);
                }
            }
        }

        // count free dices
        var freeDices = 0;
        for (var i = 0; i < 6; i++) {
            var dice = self.dices[i];
            if (!dice.disabled && !dice.selected) {
                freeDices++;
            }
        }

        setTimeout(function() {
            // strategy: end round if points >= 300 and less than 4 dices left and not loosing
            if (self.points + self.calculatePoints() >= 300 && freeDices < 4 && freeDices > 0 && self.player.score < 10000) {
                self.takePoints();
            } else {
                self.addPoints();
                self.rollDices();
            }

        }, self.cpuSpeed);
    }, 500);

}

Game.prototype.toggleCpu = function() {

}

var game = new Game(Interface);
