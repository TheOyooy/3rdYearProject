const electron = require('electron');
const {dialog} = require('electron').remote;
const fs = require('fs');


const {ipcRenderer} = electron;

var fileLocation;



$( document ).ready(function(){
    $('#Load').on('click',function(){
		dialog.showOpenDialog({
			properties: ['openFile']
		}).then(result => {
			var programText = fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
				if(err){
					alert("An error ocurred reading the file :" + err.message);
					return;
				}
				programText = data.toString();
				document.getElementById('ProgramText').innerHTML = programText;
			});
			
		  }).catch(err => {
			console.log(err)
		  });
		console.log(path)
	});
	
	$('#Save').on('click',function(){
		fs.writeFile(fileLocation + "/Program.txt", document.getElementById("ProgramText").value, (err) => {
			if(err){
				alert("An error ocurred creating the file "+ err.message)
			}
			alert("The file has been succesfully saved to: " + fileLocation + "/Program.txt");
		});
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




