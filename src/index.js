//"load jsfile after html have been loaded": https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event 
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const squares = [];
    let score;
    const startBtn = document.getElementById("playButton");

    const gridWidth = 8;
    const fruitIcons = [
        'url(../public/images/strawb.png)',
        'url(../public/images/pineapple.png)',
        'url(../public/images/orange.png)',
        'url(../public/images/grapes.png)',
        'url(../public/images/pear.png)',
        'url(../public/images/kiwi.png)'
    ];

    //Audio (only in JS, without HTML)
    var startAudio = new Audio('../public/audio/start.mp3');
    var lowScoreAudio = new Audio('../public/audio/3found.mp3');
    var mediumScoreAudio = new Audio('../public/audio/4found.mp3');
    var highScoreAudio = new Audio('../public/audio/5found.mp3');
    var finishAudio = new Audio('../public/audio/finish.mp3');


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
            //(Commented since don't want it to be assigned before play buttonis hit)
            // let randomImage = Math.floor(Math.random() * fruitIcons.length);
            // square.style.backgroundImage = fruitIcons[randomImage];

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

        //valid move if above includes the square we want to replace/move to (not outside grid)
        let validMove = validMoves.includes(replacedSuareId);

        //if id exists & is a valid move >> clear the value of replaced.
        if (replacedSuareId && validMove) {
            replacedSuareId = null;
            scoreDisplay.innerHTML = score -= 5; //each move cost 5 points, enabling strategy
            //but if id exist but not valid move >> give Images back
        } else if (replacedSuareId && !validMove) {
            squares[replacedSuareId].style.backgroundImage = replacedImage;
            squares[draggedSquareId].style.backgroundImage = draggedImage;
        } else squares[draggedSquareId].style.backgroundImage = draggedImage;
    }


    //"move" filled squares downwards & fill first row randomly
    function flowDownFilledSquares() {
        // squares.forEach(item => item.style.backgroundColor = ''); 
        for (i = 0; i < 56; i++) {
            //if any square is empty, "move down" the one above (that is not empty)
            if (squares[i + gridWidth].style.backgroundImage === '') {
                squares[i + gridWidth].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = '';
            }
            //Upper row fix
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7]
            const isFirstRow = firstRow.includes(i)
            if (isFirstRow && (squares[i].style.backgroundImage === '')) {
                let randomImage = Math.floor(Math.random() * fruitIcons.length);
                squares[i].style.backgroundImage = fruitIcons[randomImage];
            }

        }
    }
    // flowDownFilledSquares();


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
                highScoreAudio.play();
                rowOfFive.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    // loopRowsOfFive();


    //check matches of 5 squares column-wise (last check is squares 31/39/47/55/63)
    function loopColsOfFive() {
        for (i = 0; i < 32; i++) {
            let colOfFive = [i, i + gridWidth, i + (gridWidth * 2), i + (gridWidth * 3), i + (gridWidth * 4)];
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot
            if (colOfFive.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                scoreDisplay.innerHTML = score += 25;
                highScoreAudio.play();
                colOfFive.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    // loopColsOfFive();



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
                mediumScoreAudio.play();
                rowOfFour.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    // loopRowsOfFour();


    //check matches of 4 squares column-wise (last check is squares 39/47/55/63)
    function loopColsOfFour() {
        for (i = 0; i < 40; i++) {
            let colOfFour = [i, i + gridWidth, i + (gridWidth * 2), i + (gridWidth * 3)];
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === ''; //if an empty spot
            if (colOfFour.every(item => squares[item].style.backgroundImage === decidedImage && !isBlank)) {
                scoreDisplay.innerHTML = score += 12;
                mediumScoreAudio.play();
                colOfFour.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    // loopColsOfFour();



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
                lowScoreAudio.play();
                rowOfThree.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    // loopRowsOfThree();

    //check matches of 3 column-wise (last possible vertical 3-squares-match is squares 48/55/63)
    function loopColsOfThree() {
        for (i = 0; i < 48; i++) {
            let colOfThree = [i, i + gridWidth, i + (gridWidth * 2)];
            let decidedImage = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === '';
            if (colOfThree.every(item => squares[item].style.backgroundImage === decidedImage) && !isBlank) {
                scoreDisplay.innerHTML = score += 3;
                lowScoreAudio.play(); 
                colOfThree.forEach(item => {
                    squares[item].style.backgroundImage = '';
                });
            }
        }
    }

    // loopColsOfThree();


    ////// starting and timing game //////

    startBtn.onclick = function () {
        startAudio.play(); 
        //run 1 time to hav no 3,4,5-rows at start. 
        loopRowsOfFive();
        loopColsOfFive();
        loopRowsOfFour();
        loopColsOfFour();
        loopRowsOfThree();
        loopColsOfThree();
        flowDownFilledSquares();
        // set score to zero after first points are given. 
        scoreDisplay.innerHTML = score = 0; //starts at 0 points when click start!
        playTime()

    };

    //starting bar progress, and timer; when bar width is full (100), 
    //clear both bar interval and gamePlay function (which runs the game) 
    function playTime() {
        //timing the bar
        const progress = document.getElementById("gameBar");
        let barId = setInterval(frame, 200);
        let timerId = setInterval(gamePlay, 50);

        let width = 0;
        function frame() {
            if (width == 100) {
                clearInterval(barId);
            } else {
                width++;
                progress.style.width = width + '%';
            }
        }

        //timig the game, stops slight before bar reach end
        function gamePlay() {
            if (width == 99) {
                clearInterval(timerId);
                //this is just optional ending animation etc: 
                squares.forEach(item => item.style.backgroundColor = '#91e92d');
                squares.forEach(item => item.style.backgroundImage = '');
                document.getElementById("grid-shake").classList.add("gridShaking", "gridBack");
                document.getElementById("board-increase").classList.add("board-increase");
                finishAudio.play();               
                //refreshing the page: document.location.href = ''; after 5 sec. 
                setTimeout(function(){ document.location.href = ''; }, 5000);
            } else {
                loopRowsOfFive();
                loopColsOfFive();
                loopRowsOfFour();
                loopColsOfFour();
                loopRowsOfThree();
                loopColsOfThree();
                flowDownFilledSquares();
            }
        }
    }


});



