/*
Author: Denis.net
https://www.autohotkey.com/docs/Scripts.htm#cmd
*/
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as net from 'net';
import * as panic from './panic';
import { checkConnection } from './connectivity';
import { COMMAND_IDS, REVEAL_FILE_IN_OS, LAUNCH, EXTENSION_NAME, SETTINGS_KEYS } from './enums';
import { ScriptManagerProvider, Script } from './script-manager-provider';
import { cfg } from './configuration';
import { scriptCollection } from './script-meta-data-collection';

export function activate(context: vscode.ExtensionContext) {

	console.log(`${EXTENSION_NAME} is ready : let's script something awesome !`);

	let runned_scripts: string[] = new Array();
	let compiled_scripts: string[] = new Array();

	var delayed_saving_timeout: NodeJS.Timer;
	let treeDataProvider: ScriptManagerProvider;
	let scriptViewer: vscode.TreeView<Script>;

	cfg.parseConfiguration(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === "ahk" ? vscode.window.activeTextEditor.document.uri : undefined);
	if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'ahk')
		cfg.initializeEmptyWithHeaderSnippetIfNeeded(vscode.window.activeTextEditor.document.getText().length);


	treeDataProvider = new ScriptManagerProvider();
	context.subscriptions.push(vscode.window.registerTreeDataProvider('ahk.scripts-manager', treeDataProvider));
	scriptViewer = vscode.window.createTreeView('ahk.scripts-manager', { treeDataProvider });

	context.subscriptions.push(

		vscode.window.onDidChangeActiveTextEditor(e => {
			if (e && vscode.window.activeTextEditor && e.document.languageId === 'ahk') {
				cfg.parseConfiguration(e.document.uri);
				cfg.initializeEmptyWithHeaderSnippetIfNeeded(vscode.window.activeTextEditor.document.getText().length);
			}
		}),

		vscode.workspace.onDidOpenTextDocument(e => {
			if (vscode.window.activeTextEditor && e.languageId === 'ahk') {
				cfg.parseConfiguration(e.uri);
				cfg.initializeEmptyWithHeaderSnippetIfNeeded(vscode.window.activeTextEditor.document.getText().length);
			}
		}),

		vscode.workspace.onDidSaveTextDocument(e => {
			if (e.languageId !== 'ahk' || !e.getText().length)
				return;

			if (delayed_saving_timeout)
				clearTimeout(delayed_saving_timeout);

			delayed_saving_timeout = setTimeout(() => {
				if (cfg.compile_on_save && compiled_scripts.includes(e.uri.fsPath)) {
					vscode.commands.executeCommand(COMMAND_IDS.KILL);
					vscode.commands.executeCommand(COMMAND_IDS.COMPILE);
				}
				if (cfg.run_on_save && runned_scripts.includes(e.uri.fsPath))
					vscode.commands.executeCommand(COMMAND_IDS.RUN);
			}, 1000);
		}),

		vscode.commands.registerCommand(COMMAND_IDS.DOCS, () => {
			if (vscode.window.activeTextEditor && !vscode.window.activeTextEditor.selection.isEmpty) {
				const selection = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
				if (selection) {
					const encodedSelection = encodeURI(selection);
					openLink(encodedSelection);
				}
			}
			else if (cfg.docsPath) {
				// const docs = cfg.docsPath;
				checkConnection((online) => {
					if (online) {
						const uri = vscode.Uri.parse('https://www.autohotkey.com/docs/AutoHotkey.htm');
						// vscode.env.openExternal(uri);
						vscode.commands.executeCommand('vscode.open', uri);
					} else {
						launchProcess(cfg.docsPath, false);
					}
				});
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.SWITCH, () => {
			try {
				const options: vscode.OpenDialogOptions = {
					canSelectMany: false,
					openLabel: 'Switch executable',
					filters: {
						'Executable': ['exe']
					}
				};

				options.defaultUri = cfg.executableDir;
				vscode.window.showOpenDialog(options).then(fileUri => {
					if (fileUri && fileUri[0]) {
						cfg.overrideExecutablePaths(fileUri[0].fsPath);
					}
				});
			} catch (err) {
				console.log(err);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.SPY, () => {
			if (vscode.window.activeTextEditor && cfg.executablePath && cfg.winSpyPath) {
				launchProcess(cfg.executablePath, false, "/ErrorStdOut", "/r", cfg.winSpyPath);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.RUN_COMPILED, () => {
			let compiled_path = scriptCollection.getCurrentDestination()
			if (vscode.window.activeTextEditor && compiled_path) {
				if (!fs.existsSync(compiled_path)) {
					vscode.commands.executeCommand(COMMAND_IDS.COMPILE);
					setTimeout(() => {
						if (fs.existsSync(compiled_path))
							launchProcess(cfg.pathify(compiled_path), false);
					}, 3000);
				}
				else
					launchProcess(cfg.pathify(compiled_path), false, scriptCollection.getCurrentScriptArguments());
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.RUN, () => {
			if (vscode.window.activeTextEditor && cfg.executablePath) {
				const scriptFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
				if (!runned_scripts.includes(scriptFilePath))
					runned_scripts.push(scriptFilePath);
				launchProcess(cfg.executablePath, false, "/ErrorStdOut", "/r", cfg.pathify(scriptFilePath), scriptCollection.getCurrentScriptArguments());
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.KILL, () => {
			try {
				if (!vscode.window.activeTextEditor)
					return;
				let scriptFileName = path.basename(vscode.window.activeTextEditor.document.uri.fsPath);
				let compiledPath = scriptCollection.getCurrentDestination();
				if (!compiledPath)
					compiledPath = scriptFileName.replace(path.extname(scriptFileName), ".exe");
				else
					compiledPath = path.basename(compiledPath);

				runBuffered(panic.Kill_Target_Raw_Script(scriptFileName));
				launchProcess("taskkill", true, "/IM", JSON.stringify(compiledPath), "/F"); // launchProcess("taskkill", "/F", "/PID", last_launched_pid.toString());
			} catch (err) {
				vscode.window.showErrorMessage('An error has occured while killing the script/executable: ' + err);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.COMPILE, () => {
			try {
				if (vscode.window.activeTextEditor && cfg.compilerPath) {
					const scriptFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
					if (!compiled_scripts.includes(scriptFilePath))
						compiled_scripts.push(scriptFilePath);

					let iconPath = scriptCollection.getCurrentIcon();
					iconPath = fs.existsSync(iconPath) ? "/icon " + cfg.pathify(iconPath) : "";

					let destination = scriptCollection.getCurrentDestination();
					launchProcess(cfg.compilerPath, false, "/in", cfg.pathify(scriptFilePath), "/out", cfg.pathify(destination), iconPath).then((success) => {
						if (success) {
							vscode.window.showInformationMessage(`The script has been compiled!\nYou can find it on \`${destination}\``, LAUNCH, REVEAL_FILE_IN_OS).then((res) => {
								switch (res) {
									case LAUNCH:
										vscode.commands.executeCommand(COMMAND_IDS.RUN_COMPILED);
										break;
									case REVEAL_FILE_IN_OS:
										vscode.commands.executeCommand(COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, vscode.Uri.file(destination));
										break;
								}
							});
						}
					});
				}
			} catch (err) {
				vscode.window.showErrorMessage("An error has occured while compiling the script: " + err.message);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.COMPILE_AS, () => {
			try {
				if (vscode.window.activeTextEditor && cfg.compilerPath) {
					const options: vscode.SaveDialogOptions = {
						saveLabel: 'Select the destination',
						filters: {
							'Executable': ['exe']
						}
					};
					if (cfg.executablePath)
						options.defaultUri = vscode.Uri.file(path.dirname(cfg.executablePath));
					vscode.window.showSaveDialog(options).then(fileUri => {
						if (vscode.window.activeTextEditor && cfg.compilerPath && fileUri) {
							scriptCollection.setCurrentDestination(fileUri.fsPath);
							// cfg.overriddenCompiledDestination = cfg.pathify(fileUri.fsPath);
							vscode.commands.executeCommand(COMMAND_IDS.COMPILE);
						}
					});
				}
			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage("An error has occured while compiling the script: " + err.message);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.RUNBUFFERED, () => {
			const buffer = getValidSelectedText();
			runBuffered(buffer);
		}),

		vscode.commands.registerCommand(COMMAND_IDS.SET_TRAY_ICON, () => {
			try {
				if (vscode.window.activeTextEditor) {
					const options: vscode.OpenDialogOptions = {
						openLabel: 'Select the tray icon',
						canSelectMany: false,
						filters: {
							'icon': ['ico']
						}
					};
					if (scriptCollection.getCurrentTrayIcon())
						options.defaultUri = vscode.Uri.file(path.dirname(scriptCollection.getCurrentTrayIcon()));
					else if (scriptCollection.getCurrentScriptFilePath())
						options.defaultUri = vscode.Uri.file(path.dirname(scriptCollection.getCurrentScriptFilePath()));
					vscode.window.showOpenDialog(options).then(fileUri => {
						const editor = vscode.window.activeTextEditor;
						if (editor && fileUri) {
							const selPath = fileUri[0].fsPath;
							let text = editor.document.getText();
							const reg: RegExp = /TrayIcon\s*:?\s*=/;
							let pos = text.search(reg);
							if (pos >= 0) {
								editor.edit((builder) => {
									let position = editor.document.positionAt(pos);
									let line = editor.document.lineAt(position.line);
									let endPosition = line.range.end;
									let icoPos = line.text.indexOf('.ico', line.text.search(reg));
									if (icoPos >= 0)
										endPosition = new vscode.Position(line.lineNumber, icoPos + 4); //line.range.end.translate(0, -(line.range.end.character - icoPos+4));
									let range: vscode.Range = new vscode.Range(position, endPosition);
									let statementLine = editor.document.getText(range);
									if (statementLine.includes(':=')) {
										endPosition = new vscode.Position(endPosition.line, endPosition.character + 1);
										range = new vscode.Range(position, endPosition);
										builder.replace(range, `TrayIcon := "${selPath}"`);
									}
									else
										builder.replace(range, 'TrayIcon = ' + selPath);
									scriptCollection.setCurrentTrayIcon(selPath);
								});
							}
							else
								editor.insertSnippet(new vscode.SnippetString(
									`TrayIcon = \${1:${selPath}}\nIf (FileExist(TrayIcon)) {\n\tMenu, Tray, Icon, TrayIcon\n}\n$0`
								)).then((value) => {
									if (value)
										scriptCollection.setCurrentTrayIcon(selPath);
								});
						}
					});
				}
			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage("An error has occured while setting the script's tray icon: " + err.message);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.SET_ICON, () => {
			try {
				if (vscode.window.activeTextEditor) {
					const options: vscode.OpenDialogOptions = {
						openLabel: 'Select the icon',
						canSelectMany: false,
						filters: {
							'icon': ['ico']
						}
					};

					if (scriptCollection.getCurrentIcon())
						options.defaultUri = vscode.Uri.file(path.dirname(scriptCollection.getCurrentIcon()));
					else if (scriptCollection.getCurrentScriptFilePath())
						options.defaultUri = vscode.Uri.file(path.dirname(scriptCollection.getCurrentScriptFilePath()));
					vscode.window.showOpenDialog(options).then(fileUri => {
						if (vscode.window.activeTextEditor && fileUri) {
							scriptCollection.setCurrentIcon(fileUri[0].fsPath);
						}
					});
				}
			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage("An error has occured while setting the script's tray icon: " + err.message);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.SET_SCRIPT_ARGS, () => {
			try {
				if (vscode.window.activeTextEditor) {
					const options: vscode.InputBoxOptions = { value: scriptCollection.getCurrentScriptArguments(), valueSelection: undefined };
					vscode.window.showInputBox(options).then(value => {
						if (value !== undefined) {
							scriptCollection.setCurrentScriptArguments(value || '');
							if (cfg.run_on_args)
								vscode.commands.executeCommand(COMMAND_IDS.RUN);
						}
					});
				}
			} catch (err) {
				console.log(err);
				vscode.window.showErrorMessage("An error has occured while setting the script's arguments: " + err.message);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.REMOVE_METADATA, () => {
			scriptCollection.clear();
		}),

		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.REFRESH, (element: Script) => {
			treeDataProvider.refresh();
		}),
		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.SUSPEND_ON, (element: Script) => {
			element.suspend();
		}),
		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.SUSPEND_OFF, (element: Script) => {
			element.unSuspend();
		}),
		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.PAUSE_ON, (element: Script) => {
			element.pause();
		}),
		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.PAUSE_OFF, (element: Script) => {
			element.resume();
		}),
		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.KILL, (element: Script) => {
			element.kill();
		}),
		vscode.commands.registerCommand(COMMAND_IDS.TREE_COMMANDS.SHOW_IN_EXPLORER, (uri: vscode.Uri) => {
			try {
				if (cfg.executablePath)
					treeDataProvider.ExecuteAHKCode(cfg.executablePath, (pipe) => panic.GetKeyState(pipe, 'Ctrl'), (error) => { throw error; }, true, (result) => {
						let ctrlIsDown = parseInt(new Buffer(result.buffer).toString('utf8'));
						if (ctrlIsDown) {
							// launchProcess(pathify(process.execPath), false, pathify(uri.fsPath));
							vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(path.dirname(uri.fsPath)), cfg.open_script_folders_in_new_instance);
						}
						else
							vscode.commands.executeCommand(COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, uri);
					});
				else
					vscode.commands.executeCommand(COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, uri);
			} catch (err1) {
				try {
					vscode.commands.executeCommand(COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, uri);
				} catch (err2) {
					vscode.window.showErrorMessage('An error has occured while opening the file', err1, err2);
				}
			}
		}),
		vscode.languages.registerDocumentFormattingEditProvider('ahk', {
			provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
				let promise: Promise<vscode.TextEdit[]> = new Promise((c, r) => {
					let replacement: vscode.TextEdit[] = new Array();
					if (!cfg.executablePath) {
						r();
						return;
					}

					// const firstLine = document.lineAt(0);
					// if (firstLine.text !== '42') {
					// 	return [vscode.TextEdit.insert(firstLine.range.start, '42\n')];
					// }
					// let editor = vscode.window.activeTextEditor;
					let oldClipboard = vscode.env.clipboard.readText();
					let text = document.getText();
					vscode.env.clipboard.writeText(text);
					treeDataProvider.ExecuteAHKCode(cfg.executablePath, (pipe) => panic.FormatText(pipe), (error) => { throw error; }, true, (result) => {
						text = new Buffer(result.buffer).toString('utf8');
						// editor.edit((builder) => {
						// 	let invalidRange = new vscode.Range(0, 0, document.lineCount /*intentionally missing the '-1' */, 0);
						// 	let fullRange = document.validateRange(invalidRange);
						// 	builder.replace(fullRange, text);
						// });
						let invalidRange = new vscode.Range(0, 0, document.lineCount, 0);
						let fullRange = document.validateRange(invalidRange);
						oldClipboard.then((value) => vscode.env.clipboard.writeText(value));
						replacement.push(vscode.TextEdit.replace(fullRange, text));
						c(replacement);
					});
				});
				return promise;
			}
		})
	);

	function openLink(encodedSelection: string) {
		try {
			if (!cfg.on_search_query_template)
				return;
			const template = cfg.on_search_query_template.replace('${encodedSelection}', encodedSelection);
			require('open')(template, cfg.on_search_target_browser);
		} catch (err) {
			vscode.window.showErrorMessage(`An Error has occured while searching for info about "${encodedSelection}"`, err);
		}
	}

	function runBuffered(buffer: string = "MsgBox, Select something first !") {

		try {
			const pipe_path = "\\\\.\\pipe\\AHK_" + Date.now();
			let is_the_second_connection = false;
			let server = net.createServer(function (stream) {
				if (is_the_second_connection)
					stream.write(buffer);
				else
					is_the_second_connection = true;
				stream.end();
			});
			server.listen(pipe_path, function () {
				if (cfg.executablePath)
					launchProcess(cfg.executablePath, false, pipe_path);
			});
		} catch (err) {
			vscode.window.showErrorMessage('An error has occured while interacting with AHK: ', err);
		}
	}

	function getValidSelectedText(): string {
		let buffer = '';
		if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === "ahk") {
			buffer = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection).toString();
			if (!buffer)
				buffer = vscode.window.activeTextEditor.document.getText();
		}
		return buffer;
	}

	function launchProcess(name: string, quiet: boolean, ...args: string[]): Promise<boolean> {
		let p: Promise<boolean> = new Promise((r, c) => {
			try {
				let command = name.concat(' ', args.join(' '));
				child_process.exec(command, function callback(error: any, stdout: any, stderr: any) {
					if (error) {
						if (quiet) {
							console.log('error: ' + error);
						}
						else
							vscode.window.showErrorMessage("An error has occured while launching the executable: " + error);
						c(error);
					}
					else
						r(true);
				});
			} catch (err) {
				if (quiet)
					console.log(err);
				else
					vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
				c(err);
			}
		});
		return p;
	}


	/*
		// Example 1: Reading Window scoped configuration
		// const configuredView = vscode.workspace.getConfiguration().get('conf.view.showOnWindowOpen');
		// switch (configuredView) {
		// 	case 'explorer':
		// 		vscode.commands.executeCommand('workbench.view.explorer');
		// 		break;
		// 	case 'search':
		// 		vscode.commands.executeCommand('workbench.view.search');
		// 		break;
		// 	case 'scm':
		// 		vscode.commands.executeCommand('workbench.view.scm');
		// 		break;
		// 	case 'debug':
		// 		vscode.commands.executeCommand('workbench.view.debug');
		// 		break;
		// 	case 'extensions':
		// 		vscode.commands.executeCommand('workbench.view.extensions');
		// 		break;
		// }

		// Example 2: Updating Window scoped configuration
		// vscode.commands.registerCommand('config.commands.configureViewOnWindowOpen', async () => {
		// 	// 1) Getting the value
		// 	const value = await vscode.window.showQuickPick(['explorer', 'search', 'scm', 'debug', 'extensions'], { placeHolder: 'Select the view to show when opening a window.' });

		// 	if (vscode.workspace.workspaceFolders) {
		// 		// 2) Getting the Configuration target
		// 		const target = await vscode.window.showQuickPick(
		// 			[
		// 				{ label: 'User', description: 'User Settings', target: vscode.ConfigurationTarget.Global },
		// 				{ label: 'Workspace', description: 'Workspace Settings', target: vscode.ConfigurationTarget.Workspace }
		// 			],
		// 			{ placeHolder: 'Select the view to show when opening a window.' });

		// 		if (value && target) {

		// 			// 3) Update the configuration value in the target
		// 			await vscode.workspace.getConfiguration().update('conf.view.showOnWindowOpen', value, target.target);
		// 		}
		// 	} else {
		// 		// 2) Update the configuration value in User Setting in case of no workspace folders
		// 		await vscode.workspace.getConfiguration().update('conf.view.showOnWindowOpen', value, vscode.ConfigurationTarget.Global);
		// 	}
		// });

		// Example 3: Reading Resource scoped configuration for a file
		context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => {

			// 1) Get the configured glob pattern value for the current file
			const value: any = vscode.workspace.getConfiguration('', e.uri).get('conf.resource.insertEmptyLastLine');

			// 2) Check if the current resource matches the glob pattern
			const matches = value ? value[e.fileName] : undefined;

			// 3) If matches, insert empty last line
			if (matches) {
				vscode.window.showInformationMessage('An empty line will be added to the document ' + e.fileName);
			}

		}));

		// Example 4: Updating Resource scoped Configuration for current file
		vscode.commands.registerCommand('config.commands.configureEmptyLastLineCurrentFile', async () => {

			if (vscode.window.activeTextEditor) {
				const currentDocument = vscode.window.activeTextEditor.document;

				// 1) Get the configuration for the current document
				const configuration = vscode.workspace.getConfiguration('', currentDocument.uri);

				// 2) Get the configiuration value
				const currentValue = configuration.get('conf.resource.insertEmptyLastLine', {});

				// 3) Choose target to Global when there are no workspace folders
				const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Global;

				const value = { ...currentValue, ...{ [currentDocument.fileName]: true } };

				// 4) Update the configuration
				await configuration.update('conf.resource.insertEmptyLastLine', value, target);
			}
		});

		// Example 5: Updating Resource scoped Configuration
		vscode.commands.registerCommand('config.commands.configureEmptyLastLineFiles', async () => {

			// 1) Getting the value
			const value = await vscode.window.showInputBox({ prompt: 'Provide glob pattern of files to have empty last line.' });

			if (vscode.workspace.workspaceFolders) {

				// 2) Getting the target
				const target = await vscode.window.showQuickPick(
					[
						{ label: 'Application', description: 'User Settings', target: vscode.ConfigurationTarget.Global },
						{ label: 'Workspace', description: 'Workspace Settings', target: vscode.ConfigurationTarget.Workspace },
						{ label: 'Workspace Folder', description: 'Workspace Folder Settings', target: vscode.ConfigurationTarget.WorkspaceFolder }
					],
					{ placeHolder: 'Select the target to which this setting should be applied' });

				if (value && target) {

					if (target.target === vscode.ConfigurationTarget.WorkspaceFolder) {

						// 3) Getting the workspace folder
						let workspaceFolder = await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Pick Workspace Folder to which this setting should be applied' });
						if (workspaceFolder) {

							// 4) Get the configuration for the workspace folder
							const configuration = vscode.workspace.getConfiguration('', workspaceFolder.uri);

							// 5) Get the current value
							const currentValue = configuration.get('conf.resource.insertEmptyLastLine');

							const newValue = { ...currentValue, ...{ [value]: true } };

							// 6) Update the configuration value
							await configuration.update('conf.resource.insertEmptyLastLine', newValue, target.target);
						}
					} else {

						// 3) Get the configuration
						const configuration = vscode.workspace.getConfiguration();

						// 4) Get the current value
						const currentValue = configuration.get('conf.resource.insertEmptyLastLine');

						const newValue = { ...currentValue, ...(value ? { [value]: true } : {}) };

						// 3) Update the value in the target
						await vscode.workspace.getConfiguration().update('conf.resource.insertEmptyLastLine', newValue, target.target);
					}
				}
			} else {

				// 2) Get the configuration
				const configuration = vscode.workspace.getConfiguration();

				// 3) Get the current value
				const currentValue = configuration.get('conf.resource.insertEmptyLastLine');

				const newValue = { ...currentValue, ...(value ? { [value]: true } : {}) };

				// 4) Update the value in the User Settings
				await vscode.workspace.getConfiguration().update('conf.resource.insertEmptyLastLine', newValue, vscode.ConfigurationTarget.Global);
			}
		});

		// Example 6: Listening to configuration changes
		context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {

			if (e.affectsConfiguration('conf.resource.insertEmptyLastLine')) {
				if (vscode.window.activeTextEditor) {

					const currentDocument = vscode.window.activeTextEditor.document;

					// 1) Get the configured glob pattern value for the current file
					const value: any = vscode.workspace.getConfiguration('', currentDocument.uri).get('conf.resource.insertEmptyLastLine');

					// 2) Check if the current resource matches the glob pattern
					const matches = value[currentDocument.fileName];

					// 3) If matches, insert empty last line
					if (matches) {
						vscode.window.showInformationMessage('An empty line will be added to the document ' + currentDocument.fileName);
					}
				}
			}

		}));
	*/
}

export function deactivate() {
}