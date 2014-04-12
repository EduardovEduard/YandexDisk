var CanvasManager = {

    initialize: function() {
        this.drawingCanvas = $('#drawing_canvas')[0];
        this.imageCanvas = $('#screenshot_canvas')[0];

        this.drawContext = this.drawingCanvas.getContext('2d');
        this.mainContext = this.imageCanvas.getContext('2d');

        this.offsetLeft= this.drawingCanvas.offsetLeft;
        this.offsetTop = this.drawingCanvas.offsetTop;

        this.drawingCanvas.addEventListener('mousedown', function(e) {CanvasManager.onMouseDown(e);});
        this.drawingCanvas.addEventListener('mousemove', function(e) {CanvasManager.onMove(e);});
        this.drawingCanvas.addEventListener('mouseup', function(e) {CanvasManager.onMouseUp(e);});
    },

    clickX: 0,
    clickY: 0,

    onMouseDown: function(event) {
        if (this.shapeDrawer != null) {
            var x = event.clientX, y = event.clientY;

            this.clickX = x - this.offsetLeft;
            this.clickY = y - this.offsetTop;

            this.shapeDrawer.start();

            this.drawContext.lineWidth = 4;
        }
    },

    onMove: function(event) {
        var x = event.clientX, y = event.clientY;

        if (this.shapeDrawer != null) {
            this.drawContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.shapeDrawer.draw(this.drawContext, this.clickX, this.clickY, x - this.offsetLeft, y - this.offsetTop);
        }
    },

    onMouseUp: function() {
        if (this.shapeDrawer != null) {
            this.shapeDrawer.stop();
            this.mainContext.drawImage(this.drawingCanvas, 0, 0);
        }
    }
};

function AbstractDrawer () {
    this.isDrawing = false;
}

AbstractDrawer.prototype.start = function() {
    this.isDrawing = true;
};

AbstractDrawer.prototype.stop = function() {
    this.isDrawing = false;
};

/* Rectangle drawer */
function RectangleDrawer() {
    AbstractDrawer.call(this);
}

RectangleDrawer.prototype = Object.create(AbstractDrawer.prototype);

RectangleDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
};

/* Circle drawer */
function CircleDrawer() {
    AbstractDrawer.call(this);
}

CircleDrawer.prototype = Object.create(AbstractDrawer.prototype);

CircleDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
      ellipse(ctx, x1, y1, x2 - x1, y2 - y1);
  }
};

function LineDrawer() {
    AbstractDrawer.call(this);
}

LineDrawer.prototype = Object.create(AbstractDrawer.prototype);

LineDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
};

window.onload = function() {

    function getDrawer(id) {
        switch (id) {
            case 'rectangle': return new RectangleDrawer();
            case 'ellipse': return new CircleDrawer();
            case 'line': return new LineDrawer();
            default: return new RectangleDrawer();
        }
        return null;
    }

    $('.draw_method').click(function() {
        console.log(this.id);
        CanvasManager.shapeDrawer = getDrawer(this.id);
    });

    CanvasManager.initialize();
};

function ellipse(drawCtx, aX, aY, aWidth, aHeight) {
    var hB = (aWidth / 2) * .5522848,
        vB = (aHeight / 2) * .5522848,
        eX = aX + aWidth,
        eY = aY + aHeight,
        mX = aX + aWidth / 2,
        mY = aY + aHeight / 2;

    drawCtx.beginPath();
    drawCtx.moveTo(aX, mY);
    drawCtx.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
    drawCtx.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
    drawCtx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
    drawCtx.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
    drawCtx.closePath();
    drawCtx.stroke();
}