//'use strict' ? (SyntaxError: Octal literals are not allowed in strict mode. (at mine-sweeper.js:20:13))
var gBoard

var gGame = {
    isReady: true,
    isOn: false,
    isHint: false,
    livesLeft: 3,
    hintsLeft: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gLevel = {
    size: 4,
    mines: 2
}
const MINE = '&#128163'
const FLAG = '&#128681'
const LIFE = `&#x1f9b6`
const HINT = '&#127992'
const SMILY = '&#128512'
const SMILY_DEFEAT = '&#128542'
const SMILY_WIN = '&#128526'
var gMinesPlace = 2

var audioClear = new Audio('audio/panui.wav')
var audioMine = new Audio('audio/mokesh.wav')
var audioFlag = new Audio('audio/degel.wav')
var audioWin = new Audio('audio/nitsahon.wav')
var audioLoss = new Audio('audio/met.wav')

var gSeconds = 00;
var gTens = 00;
var elTens = document.querySelector('.tens')
var elSeconds = document.querySelector('.seconds')
var gInterval;
var gStartTime
var gEndTime
var gBestTime = localStorage.getItem('bestTime')
var elBestTime = document.querySelector('.best-time span')
elBestTime.innerHTML = gBestTime

function initGame() {
    gGame.isReady = true
    gGame.isOn = false
    gGame.livesLeft = 3
    gGame.hintsLeft = 3
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isHint = false
    gMinesPlace = gLevel.mines
    gBoard = buildBoard()
    renderBoard(gBoard)
    resetClock()
    renderLife()
    renderHint()
    document.querySelector('.hint-btn').disabled = false
    document.querySelector('.smile').innerHTML = SMILY
    document.querySelector('.board').classList.remove('hint-mode')
    console.table(gBoard);
}
function setLevel(level, mines, elBtn) {
    gLevel.size = Math.sqrt(level)
    gLevel.mines = mines
    gMinesPlace = mines
    var elBtns = document.querySelectorAll('.diff-btn')
    for (var i = 0; i < elBtns.length; i++) {
        if (elBtns[i].classList.contains('active-btn')) {
            elBtns[i].classList.remove('active-btn')
        }
    }
    elBtn.classList.add('active-btn')
    initGame()
}

function upDateBestTime() {
    if (gGame.secsPassed > gBestTime && gBestTime !== null) return
    localStorage.setItem('bestTime', gGame.secsPassed)
    gBestTime = localStorage.getItem('bestTime')
    elBestTime = document.querySelector('.best-time span')
    elBestTime.innerHTML = gBestTime
}

function toggleHint() {
    gGame.isHint = !gGame.isHint
    if (gGame.isHint) document.querySelector('.board').classList.add('hint-mode')
    if (!gGame.isHint) document.querySelector('.board').classList.remove('hint-mode')

}

function showHint(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var currCell = gBoard[i][j]
            if (currCell.isShown) continue
            if (!currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                renderBoard(gBoard)
                hideHint(currCell)

            }
        }
    }
}

function hideHint(cell) {
    setTimeout(() => {
        cell.isShown = false
        renderBoard(gBoard)
    }, "1000")
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function placeMines(board) {
    while (gMinesPlace > 0) {
        var currMineCell = board[getRandomInt(0, gLevel.size)][getRandomInt(0, gLevel.size)]
        if (!currMineCell.isMine && !currMineCell.isShown) {
            currMineCell.isMine = true
            gMinesPlace--
        }
    }
    uptateMinesAroundCount(board)
}

function uptateMinesAroundCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            currCell.minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesNegsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMine) minesNegsCount++
        }
    }
    return minesNegsCount
}

function renderLife() {
    var elLife = document.querySelector('.life span')
    elLife.innerHTML = ''
    for (var i = 0; i < gGame.livesLeft; i++) {
        elLife.innerHTML += LIFE
    }
}

function renderHint() {
    var elHint = document.querySelector('.hint span')
    elHint.innerHTML = ''
    for (var i = 0; i < gGame.hintsLeft; i++) {
        elHint.innerHTML += HINT
    }
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isShown && !currCell.isMine) {
                var cell = setMinesNegsCount(board, i, j)
                if (cell === 0) cell = ''
                var className = 'show'
            } else {
                cell = ''
                className = ''
            }
            if (currCell.isShown && currCell.isMine) {
                cell = MINE
                className = 'mine'
            }

            if (currCell.isMarked) {
                cell = FLAG
                className = 'flag'
            }
            strHTML += `<td class="cell ${className}"
            data-i="${i}" data-j="${j}"
            onclick="onCellClicked(this,${i},${j})" ondblclick="onDoubleClick(this,${i},${j})" oncontextmenu="onCellRightClicked(this,${i},${j})">${cell}
            </td>`
        }
        strHTML += `</tr>`
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function expandShown(board, elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked && !currCell.isMine) {
                currCell.isShown = true
                gGame.shownCount++

                if (currCell.minesAroundCount === 0 && gGame.isOn) { // except first click
                    expandShown(board, currCell, i, j)
                }

            }
        }
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isReady) return
    var clickedCell = gBoard[i][j]
    if (clickedCell.isMarked || clickedCell.isShown) return

    if (gGame.isHint) {
        showHint(i, j)
        gGame.hintsLeft--
        renderHint()
        toggleHint()
        if (!gGame.hintsLeft) document.querySelector('.hint-btn').disabled = true
        return
    }
    if (clickedCell.isMine) {
        console.log(clickedCell);
        gGame.livesLeft--
        audioMine.play()
        renderLife()
        checkDefeat()
        return
    }
    if (clickedCell.minesAroundCount === 0) {
        audioClear.play()
        var i = +elCell.dataset.i
        var j = +elCell.dataset.j
        expandShown(gBoard, elCell, i, j)
    } else {
        audioClear.play()
        clickedCell.isShown = true
        gGame.shownCount++
    }

    if (!gGame.isOn) {
        gStartTime = Date.now()
        placeMines(gBoard)
        gGame.isOn = true
        runClock()
    }

    checkWin()
    renderBoard(gBoard)
}

function onCellRightClicked(elCell, i, j) {
    document.addEventListener('contextmenu',
        event => event.preventDefault());
    if (!gGame.isReady || !gGame.isOn) return
    runClock()
    gGame.isOn = true
    var clickedCell = gBoard[i][j]
    if (clickedCell.isShown) return
    if (!clickedCell.isMarked) {
        clickedCell.isMarked = true
        gGame.markedCount++
    } else {
        clickedCell.isMarked = false
        gGame.markedCount--
    }
    audioFlag.play()
    checkWin()
    renderBoard(gBoard)
}

function onDoubleClick(elCell, i, j) {
    // if (!gGame.isReady) return
    // var clickedCell = gBoard[i][j]
    // if (!clickedCell.isShown) return
    alert('sssss')
}

function defeat() {
    audioLoss.play()
    gGame.isOn = false
    gGame.isReady = false
    stopClock()
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) currCell.isShown = true
        }
    }
    var elDefeat = document.querySelector('.smile')
    elDefeat.innerHTML = SMILY_DEFEAT
    // alert('defeat')
    renderBoard(gBoard)
}

function checkDefeat() {
    if (gGame.livesLeft) return
    defeat()

}

function checkWin() {
    if (gGame.shownCount === (gLevel.size * gLevel.size) - gLevel.mines &&
        gGame.markedCount === gLevel.mines) {
        gGame.isOn = false
        gGame.isReady = false
        audioWin.play()
        stopClock()
        var elWin = document.querySelector('.smile')
        elWin.innerHTML = SMILY_WIN
        gEndTime = Date.now()
        gGame.secsPassed = (gEndTime - gStartTime) / 1000
        gGame.secsPassed = Math.round(gGame.secsPassed * 100) / 100
        upDateBestTime()
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function runClock() {
    clearInterval(gInterval);
    gInterval = setInterval(startTimer, 10);
}

function stopClock() {
    clearInterval(gInterval);
}

function resetClock() {
    clearInterval(gInterval);
    gTens = '00';
    gSeconds = '00';
    elTens.innerHTML = gTens;
    elSeconds.innerHTML = gSeconds;
}

function startTimer() {
    gTens++
    if (gTens <= 9) {
        elTens.innerHTML = '0' + gTens;
    }
    if (gTens > 9) {
        elTens.innerHTML = gTens;
    }
    if (gTens > 99) {
        gSeconds++;
        elSeconds.innerHTML = '0' + gSeconds;
        gTens = 0;
        elTens.innerHTML = '00' + 0;
    }
    if (gSeconds > 9) {
        elSeconds.innerHTML = gSeconds;
    }
}


