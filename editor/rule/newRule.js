const electron = require('electron');
const {dialog} = require('electron').remote;
var  path = require('path');
const fs = require('fs');


const {ipcRenderer} = electron;

var fileLocation;


$( document ).ready(function(){
	
	$('#CreateRule').on('click',function(){
		ruleName = document.getElementById("RuleName").value;
		
		fs.appendFile( fileLocation + '/RuleList.txt', ruleName + "\n", function (err) {
			if (err) throw err;
		  });
		  

		fs.writeFile(fileLocation + "/" + ruleName + ".rule" , ruleName + "()\n[ | ]\n=>\n[ | ]\ninterface = {}", function(err) {
			if(err) {
				return console.log(err);
			};
		});
		ipcRenderer.send('new-rule')


	});
	

	ipcRenderer.on('project-path', function (event, projectPath) {
		fileLocation = projectPath;
	});

});




