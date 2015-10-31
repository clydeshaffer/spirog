$(function() {
    function Term(func, r, m, b) {
        this.func = func;
        this.r = r;
        this.m = m;
        this.b = b;
    }

    Term.prototype.eval = function(t) {
        return Math[this.func](parseGoat(this.m) * t + parseGoat(this.b)) * parseGoat(this.r);
    }

    Term.prototype.toString = function() {
        return this.r + this.func + "(" + this.m + "t + " + this.b + ")";
    }
    
    var canvas = $("#maingraph");
    var ctx = canvas[0].getContext("2d");

    var overlayCanvas = $("#overlay");
    var overlayCtx = overlayCanvas[0].getContext("2d");

    function recenter() {
        canvas.attr({width : canvas.innerWidth(), height : canvas.innerHeight()});
        overlayCanvas.attr({width : overlayCanvas.innerWidth(), height : overlayCanvas.innerHeight()});
        ctx.setTransform(1,0,0,1,0,0);
        ctx.translate(canvas.width() / 2, canvas.height() / 2);

        overlayCtx.setTransform(1,0,0,1,0,0);
        overlayCtx.translate(overlayCanvas.width()/2, overlayCanvas.height()/2)
        clearScreen();
    }

    var template = $(".termTemplate");
    var xList = $("#xList");
    var yList = $("#yList");

    var terms = {
        x : [],
        y : []
    };

    function evalAxis(axis, t) {
        return terms[axis].reduce(function(total, nextTerm) {
           return total + nextTerm.eval(t);
        }, 0);
    }

    function parseGoat(numStr) {
        if(typeof numStr === "number") return numStr;
        else {
            var val = parseFloat(numStr);
            if(numStr.toLowerCase().endsWith("pi")) val *= Math.PI;
            return val;
        }
    }

    function clearScreen() {
        ctx.clearRect(-10000, -10000, 20000, 20000);
        lastX = null;
        lastY = null;
        ctx.strokeStyle = "grey";
        ctx.beginPath();
        ctx.moveTo(0, -10000);
        ctx.lineTo(0, 10000);
        ctx.moveTo(-10000,0);
        ctx.lineTo(10000,0);
        ctx.closePath();
        ctx.stroke();
    }

    function axisToString(axis) {
        return terms[axis].join(" + ");
    }

    function updateExport() {
        $("#graphInput").val(JSON.stringify(terms));
        $("#xlabel").text("X = " + (axisToString("x") || 0));
        $("#ylabel").text("Y = " + (axisToString("y") || 0));
    }

    function addEntry(axis, r, m, b) {
        if(r == undefined) r = 1;
        if(m == undefined) m = 1;
        if(b == undefined) b = 0;
        var clone = template.clone();
        clone.removeClass("termTemplate");

        if(axis == "x") {
            $(".func", clone).text("Cos");
        }

        var f = (axis == "x") ? "cos" : "sin";
        var newTerm = new Term(f, r, m, b);

        var radInput = $(".rad", clone);
        var mInput = $(".m", clone);
        var bInput = $(".b", clone);

        radInput.change(function() {
            newTerm.r = radInput.val();//parseGoat(radInput.val());
            updateExport();
        });

        mInput.change(function() {
            newTerm.m = mInput.val();//parseGoat(mInput.val());
            updateExport();
        });

        bInput.change(function() {
            newTerm.b = bInput.val();//parseGoat(bInput.val());
            updateExport();
        });

        radInput.val(r);
        mInput.val(m);
        bInput.val(b);

        terms[axis].push(newTerm);

        $(".remove", clone).click(function () {
            clone.remove();
            terms[axis] = terms[axis].filter(function(a) { return a != newTerm;});
            //clearScreen();
            updateExport();
        });

        clone.addClass("clonedEntry");
        $("#" + axis + "List").append(clone);

        updateExport();
        //clearScreen();
    }

    $("#clearbutton").click(clearScreen);
    $("#importbutton").click(function() {
        terms.x = [];
        terms.y = [];
        function convert(axis) {
            return function(imported) {
                addEntry(axis, imported.r, imported.m, imported.b);
            }
        }

        var imported = JSON.parse($("#graphInput").val());
        $(".clonedEntry").remove();
        imported.x.forEach(convert('x'));
        imported.y.forEach(convert('y'));
    });


    $("#addX").click(function() {
        addEntry("x");
    });

    $("#addY").click(function() {
        addEntry("y");
    });

    ctx.strokeStyle = "black";

    recenter();
    $(window).resize(recenter);

    var lastX = null;
    var lastY = null;

    function rand255() {
        return Math.floor(Math.random() * 255);
    }

    function randColor() {
        return "rgb(" + rand255() + "," + rand255() + "," + rand255();
    }

    overlayCtx.strokeStyle = "black";

    function drawFrame(timestamp) {
        ctx.strokeStyle = "#3333cc";//randColor();
        var xPos = evalAxis("x", timestamp / 1000);
        var yPos = evalAxis("y", timestamp / 1000);
        ctx.beginPath();
        if(lastX == null) lastX = xPos;
        if(lastY == null) lastY = yPos;
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(xPos, yPos);
        ctx.closePath();
        ctx.stroke();
        lastX = xPos;
        lastY = yPos;

        overlayCtx.clearRect(-1000, -1000, 2000, 2000);
        overlayCtx.beginPath();
        overlayCtx.arc(xPos,yPos,4,0,2*Math.PI);
        overlayCtx.closePath();
        overlayCtx.stroke();
        window.requestAnimationFrame(drawFrame);
    }

    clearScreen();
    addEntry("x", 100, 1, 0);
    addEntry("y", 100, 1, 0); 
    drawFrame();

});
