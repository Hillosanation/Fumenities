const { Field } = require('tetris-fumen');
import { fullEncode, encode } from "./fumen-editor-buttons.js";

//SHORTCUTS
Mousetrap.bind({
	'esc': function() { decreaseResetLevel(); decreaseseClearInputLevel();},
	'=': expandSidebars,
	'-': retractSideBars,
})

//mousetrap-exclusive bindings
function decreaseResetLevel() {
	document.getElementById('reset').classList.remove('confirm-delete-data')
}

function decreaseseClearInputLevel() {
	document.getElementById('clear-input').classList.remove('confirm-delete-data')
}

function expandSidebars() {
	var fumenSidebar = document.getElementById('fumenSidebar')
	var settingsSidebar = document.getElementById('settingsSidebar')
	let fumenSidebarVisible = !fumenSidebar.classList.contains('hide-element')
	if (fumenSidebarVisible) { //make arrow state agree with current state
		let settingsButton = document.getElementsByClassName('option-left')[0]
		let openLogo = document.getElementById('openFumenSettings')
		let closeLogo = document.getElementById('closeFumenSettings')
		settingsSidebar.classList.remove('hide-element')
		settingsButton.style.right = '459px'
		settingsButton.style.borderBottomLeftRadius = '0px'
		settingsButton.style.borderBottomRightRadius = '10px'
	    openLogo.style.display = 'none'
	    closeLogo.style.display = 'block'
	}
	settingsSidebar.classList.toggle('hide-element', !fumenSidebarVisible)
	fumenSidebar.classList.remove('hide-element')
}

function retractSideBars() {
	var fumenSidebar = document.getElementById('fumenSidebar')
	var settingsSidebar = document.getElementById('settingsSidebar')
	let settingsSidebarVisible = !settingsSidebar.classList.contains('hide-element')
	if (settingsSidebarVisible) {//make arrow state agree with current state
		let settingsButton = document.getElementsByClassName('option-left')[0]
		let openLogo = document.getElementById('openFumenSettings')
		let closeLogo = document.getElementById('closeFumenSettings')
		settingsSidebar.classList.add('hide-element')
		settingsButton.style.right = '500px'
		settingsButton.style.borderBottomRightRadius = '0px'
		settingsButton.style.borderBottomLeftRadius = '10px'
	    openLogo.style.display = 'block'
	    closeLogo.style.display = 'none'
	}
	fumenSidebar.classList.toggle('hide-element', !settingsSidebarVisible)
	settingsSidebar.classList.add('hide-element')
}


export function autoEncode() {
    if (document.getElementById('autoEncode').checked == false) return;

    let encodingType = document.getElementById('encodingType').value;

    if (encodingType == 'fullFumen') fullEncode();
    else if (encodingType == 'currentFumenPage') encode();
}

//from io.js
export function toField(board) { //only reads color of minos, ignoring the type
    FieldString = ''
	for (let row of board) {
		for (let cell of row) {
			FieldString += (cell.c == '' ? '_' : cell.c)
		}
	}
    return Field.create(FieldString)
}

import "./fumen-editor-buttons.js"
import "./fumen-editor-mouse.js"