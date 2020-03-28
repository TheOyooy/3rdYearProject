const electron = require('electron');
const fs = require('fs');
var path = require('path');


const {ipcRenderer} = electron;

var programText;

window.onload = loadText();

function loadText(){
	var p = path.join(__dirname, '..', 'text example.txt');
	var programText = "blank";
	var programText = fs.readFile('/home/patrick/textexample.txt', 'utf-8', (err, data) => {
		if(err){
			alert("An error ocurred reading the file :" + err.message);
			return;
		}

		// Change how to handle the file content
		console.log("The file content is : " + data);
		programText = data.toString();
		document.getElementById('ProgramText').innerHTML = programText;
	});
};

$( document ).ready(function(){
    $('#EditGraph').on('click',function(){
		ipcRenderer.send('open-graph-window');
	});
	
	$('#EditRule').on('click',function(){
		ipcRenderer.send('open-rule-window');
    });
});




