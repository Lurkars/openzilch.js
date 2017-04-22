function Interface() {

  var self = this;

  self.events = {};

  self.restartButton = document.querySelector('#restart-button');

  self.playerScoreContainer = document.querySelector('#player-score-container');
  self.playerScore = document.querySelector('#player-score');
  self.playerZilch = document.querySelector('#player-zilch');

  self.cpuScoreContainer = document.querySelector('#cpu-score-container');
  self.cpuScore = document.querySelector('#cpu-score');
  self.cpuZilch = document.querySelector('#cpu-zilch');

  self.points = document.querySelector('#points');
  self.pointsButton = document.querySelector('#points-button');
  self.dicesButton = document.querySelector('#dices-button');
  self.diceContainer = document.querySelector('#dices');
  self.dices = self.diceContainer.children;

  self.message = document.querySelector('#message');

  self.dicesButton.classList.add("disabled");
  self.pointsButton.classList.add("disabled");

  self.restartButton.addEventListener("click", function() {
    if (!this.classList.contains('disabled')) {
      self.fireEvent("restart");
    }
  });

  self.pointsButton.addEventListener("click", function() {
    if (self.playing && !this.classList.contains('disabled')) {
      self.fireEvent("takePoints");
    }
  });


  self.dicesButton.addEventListener("click", function() {
    if (self.playing && !this.classList.contains('disabled')) {
      self.fireEvent("addPoints");
      self.fireEvent("rollDices");
    }
  });

  for (var diceIndex = 0; diceIndex < 6; diceIndex++) {
    var diceContainer = self.dices[diceIndex];
    diceContainer.diceIndex = diceIndex;
    diceContainer.addEventListener("click", function() {
      if (self.playing && !this.classList.contains('disabled')) {
        self.fireEvent("toggleDice", this.diceIndex);
      }
    });
  }

  this.setup();
};

Interface.prototype.setup = function() {
  this.dicesButton.classList.add("disabled");
  this.pointsButton.classList.add("disabled");
  this.message.classList.remove('visible');

};

Interface.prototype.on = function(event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

Interface.prototype.fireEvent = function(event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function(callback) {
      callback(data);
    });
  }
};

Interface.prototype.setDices = function(dices) {
  var self = this;

  for (var diceIndex = 0; diceIndex < 6; diceIndex++) {
    var dice = dices[diceIndex];
    var diceContainer = self.dices[diceIndex];
    diceContainer.innerHTML = dice.value + 1;

    if (dice.disabled) {
      diceContainer.classList.add('disabled');
    } else {
      diceContainer.classList.remove('disabled');
    }

    if (dice.selected) {
      diceContainer.classList.add('selected');
    } else {
      diceContainer.classList.remove('selected');
    }

    if (dice.invalid) {
      diceContainer.classList.add('invalid');
      diceContainer.classList.remove('selected');
    } else {
      diceContainer.classList.remove('invalid');
    }
  }




};

Interface.prototype.animateDices = function(dices, timeout, callback) {
  var self = this;
  for (var diceIndex = 0; diceIndex < 6; diceIndex++) {
    var dice = dices[diceIndex];
    if (!dice.disabled && !dice.selected) {
      self.dices[diceIndex].classList.add("animate");
      self.dices[diceIndex].classList.add("duration" + diceIndex);
    }
  }

  setTimeout(function() {
    for (var diceIndex = 0; diceIndex < 6; diceIndex++) {
      self.dices[diceIndex].classList.remove("animate");
    }
    if (callback) {
      callback();
    }
  }, timeout ? timeout : 0);
};

Interface.prototype.disableRestart = function(disabled) {
  if (disabled) {
    this.restartButton.classList.add("disabled")
  } else {
    this.restartButton.classList.remove("disabled")
  }
};

Interface.prototype.disableTakePoints = function(disabled) {
  if (disabled) {
    this.pointsButton.classList.add("disabled")
  } else {
    this.pointsButton.classList.remove("disabled")
  }
};

Interface.prototype.disableRollDices = function(disabled) {
  if (disabled) {
    this.dicesButton.classList.add("disabled")
  } else {
    this.dicesButton.classList.remove("disabled")
  }
};

Interface.prototype.setPoints = function(points) {
  this.points.innerHTML = points;
};

Interface.prototype.setPlaying = function(playing) {
  if (playing) {
    this.playing = true;
    this.playerScoreContainer.classList.add('active');
    this.cpuScoreContainer.classList.remove('active');
  } else {
    this.playing = false;
    this.playerScoreContainer.classList.remove('active');
    this.cpuScoreContainer.classList.add('active');
  }
};

Interface.prototype.setPlayer = function(player) {
  this.playerScore.innerHTML = player.score;
  var zilchs = '';
  for (var i = 0; i < player.zilch; i++) {
    zilchs += '<div class="point"></div>';
  }
  this.playerZilch.innerHTML = zilchs;

};

Interface.prototype.setCpu = function(cpu) {
  this.cpuScore.innerHTML = cpu.score;
  var zilchs = '';
  for (var i = 0; i < cpu.zilch; i++) {
    zilchs += '<div class="point"></div>';
  }

  this.cpuZilch.innerHTML = zilchs;
};

Interface.prototype.showMessage = function(message, timeout, callback) {
  var self = this;

  self.message.innerHTML = '<p>' + message + '</p>';

  self.message.classList.add('visible');

  if (timeout) {
    setTimeout(function() {
      self.clearMessage(callback);
    }, timeout);
  } else if (callback) {
    callback();
  }
};

Interface.prototype.clearMessage = function(callback) {
  this.message.classList.remove('visible');
  if (callback) {
    callback();
  }
};
