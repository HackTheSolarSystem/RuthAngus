function Game(querySelector) {
	this.canvas = document.querySelector(querySelector);
	this.ctx = this.canvas.getContext("2d");
	this.stars = [];
	this.mouse = { x: 0, y: 0, down: false };
	this.ui = [];
	this.state = STATE_PROBE;

	this._probeAngle = 0;
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
			selectedStar.probe();

			window.game.probesLeft -= 1;

			if (window.game.probesLeft == 0) {
				window.game.startResearchPrompt();
			}
		} else {
			$('#must-select-planet').modal()
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
				$('#win-modal').modal()
			} else {
				$('#lose-modal').modal()
			}
			game.startRound();
		} else {
			$('#must-select-planet').modal()
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

Game.prototype.drawFrame = function () {
	//
	// update
	//

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].update(this.mouse);
	}

	for (var starIndex in this.stars) {
		this.stars[starIndex].update(this.mouse);
	}

	var probeX = ((CANVAS_WIDTH - PROBE_WIDTH) / 2) + (PROBE_WIDTH / 2);
	var probeY = (CANVAS_HEIGHT - 80);

	if (this.state == STATE_PROBE) {
		this._probeAngle = Math.atan2(probeY - this.mouse.y, probeX - this.mouse.x) - (Math.PI / 2);
	}

	//
	// draw
	//

	this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
		this.ctx.fillText("Select a star to probe", CANVAS_WIDTH / 2, 10 + 8);

		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "bottom";
		this.ctx.fillText("Probes left: " + this.probesLeft, 10, CANVAS_HEIGHT - 10);
	} else if (this.state == STATE_GUESS) {
		this.ctx.fillText("Where do you want to pursue research? Select a star.", CANVAS_WIDTH / 2, 10 + 8);
	}

	this.ctx.translate(probeX, probeY);
	this.ctx.rotate(this._probeAngle);
	this.ctx.drawImage(this.assets.img.probe, -(PROBE_WIDTH / 2), -(PROBE_HEIGHT / 2), PROBE_WIDTH, PROBE_HEIGHT);
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);

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