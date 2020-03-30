const electron = require('electron');
const {dialog} = require('electron').remote;
var  path = require('path');
const fs = require('fs');



const {ipcRenderer} = electron;


$( document ).ready(function(){
    $('#SelectLocation').on('click',function(){
		dialog.showOpenDialog({
			properties: ['openDirectory']
		}).then(result => {
			document.getElementById("ProjectPath").value = result.filePaths[0];
		  }).catch(err => {
			console.log(err)
		  });
		console.log(path)
		

	});
	
	$('#CreateProject').on('click',function(){
		var x = path.join(document.getElementById("ProjectPath").value, document.getElementById("ProjectName").value);
		

		if (fs.existsSync(x)) {
			alert("Folder already exists.");
		} else {
			fs.mkdir(x, { recursive: true }, (err) => {
				if (err) throw err;
			});
		};
		  
		fs.writeFile(x+"/Graph.host", "[\n|\n]", function(err) {
			if(err) {
				return console.log(err);
			}
		});
		fs.writeFile(x+"/Program.txt", "", function(err) {
			if(err) {
				return console.log(err);
			};
		});
		fs.writeFile(x+"/Control.txt", "", function(err) {
			if(err) {
				return console.log(err);
			};
		});
		alert("Project Created");
		ipcRenderer.send('open-project', x);


    });

});




