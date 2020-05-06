const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, screen} = electron



app.on('ready', function(){
	//set dimensions for fullscreen windows
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    
	//Open the control window on program start
	controlWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences:{
			nodeIntegration: true
		}
	});
	controlWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'control/controlWindow.html'),
		protocol: 'file',
		slashes: true
	}));
	controlWindow.webContents.on('did-finish-load', () => {
		controlWindow.webContents.send('project-variables', "No project selected");
	});


	ipcMain.on('open-graph-window', (event) => {
		graphWindow = new BrowserWindow({
			width,
			height,
			//webPreferences:{
			//	nodeIntegration: true
			//}
		});
		graphWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/index.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));
	});

	ipcMain.on('open-graph-gp2', (event, projectPath) => {
		graphCodeWindow = new BrowserWindow({
			width,
			height,
			webPreferences:{
				nodeIntegration: true
			}
		});
		graphCodeWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/gp2Code/graphCodeWindow.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));
		graphCodeWindow.webContents.on('did-finish-load', () => {
			graphCodeWindow.webContents.send('project-path', projectPath);
		});

	});

	ipcMain.on('open-program-window', (event, projectPath) => {
		ruleWindow = new BrowserWindow({
			width,
			height,
			webPreferences:{
				nodeIntegration: true
			}
		});
		ruleWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/program/programWindow.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));
		ruleWindow.webContents.on('did-finish-load', () => {
			ruleWindow.webContents.send('project-path', projectPath);
		});

	});

	ipcMain.on('open-rule-window', (event) => {
		ruleWindow = new BrowserWindow({
			width,
			height,
			//webPreferences:{
			//	nodeIntegration: true
			//}
		});
		ruleWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/rule/index.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));

	});

	ipcMain.on('open-rule-gp2', (event, projectPath, ruleName) => {
		ruleCodeWindow = new BrowserWindow({
			width,
			height,
			webPreferences:{
				nodeIntegration: true
			}
		});
		ruleCodeWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/gp2Code/ruleCodeWindow.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));
		ruleCodeWindow.webContents.on('did-finish-load', () => {
			ruleCodeWindow.webContents.send('project-path', projectPath, ruleName);
		});

	});

	ipcMain.on('new-rule-window', (event, projectPath) => {
		newRuleWindow = new BrowserWindow({
			width: 470,
			height: 400,
			webPreferences:{
				nodeIntegration: true
			}
		});
		newRuleWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/rule/newRule.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));
		newRuleWindow.webContents.on('did-finish-load', () => {
			newRuleWindow.webContents.send('project-path', projectPath);
		});

	});

	ipcMain.on('show-output', (event, projectPath) => {
		outputGraphWindow = new BrowserWindow({
			width,
			height,
			webPreferences:{
				nodeIntegration: true
			}
		});
		outputGraphWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'editor/gp2Code/outputGraph.html'),
			protocol: 'file',
			slashes: true,
			node: {
				__dirname: false,
				__filename: false
			}
		}));
		outputGraphWindow.webContents.on('did-finish-load', () => {
			outputGraphWindow.webContents.send('project-path', projectPath);
		});
	});

	ipcMain.on('get-compiler-location', (event) => {
		setCompilerLocation();
	});

	ipcMain.on('new-rule', (event) => {
		newRuleWindow.close();
		controlWindow.webContents.send('update-rules');

	});

	ipcMain.on('compiler-location-set', (event) => {
		compilerLocationWindow.close();
	});

	ipcMain.on('open-project', (event, projectPath) => {
		controlWindow.webContents.send('project-variables', projectPath);
		newProjectWindow.close();
	});

	

	//Quit app when closed
	controlWindow.on('closed', function(){
		app.quit();
	})

	//Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
});


//Create menu template
const mainMenuTemplate = [
	{
		label:'File',
		submenu:[
			{
				label: 'New Project',
				click(){
					newProject();
				}

			},
			{
				label: 'Open Project',
				click(){
					openProject();
				}

			},
			{
				label: 'Change Compiler Location',
				click(){
					setCompilerLocation();
				}
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' :
				'Ctrl+Q',
				click(){
					app.quit();
				}
			}
		]
	}

];

//if mac, add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
};

//Add developer tools items
if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu:[
			{
				label: 'Toggle Devtools',
				accelerator: process.platform == 'darwin' ? 'Command+I' :
				'Ctrl+I',
				click(item, focusedWindow){
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	})
};

function newProject(){
	newProjectWindow = new BrowserWindow({
		width: 470,
		height: 400,
		webPreferences:{
			nodeIntegration: true
		}
	});
	newProjectWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'control/newProject.html'),
		protocol: 'file',
		slashes: true,
		node: {
			__dirname: false,
			__filename: false
		}
	}));
};

function openProject(){
	controlWindow.webContents.send('open-project');

};

function setCompilerLocation(){
	compilerLocationWindow = new BrowserWindow({
		width: 470,
		height: 400,
		webPreferences:{
			nodeIntegration: true
		}
	});
	compilerLocationWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'control/compilerLocation.html'),
		protocol: 'file',
		slashes: true,
		node: {
			__dirname: false,
			__filename: false
		}
	}));
}