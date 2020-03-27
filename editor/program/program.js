const electron = require('electron');


const {ipcRenderer} = electron;


$( document ).ready(function(){
    $('#EditGraph').on('click',function(){
		ipcRenderer.send('open-graph-window');
	});
	
	$('#EditRule').on('click',function(){
		ipcRenderer.send('open-rule-window');
    });
});




