import { pageToBoard, renderBoardOnCanvas, getFumenMaxHeight } from "./board-render.js"
import { GIFEncoder as gifenc, quantize, applyPalette } from 'https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js';

function draw(fumenPage, numrows) {
	var tileSize = Math.max(document.getElementById('cellSize').valueAsNumber)
	let fillStyle = (document.getElementById('transparency').checked ? '#00000000': document.getElementById('bg').value)
	
	let gridColor = document.getElementById('gridColor').value
	let strokeStyle = (document.getElementById('gridToggle').checked ? gridColor : '#00000000')
	
	var combinedBoardStats = {
		board: pageToBoard(fumenPage), 
		tileSize: tileSize, 
		style: 'four', 
		lockFlag: document.getElementById('highlightLineClear').checked && (fumenPage.flags.lock ?? false),
		grid: {
			fillStyle: fillStyle, //turn to BGColor
			strokeStyle: strokeStyle, //turn to gridColor
		},
	}
	
	
	var numcols = document.getElementById('width').valueAsNumber;
	const width = numcols * tileSize;
	const height = Math.min(20, numrows) * tileSize;

	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const canvasContext = canvas.getContext('2d');
	canvasContext.imageSmoothingEnabled = false // no anti-aliasing
	canvasContext.drawImage(renderBoardOnCanvas(combinedBoardStats), 0, -20*tileSize + height)
	
	//add surrounding border
	canvasContext.strokeStyle = strokeStyle
	canvasContext.strokeRect(0.5, 0.5, canvas.width-1, canvas.height-1)
	
	return canvas
}

function drawFumens(fumenPages, start, end) {
	if (end == undefined) {
		end = fumenPages.length;
	}

	var drawnFumenPages = fumenPages.slice(start, end)
	
	var numrows = getFumenMaxHeight(...drawnFumenPages) + 1 //extra empty row on top for drawing highlight

	var canvases = drawnFumenPages.map(fumenPage => draw(fumenPage, numrows))

	return canvases
}

function GenerateFourGIF(canvases) {
	let transparent = document.getElementById('transparency').checked
	let delay = parseFloat(document.getElementById('delay').value)
	const gif = new gifenc();
	canvases.forEach(canvas => {
		const { data, width, height } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
		const palette = quantize(data, 256, {format: 'rgba4444'});
		const index = applyPalette(data, palette, {format: 'rgba4444'});
		gif.writeFrame(index, width, height, { palette, transparent, delay }); //assumes that the first element in palette is [0,0,0,0].
	})
	gif.finish();
	return gif;
}

var start = 0;
var end = undefined;

function GIFDataURL(gif) {
	let bytes = gif.stream.bytes()
	return 'data:image/gif;base64,' + base64js.fromByteArray(bytes);
}

export default function fumencanvas(fumens) {
	var container = document.getElementById('imageOutputs');
	var resultURLs = [];
	let startTime = performance.now()

	for (let fumen of fumens) {
		let startTime = performance.now()
		if (fumen.length == 1) {
			let canvas = drawFumens(fumen, 0, undefined)[0]
			var data_url = canvas.toDataURL("image/png")
		} else if (fumen.length >= 2) {
			let canvases = drawFumens(fumen, start, end);
			var data_url = GIFDataURL(GenerateFourGIF(canvases));
		}
		
		var img = new Image();
		img.classList.add('imageOutput', 'fourImageOutput');
		img.src = data_url;
		
		var figure = document.createElement('figure');
		figure.appendChild(img);
		
		if (document.getElementById('displayMode').checked) {
			var textBox = document.createElement('textarea')
			textBox.value = fumen[0]['comment']; // only displays comment of first page, unless I find some way to loop text
			textBox.classList.add('commentDisplay');
			
			var commentBox = document.createElement('figcaption');
			commentBox.style = "width:100%"
			commentBox.appendChild(textBox);
			
			figure.appendChild(commentBox);
		};
		
		container.appendChild(figure);
		resultURLs.push(data_url);
		console.log("Rendered in " + String(performance.now() - startTime) + "ms")
	}
	console.log("Finished in " + String(performance.now() - startTime) + "ms")

	return resultURLs
}

