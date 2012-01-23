(function ($) {

    function makeGrid(canvas, width, height, turn) {

        var GRID_OBJECT = {"empty" : 0, "cross" : 1, "circle" : 2};
        var CELL_SIZE = 40; // solun koko pikseleissä, sisältää myös ruudukon pikselit
        var ctx = canvas.getContext("2d");
        
        var VICTORY_LIMIT = 3;

        var grid = new Array(width);
        var i, j;

        // alustetaan ruudukko tyhjäksi
        var initGrid = function() {
            for (i = 0; i < width; i++) {
                grid[i] = new Array(height);       
                for (j = 0; j < height; j++) {
                    grid[i][j] = GRID_OBJECT.empty;
                }
            }
        };
        initGrid();
        
        var playCross = function(x,y) {
            grid[x][y] = GRID_OBJECT.cross;
        };
        
        var playCircle = function(x,y) {
            grid[x][y] = GRID_OBJECT.circle;
        };
    
        // ruudukon piirtoa
        var drawHorizontalLines = function() {
            var x;
            for (x = 0; x <= width; x++) {
                drawLine(x * CELL_SIZE + 0.5, 0.5,
                         x * CELL_SIZE + 0.5, height * CELL_SIZE + 0.5);
            }
        };
        
        var drawVerticalLines = function() {
            var y;
            for (y = 0; y <= height; y++) {
                
                drawLine(0.5, y * CELL_SIZE + 0.5, 
                         width * CELL_SIZE + 0.5, y * CELL_SIZE + 0.5)
            }
        };
        
        var drawCircle = function(x,y) {
            var xx = (x * CELL_SIZE) + (CELL_SIZE / 2);
            var yy = (y * CELL_SIZE) + (CELL_SIZE / 2);
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(xx, yy, 15, 0, Math.PI*2, true); 
            ctx.closePath();        
            ctx.fill();
        };
        
        var drawCross = function(x,y) {
            
            var xx = (x * CELL_SIZE);
            var yy = (y * CELL_SIZE);
        
            ctx.lineWidth = 3; 
            ctx.lineCap = 'round';            
            ctx.strokeStyle = 'black';

            drawLine(xx+3,yy+3,xx + (CELL_SIZE - 3),
                     yy + (CELL_SIZE - 3));
           
            drawLine(xx+3, yy + (CELL_SIZE - 3), 
                     xx + (CELL_SIZE - 3),yy+3);
        };
        
        var drawLine = function(moveX, moveY, lineX, lineY) {
            ctx.beginPath();
            ctx.moveTo(moveX,moveY);
            ctx.lineTo(lineX, lineY);
            ctx.stroke();
        };
        
        // ruutuun piirretään joko rinkula, ruksi tai tyhjää
        var drawCell = function(x, y, GRID_OBJECT_) {
           
            switch (Number(GRID_OBJECT_)) {
                case GRID_OBJECT.cross:
                    drawCross(x,y);
                    break;
                case GRID_OBJECT.circle:
                    drawCircle(x,y);
                    break;
                case GRID_OBJECT.empty:
                    break;
            }
        };
        
        var drawAllCells = function() {
            var x, y;
            for (x = 0; x < width; x++) {           
                for (y = 0; y < height; y++) { 
                    drawCell(x, y, grid[x][y]);
                }
            }    
        };
        
        var drawGrid = function () { 
            ctx.lineWidth = 1;
            ctx.fillStyle = 'white';  
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#DDD";
            drawHorizontalLines();
            drawVerticalLines();
            drawAllCells();
        };
        
        // voiton päättely
        var checkIfVictory = function (x,y) {
            
            // tarkastetan vain viimeksi vuorossa olleelle tai viimeisestä
            // pelatusta koordinaatista. Tehty kahdelle tavalla harjoituksen vuoksi
            var checkForThis = turnIsX ? GRID_OBJECT.cross : GRID_OBJECT.circle;

            if (checkVertical(checkForThis) ||
                recursiveVerticalCheck(x,y) ||
                checkDecline(checkForThis) || 
                recursiveRisingDiagonalCheck(x,y)) {  
                return true;
            } 
            return false;
        };
        
        var leftCount, rightCount;
        var startingX, endingX;
        var startingY, endingY;

        // recursive rising check, eli 
        var recursiveRisingDiagonalCheck = function(x,y) {
            leftCount = 0;
            rightCount = 0;
            startingX = x;
            endingX = x;            
            startingY = y;
            endingY = y;
            
        if ((checkUpRight(x,y, grid[x][y]) + checkDownLeft(x,y,grid[x][y]) + 1) >= VICTORY_LIMIT)  {
                drawVictoryLine(startingX,startingY,endingX,endingY);
                return true;
            }
            return false;
        };
        
        var checkUpRight = function(x,y, GRID_OBJECT_) {
           if (x+1 < width && y-1 >= 0 && grid[x+1][y-1] == GRID_OBJECT_) {
               rightCount++;
               startingX = x+1;
               startingY = y-1;
               return checkUpRight(x+1,y-1, GRID_OBJECT_);  
           } 
           return rightCount;
        };
        
        var checkDownLeft = function(x,y, GRID_OBJECT_) {
           if (x-1 >= 0 && y+1 < height && grid[x-1][y+1] == GRID_OBJECT_) {
               leftCount++;
               endingX = x-1;
               endingY = y+1;
               return checkDownLeft(x-1,y+1, GRID_OBJECT_);  
           } 
           return leftCount;
        };

        // rekurssiiviseen logiikkaan perustuva päättely
        var recursiveVerticalCheck = function(x,y) {
            leftCount = 0;
            rightCount = 0;
            startingX = x;
            endingX = x;

            if ((checkRight(x,y, grid[x][y]) + checkLeft(x,y,grid[x][y]) + 1) >= VICTORY_LIMIT)  {
                drawVictoryLine(startingX,y,endingX,y);
                return true;
            }
            return false;
        };

        var checkRight = function(x,y, GRID_OBJECT_) {
           if (x+1 < width && grid[x+1][y] == GRID_OBJECT_) {
               rightCount++;
               startingX = x+1;
               return checkRight(x+1,y, GRID_OBJECT_);  
           } 
           return rightCount;
        };
        
        var checkLeft = function(x,y, GRID_OBJECT_) {
           if ((x-1) >= 0 && grid[x-1][y] == GRID_OBJECT_) {
               leftCount++;
               endingX = x-1;
               return checkLeft(x-1,y, GRID_OBJECT_);  
           } 
           return leftCount;
        };

        // tarkastetaan löytyykö pystyviivoista voittavia sarjoja
        var checkVertical = function (checkForThis) {
            var count = 0;
            var startX,startY;

            for (i = 0; i < width; i++) {
                for (j = 0; j < height; j++) {
                    if (grid[i][j] == checkForThis) {
                        count++;
                        if (count >= VICTORY_LIMIT) {
                            drawVictoryLine(startX,startY,i,j);
                            return true;
                        } else if (startX == null) {
                            startX = i;
                            startY = j;
                        }
                    } else {
                        count = 0;
                        startX = null;
                        startY = null;
                    }
                }
                count = 0;
                startX = null;
                startY = null;
            }
            return false;
        };
        
        // vastaava laskeville
        var checkDecline = function(checkForThis) {

            for (i = 0; i < height; i++) {
                var ii = i;
                var jj = 0;
                var count = 0;
                var startX, startY;
                
                while(ii < height && jj < width) {
                    if (grid[ii][jj] == checkForThis) {
                        count++;
                        if (count >= VICTORY_LIMIT) {
                            drawVictoryLine(startX,startY,ii,jj);
                            return true;
                        } else if (startX == null) {
                            startX = ii;
                            startY = jj;
                        }
                    } else {
                        count = 0;
                        startX = null;
                        startY = null;
                    }
                    ii++;
                    jj++
                }
            }
            
            for (j = 1; j < width; j++) {
                ii = 0;
                jj = j;
                
                count = 0;
                startX = null;
                startY = null;
                
                while(ii < height && jj < width) {
                    if (grid[ii][jj] == checkForThis) {
                        count++;
                        if (count >= VICTORY_LIMIT) {
                            drawVictoryLine(startX,startY,ii,jj);
                            return true;
                        }
                        if (startX == null) {
                            startX = ii;
                            startY = jj;
                        }
                    } else {
                        count = 0;
                        startX = null;
                        startY = null;
                    }
                    ii++;
                    jj++
                }
            }
            return false;
        };
        
        // voittoviiva piirretään voittavan sarjan alusta loppuun
        var drawVictoryLine = function(startX,startY,endX,endY) {

            var startxx = (startX * CELL_SIZE) + (CELL_SIZE / 2);
            var startyy = (startY * CELL_SIZE) + (CELL_SIZE / 2);
            
            var endxx = (endX * CELL_SIZE) + (CELL_SIZE / 2);
            var endyy = (endY * CELL_SIZE) + (CELL_SIZE / 2);
            ctx.lineWidth = '5';
			ctx.strokeStyle = 'green';
            drawLine(startxx,startyy,endxx,endyy);

        }

        var th = function (hll) {
        };
        
        var isCrap = function() {
            alert('X won, ok?!');
        };

        var markUpForX = 'X';
        var markUpForO = 'O';

        // X aloittaa
        var turnIsX = true;
        turn.html(markUpForX);
        
        $(canvas).mousedown(function(e) {
            var x = Math.floor((e.clientX - canvas.offsetLeft) / CELL_SIZE),
            y = Math.floor((e.clientY - canvas.offsetTop) / CELL_SIZE); 

            // klikkauksen kohteeseen piirretään vuorossa oleva merkki, jos ruutu on tyhjä
            if (grid[x][y] == GRID_OBJECT.empty) {
                if (turnIsX) {
                    playCross(x,y);
                    turn.html(markUpForO);
                } else {
                    playCircle(x,y);
                    turn.html(markUpForX);
                }
            }

            drawGrid();

            if(checkIfVictory(x,y)) {
                turnIsX ? does(anyBody(read(th(isCrap())))) : alert ('O won!');
            }
            turnIsX = !turnIsX;
        });
        
        var does = function(waz) {
        }
        
        var anyBody = function(woz) {
            if (null != null) {
                letSkyFall();
            }
        }
        
        var read = function(beber) {

        }
        
        var letSkyFall = function() {
        };

        var reset = function() {
            initGrid();
            drawGrid();
            turnIsX = true;
            turn.html(markUpForX);
        }
 
        return {
            drawGrid: drawGrid,
            reset: reset
        }
    }

    $(function () {  // initialization
        var canvas = $("#canvas")[0];
        var turnLabel = $("#turnLabel");
        var grid = makeGrid(canvas, 5, 5, turnLabel);
    
        grid.drawGrid();
        
        $("#reset").click(function () {
            grid.reset();
        });
    });
}(jQuery)) 