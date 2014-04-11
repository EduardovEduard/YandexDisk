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

var RectangleDrawer = function (drawingCanvas, imageCanvas) {
    this.drawingCanvas = drawingCanvas;
    this.imageCanvas = imageCanvas
    this.ctx = this.drawingCanvas.getContext('2d');
    this.isDrawing = false;

    this.offsetLeft = this.drawingCanvas.offsetLeft;
    this.offsetTop = this.drawingCanvas.offsetTop;

    RectangleDrawer.prototype.draw = function(x1, y1, x2, y2) {
        if (this.isDrawing) {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
    };

    RectangleDrawer.prototype.start = function() {
        this.isDrawing = true;
    };

    RectangleDrawer.prototype.stop = function() {
        this.isDrawing = false;
        this.imageCanvas.getContext('2d').drawImage(this.drawingCanvas, 0, 0);
    };
};

window.onload = function() {
    $('#rectangle').click(function() {
        var drawingCanvas = $('#drawing_canvas');
        var imageCanvas = $('#screenshot_canvas');

        CanvasManager.shapeDrawer = new RectangleDrawer(drawingCanvas[0], imageCanvas[0]);

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
