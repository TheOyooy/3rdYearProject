const electron = require('electron');
const fs = require('fs');


const {ipcRenderer} = electron;

var fileLocation;



$( document ).ready(function(){
    $('#EditGraph').on('click',function(){
		ipcRenderer.send('open-graph-window');
	});
	
	$('#EditRule').on('click',function(){
		ipcRenderer.send('open-rule-window');
	});
	ipcRenderer.on('project-path', function (event, projectPath) {
		fileLocation = projectPath;
		var programText = fs.readFile(fileLocation + "/Program.txt", 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			programText = data.toString();
			document.getElementById('ProgramText').innerHTML = programText;
		});
	});
});




