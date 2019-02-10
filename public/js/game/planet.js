function Planet(ctx) {
	this.r = (30 * Math.random()) + 10;
	this.x = ((CANVAS_WIDTH - this.r) * Math.random()) + (this.r / 2);
	this.y = ((CANVAS_HEIGHT - this.r) * Math.random()) + (this.r / 2);
	this.animationTime = 2 * Math.PI * Math.random();
	this.laserSpeed = Math.random() * 10;
}

Planet.prototype.update = function(mouse) {
	//
	// hover
	//
	this._hover = (Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - (this.y + this.yOffset), 2) <= Math.pow(this.r, 2));

	//
	// animation
	//

	this.animationTime += 0.01;

	this.yOffset = SINE_ANIMATION_HEIGHT * Math.sin(this.animationTime);

	if (this.animationTime >= 2 * Math.PI) {
		this.animationTime = 0;
	}
};

Planet.prototype.draw = function(ctx) {
	ctx.fillStyle = (this._hover ? "red" : "orange");
	ctx.beginPath();
	ctx.arc(this.x, this.y + this.yOffset, this.r, 0, 2 * Math.PI);
	ctx.fill();
};