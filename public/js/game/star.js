function Star(game) {
	this.r = (20 * Math.random()) + 20;

	while (true) {
		this.x = ((CANVAS_WIDTH - (2 * this.r)) * Math.random()) + this.r;
		this.y = UI_TOP_GAP + ((CANVAS_HEIGHT - this.r - UI_TOP_GAP - UI_BOTTOM_GAP) * Math.random()) + (this.r / 2);

		var intersects = false;
		for (var starIndex in game.stars) {
			var otherStar = game.stars[starIndex];
			if (this.x < otherStar.x + ((2 * otherStar.r) + (2 * SINE_ANIMATION_HEIGHT)) &&
				this.x + ((2 * this.r) + (2 * SINE_ANIMATION_HEIGHT)) > otherStar.x &&
				this.y < otherStar.y + ((2 * otherStar.r) + (2 * SINE_ANIMATION_HEIGHT)) &&
				this.y + ((2 * this.r) + (2 * SINE_ANIMATION_HEIGHT)) > otherStar.y) {
				intersects = true;
				break;
			}
		}

		if (!intersects) {
			break;
		}
	}

	this.fill = game.ctx.createLinearGradient(this.x, this.y, this.x + 2 * this.r, this.y);
	this.fill.addColorStop(0, "#f6d365");
	this.fill.addColorStop(1, "#fda085");

	this.yOffset = 0;
	this.animationTime = 2 * Math.PI * Math.random();
	this.soundFrequency = (Math.random() * 900) + 100;
	this.soundFrequency = Math.round(this.soundFrequency * 100) / 100;
	this._hover = false;
	this.selected = false;
	this._probed = false;
	this._lastMouseDown = false;
};

Star.prototype.probe = function(mouse) {
	this._probed = true;
};

Star.prototype.update = function(mouse) {
	//
	// mouse events
	//
	this._hover = (Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - (this.y + this.yOffset), 2) <= Math.pow(this.r, 2));

	if (mouse.down && !this._lastMouseDown) {
		this.selected = this._hover;
	}

	this._lastMouseDown = mouse.down;

	//
	// animation
	//

	if (!this._probed) {
		this.animationTime += 0.01;

		this.yOffset = SINE_ANIMATION_HEIGHT * Math.sin(this.animationTime);

		if (this.animationTime >= 2 * Math.PI) {
			this.animationTime = 0;
		}
	}
};

Star.prototype.draw = function(ctx) {
	var outlineColor = "white";

	if (this._probed) {
		outlineColor = "red";
	} else if (this._hover || this.selected) {
		outlineColor = "yellow";
	}

	ctx.fillStyle = this.fill;
	ctx.beginPath();
	ctx.arc(this.x, this.y + this.yOffset, this.r, 0, 2 * Math.PI);
	ctx.fill();

	ctx.strokeStyle = outlineColor;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(this.x, this.y + this.yOffset, this.r, 0, 2 * Math.PI);
	ctx.stroke();

	if (this._probed) {
		ctx.fillStyle = "white";
		ctx.font = "16px Quicksand";
		ctx.textAlign = "top";
		ctx.textBaseline = "middle";
		ctx.fillText(this.soundFrequency + " uHz", this.x, this.y + this.yOffset + this.r + 15);
	}
};