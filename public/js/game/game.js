function Game(querySelector) {
	this.canvas = document.querySelector(querySelector);
	this.ctx = this.canvas.getContext("2d");
	this.stars = [];
	this.mouse = { x: 0, y: 0, down: false };
	this.ui = [];

	this._boundDrawFrame = this.drawFrame.bind(this);
	this._boundMouseEvent = this.onMouseEvent.bind(this);

	this.canvas.addEventListener("mousedown", this._boundMouseEvent);
	this.canvas.addEventListener("mousemove", this._boundMouseEvent);
	this.canvas.addEventListener("mouseup", this._boundMouseEvent);

	this.ui.push(new Button(this, (CANVAS_WIDTH - 100) / 2, CANVAS_HEIGHT - 30 - 10, "Fire", function() {
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
			selectedStar.shoot();
		} else {
			alert("You must select a star.");
		}
	}));
}

Game.prototype.startRound = function() {
	this.laserShotsLeft = 5;
	this.stars = [];
	for (var i = 0; i < 5; i++) {
		this.stars.push(new Star(this));
	}
};

Game.prototype.onMouseEvent = function(e) {
	var rect = this.canvas.getBoundingClientRect();

	this.mouse.x = e.clientX - rect.left;
	this.mouse.y = e.clientY - rect.top;
	this.mouse.down = (e.buttons == 1);
};

Game.prototype.drawFrame = function() {
	//
	// update
	//

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].update(this.mouse);
	}

	for (var starIndex in this.stars) {
		this.stars[starIndex].update(this.mouse);
	}

	//
	// draw
	//

	this.ctx.fillStyle = "white";
	this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].draw(this.ctx);
	}

	for (var starIndex in this.stars) {
		this.stars[starIndex].draw(this.ctx);
	}

	this.ctx.font = "18px Quicksand";
	this.ctx.fillStyle = "black";
	this.ctx.fillText("Select a star to fire at", CANVAS_WIDTH / 2, 10 + 8);

	this.ctx.fillStyle = (this.mouse.down ? "green" : "red");
	this.ctx.beginPath();
	this.ctx.arc(this.mouse.x, this.mouse.y, 2, 0, 2 * Math.PI);
	this.ctx.fill();

	//
	// request next
	//

	requestAnimationFrame(this._boundDrawFrame);
};

window.addEventListener("load", function() {
	window.game = new Game("canvas");
	game.startRound();
	game.drawFrame();
});