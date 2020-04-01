const electron = require('electron');
const {dialog} = require('electron').remote;
const fs = require('fs');


const {ipcRenderer} = electron;

var fileLocation;
var rule;


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
				document.getElementById('RuleCode').innerHTML = programText;
			});
			
		  }).catch(err => {
			console.log(err)
		  });
		console.log(path)
	});
	
	$('#Save').on('click',function(){
		fs.writeFile(fileLocation + "/" + rule + ".rule", document.getElementById("RuleCode").value, (err) => {
			if(err){
				alert("An error ocurred saving the file "+ err.message)
			}
			alert("The file has been succesfully saved to: " + fileLocation + "/" + rule + ".rule");
		});
	});
	ipcRenderer.on('project-path', function (event, projectPath, ruleName) {
		fileLocation = projectPath;
		rule = ruleName;
		var programText = fs.readFile(fileLocation + "/" + rule + ".rule", 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			programText = data.toString();
			document.getElementById('RuleCode').innerHTML = programText;
		});
	});
});




