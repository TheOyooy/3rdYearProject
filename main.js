const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, screen} = electron

let mainWindow;
let addWindow;

app.on('ready', function(){
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
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
    

	controlWindow = new BrowserWindow({
		webPreferences:{
			nodeIntegration: true
		}
	});
	controlWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'control/controlWindow.html'),
		protocol: 'file',
		slashes: true
	}));

	//Quit app when closed
	controlWindow.on('closed', function(){
		app.quit();
	})

	//Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
});


//Handle create add window
function createAddWindow(){
	addWindow = new BrowserWindow({
		width: 700,
		height: 800,
		title:'Add Shopping List Item',
		webPreferences:{
			nodeIntegration: true
		}
	});
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'editor/index.HTML'),
		protocol: 'file',
		slashes: true,
		node: {
			__dirname: false,
			__filename: false
		}
	}));
	//Garbage collection handle
	addWindow.on('close', function(){
		addWindow = null;
	})
}

//Catch item:add
ipcMain.on('item:add', function(e, item){
	console.log(item);
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
	{
		label:'File',
		submenu:[
			{
				label: 'Add Item',
				click(){
					createAddWindow();
				}

			},
			{
				label: 'Clear Items',
				click(){
					mainWindow.webContents.send('item:clear');
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

//if mac, add empty object ot menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

//Add developer tools item if not in prod
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
}