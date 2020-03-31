const electron = require('electron');
const {dialog} = require('electron').remote;


const {ipcRenderer} = electron;


$( document ).ready(function(){
    $('#EditGraph').on('click',function(){
		ipcRenderer.send('open-graph-window');
	});

	$('#EditGraphGP2').on('click',function(){
		ipcRenderer.send('open-graph-gp2', document.getElementById("ProjectLocation").innerHTML);
	});
	
	$('#EditProgram').on('click',function(){
		ipcRenderer.send('open-program-window', document.getElementById("ProjectLocation").innerHTML);
    });

	$('#EditRule').on('click',function(){
		ipcRenderer.send('open-rule-window');
	});

	ipcRenderer.on('project-variables', function (event, projectPath) {
		document.getElementById("ProjectLocation").innerHTML = projectPath;
	});


	ipcRenderer.on('open-project', function (event) {
		var projectPath;
		dialog.showOpenDialog({
			properties: ['openDirectory']
		}).then(result => {
			projectPath = result.filePaths[0];
			document.getElementById("ProjectLocation").innerHTML = projectPath;
		}).catch(err => {
			console.log(err)
		});
		
			
	});
});




