const electron = require('electron');


const {ipcRenderer} = electron;


$( document ).ready(function(){
    $('#EditGraph').on('click',function(){
		ipcRenderer.send('open-graph-window');
	});
	
	$('#EditProgram').on('click',function(){
		ipcRenderer.send('open-program-window');
		console.log('button')
    });

	$('#EditRule').on('click',function(){
		ipcRenderer.send('open-rule-window');
	});
});




