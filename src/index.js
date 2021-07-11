//"load jsfile after html have been loaded": https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event 
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const squares = [];
    let score;

    const gridWidth = 8;
    const fruitIcons = [
        'url(../public/images/strawb.png)',
        'url(../public/images/pineapple.png)',
        'url(../public/images/orange.png)',
        'url(../public/images/grapes.png)',
        'url(../public/images/pear.png)',
        'url(../public/images/kiwi.png)'
    ];


    //create board and its squares 
    //(styles.css defines number of possible squares in .grid)
    function board() {
    for (let i = 0; i < gridWidth * gridWidth; i++) {
        //create div for every loop
        const square = document.createElement('div');
        //make each square draggable,and assign it an id
        square.setAttribute('draggable', true);
        square.setAttribute('id', i);

        //assigning a random fruit-Image (0-5) for each square
        let randomImage = Math.floor(Math.random() * fruitIcons.length);
        square.style.backgroundImage = fruitIcons[randomImage];

        grid.appendChild(square);
        squares.push(square);
    }
    scoreDisplay.innerHTML = score = 0;
    }

    board();


    let draggedImage;
    let replacedImage;
    let draggedSquareId;
    let replacedSuareId;

    //drag event: https://www.w3schools.com/jsref/event_ondrag.asp 
    //add an eventlistener for each drag operation, for each related function
    squares.forEach(square => square.addEventListener('dragstart', dragStart));
    squares.forEach(square => square.addEventListener('dragover', dragOver));
    squares.forEach(square => square.addEventListener('dragenter', dragEnter));
    squares.forEach(square => square.addEventListener('drageleave', dragLeave));
    squares.forEach(square => square.addEventListener('drop', dragDrop));
    squares.forEach(square => square.addEventListener('dragend', dragEnd));


    function dragStart() {
        draggedImage = this.style.backgroundImage;
        draggedSquareId = parseInt(this.id);
    }

    function dragOver(event) {
        event.preventDefault();
    }


    function dragEnter(event) {
        event.preventDefault();
    }

    function dragLeave() {
        this.style.backgroundImage = '';
    }

    function dragDrop() {
        replacedSuareId = parseInt(this.id);
        //Swapping Images between dragged and replaced squares
        replacedImage = this.style.backgroundImage;
        this.style.backgroundImage = draggedImage;
        squares[draggedSquareId].style.backgroundImage = replacedImage;
    }

    function dragEnd() {
        //valid moves: 
        //one step to left (-1), one up (-8 lands in the square above), 
        //one to right (+1), & one step down (+8 lands in the square below), 
        //and one step up-left, up-right, down-left, down-right. 
        let validMoves = [
            draggedSquareId - 1,
            draggedSquareId - gridWidth,
            draggedSquareId - (gridWidth - 1),
            draggedSquareId - (gridWidth + 1),
            draggedSquareId + 1,
            draggedSquareId + gridWidth,
            draggedSquareId + (gridWidth - 1),
            draggedSquareId + (gridWidth + 1),
        ];

        //valid move if above includes the square we want to repla/move to
        let validMove = validMoves.includes(replacedSuareId);

        //if id exists & is a valid move >> clear the value of replaced & minus points.
        if (replacedSuareId && validMove) {
            replacedSuareId = null;
            scoreDisplay.innerHTML = score -= 5;
            //but if id exist but not valid move >> give Images back
        } else if (replacedSuareId && !validMove) {
            squares[replacedSuareId].style.backgroundImage = replacedImage;
            squares[draggedSquareId].style.backgroundImage = draggedImage;
            //otherwise (if outside grid) let dragged square keep Image/place.
        } else squares[draggedSquareId].style.backgroundImage = draggedImage;
    }


    //"move" filled squares downwards & fill first row randomly
    function flowDownFilledSquares() {
        for (i = 0; i < 56; i++) {
            //if any square is empty, "move down" the one above (that is not empty)
            if (squares[i + gridWidth].style.backgroundImage === '') {
                squares[i + gridWidth].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = '';
            } else if (squares[i].style.backgroundImage === '') {
                let randomImage = Math.floor(Math.random() * fruitIcons.length);
                squares[i].style.backgroundImage = fruitIcons[randomImage];
            }
        }
    }


    //check matches of 5 squares in a row (last check is squares 59-63)
    function loopRowsOfFive() {
        for (i = 0; i < 60; i++) {
            //arrays for each 4-square possibility row-wise
            let rowOfFive = [i, i + 1, i + 2, i + 3, i + 4];
            //set Image for the first square in each 4-square-row
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot

            //to avoid matches covering 5 squares in two rows
            const notValid = [4, 5, 6, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31, 36, 37, 38, 39, 44, 45, 46, 47, 52, 53, 54, 55];
            if (notValid.includes(i)) continue;

            //if every rowOfFive-item equals decideImage (i.e. first square's Image) & is not blank...
            if (rowOfFive.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                //if found rowOfFive-match, increment score & give each square empty background
                scoreDisplay.innerHTML = score += 25;
                rowOfFive.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    loopRowsOfFive()


    //check matches of 5 squares column-wise (last check is squares 31/39/47/55/63)
    function loopColsOfFive() {
        for (i = 0; i < 32; i++) {
            let colOfFive = [i, i + gridWidth, i + (gridWidth * 2), i + (gridWidth * 3), i + (gridWidth * 4)];
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot
            if (colOfFive.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                scoreDisplay.innerHTML = score += 25;
                colOfFive.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    loopColsOfFive()



    //check matches of 4 squares in a row (last check is squares 60-63)
    function loopRowsOfFour() {
        for (i = 0; i < 61; i++) {
            //arrays for each 4-square possibility row-wise
            let rowOfFour = [i, i + 1, i + 2, i + 3];
            //set Image for the first square in each 4-square-row
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot

            //to avoid matches covering 4 squares in two rows
            const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55];
            if (notValid.includes(i)) continue;

            //if every rowOfFour-item equals decideImage (i.e. first square's Image) & is not blank...
            if (rowOfFour.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                //if found rowOfFour-match, increment score & give each square empty background
                scoreDisplay.innerHTML = score += 12;
                rowOfFour.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    loopRowsOfFour()


    //check matches of 4 squares column-wise (last check is squares 39/47/55/63)
    function loopColsOfFour() {
        for (i = 0; i < 40; i++) {
            let colOfFour = [i, i + gridWidth, i + (gridWidth * 2), i + (gridWidth * 3)];
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot
            if (colOfFour.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                scoreDisplay.innerHTML = score += 12;
                colOfFour.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    loopColsOfFour()



    //check matches of 3 in a row (last possible 3-squares-match is at 61-63)
    function loopRowsOfThree() {
        for (i = 0; i < 62; i++) {
            //arrays for each 3-square possibility row-wise
            let rowOfThree = [i, i + 1, i + 2];
            //set Image for the first square in each 3-square-row
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot

            //to avoid matches covering 3 squares in two rows
            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55];
            if (notValid.includes(i)) continue;


            //if every rowOfThree-item equals decideImage (i.e. first square's Image) & is not blank...
            //(every() vs map(): https://stackoverflow.com/questions/7340893/what-is-the-difference-between-map-every-and-foreach ) 
            if (rowOfThree.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                //if found rowOfThree-match, increment scores & give each square empty background
                scoreDisplay.innerHTML = score += 3;
                rowOfThree.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    loopRowsOfThree();

    //check matches of 3 column-wise (last possible vertical 3-squares-match is squares 48/55/63)
    function loopColsOfThree() {
        for (i = 0; i < 48; i++) {
            let colOfThree = [i, i + gridWidth, i + (gridWidth * 2)];
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === '';
            if (colOfThree.every(item => squares[item].style.backgroundImage === decidedImage) && !isBlank) {
                scoreDisplay.innerHTML = score += 3;
                colOfThree.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    loopColsOfThree()


        ///How often to invoke function, in milliseconds - and in what order (higher scores/points first)
        window.setInterval(function () {
            flowDownFilledSquares()
            loopRowsOfFive()
            loopColsOfFive()
            loopRowsOfFour()
            loopColsOfFour()
            loopRowsOfThree()
            loopColsOfThree()
        }, 50)






    //Temporarrybar (although without any relation to start and stop the game,YET!)

    document.getElementById("playButton").onclick = function () { play() };

    function play() {

        var progress = document.getElementById("gameBar");
        var width = 0;
        var id = setInterval(frame, 500);
        function frame() {
            if (width == 100) {
                clearInterval(id);
                playValid = false;
            } else {
                width++;
                progress.style.width = width + '%';
            }
        }
    }







});

/////testing branch fruitfulSecond


