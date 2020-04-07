const electron = require('electron');
const {dialog} = require('electron').remote;
const fs = require('fs');
const exec = require('child_process').exec;

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

	$('#DeleteRule').on('click',function(){
		undesiredRule = document.getElementById("RuleName").options[document.getElementById("RuleName").selectedIndex].text;
		path = document.getElementById("ProjectLocation").innerHTML + "/" + undesiredRule + ".rule"

		//Delete rule file
		if (fs.existsSync(path)) {
			fs.unlink(path, (err) => {
				if (err) {
					alert("An error ocurred updating the file" + err.message);
					console.log(err);
					return;
				}
				
			});
		} else {
			alert("This file doesn't exist, cannot delete");
		}

		//Create rule list without the deleted rule
		fs.readFile(document.getElementById("ProjectLocation").innerHTML + "/RuleList.txt", 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred fetching the rules:" + err.message);
				return;
			}
			rules = data.toString().split("\n");

			for( var i = 0; i < rules.length; i++){ 
				if ( rules[i] === undesiredRule){
					rules.splice(i, 1); 
				}
			}
			ruleList = rules.join("\n");

			//Write rule list to rule list file
			fs.writeFile(document.getElementById("ProjectLocation").innerHTML + "/RuleList.txt" , ruleList, function(err) {
				if(err) {
					return console.log(err);
				};
				updateRules();
			});
		});

		
		console.log("File succesfully deleted");
	});

	$('#Build').on('click',function(){
		
		//Promise to get the program code and store it in completeProgram
		let getProgram = new Promise ((resolve,reject) => {
			fs.readFile(document.getElementById("ProjectLocation").innerHTML + "/Program.txt", 'utf-8', (err, data) => {
				if(err){
					alert("An error ocurred fetching the program:" + err.message);
					reject();
					return;
				}
				completeProgram = data.toString();
				resolve();
			});
		});

		//Promise to get all of the rules and add it to the end of completeProgram
		let getRules = new Promise ((resolve,reject) => {
			fs.readFile(document.getElementById("ProjectLocation").innerHTML + "/RuleList.txt", 'utf-8', (err, data) => {
				if(err){
					alert("An error ocurred fetching the program:" + err.message);
					reject();
					return;
				}
				rules = data.toString().split("\n");
				
				
				//Sets up a collection of promises to read in each rule and combine them together
				promises = []; 
				rulesCombined = "";
				for( var i = 0; i < rules.length - 1; i++){ 
					promises.push(readARule(rules[i]));	
				};
				//Once these rules have been read and combined, add those to the end of completeProgram
				Promise.all(promises).then(() => {
					completeProgram = completeProgram.concat("\n\n", rulesCombined);
					resolve(); 
				}).catch((e) => {

    			});

			});	
				
		});

		var readARule = function(ruleName) {
			return new Promise(function(resolve, reject) {
				fs.readFile(document.getElementById("ProjectLocation").innerHTML + "/" + ruleName + ".rule", 'utf-8', (err, ruleText) => {
					//alert(ruleText);
					rulesCombined = rulesCombined.concat("\n\n", ruleText.toString());
					
					resolve();

				});
			});
		  }
		
		//Get the program code, then the rules, then write it to Program.gp2
		getProgram.then(() => {
			getRules.then(() => {
				fs.writeFile(document.getElementById("ProjectLocation").innerHTML + "/Program.gp2" , completeProgram, function(err) {
					if(err) {
						return console.log(err);
					};
				});
			});

		});
		
	

	});

	$('#Run').on('click',function(){
		disableButtons();
		//alert(command)

		exec('./gp2c Program.gp2 Graph.host', {cwd: document.getElementById("ProjectLocation").innerHTML}, function (err, stdout, stderr) {
			if (err){
				enableButtons();
				alert("Error");
			} else {
				enableButtons();
				alert("Success")
			}
		});
		//execFile(document.getElementById("ProjectLocation").innerHTML + '/gp2c', ['Program.gp2', 'Graph.host'], shell = true, function (err, stdout, stderr) {


		//});
	});

	ipcRenderer.on('project-variables', function (event, projectPath) {
		if (projectPath == "No project selected") {
			document.getElementById("ProjectLocation").innerHTML = projectPath;
			disableButtons();
		} else {
			document.getElementById("ProjectLocation").innerHTML = projectPath;
			updateRules();
			enableButtons();
		};
	});

	ipcRenderer.on('update-rules', function (event) {
		updateRules();
	});


	ipcRenderer.on('open-project', function (event) {
		var projectPath;
		dialog.showOpenDialog({
			properties: ['openDirectory']
		}).then(result => {
			projectPath = result.filePaths[0];
			document.getElementById("ProjectLocation").innerHTML = projectPath;
			updateRules();
			enableButtons();
		}).catch(err => {
			console.log(err)
		});
		
			
	});
});

function disableButtons(){
	document.getElementById("EditGraphGP2").disabled = true;
	document.getElementById("EditProgram").disabled = true;
	document.getElementById("EditRuleGP2").disabled = true;
	document.getElementById("NewRule").disabled = true;
	document.getElementById("DeleteRule").disabled = true;
	document.getElementById("Build").disabled = true;
	document.getElementById("Run").disabled = true;
}

function enableButtons(){

	document.getElementById("EditGraphGP2").disabled = false;
	document.getElementById("EditProgram").disabled = false;
	document.getElementById("EditRuleGP2").disabled = false;
	document.getElementById("NewRule").disabled = false;
	document.getElementById("DeleteRule").disabled = false;
	document.getElementById("Build").disabled = false;
	document.getElementById("Run").disabled = false;
}

function updateRules(){
	fs.readFile(document.getElementById("ProjectLocation").innerHTML + "/RuleList.txt", 'utf-8', (err, data) => {
		if(err){
			alert("An error ocurred fetching the rules:" + err.message);
			return;
		}
		rules = data.toString().split("\n");

		//Clear exising rules
		var length = document.getElementById("RuleName").options.length;
		for (i = length-1; i >= 0; i--) {
			document.getElementById("RuleName").options[i] = null;
		};
		//Fill with updated rules
		for(var i = 0; i < rules.length-1; i++) {
			var option = document.createElement("option");
			option.textContent = rules[i];
			option.value = rules[i];
			document.getElementById("RuleName").appendChild(option);
		};
	});
};




