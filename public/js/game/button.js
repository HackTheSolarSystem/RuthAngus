function Button(game, x, y, label, callback) {
	this.x = x;
	this.y = y;
	this.w = 100;
	this.h = 30;
	this.label = label;
	this.font = "14px Quicksand";
	this.enabled = true;
	this.callback = callback;
	this._hover = false;
	this._lastMouseDown = false;
};

Button.prototype.update = function(mouse) {
	if (!this.enabled) { return; }

	this._hover = (
		(mouse.x > this.x && mouse.x < (this.x + this.w)) &&
		(mouse.y > this.y && mouse.y < (this.y + this.h))
	);

	if (this._hover && mouse.down && !this._lastMouseDown) {
		this.callback(this);
	}

	this._lastMouseDown = mouse.down;
};

Button.prototype.draw = function(ctx) {
	if (!this.enabled) { return; }

	ctx.strokeStyle = (this._hover ? "yellow" : "white");
	ctx.lineWidth = 5;
	ctx.fillStyle = "#cccccc";

	ctx.strokeRect(this.x, this.y, this.w, this.h);
	ctx.fillRect(this.x, this.y, this.w, this.h);

	ctx.font = this.font;
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(this.label, this.x + (this.w / 2), this.y + (this.h / 2));
};