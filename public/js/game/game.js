function Game(querySelector) {
	this.canvas = document.querySelector(querySelector);
	this.ctx = this.canvas.getContext("2d");
	this.planets = [];
	this.mouse = { x: 0, y: 0, down: false };
	this.ui = [];

	this._boundDrawFrame = this.drawFrame.bind(this);
	this._boundMouseEvent = this.onMouseEvent.bind(this);

	this.canvas.addEventListener("mousedown", this._boundMouseEvent);
	this.canvas.addEventListener("mousemove", this._boundMouseEvent);
	this.canvas.addEventListener("mouseup", this._boundMouseEvent);

	this.ui.push(new Button(this.ctx, 10, CANVAS_HEIGHT - 30 - 10, "Fire", function() {
		alert("pew");
	}));
}

Game.prototype.startRound = function() {
	this.laserShotsLeft = 5;
	this.planets = [];
	for (var i = 0; i < 5; i++) {
		this.planets.push(new Planet(this.ctx));
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

	for (var planetIndex in this.planets) {
		this.planets[planetIndex].update(this.mouse);
	}

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].update(this.mouse);
	}

	//
	// draw
	//

	this.ctx.fillStyle = "white";
	this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	for (var planetIndex in this.planets) {
		this.planets[planetIndex].draw(this.ctx);
	}

	for (var uiIndex in this.ui) {
		this.ui[uiIndex].draw(this.ctx);
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

window.addEventListener("load", function() {
	var game = new Game("canvas");
	game.startRound();
	game.drawFrame();
});