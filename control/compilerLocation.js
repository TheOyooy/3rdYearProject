const electron = require('electron');
const {dialog} = require('electron').remote;
var  path = require('path');
const fs = require('fs');



const {ipcRenderer} = electron;


$( document ).ready(function(){
    $('#SelectInstall').on('click',function(){
		dialog.showOpenDialog({
			properties: ['openDirectory']
		}).then(result => {
			document.getElementById("Install").value = result.filePaths[0];
		  }).catch(err => {
			console.log(err)
		  });
		console.log(path)
		

	});

	$('#SelectSource').on('click',function(){
		dialog.showOpenDialog({
			properties: ['openDirectory']
		}).then(result => {
			document.getElementById("Source").value = result.filePaths[0];
		  }).catch(err => {
			console.log(err)
		  });
		console.log(path)
		

	});
	
	$('#SetLocation').on('click',function(){
		


		alert(document.getElementById("Install").value + "\n" + document.getElementById("Source").value)
		fs.writeFile(path.join(__dirname, 'compilerLocation.txt'), document.getElementById("Install").value + "\n" + document.getElementById("Source").value, function(err) {
			if(err) {
				return console.log(err);
			}
		});

		ipcRenderer.send('compiler-location-set');


    });

});




