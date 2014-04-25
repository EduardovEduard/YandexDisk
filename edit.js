Array.prototype.top = function() {
    return this[this.length - 1];
};

function spawnTextInput(x, y) {
    if (!this.textInputId)
        this.textInputId = 0;

    var textInputId = 'textInput' + this.textInputId++;
    var input = $('<input/>', {
        "class": 'textinput',
        id: textInputId
    }).appendTo("#main");

    input.css({
        top: (y - input.height()) + 'px',
        left: x + 'px'
    });

    input.focus();
    input.on('keyup',function(event) {
        switch (event.keyCode) {
            case 8 : //fallthrough
            case 46: break;
            case 13: var rect = input[0].getBoundingClientRect();
                     spawnTextInput(rect.left, rect.bottom + rect.height);
        }
    });

    input.on('input', function() {
        var lastChar = $(this).val().slice(-1);

        $('#string_width_div').html(lastChar);
        var charWidth = $('#string_width_div').width();
        console.log(CanvasManager.mainCanvas.width + ' ' + $(this).width() + ' ' + $(this).position().left + ' ' + charWidth);

        if ($(this).position().left + $(this).width() + charWidth < CanvasManager.mainCanvas.width)
        {
            $(this).width($(this).width() + charWidth);
        }
        else
        {
          $(this).prop('readonly', 'readonly');
        }
    });

    return textInputId;
}

var CanvasManager = {

    initialize: function() {
        this.drawingCanvas = $('#drawing_canvas')[0];
        this.mainCanvas = $('#screenshot_canvas')[0];

        this.drawingContext = this.drawingCanvas.getContext('2d');
        this.mainContext = this.mainCanvas.getContext('2d');

        this.offsetLeft= this.drawingCanvas.offsetLeft;
        this.offsetTop = this.drawingCanvas.offsetTop;

        this.setDrawingHandlers();
    },

    setDrawingHandlers: function () {
        $('#drawing_canvas').off();
        $('#drawing_canvas').on('mousedown', function(e) {CanvasManager.onMouseDrawDown(e);});
        $('#drawing_canvas').on('mousemove', function(e) {CanvasManager.onMouseDrawMove(e);});
        $('#drawing_canvas').on('mouseup',   function(e) {CanvasManager.onMouseDrawUp(e);});
    },

    setTextInputHandlers: function() {
        $('#drawing_canvas').off();
        $('#drawing_canvas').on('click', function(e) {CanvasManager.onMouseTextClickBefore(e);});
    },

    getCanvasPos: function(canvas) {
        var _x = canvas.offsetLeft;
        var _y = canvas.offsetTop;

        while(canvas == canvas.offsetParent) {
            _x += canvas.offsetLeft - canvas.scrollLeft;
            _y += canvas.offsetTop - canvas.scrollTop;
        }

        return {
            left : _x,
            top : _y
        }
    },

    mousePos: function(event) {
        var mouseX = event.clientX - this.getCanvasPos(event.target).left + window.pageXOffset;
        var mouseY = event.clientY - this.getCanvasPos(event.target).top + window.pageYOffset;
        return {
            x : mouseX,
            y : mouseY
        };
    },

    onMouseDrawDown: function(event) {
        if (this.shapeDrawer != null) {

            var point = this.mousePos(event);

            this.prevPoint = point;

            this.shapeDrawer.start(this.drawingContext, point);

            this.drawingContext.lineWidth = 4;
        }
    },

    onMouseDrawMove: function(event) {
        var point = this.mousePos(event);

        if (this.shapeDrawer != null && this.shapeDrawer.isDrawing) {
            if (this.shapeDrawer.needsToClear) {
                this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            }

            this.shapeDrawer.draw(this.drawingContext, this.prevPoint.x, this.prevPoint.y, point.x, point.y);
        }
        this.prevPoint = point;
    },

    onMouseDrawUp: function(event) {
        if (this.shapeDrawer != null) {
            this.shapeDrawer.stop(this.drawingContext, this.prevPoint);

            if (this.historyStack.length == 0) {
                this.save();
            }

            this.mainContext.drawImage(this.drawingCanvas, 0, 0);
            this.save();

            this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.redoStack = [];
        }
    },

    onMouseTextClickBefore: function(event) {
        console.log('onMouseTextClickBefore');
        var point = this.mousePos(event);
        var textInputId = spawnTextInput(point.x + this.mainCanvas.offsetLeft, point.y + this.mainCanvas.offsetTop);

        $('#drawing_canvas').off('click');
        $('#drawing_canvas').on('click', function(e) {CanvasManager.onMouseTextClickAfter(e);});
    },

    onMouseTextClickAfter: function() {
        console.log('onMouseTextClickAfter');
        $('#drawing_canvas').off('click');

        $.each($('.textinput'), function (index, input) {
            var context = CanvasManager.mainContext;
            var rect = input.getBoundingClientRect();

            context.save();
            var style = window.getComputedStyle(input);
            console.log(parseInt(style.getPropertyValue('font-size').slice(0, -2)));
            context.font = 'bold ' + style.getPropertyValue('font-size') + ' Arial';

            context.fillText(input.value, rect.left - CanvasManager.mainCanvas.offsetLeft, rect.bottom - CanvasManager.mainCanvas.offsetTop);
            context.restore();
        });

        $('.textinput').remove();

        $('#drawing_canvas').on('click', function(e) {CanvasManager.onMouseTextClickBefore(e);});
    },

    historyStack: [],
    redoStack: [],

    save: function() {
        this.historyStack.push({
            data: this.mainCanvas.toDataURL(),
            width: this.mainCanvas.width,
            height: this.mainCanvas.height
        });
    },

    undo: function() {
        if (this.historyStack.length > 1) {
            var canvas = CanvasManager.mainCanvas;
            var context = CanvasManager.mainContext;

            var state = this.historyStack.pop();
            this.redoStack.push(state);

            state = this.historyStack.top();

            var image = new Image();
            image.addEventListener('load', function() {
                if (state.height != canvas.height || state.width != canvas.width) {
                    resize(CanvasManager.drawingCanvas, state.width, state.height);
                    resize(CanvasManager.mainCanvas, state.width, state.height);
                }
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0);
            });

            image.src = state.data;
        }
    },

    redo: function() {
        if (this.redoStack.length > 0) {
            var canvas = CanvasManager.mainCanvas;
            var context = CanvasManager.mainContext;

            var state = this.redoStack.pop();
            this.historyStack.push(state);

            var image = new Image();
            image.addEventListener('load', function() {
                if (state.height != canvas.height || state.width != canvas.width) {
                    resize(CanvasManager.drawingCanvas, state.width, state.height);
                    resize(CanvasManager.mainCanvas, state.width, state.height);
                }
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0);
            });

            image.src = state.data;
        }
    }
};

function resize(canvas, width, height) {
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
}


function AbstractDrawer() {
    this.isDrawing = false;
    this.needsToClear = true;
}

AbstractDrawer.prototype.start = function(ctx, point) {
    this.isDrawing = true;
    this.startPoint = point;
};

AbstractDrawer.prototype.stop = function(ctx, point) {
    console.log("Stop");
    this.isDrawing = false;
};

/* Rectangle drawer */
function RectangleDrawer() {
    AbstractDrawer.call(this);
}

RectangleDrawer.prototype = Object.create(AbstractDrawer.prototype);

RectangleDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        ctx.strokeRect(this.startPoint.x, this.startPoint.y,  x2 - this.startPoint.x, y2 - this.startPoint.y);
    }
};

/* Circle drawer */
function CircleDrawer() {
    AbstractDrawer.call(this);
}

CircleDrawer.prototype = Object.create(AbstractDrawer.prototype);

CircleDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
      ellipse(ctx, this.startPoint.x, this.startPoint.y, x2 - this.startPoint.x, y2 - this.startPoint.y);
  }
};

function LineDrawer() {
    AbstractDrawer.call(this);
}

LineDrawer.prototype = Object.create(AbstractDrawer.prototype);

LineDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
};

function ArrowDrawer() {
    AbstractDrawer.call(this);
}

ArrowDrawer.prototype = Object.create(AbstractDrawer.prototype);

ArrowDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        var LENGTH_PATH = 10;
        var angle = Math.atan2(y2 - this.startPoint.y, x2 - this.startPoint.x);
        var length = Math.sqrt(Math.pow(x2 - this.startPoint.x, 2) + Math.pow(y2 - this.startPoint.y, 2)) / LENGTH_PATH;

        ctx.save();
        ctx.lineCap = 'round'
        ctx.lineWidth = 1;
        ctx.beginPath();

        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(x2, y2);

        ctx.lineTo(x2 - length * Math.cos(angle - Math.PI / 6), y2 - length*Math.sin(angle - Math.PI/6));

        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - length * Math.cos(angle + Math.PI / 6), y2 - length*Math.sin(angle + Math.PI/6));

        ctx.stroke();

        ctx.restore();
    }
}

function CropDrawer() {
    AbstractDrawer.call(this);
}

CropDrawer.prototype = Object.create(AbstractDrawer.prototype);

CropDrawer.prototype.start = function(ctx, point) {
    AbstractDrawer.prototype.start.call(this, ctx, point);

    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fillRect(0, 0, CanvasManager.drawingCanvas.width, CanvasManager.drawingCanvas.height);
    ctx.fill();
}

CropDrawer.prototype.stop = function(ctx, point) {
    if (this.isDrawing && this.lastRect) {
        var temp = document.createElement('canvas');
        var tempContext = temp.getContext('2d');

        resize(temp, this.lastRect.width, this.lastRect.height);

        tempContext.drawImage(CanvasManager.mainCanvas, this.lastRect.x, this.lastRect.y,
            this.lastRect.width, this.lastRect.height, 0, 0, this.lastRect.width, this.lastRect.height);

        resize(CanvasManager.mainCanvas, this.lastRect.width, this.lastRect.height);

        CanvasManager.mainContext.drawImage(temp, 0, 0,
            temp.width, temp.height, 0, 0, temp.width, temp.height);

        resize(CanvasManager.drawingCanvas, temp.width, temp.height);
        this.isDrawing = false;
    }
}

CropDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        ctx.strokeRect(this.startPoint.x, this.startPoint.y, x2 - this.startPoint.x, y2 - this.startPoint.y);
        this.lastRect = {
            x: this.startPoint.x,
            y: this.startPoint.y,
            width: x2 - this.startPoint.x, 
            height: y2 - this.startPoint.y
        };
    }
};

function SimpleDrawer() {
    AbstractDrawer.call(this);
    this.needsToClear = false;
}

SimpleDrawer.prototype = Object.create(AbstractDrawer.prototype);

SimpleDrawer.prototype.draw = function(ctx, x1, y1, x2, y2) {
    if (this.isDrawing) {
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }
}

window.onload = function() {

    function getDrawer(id) {
        switch (id) {
            case 'rectangle': return new RectangleDrawer();
            case 'ellipse'  : return new CircleDrawer();
            case 'line'     : return new LineDrawer();
            case 'arrow'    : return new ArrowDrawer;
            case 'draw'     : return new SimpleDrawer();
            case 'crop'     : return new CropDrawer();
            default         : return new RectangleDrawer();
        }
        return null;
    }

    $('.draw_method').click(function() {
        console.log(this.id);
        CanvasManager.setDrawingHandlers();
        CanvasManager.shapeDrawer = getDrawer(this.id);
    });

    $('.text_method').click(function() {
       console.log(this.id);
        CanvasManager.setTextInputHandlers();
    });

    $('#undo').click(function() {
        CanvasManager.undo();
    });

    $('#redo').click(function() {
        CanvasManager.redo();
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