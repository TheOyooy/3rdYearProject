const electron = require('electron');
const {dialog} = require('electron').remote;
const fs = require('fs');
const exec = require('child_process').exec;
const pathModule = require('path');

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
		let getRules = new Promise((resolve,reject) => {
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
		
		function getCompilerLocation() {
			return new Promise((resolve,reject) => {
				fs.exists(pathModule.join(__dirname, 'compilerLocation.txt'), (exists) => {
					if (exists) {
					fs.readFile(pathModule.join(__dirname, 'compilerLocation.txt'), 'utf-8', (err, data) => {
						locations = data.toString().split("\n");
						install = locations[0];
						source = locations[1];
						alert("Got location")
						resolve();

					});
					} else {
						alert("Couldn't get location")
						reject();
						ipcRenderer.send('get-compiler-location');
						

					};
				});

			});
		}
		//install = "Error";
		//source = "Error";

		function createGp2c() {
			return new Promise((resolve,reject) => {
				disableButtons();
				contents = '#!/bin/bash \ninstall_dir="' + install + '" \nsource_dir="' + source + '" \necho "1. Making Code Directory" \necho "		mkdir -p ./gp2_code_temp" \nmkdir -p ./gp2_code_temp \necho "" \necho "2. Executing GP2 Compiler on $1" \necho "		$install_dir/bin/gp2 -o ./gp2_code_temp $1" \n$install_dir/bin/gp2 -o ./gp2_code_temp $1 \necho "" \necho "3. Coping GP2 Library Files" \necho "		cp $source_dir/gp2-1.0/lib/*.{c,h} ./gp2_code_temp/" \ncp $source_dir/gp2-1.0/lib/*.{c,h} ./gp2_code_temp/ \necho "		cp $source_dir/lib/*.{c,h} ./gp2_code_temp/" \ncp $source_dir/lib/*.{c,h} ./gp2_code_temp/ \necho "" \necho "4. Building GP2 Executable" \necho "		make -C gp2_code_temp" \nmake -C gp2_code_temp \necho "" \necho "5. Executing on Host Graph $2" \necho "		gp2_code_temp/gp2run $2" \ngp2_code_temp/gp2run $2 \necho "" \necho "6. Removing code & executable & log" \necho "		rm -r -f gp2_code_temp ; rm -f gp2.log" \nrm -r -f gp2_code_temp ; rm -f gp2.log \necho "" \necho "Final Result (stored in gp2.output) is:" \necho "		cat gp2.output" \ncat gp2.output'
				fs.writeFile(document.getElementById("ProjectLocation").innerHTML + "/gp2c" , contents, function(err) {
					if(err) {
						reject(err);
					};
					resolve();
				});

			});
		}

		function makeGp2cRunnable() {
			return new Promise((resolve,reject) => {
				exec('chmod u+x gp2c', {cwd: document.getElementById("ProjectLocation").innerHTML}, function (err, stdout, stderr) {
					if (err){
						alert("Could not make gp2c runnable");
						resolve();
					} else {
						resolve();
					}
				});

			});
		}

		getCompilerLocation().then(() => {
			createGp2c().then(() => {
				makeGp2cRunnable().then(() => {
					exec('./gp2c Program.gp2 Graph.host', {cwd: document.getElementById("ProjectLocation").innerHTML}, function (err, stdout, stderr) {
						if (err){
							enableButtons();
							alert("Could not run gp2c");
						} else {
							enableButtons();
							ipcRenderer.send('show-output', document.getElementById("ProjectLocation").innerHTML);
						}
					});
	
				});
				
	
			});

		}, () => {
		});
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
	//Read rule list
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




