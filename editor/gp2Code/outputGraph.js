const electron = require('electron');
const fs = require('fs');


const {ipcRenderer} = electron;

var fileLocation;



$( document ).ready(function(){
	$('#OverwriteGraph').on('click',function(){
		fs.writeFile(fileLocation + "/Graph.host", document.getElementById("GraphCode").value, (err) => {
			if(err){
				alert("An error ocurred saving the file "+ err.message)
			}
			alert("The file has been succesfully saved to: " + fileLocation + "/Graph.host");
		});
	});
	ipcRenderer.on('project-path', function (event, projectPath) {
		fileLocation = projectPath;
		var programText = fs.readFile(fileLocation + "/gp2.output", 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			programText = data.toString();
			document.getElementById('GraphCode').innerHTML = programText;
		});
	});
});




