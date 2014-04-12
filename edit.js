var CanvasManager = {
    clickX: 0,
    clickY: 0,
    shapeDrawer: null,

    onMouseDown: function(x, y) {
        this.clickX = x - this.shapeDrawer.offsetLeft;
        this.clickY = y - this.shapeDrawer.offsetTop;
        this.shapeDrawer.start();
    },

    onMove: function(x, y) {
        if (this.shapeDrawer != null)
            this.shapeDrawer.draw(this.clickX, this.clickY,
                                  x - this.shapeDrawer.offsetLeft, y - this.shapeDrawer.offsetTop);
    },

    onMouseUp: function() {
        this.shapeDrawer.stop();
    }
};

function AbstractDrawer (drawingCanvas, imageCanvas) {
    this.drawingCanvas = drawingCanvas;
    this.imageCanvas = imageCanvas;
    this.ctx = this.drawingCanvas.getContext('2d');
    this.isDrawing = false;

    this.offsetLeft = this.drawingCanvas.offsetLeft;
    this.offsetTop = this.drawingCanvas.offsetTop;

    this.ctx.lineWidth = 4;
}

AbstractDrawer.prototype.start = function() {
    this.isDrawing = true;
};

AbstractDrawer.prototype.stop = function() {
    this.isDrawing = false;
    this.imageCanvas.getContext('2d').drawImage(this.drawingCanvas, 0, 0);
};

/* Rectangle drawer */
function RectangleDrawer(drawingCanvas, imageCanvas) {
    AbstractDrawer.call(this, drawingCanvas, imageCanvas);
}

RectangleDrawer.prototype = Object.create(AbstractDrawer.prototype);

RectangleDrawer.prototype.draw = function(x1, y1, x2, y2) {
    if (this.isDrawing) {
        this.ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
};

/* Circle drawer */
function CircleDrawer(drawingCanvas, imageCanvas) {
    AbstractDrawer.call(this, drawingCanvas, imageCanvas);
}

CircleDrawer.prototype = Object.create(AbstractDrawer.prototype);

CircleDrawer.prototype.draw = function(x1, y1, x2, y2) {
    if (this.isDrawing) {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
      ellipse(ctx, x1, y1, x2 - x1, y2 - y1);
  }
};


window.onload = function() {
    function getDrawer(id, drawCanvas, imageCanvas) {
        switch (id) {
            case 'rectangle': return new RectangleDrawer(drawCanvas, imageCanvas); break;
            case 'ellipse': return new CircleDrawer(drawCanvas, imageCanvas); break;
            default: return new RectangleDrawer(drawCanvas, imageCanvas); break;
        }
        return null;
    }

    $('.draw_method').click(function() {
        var drawingCanvas = $('#drawing_canvas');
        var imageCanvas = $('#screenshot_canvas');

        CanvasManager.shapeDrawer = getDrawer(this.id, drawingCanvas[0], imageCanvas[0]);

        drawingCanvas.mousedown(function (e) {
            CanvasManager.onMouseDown(e.clientX, e.clientY);
        });

        drawingCanvas.mousemove(function(e) {
            CanvasManager.onMove(e.clientX, e.clientY);
        });

        drawingCanvas.mouseup(function(e) {
            CanvasManager.onMouseUp();
        });
    });
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