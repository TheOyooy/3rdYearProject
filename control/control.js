const electron = require('electron');
const {dialog} = require('electron').remote;
const fs = require('fs');

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

	$('#EditRuleGP2').on('click',function(){
		ipcRenderer.send('open-rule-gp2', document.getElementById("ProjectLocation").innerHTML, document.getElementById("RuleName").options[document.getElementById("RuleName").selectedIndex].text);
	});
	
	$('#NewRule').on('click',function(){
		ipcRenderer.send('new-rule-window', document.getElementById("ProjectLocation").innerHTML);
	});

	ipcRenderer.on('project-variables', function (event, projectPath) {
		document.getElementById("ProjectLocation").innerHTML = projectPath;
	});

	ipcRenderer.on('update-rules', function (event) {
		fs.readFile(document.getElementById("ProjectLocation").innerHTML + "/RuleList.txt", 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			rules = data.toString().split("\n");

			//Clear exising rules
			var length = document.getElementById("RuleName").options.length;
			for (i = length-1; i >= 0; i--) {
				document.getElementById("RuleName").options[i] = null;
			};
			//Fill with updated rules
			for(var i = 0; i < rules.length; i++) {
				var option = document.createElement("option");
				option.textContent = rules[i];
				option.value = rules[i];
				document.getElementById("RuleName").appendChild(option);
			};
		});
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




