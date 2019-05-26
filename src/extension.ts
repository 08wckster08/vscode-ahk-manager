/*
Author: Denis.net
https://www.autohotkey.com/docs/Scripts.htm#cmd
*/
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as process from 'child_process';
import * as net from 'net';
import * as panic from './panic';

const COMMAND_IDS: any = {
	COMPILE: "ahk.compile",
	COMPILE_AS: "ahk.compile-as",
	RUN: "ahk.run",
	RUNBUFFERED: "ahk.run-buffer",
	KILL: "ahk.kill",
	SPY: "ahk.spy",
	SWITCH: "ahk.temporary-switch-executable"
};

const SETTINGS_KEYS: any = {
	ExecutablePath: "ahk.executableFullPath",
	DisplayButtons: "ahk.displayButtons",
	InitializeWithHeaderSnippet: "ahk.onEmpty.initializeWithHeaderSnippet",
	OverrideHeaderSnippet: "ahk.onEmpty.overrideHeaderSnippet",
	CompileOnSave: "ahk.onSave.compile",
	RunOnSave: "ahk.onSave.run"
};

const DEFAULT_HEADER_SNIPPET_NAME = "Default Sublime Header";

export function activate(context: vscode.ExtensionContext) {

	console.log('vscode-ahk-manager is ready !');

	let runned_scripts: string[] = new Array();
	let compiled_scripts: string[] = new Array();
	let overriddenCompiledDestination: string | undefined;
	let executablePath: string | undefined = undefined;
	let compilerPath: string | undefined = undefined;
	let winSpyPath: string | undefined = undefined;
	let compile_on_save: boolean = false;
	let run_on_save: boolean = false;
	var delayed_saving_timeout: NodeJS.Timer;

	let is_overridden = false;
	if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === "ahk")
		parseConfiguration(vscode.window.activeTextEditor.document.uri, vscode.window.activeTextEditor.document.getText().length);

	context.subscriptions.push(

		vscode.window.onDidChangeActiveTextEditor(e => {
			if (e && e.document.languageId === 'ahk')
				parseConfiguration(e.document.uri, e.document.getText().length);
		}),

		vscode.workspace.onDidOpenTextDocument(e => {
			if (e.languageId === 'ahk')
				parseConfiguration(e.uri, e.getText().length);
		}),

		vscode.workspace.onDidSaveTextDocument(e => {
			if (e.languageId !== 'ahk' || !e.getText().length)
				return;

			if (delayed_saving_timeout)
				clearTimeout(delayed_saving_timeout);

			delayed_saving_timeout = setTimeout(() => {
				if (compile_on_save && compiled_scripts.includes(e.uri.fsPath)) {
					vscode.commands.executeCommand(COMMAND_IDS.KILL);
					vscode.commands.executeCommand(COMMAND_IDS.COMPILE);
				}
				if (run_on_save && runned_scripts.includes(e.uri.fsPath))
					vscode.commands.executeCommand(COMMAND_IDS.RUN);
				// setTimeout(() => vscode.commands.executeCommand(COMMAND_IDS.RUN), compile_on_save ? 2000 : 1); // the timer delays the RUN command after the KILL above
			}, 1000);
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
				if (executablePath)
					options.defaultUri = vscode.Uri.file(path.dirname(executablePath));
				vscode.window.showOpenDialog(options).then(fileUri => {
					if (fileUri && fileUri[0]) {
						setExecutablePaths(fileUri[0].fsPath);
						is_overridden = true;
					}
				});
			} catch (err) {
				console.log(err);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.SPY, () => {
			if (vscode.window.activeTextEditor && executablePath && winSpyPath) {
				launchProcess(pathify(executablePath), false, "/ErrorStdOut", "/r", winSpyPath);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.RUN, () => {
			if (vscode.window.activeTextEditor && executablePath) {
				const scriptFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
				if (!runned_scripts.includes(scriptFilePath))
					runned_scripts.push(scriptFilePath);
				launchProcess(pathify(executablePath), false, "/ErrorStdOut", "/r", pathify(scriptFilePath));
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.KILL, () => {
			try {
				if (!vscode.window.activeTextEditor)
					return;
				let scriptFileName = path.basename(vscode.window.activeTextEditor.document.uri.fsPath);
				let compiledPath = overriddenCompiledDestination;
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
				if (vscode.window.activeTextEditor && compilerPath) {
					const scriptFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
					if (!compiled_scripts.includes(scriptFilePath))
						compiled_scripts.push(scriptFilePath);

					let iconPath = scriptFilePath.replace(".ahk", ".ico");
					iconPath = fs.existsSync(iconPath) ? "/icon " + pathify(iconPath) : "";
					if (overriddenCompiledDestination)
						launchProcess(compilerPath, false, "/in", pathify(scriptFilePath), "/out", overriddenCompiledDestination, iconPath);
					else
						launchProcess(compilerPath, false, "/in", pathify(scriptFilePath), iconPath);
				}
			} catch (err) {
				vscode.window.showErrorMessage("An error has occured while compiling the script: " + err.message);
			}
		}),

		vscode.commands.registerCommand(COMMAND_IDS.COMPILE_AS, () => {
			try {
				if (vscode.window.activeTextEditor && compilerPath) {
					const options: vscode.SaveDialogOptions = {
						saveLabel: 'Select the destination',
						filters: {
							'Executable': ['exe']
						}
					};
					if (executablePath)
						options.defaultUri = vscode.Uri.file(path.dirname(executablePath));
					vscode.window.showSaveDialog(options).then(fileUri => {
						if (vscode.window.activeTextEditor && compilerPath && fileUri && fileUri) {
							overriddenCompiledDestination = pathify(fileUri.fsPath);
							vscode.commands.executeCommand(COMMAND_IDS.COMPILE);
							// launchProcess(compilerPath, "/in", pathify(vscode.window.activeTextEditor.document.uri.fsPath), "/out", overriddenCompiledDestination);
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
		})
	);

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
				if (executablePath)
					launchProcess(pathify(executablePath), false, pipe_path);
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

	function launchProcess(name: string, quiet: boolean, ...args: string[]) {
		try {
			let command = name.concat(' ', args.join(' '));
			process.exec(command, function callback(error: any, stdout: any, stderr: any) {
				if (error) {
					if (quiet)
						console.log('error: ' + error);
					else
						vscode.window.showErrorMessage("An error has occured while launching the executable: " + error);
				}
			});
		} catch (err) {
			if (quiet)
				console.log(err);
			else
				vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
		}
	}

	function parseConfiguration(uri: vscode.Uri, len: number) {
		try {
			const configuration = vscode.workspace.getConfiguration('', uri);
			const initializeWithHeaderSnippet: boolean | undefined = configuration.get(SETTINGS_KEYS.InitializeWithHeaderSnippet);
			if (initializeWithHeaderSnippet && len === 0) {
				const headerSnippetName: string | undefined = configuration.get(SETTINGS_KEYS.OverrideHeaderSnippet, DEFAULT_HEADER_SNIPPET_NAME);
				vscode.commands.executeCommand('editor.action.insertSnippet', { name: headerSnippetName });
			}
			const filePath: string | undefined = configuration.get(SETTINGS_KEYS.ExecutablePath);
			if (filePath && !is_overridden) {
				setExecutablePaths(filePath);
			}
			compile_on_save = configuration.get(SETTINGS_KEYS.CompileOnSave, false);
			run_on_save = configuration.get(SETTINGS_KEYS.RunOnSave, false);
		} catch (err) {
			console.error(err);
			vscode.window.showErrorMessage(err.message);
		}
	}

	function setExecutablePaths(filePath: string) {
		executablePath = filePath;
		winSpyPath = pathify(path.join(path.dirname(filePath), 'WindowSpy.ahk'));
		compilerPath = pathify(path.join(path.dirname(filePath), 'Compiler', 'Ahk2Exe.exe'));
	}

	function pathify(stringPath: string): string {
		const stringPathDelimiter = '"';
		const path = vscode.Uri.file(stringPath).fsPath;
		return stringPathDelimiter.concat(path, stringPathDelimiter);
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

export function deactivate() { }
