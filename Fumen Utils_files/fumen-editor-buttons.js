import { getDelimiter, shape_table } from "./global-utils.js"
import { updateBook } from "./event-listeners.js";
import { autoEncode, toField } from "./fumen-editor.js";

//INITIALIZATION
updateToolTips()
updateMinoMode()

//SHORTCUTS
Mousetrap.bind({
    '1': function() {setPaintBucket(0)},
	'2': function() {setPaintBucket(1)},
	'3': function() {setPaintBucket(2)},
	'4': function() {setPaintBucket(3)},
	'5': function() {setPaintBucket(4)},
	'6': function() {setPaintBucket(5)},
	'7': function() {setPaintBucket(6)},
	'8': function() {setPaintBucket(7)},
	'0': toggleMinoMode,
	
	'left': prevPage,
	'mod+left': startPage,
	'right': nextPage,
	'mod+right': endPage,
	
	'shift+up': function() {shift('up')},
	'shift+down': function() {shift('down')},
	'shift+left': function() {shift('left')},
	'shift+right': function() {shift('right')},
	
	'M p': mirror,
	'M f': fullMirror,
	'D p': dupliPage,
	'alt+backspace': clearPage,
	'del': deletePage,
	'r': increaseResetLevel,
	
	// Import image already binded to paste
	'ins': decodeInsert,
	'E p': encode,
	'I f': fullDecode,
	'E f': fullEncode,
	'+': addToInput,

	'A e': toggleAutoEncoding,
	
	'l': toggleLock,
	'A c': toggleAutoColor,
	'R f': toggleRowFillInput,
	
	'T t': toggleToolTips,
	'# d': toggle3dSetting,
	'U d': toggleStyle,
	
	'mod+z': undo,
	'mod+y': redo,
})

//mousetrap-exclusive bindings
function setPaintBucket(index) {
	document.paintbucket[index].checked = true;
}

function toggleMinoMode() {
    document.getElementById('minoModeInput').checked = !document.getElementById('minoModeInput').checked
	updateMinoMode()
}

function toggleAutoEncoding() {
	document.getElementById('autoEncode').checked = !document.getElementById('autoEncode').checked
	updateAutoEncoding()
}

function toggleLock() {
	document.getElementById('lockFlagInput').checked = !document.getElementById('lockFlagInput').checked
	updateBook()
}

function toggleAutoColor() {
	document.getElementById('autoColorInput').checked = !document.getElementById('autoColorInput').checked
	updateAutoColor()
}

function toggleRowFillInput() {
	document.getElementById('rowFillInput').checked = !document.getElementById('rowFillInput').checked
	updateRowFillInput()
}

function updateRowFillInput() {
	var isRowFillUsable = !document.getElementById('minoModeInput').checked && !document.getElementById('autoColorInput').checked
	document.getElementById('rowFillInput').classList.toggle('disabled', !isRowFillUsable)
}

function toggleToolTips() {
	document.getElementById('tooltipSetting').checked = !document.getElementById('tooltipSetting').checked
	updateToolTips() 
}

function toggle3dSetting() {
	document.getElementById('3dSetting').checked = !document.getElementById('3dSetting').checked
	requestAnimationFrame(renderBoard)
}

function toggleStyle() {
	document.getElementById('defaultRenderInput').checked = !document.getElementById('defaultRenderInput').checked
	updateStyle()
}

//cosmetic bindings
for (let fumenOption in document.getElementsByClassName('fumen-option')) {
	fumenOption.addEventListener("click", () => this.blur)
}

//html bindings
document.getElementById("minoModeInput").addEventListener("click", updateMinoMode)
function updateMinoMode() {
    let minoMode = document.getElementById('minoModeInput').checked
    if (!minoMode && operation == undefined)  {
		minoModeBoard = JSON.parse(JSON.stringify(emptyBoard))
		operation = undefined
		updateBook()
	}
	updateAutoColor()
}

document.getElementById("prevPage").addEventListener("click", prevPage)
function prevPage() {
	bookPos = getCurrentPosition()
	solidifyAutoColor(bookPos)
	settoPage(bookPos-1)
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}

document.getElementById("startPage").addEventListener("click", startPage)
function startPage(){
	bookPos = 0
	settoPage(bookPos)
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}

document.getElementById("currentPage").addEventListener("change", gotoPage)
function gotoPage() {
	solidifyAutoColor(bookPos) //relying on global to solidify the page before we leave it
	//TODO: something like this? https://stackoverflow.com/questions/1909992/how-to-get-old-value-with-onchange-event-in-text-box
	// check for numeric input and within bounds
	bookPos = getCurrentPosition()
	if(isNaN(bookPos)){
		bookPos = 0
	}
	bookPos = Math.max(Math.min(book.length, bookPos), 0)
	
	settoPage(bookPos)
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}

document.getElementById("nextPage").addEventListener("click", nextPage)
function nextPage() {
	bookPos = getCurrentPosition()

	if (bookPos == book.length-1) { // Create new page when at the page
		solidifyAutoColor(bookPos)
		insertFollowingPage(bookPos)
	}

	bookPos += 1 // next page
	settoPage(bookPos)
	window.requestAnimationFrame(renderBoard)
	updateBook()
	autoEncode()
}

document.getElementById("endPage").addEventListener("click", endPage)
function endPage(){
	settoPage(book.length-1)
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}


document.getElementById("shiftLeft").addEventListener("click", function() {shift('left')} )
document.getElementById("shiftUp").addEventListener("click", function() {shift('up')} )
document.getElementById("shiftDown").addEventListener("click", function() {shift('down')} )
document.getElementById("shiftRight").addEventListener("click", function() {shift('right')} )
function shift(direction){
	switch(direction) {
		case 'left':		
				board.map((y) => {
					y.shift()
					y.push({t: 0, c: ''})
				})
			break;
		case 'up':
				board.shift()
				board.push(JSON.parse(JSON.stringify(aRow)))
			break;
		case 'down':
				board.unshift(JSON.parse(JSON.stringify(aRow)))
				board.pop()
			break;
		case 'right':
				board.map((y) => {
					y.unshift({t: 0, c: ''})
					y.pop()
				})
			break;
	}
	updateBook()
}


const reversed = {Z: 'S',L: 'J',O: 'O',S: 'Z',I: 'I',J: 'L',T: 'T',X: 'X'};
document.getElementById("mirrorPage").addEventListener("click", mirror)
function mirror() {
	for (row = 0; row < board.length; row++) {
		board[row].reverse();
		for (i = 0; i < board[row].length; i++) {
			if (board[row][i].t == 1) board[row][i].c = reversed[board[row][i].c];
		}
	}
	updateBook();
	window.requestAnimationFrame(renderBoard);
}

document.getElementById("mirrorFumen").addEventListener("click", fullMirror)
function fullMirror() {
	for (let page in book) {
		var tempBoard = JSON.parse(book[page]['board']);
		for (let row in tempBoard) {
			tempBoard[row].reverse();
			for (let col in tempBoard[row]) {
				if (tempBoard[row][col].t == 1) tempBoard[row][col].c = reversed[tempBoard[row][col].c];
			}
		}
		book[page]['board'] = JSON.stringify(tempBoard);
	}
	board = tempBoard;
	updateBook();
	window.requestAnimationFrame(renderBoard);
}

document.getElementById("duplicatePage").addEventListener("click", dupliPage)
function dupliPage(){
	bookPos = getCurrentPosition()
	solidifyAutoColor(bookPos)
	insertFollowingPage(bookPos)
	//technically you don't need to update since it's the same page
	settoPage(bookPos)
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}

document.getElementById("clearPage").addEventListener("click", clearPage)
function clearPage(){
	bookPos = getCurrentPosition()
	book[bookPos] = {
		board: JSON.stringify(emptyBoard),
		minoBoard: JSON.stringify(emptyBoard),
		comment: '',
		operation: undefined,
		flags: flags
	}
	settoPage(bookPos)
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}

document.getElementById("deletePage").addEventListener("click", deletePage)
function deletePage(){
	bookPos = getCurrentPosition()
	if(book.length == 1){
		clearPage()
	} else {
		book.splice(bookPos,1)
		bookPos = Math.min(bookPos,book.length-1) // Bound bookPos to end of book
		settoPage(bookPos)
	}
	window.requestAnimationFrame(renderBoard)
	autoEncode()
}

document.getElementById("reset").addEventListener("click", increaseResetLevel)
function increaseResetLevel() {
	let confirmedReset = document.getElementById('reset').classList.contains('confirm-delete-data')
	if (confirmedReset)  {
		board = JSON.parse(JSON.stringify(emptyBoard))
		minoModeBoard = JSON.parse(JSON.stringify(emptyBoard))
		book = [{board: JSON.parse(JSON.stringify(emptyBoard)), flags: flags}]
		setPositionDisplay(0, book.length)
		document.getElementById('boardOutput').value = ''
		document.getElementById('commentBox').value = ''
		comments = []
		updateBook() // record initial state in logs, testing
		autoEncode()
		window.requestAnimationFrame(renderBoard)
	}
	document.getElementById('reset').classList.toggle('confirm-delete-data')
}



function decodeFumen() {
	var fumen = document.getElementById('boardOutput').value;
    var pages = decoder.decode(fumen);
    var tempBook = pages.map(page => {
		return {
			board: JSON.stringify(pageToBoard(page)),
			operation: page['operation'],
			minoBoard: JSON.stringify(decodeOperation(page['operation'])),
			comment: page['comment'],
			flags: page['flags'],
		}
	});
	
	return tempBook;

    function decodeOperation(operation){
        if (operation === undefined) return JSON.parse(JSON.stringify(emptyBoard)) //no operation
    
        decodedMinoBoard = JSON.parse(JSON.stringify(emptyBoard))
        let pieceColor = operation.type
        let rotation = operation.rotation
        let x = operation.x
        let y = 19 - operation.y //fumen has inverted y axis
        
        piecePositions = shape_table[pieceColor][rotation]
        for (let piecePosition of piecePositions) {
            decodedMinoBoard[y + piecePosition[0]][x + piecePosition[1]] = { t: 1, c: pieceColor }
        }
        
        return decodedMinoBoard
    }
}

document.getElementById("insertFumen").addEventListener("click", decodeInsert)
function decodeInsert() {
    bookPos = getCurrentPosition()
	var bookInsert = decodeFumen()
	book.splice(bookPos, 0, ...bookInsert)
	settoPage(bookPos)
	updateBook()
	window.requestAnimationFrame(renderBoard)
};

document.getElementById("importFumen").addEventListener("click", fullDecode)
function fullDecode() {
	book = decodeFumen();
	bookPos = 0;
	settoPage(bookPos)
	window.requestAnimationFrame(renderBoard);
};

function encodeFumen(...book) {
	var fullBook = []
	for (let pageNum in book) {
		let page = book[pageNum]
		fullBook.push({
			comment: page['comment'],
			operation: page['operation'],
			field: toField(JSON.parse(page['board'])),
			flags: {
				rise: false,
				mirror: false,
				colorize: true,
				comment: page['comment'],
				lock: page['flags']['lock'],
				piece: undefined,
			},
			index: pageNum, //necessary?
		});
	}
	return encoder.encode(fullBook)
}

document.getElementById("exportPage").addEventListener("click", encode)
export function encode() {
	bookPos = getCurrentPosition()
	document.getElementById('boardOutput').value = encodeFumen(book[bookPos]);
}

document.getElementById("exportFumen").addEventListener("click", fullEncode)
export function fullEncode() {
	document.getElementById('boardOutput').value = encodeFumen(...book);
}

document.getElementById("addToInput").addEventListener("click", addToInput)
function addToInput() {
	document.getElementById('input').value += getDelimiter() + document.getElementById('boardOutput').value
}


document.getElementById("encodingType").addEventListener("change", autoEncode) //TODO: bind elements to autoencode, instead of calling from the function
document.getElementById("autoEncode").addEventListener("click", updateAutoEncoding)
function updateAutoEncoding() {
	var boardOutput = document.getElementById('boardOutput')
	var isAutoEncode = document.getElementById('autoEncode').checked
	document.getElementById('autoEncodeOptions').classList.toggle('hide-element', !isAutoEncode)
	if (isAutoEncode) {
		boardOutput.style.height = 50
		autoEncode()
	} else {
		boardOutput.style.height = 79
	}
}


document.getElementById("autoColorInput").addEventListener("click", updateAutoColor)
export function updateAutoColor() {
	var autoColorBool = document.getElementById('autoColorInput').checked
	var isAutoColorUsable = !document.getElementById('minoModeInput').checked
	document.getElementById('autoColorInput').classList.toggle('disabled', !isAutoColorUsable)
	updateRowFillInput()
	if(!(isAutoColorUsable && autoColorBool)) {
		for (let row in board) {
			for (let col in board[row]) {
				if (board[row][col].t === 2){
					board[row][col].t = 1 //solidify any minos
				}
			}
		}
	}
}

document.getElementById("tooltipSetting").addEventListener("click", updateToolTips)
function updateToolTips() {
	var tooltipTextElements = document.getElementsByClassName('tooltiptext')
	var enableToolTips = document.getElementById('tooltipSetting').checked
	for (let tooltipTextElement of tooltipTextElements) {
		tooltipTextElement.classList.toggle('hide-element', !enableToolTips)
	}
}

document.getElementById("defaultRenderInput").addEventListener("click", updateStyle)
function updateStyle() {
	document.getElementById('3dToggle').classList.toggle('disabled', document.getElementById('defaultRenderInput').checked)
	requestAnimationFrame(renderBoard)
}


document.getElementById("undo").addEventListener("click", undo)
function undo() {
	bookPos = getCurrentPosition()
	if (undoLog.length <= 1){
		console.log('No previous actions logged')
	} else {
		redoLog.push(undoLog.pop())
		book = JSON.parse(undoLog[undoLog.length-1])
		// console.log(bookPos, book.length-1)
		bookPos = Math.min(bookPos, book.length-1) // Bound bookPos to end of book, temporary measure
		
		settoPage(bookPos)
	}
	window.requestAnimationFrame(renderBoard)
}

document.getElementById("redo").addEventListener("click", redo)
function redo() {
	bookPos = getCurrentPosition()
	if (redoLog.length == 0){
		console.log('No following actions logged')
	} else {
		undoLog.push(redoLog.pop())
		book = JSON.parse(undoLog[undoLog.length-1])
		settoPage(bookPos)
	}
	window.requestAnimationFrame(renderBoard)
}