// fix align by wordWrapWidth
Phaser.Text.prototype.updateText = function () {

	this.context.font = this.style.font;

	var outputText = this.text;
	var maxLineWidth = 0;

	// word wrap
	// preserve original text
	if (this.style.wordWrap)
	{
		outputText = this.runWordWrap(this.text);
		var maxLineWidth = this.wordWrapWidth;
	}

	//split text into lines
	var lines = outputText.split(/(?:\r\n|\r|\n)/);

	//calculate text width
	var lineWidths = [];
	

	for (var i = 0; i < lines.length; i++)
	{
		var lineWidth = this.context.measureText(lines[i]).width;
		lineWidths[i] = lineWidth;
		maxLineWidth = Math.max(maxLineWidth, lineWidth);
	}

	this.canvas.width = maxLineWidth + this.style.strokeThickness;

	//calculate text height
	var lineHeight = this.determineFontHeight('font: ' + this.style.font + ';') + this.style.strokeThickness + this._lineSpacing;

	this.canvas.height = lineHeight * lines.length  + this.style.shadowOffsetY;

	if (navigator.isCocoonJS)
	{
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	//set canvas text styles
	this.context.fillStyle = this.style.fill;
	this.context.font = this.style.font;

	this.context.strokeStyle = this.style.stroke;
	this.context.lineWidth = this.style.strokeThickness;

	this.context.shadowOffsetX = this.style.shadowOffsetX;
	this.context.shadowOffsetY = this.style.shadowOffsetY;
	this.context.shadowColor = this.style.shadowColor;
	this.context.shadowBlur = this.style.shadowBlur;

	this.context.textBaseline = 'top';
	this.context.lineCap = 'round';
	this.context.lineJoin = 'round';
	
	
	var linePosition = new PIXI.Point(0, 0);
	//draw lines line by line
	for (i = 0; i < lines.length; i++)
	{
		linePosition.x = this.style.strokeThickness / 2;
		linePosition.y = this.style.strokeThickness / 2 + i * lineHeight + this._lineSpacing;

		if (this.style.align === 'right')
		{
			linePosition.x += maxLineWidth - lineWidths[i];
		}
		else if (this.style.align === 'center')
		{
			linePosition.x += (maxLineWidth - lineWidths[i]) / 2;
		}

		if (this.style.stroke && this.style.strokeThickness)
		{
			this.context.strokeText(lines[i], linePosition.x, linePosition.y);
		}

		if (this.style.fill)
		{
			this.context.fillText(lines[i], linePosition.x, linePosition.y);
		}
	}

	this.updateTexture();
};