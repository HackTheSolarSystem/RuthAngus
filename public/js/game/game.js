function Game(querySelector) {
	this.canvas = document.querySelector(querySelector);
	this.ctx = this.canvas.getContext("2d");
	this.stars = [];
	this.mouse = { x: 0, y: 0, down: false };
	this.ui = [];
	this.state = STATE_PROBE;
	this.selectedStarIndex = -1;
	this.probedStarIndex = -1;

	this._probeAngle = 0;
	this._laserAnimating = false;
	this._laserTime = 0;
	this._boundDrawFrame = this.drawFrame.bind(this);
	this._boundMouseEvent = this.onMouseEvent.bind(this);

	this.canvas.addEventListener("mousedown", this._boundMouseEvent);
	this.canvas.addEventListener("mousemove", this._boundMouseEvent);
	this.canvas.addEventListener("mouseup", this._boundMouseEvent);

	this.probeButton = new Button(this, (CANVAS_WIDTH - 100) / 2, CANVAS_HEIGHT - 30 - 10, "Probe", function () {
		var stars = window.game.stars;
		var selectedStar;
		for (var starIndex in stars) {
			var star = stars[starIndex];
			if (star.selected) {
				selectedStar = star;
				break;
			}
		}

		if (selectedStar) {
			window.game.probedStarIndex = window.game.selectedStarIndex;
			window.game.selectedStarIndex = -1;
			// window.game._laserAnimating = true;
			// window.game._laserTime = 0;

			selectedStar.probe();

			window.game.probesLeft -= 1;

			if (window.game.probesLeft == 0) {
				window.game.startResearchPrompt();
			}
		} else {
			$("#must-select-planet").modal();
		}
	});
	this.researchButton = new Button(this, (CANVAS_WIDTH - 100) / 2, CANVAS_HEIGHT - 30 - 10, "Research", function () {
		var stars = window.game.stars;
		var selectedStar;
		var selectedStarIndex;
		var lowestFrequency = STAR_FREQUENCY_MAX + 1;
		var lowestFrequencyIndex = -1;
		for (var starIndex in stars) {
			var star = stars[starIndex];
			if (star.selected) {
				selectedStar = star;
				selectedStarIndex = starIndex;
			}
			if (star.soundFrequency < lowestFrequency) {
				lowestFrequency = star.soundFrequency;
				lowestFrequencyIndex = starIndex;
			}
		}

		if (selectedStar) {
			if (selectedStarIndex == lowestFrequencyIndex) {
				$("#win-modal").modal();
			} else {
				$("#lose-modal").modal();
			}
			game.startRound();
		} else {
			$("#must-select-planet").modal();
		}
	});
	this.researchButton.enabled = false;

	this.ui.push(this.probeButton);
	this.ui.push(this.researchButton);
}

Game.prototype.loadAssets = function (callback) {
	this.loader = new PxLoader();
	this.loader.addCompletionListener(callback);
	this.assets = {
		img: {
			laser: this.loader.addImage(window.BASE_URL + "/public/img/laser.png"),
			probe: this.loader.addImage(window.BASE_URL + "/public/img/probe.png")
		}
	};
	this.loader.start();
};

Game.prototype.startRound = function () {
	this.state = STATE_PROBE;
	this.probesLeft = PROBE_COUNT_MAX;
	this.probeButton.enabled = true;
	this.researchButton.enabled = false;
	this.selectedStarIndex = -1;
	this.stars = [];
	for (var i = 0; i < STAR_COUNT; i++) {
		this.stars.push(new Star(this));
	}
};

Game.prototype.startResearchPrompt = function () {
	this.state = STATE_GUESS;
	this.probeButton.enabled = false;
	// please don't write code like this ever
	setTimeout((function () {
		this.researchButton.enabled = true;
	}).bind(this), 200);
	for (var starIndex in this.stars) {
		var star = this.stars[starIndex];
		star.frozen = true;
		if (star.probed) {
			star.researchable = true;
		}
	}
};

Game.prototype.onMouseEvent = function (e) {
	var rect = this.canvas.getBoundingClientRect();

	this.mouse.x = e.clientX - rect.left;
	this.mouse.y = e.clientY - rect.top;
	this.mouse.down = (e.buttons == 1);
};

Game.prototype.lerp = function (from, to, time) {
	return ((to - from) * time) + from;
};

Game.prototype.drawFrame = function () {
	//
	// update
	//

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].update(this, this.mouse, uiIndex);
	}

	for (var starIndex in this.stars) {
		this.stars[starIndex].update(this, this.mouse, starIndex);
	}

	var probeX = ((CANVAS_WIDTH - PROBE_WIDTH) / 2) + (PROBE_WIDTH / 2);
	var probeY = (CANVAS_HEIGHT - 80);
	var probeTargetX = this.mouse.x;
	var probeTargetY = this.mouse.y;

	if (this.state == STATE_PROBE) {
		if (this.selectedStarIndex == -1) {
			probeTargetX = this.mouse.x;
			probeTargetY = this.mouse.y;
		} else {
			probeTargetX = this.stars[this.selectedStarIndex].x;
			probeTargetY = this.stars[this.selectedStarIndex].y + this.stars[this.selectedStarIndex].yOffset;
		}
	}

	this._probeAngle = Math.atan2(probeY - probeTargetY, probeX - probeTargetX) - (Math.PI / 2);

	var laserX = 0;
	var laserY = 0;

	if (this._laserAnimating) {
		laserX = this.lerp(probeX, this.stars[this.probedStarIndex].x, this._laserTime);
		laserY = this.lerp(probeY, this.stars[this.probedStarIndex].y + this.stars[this.probedStarIndex].yOffset, this._laserTime);

		this._laserTime += 0.01;
		if (this._laserTime >= 1) {
			this._laserAnimating = false;
		}
	}

	//
	// draw
	//

	this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	if (this.state == STATE_PROBE) {
		this.ctx.translate(probeX, probeY);
		this.ctx.rotate(this._probeAngle);
		this.ctx.drawImage(this.assets.img.probe, -(PROBE_WIDTH / 2), -(PROBE_HEIGHT / 2), PROBE_WIDTH, PROBE_HEIGHT);
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	if (this._laserAnimating) {
		this.ctx.translate(laserX, laserY);
		this.ctx.rotate(0);
		this.ctx.drawImage(this.assets.img.laser, 0, 0);
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].draw(this.ctx);
	}

	for (var starIndex in this.stars) {
		this.stars[starIndex].draw(this.ctx);
	}

	this.ctx.font = "18px Quicksand";
	this.ctx.fillStyle = "white";
	this.ctx.textAlign = "center";
	this.ctx.textBaseline = "middle";
	if (this.state == STATE_PROBE) {
		this.ctx.fillText("Select a star to probe.", CANVAS_WIDTH / 2, 10 + 8);

		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "bottom";
		this.ctx.fillText("Probes left: " + this.probesLeft, 10, CANVAS_HEIGHT - 10);
	} else if (this.state == STATE_GUESS) {
		this.ctx.fillText("Where do you want to pursue research? Select a star.", CANVAS_WIDTH / 2, 10 + 8);
	}

	this.ctx.fillStyle = (this.mouse.down ? "green" : "red");
	this.ctx.beginPath();
	this.ctx.arc(this.mouse.x, this.mouse.y, 2, 0, 2 * Math.PI);
	this.ctx.fill();

	//
	// request next
	//

	requestAnimationFrame(this._boundDrawFrame);
};

window.addEventListener("load", function () {
	particlesJS.load("particles", window.BASE_URL + "/public/particlesjs-config.json", function () { });

	window.game = new Game("canvas");
	game.loadAssets(function () {
		document.querySelector("#loadingCover").remove();
		game.startRound();
		game.drawFrame();
	});
});