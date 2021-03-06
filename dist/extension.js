module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/*
Author: Denis.net
https://www.autohotkey.com/docs/Scripts.htm#cmd
*/
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const fs = __webpack_require__(3);
const process_utils_1 = __webpack_require__(4);
const offline_docs_manager_1 = __webpack_require__(10);
const net = __webpack_require__(15);
const panic = __webpack_require__(25);
const connectivity_1 = __webpack_require__(26);
const enums_1 = __webpack_require__(7);
const script_manager_provider_1 = __webpack_require__(27);
const configuration_1 = __webpack_require__(6);
const script_meta_data_collection_1 = __webpack_require__(8);
const file_utils_1 = __webpack_require__(9);
let isSaveFromButtonRequest;
function activate(context) {
    console.log(`${enums_1.EXTENSION_NAME} is ready : let's script something awesome !`);
    configuration_1.cfg.extensionPath = context.extensionPath;
    let runned_scripts = new Array();
    let compiled_scripts = new Array();
    var delayed_saving_timeout;
    let treeDataProvider;
    let scriptViewer;
    isSaveFromButtonRequest = false;
    configuration_1.cfg.parseConfiguration(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === "ahk" ? vscode.window.activeTextEditor.document.uri : undefined);
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'ahk')
        configuration_1.cfg.initializeEmptyWithHeaderSnippetIfNeeded(vscode.window.activeTextEditor.document.getText().length);
    treeDataProvider = new script_manager_provider_1.ScriptManagerProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('ahk.scripts-manager', treeDataProvider));
    scriptViewer = vscode.window.createTreeView('ahk.scripts-manager', { treeDataProvider });
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => {
        if (e && vscode.window.activeTextEditor && e.document.languageId === 'ahk') {
            configuration_1.cfg.parseConfiguration(e.document.uri);
            configuration_1.cfg.initializeEmptyWithHeaderSnippetIfNeeded(vscode.window.activeTextEditor.document.getText().length);
        }
    }), vscode.workspace.onDidOpenTextDocument(e => {
        if (vscode.window.activeTextEditor && e.languageId === 'ahk') {
            configuration_1.cfg.parseConfiguration(e.uri);
            configuration_1.cfg.initializeEmptyWithHeaderSnippetIfNeeded(vscode.window.activeTextEditor.document.getText().length);
        }
    }), vscode.workspace.onDidSaveTextDocument(e => {
        if (e.languageId !== 'ahk' || !e.getText().length)
            return;
        if (delayed_saving_timeout)
            clearTimeout(delayed_saving_timeout);
        delayed_saving_timeout = setTimeout(() => {
            if (isSaveFromButtonRequest) {
                isSaveFromButtonRequest = false;
                return;
            }
            if (configuration_1.cfg.compile_on_save && compiled_scripts.includes(e.uri.fsPath)) {
                vscode.commands.executeCommand(enums_1.COMMAND_IDS.KILL);
                vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMPILE);
            }
            if (configuration_1.cfg.run_on_save && runned_scripts.includes(e.uri.fsPath))
                vscode.commands.executeCommand(enums_1.COMMAND_IDS.RUN);
        }, 1000);
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.DOCS, () => {
        if (vscode.window.activeTextEditor && !vscode.window.activeTextEditor.selection.isEmpty && configuration_1.cfg.on_search_docs_style === "online" /* online */) {
            const selection = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
            if (selection) {
                const encodedSelection = encodeURI(selection);
                openLink(encodedSelection);
            }
        }
        else if (configuration_1.cfg.docsPath) {
            // const docs = cfg.docsPath;
            connectivity_1.checkConnection((online) => {
                if (online && configuration_1.cfg.on_search_docs_style === "online" /* online */) {
                    const uri = vscode.Uri.parse('https://www.autohotkey.com/docs/AutoHotkey.htm');
                    // vscode.env.openExternal(uri);
                    vscode.commands.executeCommand('vscode.open', uri);
                }
                else {
                    if (configuration_1.cfg.on_search_docs_style === "html" /* html */) {
                        treeDataProvider.ExecuteAHKCode(configuration_1.cfg.executablePath, (pipe) => panic.CheckIfWinExists(pipe, enums_1.OFFLINE_DOCS_BROWSER_TITLE), (err) => vscode.window.showErrorMessage(err), true, (data) => {
                            let exist = data.toString() !== '0x0';
                            offline_docs_manager_1.offlineDocsManager.initialize(configuration_1.cfg.docsPath, configuration_1.cfg.offline_docs_style_path)
                                .then(offline_docs_manager_1.offlineDocsManager.loadDocs)
                                .then(offline_docs_manager_1.offlineDocsManager.loadBrowser)
                                .then(() => offline_docs_manager_1.offlineDocsManager.browseDocs(exist, runBuffered));
                        });
                    }
                    else {
                        offline_docs_manager_1.offlineDocsManager.launchDocs(configuration_1.cfg.docsPath, runBuffered);
                    }
                    // launchProcess(cfg.docsPath, false);//https://stackoverflow.com/questions/30844427/calling-html-help-from-command-prompt-with-keyword
                }
            });
        }
    }), 
    // vscode.commands.registerCommand('ahk.docs-go-page', (element: string) => {
    // 	vscode.window.showInformationMessage('link ' + element);
    // 	let nPath = vscode.Uri.parse(element).with({ scheme: 'file' });
    // 	let destinationPath = nPath.fsPath.replace(/docs\\\.\./g, 'docs');
    // 	offlineDocsManager.openTheDocsPanel(offlineDocsManager.lastOpenedPanelNumber, destinationPath);
    // }),
    vscode.commands.registerCommand('ahk.hello', () => {
        vscode.window.showInformationMessage('hello from ahk');
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.SWITCH, () => {
        try {
            const options = {
                canSelectMany: false,
                openLabel: 'Switch executable',
                filters: {
                    'Executable': ['exe']
                }
            };
            options.defaultUri = configuration_1.cfg.executableDir;
            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    configuration_1.cfg.overrideExecutablePaths(fileUri[0].fsPath);
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.SPY, () => {
        if (vscode.window.activeTextEditor && configuration_1.cfg.executablePath && configuration_1.cfg.winSpyPath) {
            process_utils_1.launchProcess(configuration_1.cfg.executablePath, false, "/ErrorStdOut", "/r", configuration_1.cfg.winSpyPath);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.RUN_COMPILED, () => {
        let compiled_path = script_meta_data_collection_1.scriptCollection.getCurrentDestination();
        if (vscode.window.activeTextEditor && compiled_path) {
            if (!fs.existsSync(compiled_path)) {
                vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMPILE);
                setTimeout(() => {
                    if (fs.existsSync(compiled_path))
                        process_utils_1.launchProcess(file_utils_1.pathify(compiled_path), false);
                }, 3000);
            }
            else
                process_utils_1.launchProcess(file_utils_1.pathify(compiled_path), false, script_meta_data_collection_1.scriptCollection.getCurrentScriptArguments());
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.RUN, () => {
        if (vscode.window.activeTextEditor && configuration_1.cfg.executablePath) {
            saveIfNeededThenRun((editor) => {
                const scriptFilePath = editor.document.uri.fsPath;
                if (!runned_scripts.includes(scriptFilePath))
                    runned_scripts.push(scriptFilePath);
                process_utils_1.launchProcess(configuration_1.cfg.executablePath, false, "/ErrorStdOut", "/r", file_utils_1.pathify(scriptFilePath), script_meta_data_collection_1.scriptCollection.getCurrentScriptArguments());
            });
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.KILL, () => {
        try {
            if (!vscode.window.activeTextEditor)
                return;
            let scriptFileName = path.basename(vscode.window.activeTextEditor.document.uri.fsPath);
            let compiledPath = script_meta_data_collection_1.scriptCollection.getCurrentDestination();
            if (!compiledPath)
                compiledPath = scriptFileName.replace(path.extname(scriptFileName), ".exe");
            else
                compiledPath = path.basename(compiledPath);
            runBuffered(panic.Kill_Target_Raw_Script(scriptFileName));
            process_utils_1.launchProcess("taskkill", true, "/IM", JSON.stringify(compiledPath), "/F"); // launchProcess("taskkill", "/F", "/PID", last_launched_pid.toString());
        }
        catch (err) {
            vscode.window.showErrorMessage('An error has occured while killing the script/executable: ' + err);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.COMPILE, () => {
        try {
            if (configuration_1.cfg.compilerPath) {
                saveIfNeededThenRun((editor) => {
                    const scriptFilePath = editor.document.uri.fsPath;
                    if (!compiled_scripts.includes(scriptFilePath))
                        compiled_scripts.push(scriptFilePath);
                    let iconPath = script_meta_data_collection_1.scriptCollection.getCurrentIcon();
                    iconPath = fs.existsSync(iconPath) ? "/icon " + file_utils_1.pathify(iconPath) : "";
                    let destination = script_meta_data_collection_1.scriptCollection.getCurrentDestination();
                    process_utils_1.launchProcess(configuration_1.cfg.compilerPath, false, "/in", file_utils_1.pathify(scriptFilePath), "/out", file_utils_1.pathify(destination), iconPath).then((success) => {
                        if (success) {
                            vscode.window.showInformationMessage(`The script has been compiled!\nYou can find it on \`${destination}\``, enums_1.LAUNCH, enums_1.REVEAL_FILE_IN_OS).then((res) => {
                                switch (res) {
                                    case enums_1.LAUNCH:
                                        vscode.commands.executeCommand(enums_1.COMMAND_IDS.RUN_COMPILED);
                                        break;
                                    case enums_1.REVEAL_FILE_IN_OS:
                                        vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, vscode.Uri.file(destination));
                                        break;
                                }
                            });
                        }
                    });
                });
            }
        }
        catch (err) {
            vscode.window.showErrorMessage("An error has occured while compiling the script: " + err.message);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.COMPILE_AS, () => {
        try {
            if (vscode.window.activeTextEditor && configuration_1.cfg.compilerPath) {
                const options = {
                    saveLabel: 'Select the destination',
                    filters: {
                        'Executable': ['exe']
                    }
                };
                if (configuration_1.cfg.executablePath)
                    options.defaultUri = vscode.Uri.file(path.dirname(configuration_1.cfg.executablePath));
                vscode.window.showSaveDialog(options).then(fileUri => {
                    if (vscode.window.activeTextEditor && configuration_1.cfg.compilerPath && fileUri) {
                        script_meta_data_collection_1.scriptCollection.setCurrentDestination(fileUri.fsPath);
                        // cfg.overriddenCompiledDestination = pathify(fileUri.fsPath);
                        vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMPILE);
                    }
                });
            }
        }
        catch (err) {
            console.log(err);
            vscode.window.showErrorMessage("An error has occured while compiling the script: " + err.message);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.RUNBUFFERED, () => {
        saveIfNeededThenRun(() => runBuffered(getValidSelectedText()));
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.SET_TRAY_ICON, () => {
        try {
            if (vscode.window.activeTextEditor) {
                const options = {
                    openLabel: 'Select the tray icon',
                    canSelectMany: false,
                    filters: {
                        'icon': ['ico']
                    }
                };
                if (script_meta_data_collection_1.scriptCollection.getCurrentTrayIcon())
                    options.defaultUri = vscode.Uri.file(path.dirname(script_meta_data_collection_1.scriptCollection.getCurrentTrayIcon()));
                else if (script_meta_data_collection_1.scriptCollection.getCurrentScriptFilePath())
                    options.defaultUri = vscode.Uri.file(path.dirname(script_meta_data_collection_1.scriptCollection.getCurrentScriptFilePath()));
                vscode.window.showOpenDialog(options).then(fileUri => {
                    const editor = vscode.window.activeTextEditor;
                    if (editor && fileUri) {
                        const selPath = fileUri[0].fsPath;
                        let text = editor.document.getText();
                        const reg = /TrayIcon\s*:?\s*=/;
                        let pos = text.search(reg);
                        if (pos >= 0) {
                            editor.edit((builder) => {
                                let position = editor.document.positionAt(pos);
                                let line = editor.document.lineAt(position.line);
                                let endPosition = line.range.end;
                                let icoPos = line.text.indexOf('.ico', line.text.search(reg));
                                if (icoPos >= 0)
                                    endPosition = new vscode.Position(line.lineNumber, icoPos + 4); //line.range.end.translate(0, -(line.range.end.character - icoPos+4));
                                let range = new vscode.Range(position, endPosition);
                                let statementLine = editor.document.getText(range);
                                if (statementLine.includes(':=')) {
                                    endPosition = new vscode.Position(endPosition.line, endPosition.character + 1);
                                    range = new vscode.Range(position, endPosition);
                                    builder.replace(range, `TrayIcon := "${selPath}"`);
                                }
                                else
                                    builder.replace(range, 'TrayIcon = ' + selPath);
                                script_meta_data_collection_1.scriptCollection.setCurrentTrayIcon(selPath);
                            });
                        }
                        else
                            editor.insertSnippet(new vscode.SnippetString(`TrayIcon = \${1:${selPath}}\nIf (FileExist(TrayIcon)) {\n\tMenu, Tray, Icon, %TrayIcon%\n}\n$0`)).then((value) => {
                                if (value)
                                    script_meta_data_collection_1.scriptCollection.setCurrentTrayIcon(selPath);
                            });
                    }
                });
            }
        }
        catch (err) {
            console.log(err);
            vscode.window.showErrorMessage("An error has occured while setting the script's tray icon: " + err.message);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.SET_ICON, () => {
        try {
            if (vscode.window.activeTextEditor) {
                const options = {
                    openLabel: 'Select the icon',
                    canSelectMany: false,
                    filters: {
                        'icon': ['ico']
                    }
                };
                if (script_meta_data_collection_1.scriptCollection.getCurrentIcon())
                    options.defaultUri = vscode.Uri.file(path.dirname(script_meta_data_collection_1.scriptCollection.getCurrentIcon()));
                else if (script_meta_data_collection_1.scriptCollection.getCurrentScriptFilePath())
                    options.defaultUri = vscode.Uri.file(path.dirname(script_meta_data_collection_1.scriptCollection.getCurrentScriptFilePath()));
                vscode.window.showOpenDialog(options).then(fileUri => {
                    if (vscode.window.activeTextEditor && fileUri) {
                        script_meta_data_collection_1.scriptCollection.setCurrentIcon(fileUri[0].fsPath);
                    }
                });
            }
        }
        catch (err) {
            console.log(err);
            vscode.window.showErrorMessage("An error has occured while setting the script's tray icon: " + err.message);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.SET_SCRIPT_ARGS, () => {
        try {
            if (vscode.window.activeTextEditor) {
                const options = { value: script_meta_data_collection_1.scriptCollection.getCurrentScriptArguments(), valueSelection: undefined };
                vscode.window.showInputBox(options).then(value => {
                    if (value !== undefined) {
                        script_meta_data_collection_1.scriptCollection.setCurrentScriptArguments(value || '');
                        if (configuration_1.cfg.run_on_args)
                            vscode.commands.executeCommand(enums_1.COMMAND_IDS.RUN);
                    }
                });
            }
        }
        catch (err) {
            console.log(err);
            vscode.window.showErrorMessage("An error has occured while setting the script's arguments: " + err.message);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.REMOVE_METADATA, () => {
        script_meta_data_collection_1.scriptCollection.clear();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.REMOVE_OFFLINE_DOCS, () => {
        offline_docs_manager_1.offlineDocsManager.clear();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.PASTE_DEFAULT_DOCS_STYLE, () => {
        try {
            offline_docs_manager_1.offlineDocsManager.getDefaultStyle().then((data) => {
                vscode.workspace.openTextDocument({ language: "css", content: data }).then((doc) => {
                    if (vscode.window.activeTextEditor !== undefined && vscode.window.activeTextEditor.document.languageId === 'css') { /*&& vscode.window.activeTextEditor.document.getText().length === 0*/
                        const textDocument = vscode.window.activeTextEditor;
                        vscode.window.activeTextEditor.edit((builder) => {
                            builder.insert(new vscode.Position(textDocument.selection.active.line, textDocument.selection.active.character), data);
                        });
                    }
                    else
                        vscode.window.showTextDocument(doc, vscode.ViewColumn.Active);
                });
            }).catch((err) => vscode.window.showErrorMessage('An Error has occured while getting the default style: ' + err));
        }
        catch (err) {
            vscode.window.showErrorMessage('An Error has occured while overriding the default style: ' + err);
        }
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.REFRESH, (element) => {
        treeDataProvider.refresh();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.SUSPEND_ON, (element) => {
        element.suspend();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.SUSPEND_OFF, (element) => {
        element.unSuspend();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.PAUSE_ON, (element) => {
        element.pause();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.PAUSE_OFF, (element) => {
        element.resume();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.KILL, (element) => {
        element.kill();
    }), vscode.commands.registerCommand(enums_1.COMMAND_IDS.TREE_COMMANDS.SHOW_IN_EXPLORER, (uri) => {
        try {
            if (configuration_1.cfg.executablePath)
                treeDataProvider.ExecuteAHKCode(configuration_1.cfg.executablePath, (pipe) => panic.GetKeyState(pipe, 'Ctrl'), (error) => { throw error; }, true, (result) => {
                    let ctrlIsDown = parseInt(new Buffer(result.buffer).toString('utf8'));
                    if (ctrlIsDown) {
                        // launchProcess(pathify(process.execPath), false, pathify(uri.fsPath));
                        vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(path.dirname(uri.fsPath)), configuration_1.cfg.open_script_folders_in_new_instance);
                    }
                    else
                        vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, uri);
                });
            else
                vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, uri);
        }
        catch (err1) {
            try {
                vscode.commands.executeCommand(enums_1.COMMAND_IDS.COMMONS.REVEAL_FILE_IN_OS, uri);
            }
            catch (err2) {
                vscode.window.showErrorMessage('An error has occured while opening the file', err1, err2);
            }
        }
    }), vscode.languages.registerDocumentFormattingEditProvider('ahk', {
        provideDocumentFormattingEdits(document) {
            let promise = new Promise((c, r) => {
                let replacement = new Array();
                if (!configuration_1.cfg.executablePath) {
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
                treeDataProvider.ExecuteAHKCode(configuration_1.cfg.executablePath, (pipe) => panic.FormatText(pipe), (error) => { throw error; }, true, (result) => {
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
    }));
    function openLink(encodedSelection) {
        try {
            if (!configuration_1.cfg.on_search_query_template)
                return;
            const template = configuration_1.cfg.on_search_query_template.replace('${encodedSelection}', encodedSelection);
            __webpack_require__(28)(template, configuration_1.cfg.on_search_target_browser);
        }
        catch (err) {
            vscode.window.showErrorMessage(`An Error has occured while searching for info about "${encodedSelection}"`, err);
        }
    }
    function runBuffered(buffer = "MsgBox, Select something first !") {
        try {
            const pipe_path = "\\\\.\\pipe\\AHK_" + Date.now() + "_aka_" + path.basename(vscode.window.activeTextEditor.document.uri.fsPath);
            let is_the_second_connection = false;
            let server = net.createServer(function (stream) {
                if (is_the_second_connection)
                    stream.write(buffer);
                else
                    is_the_second_connection = true;
                stream.end();
            });
            server.listen(pipe_path, function () {
                if (configuration_1.cfg.executablePath)
                    process_utils_1.launchProcess(configuration_1.cfg.executablePath, false, pipe_path);
            });
        }
        catch (err) {
            vscode.window.showErrorMessage('An error has occured while interacting with AHK: ', err);
        }
    }
    function getValidSelectedText() {
        let buffer = '';
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === "ahk") {
            buffer = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection).toString();
            if (!buffer)
                buffer = vscode.window.activeTextEditor.document.getText();
        }
        return buffer;
    }
    // function launchProcess(name: string, quiet: boolean, ...args: string[]): Promise<boolean> {
    // 	let p: Promise<boolean> = new Promise((r, c) => {
    // 		try {
    // 			let command = name.concat(' ', args.join(' '));
    // 			child_process.exec(command, function callback(error: any, stdout: any, stderr: any) {
    // 				if (error) {
    // 					if (quiet) {
    // 						console.log('error: ' + error);
    // 					}
    // 					else
    // 						vscode.window.showErrorMessage("An error has occured while launching the executable: " + error);
    // 					c(error);
    // 				}
    // 				else
    // 					r(true);
    // 			});
    // 		} catch (err) {
    // 			if (quiet)
    // 				console.log(err);
    // 			else
    // 				vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
    // 			c(err);
    // 		}
    // 	});
    // 	return p;
    // }
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
exports.activate = activate;
function saveIfNeededThenRun(run) {
    if (!vscode.window.activeTextEditor)
        return;
    const editor = vscode.window.activeTextEditor;
    if (editor.document.isDirty) {
        isSaveFromButtonRequest = true;
        editor.document.save().then((result) => {
            // isSaveFromButtonRequest = false;
            if (result)
                run(editor);
        });
    }
    else
        run(editor);
}
function deactivate() {
}
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(1);
const child_process = __webpack_require__(5);
const configuration_1 = __webpack_require__(6);
function launchProcess(name, quiet, ...args) {
    let p = new Promise((r, c) => {
        try {
            let command = name.concat(' ', args.join(' '));
            child_process.exec(command, { cwd: configuration_1.cfg.extensionPath }, function callback(error, stdout, stderr) {
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
        }
        catch (err) {
            if (quiet)
                console.log(err);
            else
                vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
            c(err);
        }
    });
    return p;
}
exports.launchProcess = launchProcess;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const enums_1 = __webpack_require__(7);
const script_meta_data_collection_1 = __webpack_require__(8);
const file_utils_1 = __webpack_require__(9);
class Configuration {
    constructor() {
        this.extensionPath = '';
        this.executablePath = "";
        this.compilerPath = "";
        this.docsPath = "";
        this.winSpyPath = "";
        this.open_script_folders_in_new_instance = true;
        this.on_search_query_template = "";
        this.on_search_target_browser = "";
        this.on_search_docs_style = "online" /* online */;
        this.offline_docs_style_path = "";
        this.compile_on_save = false;
        this.run_on_save = false;
        this.run_on_args = false;
        // public overriddenCompiledDestination: string | undefined;
        this.is_overridden = false;
    }
    // private manifest: any = {};
    // public get appName(): string {
    //     let name: string = 'ahk';
    //     try {
    //         if (!this.manifest) {
    //             this.manifest = JSON.parse(fs.readFileSync(path.join(__filename, '..', '..', 'package.json')).toString());
    //             name = this.manifest.name;
    //         }
    //     } catch (err) {
    //         vscode.window.showErrorMessage('Unable to load the manifest... ' + err);
    //     }
    //     return name;
    // }
    /**
     * parse
     */
    parseConfiguration(uri, len) {
        try {
            const configuration = uri ? vscode.workspace.getConfiguration('', uri) : vscode.workspace.getConfiguration();
            this.initializeWithHeaderSnippet = configuration.get(enums_1.SETTINGS_KEYS.InitializeWithHeaderSnippet);
            this.headerSnippetName = configuration.get(enums_1.SETTINGS_KEYS.OverrideHeaderSnippet, enums_1.DEFAULT_HEADER_SNIPPET_NAME);
            // this.initializeEmptyWithHeaderSnippetIfNeeded(len);
            const filePath = configuration.get(enums_1.SETTINGS_KEYS.ExecutablePath) || "";
            if (filePath && !this.is_overridden) {
                this.executableDir = vscode.Uri.file(path.dirname(filePath));
                this.setExecutablePaths(filePath);
            }
            this.compile_on_save = configuration.get(enums_1.SETTINGS_KEYS.CompileOnSave, false);
            this.run_on_save = configuration.get(enums_1.SETTINGS_KEYS.RunOnSave, false);
            this.on_search_target_browser = configuration.get(enums_1.SETTINGS_KEYS.OnSearchTargetBrowser) || "";
            this.on_search_query_template = configuration.get(enums_1.SETTINGS_KEYS.OnSearchQueryTemplate) || "";
            this.on_search_docs_style = configuration.get(enums_1.SETTINGS_KEYS.DocsStyle, "online" /* online */);
            this.offline_docs_style_path = configuration.get(enums_1.SETTINGS_KEYS.OverrideOfflineDocsStylePath, "");
            this.open_script_folders_in_new_instance = configuration.get(enums_1.SETTINGS_KEYS.OpenScriptFoldersInNewInstance, true);
            this.run_on_args = configuration.get(enums_1.SETTINGS_KEYS.RunOnArgs, false);
            if (uri)
                script_meta_data_collection_1.scriptCollection.setCurrent(uri);
        }
        catch (err) {
            console.error(err);
            vscode.window.showErrorMessage(err.message);
        }
    }
    initializeEmptyWithHeaderSnippetIfNeeded(len) {
        if (this.initializeWithHeaderSnippet && len === 0) {
            vscode.commands.executeCommand('editor.action.insertSnippet', { name: this.headerSnippetName });
        }
    }
    setExecutablePaths(filePath) {
        this.winSpyPath = file_utils_1.pathify(path.join(path.dirname(filePath), 'WindowSpy.ahk'));
        this.docsPath = file_utils_1.pathify(path.join(path.dirname(filePath), 'AutoHotkey.chm'));
        this.compilerPath = file_utils_1.pathify(path.join(path.dirname(filePath), 'Compiler', 'Ahk2Exe.exe'));
        this.executablePath = file_utils_1.pathify(filePath);
    }
    overrideExecutablePaths(filePath) {
        this.setExecutablePaths(filePath);
        this.is_overridden = true;
    }
}
exports.Configuration = Configuration;
exports.cfg = new Configuration();


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENSION_NAME = 'vscode-ahk-manager';
exports.COMMAND_IDS = {
    COMPILE: "ahk.compile",
    COMPILE_AS: "ahk.compile-as",
    RUN: "ahk.run",
    RUN_COMPILED: "ahk.run-compiled",
    RUNBUFFERED: "ahk.run-buffer",
    KILL: "ahk.kill",
    SPY: "ahk.spy",
    DOCS: "ahk.docs",
    PASTE_DEFAULT_DOCS_STYLE: "ahk.paste-default-docs-style",
    SET_ICON: "ahk.set-icon",
    SET_TRAY_ICON: "ahk.set-tray-icon",
    SET_SCRIPT_ARGS: "ahk.set-script-arguments",
    SWITCH: "ahk.temporary-switch-executable",
    REMOVE_METADATA: "ahk.remove-script-metadata",
    REMOVE_OFFLINE_DOCS: "ahk.remove-ahk-offline-docs",
    TREE_COMMANDS: {
        REFRESH: "ahk.scripts-manager.refresh",
        SUSPEND_ON: "ahk.scripts-manager.suspend-on",
        SUSPEND_OFF: "ahk.scripts-manager.suspend-off",
        PAUSE_ON: "ahk.scripts-manager.pause-on",
        PAUSE_OFF: "ahk.scripts-manager.pause-off",
        KILL: "ahk.scripts-manager.kill",
        SHOW_IN_EXPLORER: "ahk.scripts-manager.show-in-explorer"
    },
    COMMONS: {
        REVEAL_FILE_IN_OS: "revealFileInOS"
    }
};
exports.SETTINGS_KEYS = {
    ExecutablePath: "ahk.executableFullPath",
    DisplayButtons: "ahk.displayButtons",
    InitializeWithHeaderSnippet: "ahk.onEmpty.initializeWithHeaderSnippet",
    OverrideHeaderSnippet: "ahk.onEmpty.overrideHeaderSnippet",
    CompileOnSave: "ahk.onSave.compile",
    RunOnSave: "ahk.onSave.run",
    OnSearchQueryTemplate: "ahk.onSearch.queryTemplate",
    OnSearchTargetBrowser: "ahk.onSearch.targetBrowser",
    OpenScriptFoldersInNewInstance: "ahk.scriptFolders.openInNewInstance",
    RunOnArgs: 'ahk.onArgs.run',
    DocsStyle: 'ahk.onSearch.docsStyle',
    OverrideOfflineDocsStylePath: 'ahk.overrideOfflineDocsStylePath'
};
exports.DEFAULT_HEADER_SNIPPET_NAME = "Default Sublime Header";
exports.REVEAL_FILE_IN_OS = "Reveal file in OS";
exports.LAUNCH = "Launch now";
exports.DOCS_INDEX = 'index.hhk';
exports.OFFLINE_DOCS_BROWSER_TITLE = 'AutoHotkey Documentation';
exports.BROWSER_EXECUTABLE_NAME = 'AutoHotkeyBrowser.exe';


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(1);
const fs = __webpack_require__(3);
const path = __webpack_require__(2);
const enums_1 = __webpack_require__(7);
class ScriptMetaDataCollection {
    constructor() {
        this.lastWrittenData = '';
        this.collection = new Array();
        this.isCollectionLoaded = false;
        this.metaDataFilePath = path.join(process.env.APPDATA || 'C:/', enums_1.EXTENSION_NAME, 'script-meta-data.json');
        this.loadScriptMetaData();
    }
    /**
     * loadScriptMetaData
     */
    loadScriptMetaData() {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Script Metadata loading ...",
        }, (progress, token) => {
            return this.fromFile().then((data) => {
                progress.report({ message: 'file loaded' });
                this.lastWrittenData = data;
                this.collection = data.length ? JSON.parse(data) : new Array();
                progress.report({ message: 'data parsed' });
                this.isCollectionLoaded = true;
                if (this.delayedSetCurrentUri) {
                    this.setCurrent(this.delayedSetCurrentUri);
                    progress.report({ message: 'all ready !' });
                }
            }).catch((ex) => vscode.window.showErrorMessage('Unable to load scripts\' metadata ' + ex));
        });
    }
    /**
    * saveScriptMetaData
    */
    saveScriptMetaData() {
        var data = JSON.stringify(this.collection);
        if (data !== this.lastWrittenData) {
            if (this.makeSureDirExists())
                fs.writeFile(this.metaDataFilePath, data, (err) => {
                    if (err)
                        vscode.window.showErrorMessage('Unable to save the scripts\' metadata. ' + err);
                    console.log("Scripts metadata saved");
                    this.lastWrittenData = data;
                });
        }
    }
    makeSureDirExists() {
        if (this.metaDataFilePath)
            try {
                const dir = path.dirname(this.metaDataFilePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                return true;
            }
            catch (err) {
                vscode.window.showErrorMessage('Unable to create a directory on path `' + this.metaDataFilePath + '`: ' + err);
            }
        return false;
    }
    fromFile() {
        this.isCollectionLoaded = false;
        let promise = new Promise((r, c) => {
            if (fs.existsSync(this.metaDataFilePath))
                fs.readFile(this.metaDataFilePath, "utf-8", (err, data) => {
                    try {
                        if (err)
                            c(err);
                        else
                            r(data);
                    }
                    catch (ex) {
                        c(ex);
                    }
                });
            else
                r('');
        });
        return promise;
    }
    /**
     * setCurrent
     */
    setCurrent(uri) {
        this.current = undefined;
        if (this.isCollectionLoaded) {
            for (let i = 0; i < this.collection.length; i++) {
                const scriptMetaData = this.collection[i];
                if (scriptMetaData.scripFilePath === uri.fsPath) {
                    this.current = scriptMetaData;
                    break;
                }
            }
            if (!this.current) {
                this.current = new ScriptMetaData(uri.fsPath);
                this.collection.push(this.current);
            }
        }
        else {
            this.delayedSetCurrentUri = uri;
            vscode.window.showWarningMessage('Script Metadata load is in progress...');
        }
    }
    /**
     * setCurrentDestination
     */
    setCurrentDestination(path) {
        if (this.current) {
            this.current.compiledDestination = path;
            this.saveScriptMetaData();
        }
    }
    /**
     * getCurrentDestination
     */
    getCurrentDestination() {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.compiledDestination;
    }
    /**
 * getCurrentDestination
 */
    getCurrentIcon() {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.iconPath;
    }
    setCurrentIcon(fsPath) {
        if (this.current) {
            this.current.iconPath = fsPath;
            this.saveScriptMetaData();
        }
    }
    /**
 * getCurrentDestination
 */
    getCurrentTrayIcon() {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.trayIconPath;
    }
    setCurrentTrayIcon(fsPath) {
        if (this.current) {
            this.current.trayIconPath = fsPath;
            this.saveScriptMetaData();
        }
    }
    /**
     * getCurrentDestination
     */
    getCurrentScriptFilePath() {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.scripFilePath;
    }
    setCurrentScriptArguments(args) {
        if (this.current) {
            this.current.scriptArguments = args;
            this.saveScriptMetaData();
        }
    }
    /**
     * getCurrentDestination
     */
    getCurrentScriptArguments() {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.scriptArguments;
    }
    clear() {
        if (this.isCollectionLoaded) {
            if (this.current) {
                const filePath = this.current.scripFilePath;
                this.collection = new Array();
                this.setCurrent(vscode.Uri.parse(filePath));
            }
            else
                this.collection = new Array();
            if (fs.existsSync(this.metaDataFilePath))
                fs.unlink(this.metaDataFilePath, (err) => {
                    if (err)
                        vscode.window.showErrorMessage('Unable to remove the scripts\' metadata file: ' + err);
                });
        }
        else
            vscode.window.showWarningMessage('Script Metadata load is in progress...');
    }
}
exports.ScriptMetaDataCollection = ScriptMetaDataCollection;
class ScriptMetaData {
    constructor(scripFilePath) {
        this.scripFilePath = scripFilePath;
        this.compiledDestination = this.scripFilePath.replace('.ahk', '.exe');
        this.trayIconPath = this.iconPath = this.scripFilePath.replace('.ahk', '.ico');
        this.scriptArguments = '';
    }
}
exports.ScriptMetaData = ScriptMetaData;
exports.scriptCollection = new ScriptMetaDataCollection();


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(3);
const path = __webpack_require__(2);
const vscode = __webpack_require__(1);
function makeSureDirExists(dirPath) {
    if (dirPath)
        try {
            const dir = path.dirname(dirPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            return true;
        }
        catch (err) {
            vscode.window.showErrorMessage('Unable to create a directory on path `' + dirPath + '`: ' + err);
        }
    return false;
}
exports.makeSureDirExists = makeSureDirExists;
function readFile(filePath) {
    let promise = new Promise((r, c) => {
        if (fs.existsSync(filePath))
            fs.readFile(filePath, "utf-8", (err, data) => {
                try {
                    if (err)
                        c(err);
                    else
                        r(data);
                }
                catch (ex) {
                    c(ex);
                }
            });
        else
            r('');
    });
    return promise;
}
exports.readFile = readFile;
function pathify(stringPath) {
    const stringPathDelimiter = '"';
    const path = vscode.Uri.file(stringPath).fsPath;
    return stringPathDelimiter.concat(path, stringPathDelimiter);
}
exports.pathify = pathify;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(1);
const fs = __webpack_require__(3);
const dgram = __webpack_require__(11);
const http = __webpack_require__(12);
const path = __webpack_require__(2);
const portfinder = __webpack_require__(13);
const enums_1 = __webpack_require__(7);
const process_utils_1 = __webpack_require__(4);
const file_utils_1 = __webpack_require__(9);
const panic_1 = __webpack_require__(25);
class OfflineDocsManager {
    constructor() {
        this.udp_port = 0;
        this.collection = new Array();
        this.isLoadingInProgress = false;
        this.isCollectionLoaded = false;
        this.isDocsPanelDisposed = false;
        this.lastOpenedPanelNumber = 2;
        this.docsDirectoryPath = path.join(process.env.APPDATA || 'C:/', enums_1.EXTENSION_NAME, 'Docs');
        this.docsIndexPath = path.join(this.docsDirectoryPath, enums_1.DOCS_INDEX);
        this.docsThemePath = path.join(this.docsDirectoryPath, 'docs', 'static', 'theme.css');
        this.docsDefaultThemePath = path.join(this.docsDirectoryPath, 'docs', 'theme.css');
        this.browserPath = path.join(this.docsDirectoryPath, enums_1.BROWSER_EXECUTABLE_NAME);
    }
    /**
     * initialize
     * sourceChm is stringhyfied
     */
    initialize(sourceChm, overriddenStylePath) {
        this.docsOverriddenThemePath = overriddenStylePath;
        let p = new Promise((r, c) => {
            sourceChm = sourceChm.substring(1, sourceChm.length - 1);
            if (this.isLoadingInProgress)
                return;
            if (!sourceChm || !fs.existsSync(sourceChm)) {
                vscode.window.showErrorMessage('Source CHM not found !');
                return false;
            }
            if (!fs.existsSync(this.docsIndexPath)) {
                this.isLoadingInProgress = true;
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Decompiling Ahk Offline docs ...",
                }, (progress, token) => {
                    return process_utils_1.launchProcess('hh.exe', false, '-decompile', this.docsDirectoryPath, sourceChm) //.replace(/\\/g,'/') .replace(/\\/g,'/')
                        .then((result) => {
                        if (result) {
                            fs.copyFileSync(this.docsThemePath, this.docsDefaultThemePath);
                            r(true); //this.loadDocs(overriddenStylePath);
                        }
                    })
                        .catch((ex) => vscode.window.showErrorMessage('Unable to decompiling ahk\'s docs ' + ex))
                        .finally(() => {
                        this.isLoadingInProgress = false;
                    });
                });
            }
            else
                r(true); //this.loadDocs(overriddenStylePath);
        });
        return p;
    }
    loadBrowser() {
        return new Promise((rp, cp) => {
            if (fs.existsSync(exports.offlineDocsManager.browserPath)) {
                const creation_time = fs.statSync(exports.offlineDocsManager.browserPath).birthtime;
                const last_push_time = new Date(2019, 6, 14); //month is 0 based
                if (creation_time > last_push_time) {
                    rp(true);
                    return;
                }
                else
                    fs.unlinkSync(exports.offlineDocsManager.browserPath);
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Downloading the AutoHotkeyBrowser",
            }, (progress, token) => {
                return new Promise((r, c) => {
                    const link = 'https://raw.githubusercontent.com/Denis-net/AutoHotkeyBrowser/master/AutoHotkeyBrowser/bin/Debug/AutoHotkeyBrowser.exe';
                    const dest = exports.offlineDocsManager.browserPath;
                    var file = fs.createWriteStream(dest);
                    var request = http.get(link, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            file.close(); // close() is async, call cb after close completes.
                            r(true);
                        });
                    }).on('error', function (err) {
                        fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
                        c(err.message);
                    });
                });
            }).then(rp);
        });
    }
    loadDocs() {
        return new Promise((r, c) => {
            if (fs.existsSync(exports.offlineDocsManager.docsIndexPath)) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Loading Ahk Offline docs ...",
                }, (progress, token) => {
                    exports.offlineDocsManager.isCollectionLoaded = false;
                    return file_utils_1.readFile(exports.offlineDocsManager.docsIndexPath).then((data) => {
                        progress.report({ message: 'file loaded' });
                        // const dom = new JSDOM(data);
                        // offlineDocsManager.collection = new Array();
                        // if (dom) {
                        // var listItems = dom.window.document.getElementsByTagName('param');
                        // let lastName: string = '';
                        // for (let i = 0; i < listItems.length; i++) {
                        //     const item = listItems[i];
                        //     if (item.name === "Local") {
                        //         offlineDocsManager.collection.push(new OfflineDocItem('', lastName, item.value!.toString()));
                        //     }
                        //     else
                        //         lastName = item.value.toString();
                        // }
                        // }
                        progress.report({ message: 'data parsed' });
                        exports.offlineDocsManager.isCollectionLoaded = true;
                        progress.report({ message: 'docs ready !' });
                        try {
                            // set the theme:
                            fs.copyFileSync(exports.offlineDocsManager.docsOverriddenThemePath ? exports.offlineDocsManager.docsOverriddenThemePath : exports.offlineDocsManager.docsDefaultThemePath, exports.offlineDocsManager.docsThemePath);
                        }
                        catch (err) {
                            vscode.window.showErrorMessage('An error has occured while setting the style: ' + err);
                        }
                        r(true);
                        //this.openTheDocsPanel(vscode.window.visibleTextEditors.length + 1, path.join(this.docsDirectoryPath, 'docs', 'Hotkeys.htm'));
                    }).catch((ex) => vscode.window.showErrorMessage('Unable to load ahk\'s docs ' + ex));
                });
            }
        });
    }
    /**
     * browseDocs
     */
    browseDocs(isAlreadyOpened, runBuffered) {
        let input = this.getInput();
        if (input instanceof Promise) {
            input.then((r) => {
                this.searchWithBrowser(isAlreadyOpened, r, runBuffered);
            });
        }
        else {
            this.searchWithBrowser(isAlreadyOpened, input, runBuffered);
        }
    }
    /**
     * searchWithBrowser
        * CommandLine Arguments:
        * [0] #Program_Name
        * [1] Url
        * [2] Keyword
        * [3] UDP_Port
        * [4] Parent_Pid
     */
    searchWithBrowser(isAlreadyOpened, keyword, runBuffered) {
        var url = path.join(this.docsDirectoryPath, 'docs\\Welcome.htm');
        if (this.udp_port === 0 && isAlreadyOpened) {
            process_utils_1.launchProcess('taskkill.exe', false, '/F', '/IM', enums_1.BROWSER_EXECUTABLE_NAME, '/T');
            isAlreadyOpened = false;
        }
        if (this.udp_port === 0) {
            portfinder.getPorts(3, { host: 'localhost', port: 5000, startPort: 6000 }, (e, ports) => {
                if (e) {
                    vscode.window.showErrorMessage("can't find free port...");
                    return;
                }
                this.udp_port = ports[0];
                this.searchWithBrowser(isAlreadyOpened, keyword, runBuffered);
            });
        }
        else if (!isAlreadyOpened) {
            process_utils_1.launchProcess(this.browserPath, false, file_utils_1.pathify(url), JSON.stringify(keyword), this.udp_port.toString(), process.pid.toString());
            runBuffered(panic_1.SnapWindowToRigth(enums_1.BROWSER_EXECUTABLE_NAME));
        }
        else {
            const message = Buffer.from(keyword);
            const client = dgram.createSocket('udp4');
            client.send(message, this.udp_port, '127.0.0.1', (err) => {
                if (err) {
                    vscode.window.showErrorMessage('An error has occured while interacting with the doc: ', err.message);
                }
                client.close();
            });
        }
    }
    /**
     * launchDocs
     */
    launchDocs(docsPath, runBuffered) {
        let input = this.getInput();
        if (input instanceof Promise) {
            input.then((r) => {
                let command = panic_1.PerformOfflineDocsSearch(docsPath, r); //path.join(this.docsDirectoryPath, 'docs', 'Welcome.htm'),
                runBuffered(command);
            });
        }
        else {
            let command = panic_1.PerformOfflineDocsSearch(docsPath, input); //path.join(this.docsDirectoryPath, 'docs', 'Welcome.htm')
            runBuffered(command);
        }
    }
    // public openTheDocsPanel(column: number, pagePath: string) {
    //     this.lastOpenedPanelNumber = column;
    //     if (!this.docsPanel || this.isDocsPanelDisposed) {
    //         this.docsPanel = vscode.window.createWebviewPanel('ahk-offline-docs', 'Documentation', { viewColumn: vscode.ViewColumn.Two, preserveFocus: true }, {
    //             enableScripts: true,
    //             enableFindWidget: true,
    //             enableCommandUris: true,
    //             localResourceRoots: [vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs//')).with({ scheme: 'vscode-resource' })]
    //         });
    //         this.docsPanel.onDidDispose((e) => {
    //             this.isDocsPanelDisposed = true;
    //         });
    //     }
    //     if (!this.docsPanel.visible)
    //         this.docsPanel.reveal();
    //     if (this.updateDocsTimeout)
    //         clearTimeout(this.updateDocsTimeout);
    //     this.updateDocsTimeout = setTimeout(() => {
    //         if (!this.isDocsPanelDisposed)
    //             fs.readFile(pagePath, { encoding: "utf-8" }, (err, data) => {
    //                 if (!this.docsPanel)
    //                     return;
    //                 if (err) {
    //                     vscode.window.showErrorMessage('An error has occured while opening the page: ' + err);
    //                 }
    //                 let url = vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs/')).with({ scheme: 'vscode-resource' });
    //                 // const dom = new JSDOM(data.replace('<head>', `<head>\n<base href="${url.toString()}/">`), { runScripts: "dangerously", url: vscode.Uri.file(pagePath).toString() });
    //                 // const aTags = dom.window.document.getElementsByTagName('a');
    //                 // const len = aTags.length;
    //                 const basePath = url.toString();
    //                 for (let i = 0; i < len; i++) {
    //                     // const a = aTags[i];
    //                     if (
    //                         !a.href.includes('about:blank') &&
    //                         !a.href.includes('http:') &&
    //                         !a.href.includes('https:') &&
    //                         !a.href.includes('//#')) {
    //                         // const commentCommandUri = vscode.Uri.parse(`command:ahk.spy`);
    //                         const commentCommandUri = vscode.Uri.parse(
    //                             `command:ahk.docs-go-page?${encodeURIComponent(JSON.stringify(a.href))}`
    //                         );
    //                         // a.href = basePath + a.href;
    //                         a.href = commentCommandUri.toString();
    //                         // a.removeAttribute('href');
    //                         // a.setAttribute('onclick', '{command:ahk.spy}');
    //                     }
    //                 }
    //                 let html = dom.serialize();
    //                 this.docsPanel.webview.html = /*data/*ser*/html.toString();
    //             });
    //     }, 2000);
    //     // let exists = false;
    //     // let legacyMatchesFileUri: vscode.Uri = vscode.Uri.file("lol");
    //     // return vscode.workspace.openTextDocument(encodeURI('command:vscode.previewHtml?' + JSON.stringify(vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs', 'Hotkeys.htm')))))
    //     //     //  (exists ? vscode.workspace.openTextDocument(legacyMatchesFileUri.with({ scheme: 'file' })) :
    //     //     //     vscode.workspace.openTextDocument({ language: 'text', content: 'lol' }))
    //     //     .then(document => {
    //     //         let d1 = vscode.window.showTextDocument(document, column, true);
    //     //         return d1;
    //     //     }).then(editor => {
    //     //         let ok = true;
    //     //     });
    // }
    getDefaultStyle() {
        return new Promise((r, c) => {
            fs.readFile(exports.offlineDocsManager.docsDefaultThemePath, (err, data) => {
                if (err)
                    c(err);
                else
                    r(data.toString());
            });
        });
    }
    clear() {
        if (this.isCollectionLoaded) {
            // if (this.current) {
            //     const filePath = this.current.scripFilePath;
            //     this.collection = new Array();
            //     // this.setCurrent(vscode.Uri.parse(filePath));
            // }
            // else
            //     this.collection = new Array();
            if (fs.existsSync(this.docsIndexPath))
                fs.unlink(this.docsIndexPath, (err) => {
                    if (err)
                        vscode.window.showErrorMessage('Unable to remove the scripts\' metadata file: ' + err);
                });
        }
        else
            vscode.window.showWarningMessage('Script Metadata load is in progress...');
    }
    getInput() {
        if (!vscode.window.activeTextEditor)
            return '';
        let editor = vscode.window.activeTextEditor;
        if (!editor.selection.isEmpty) {
            const selectedText = editor.document.getText(editor.selection);
            if (editor.selection.isSingleLine) {
                return this.tokenizeText(selectedText);
            }
            else if (selectedText === editor.document.getText()) {
                vscode.window.showWarningMessage("don't select all the available text !");
                return '';
            }
            else {
                return this.tokenizeText(selectedText);
            }
        }
        else if (editor.document.getText().length === 0) {
            vscode.window.showWarningMessage('Write some text first !');
            return '';
        }
        else {
            let word = editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.active));
            if (!word.length) {
                word = this.parseLine(editor.selection.active.line);
                if (!word) {
                    word = this.parseLine(editor.selection.active.line - 1);
                    if (!word) {
                        word = this.parseLine(editor.selection.active.line + 1);
                    }
                }
            }
            return word;
        }
    }
    parseLine(lineNumber) {
        if (!vscode.window.activeTextEditor)
            return '';
        let editor = vscode.window.activeTextEditor;
        let line = editor.document.lineAt(lineNumber).text;
        if (line.length) {
            return this.tokenizeText(line);
        }
        else
            return '';
    }
    tokenizeText(line) {
        let content = line.trim();
        let parts = content.split(/[\.:,({\[\]})\s%]/g);
        if (!parts)
            return '';
        if (parts.length === 1) {
            return parts[0];
        }
        parts = parts.filter(x => x.length > 0);
        let usedParts = new Array();
        const len = parts.length;
        for (let i = 0; i < len; i++) {
            if (!Number(parts[i]))
                usedParts.push(parts[i]);
        }
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        usedParts = usedParts.filter(onlyUnique);
        let promise = new Promise((r, c) => {
            vscode.window.showQuickPick(usedParts, { placeHolder: 'Select the most intresting part' }).then((result) => {
                if (result)
                    r(result);
                else
                    c('User cancelled the operation');
            });
        });
        return promise;
    }
}
exports.OfflineDocsManager = OfflineDocsManager;
class OfflineDocItem {
    constructor(compiledDestination, name, local) {
        this.compiledDestination = compiledDestination;
        this.name = name;
        this.local = local;
        // this.compiledDestination = this.name;
    }
}
exports.OfflineDocItem = OfflineDocItem;
exports.offlineDocsManager = new OfflineDocsManager();


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("dgram");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * portfinder.js: A simple tool to find an open port on the current machine.
 *
 * (C) 2011, Charlie Robbins
 *
 */



var fs = __webpack_require__(3),
    os = __webpack_require__(14),
    net = __webpack_require__(15),
    path = __webpack_require__(2),
    async = __webpack_require__(16),
    debug = __webpack_require__(17),
    mkdirp = __webpack_require__(24).mkdirp;

var debugTestPort = debug('portfinder:testPort'),
    debugGetPort = debug('portfinder:getPort'),
    debugDefaultHosts = debug('portfinder:defaultHosts');

var internals = {};

internals.testPort = function(options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  options.server = options.server  || net.createServer(function () {
    //
    // Create an empty listener for the port testing server.
    //
  });

  debugTestPort("entered testPort(): trying", options.host, "port", options.port);

  function onListen () {
    debugTestPort("done w/ testPort(): OK", options.host, "port", options.port);

        options.server.removeListener('error', onError);
        options.server.close();
      callback(null, options.port);
  }

  function onError (err) {
    debugTestPort("done w/ testPort(): failed", options.host, "w/ port", options.port, "with error", err.code);

    options.server.removeListener('listening', onListen);

    if (!(err.code == 'EADDRINUSE' || err.code == 'EACCES')) {
      return callback(err);
    }

    var nextPort = exports.nextPort(options.port);

    if (nextPort > exports.highestPort) {
      return callback(new Error('No open ports available'));
    }

    internals.testPort({
      port: nextPort,
      host: options.host,
      server: options.server
    }, callback);
  }

  options.server.once('error', onError);
  options.server.once('listening', onListen);

  if (options.host) {
    options.server.listen(options.port, options.host);
  } else {
    /*
      Judgement of service without host
      example:
        express().listen(options.port)
    */
    options.server.listen(options.port);
  }
};

//
// ### @basePort {Number}
// The lowest port to begin any port search from
//
exports.basePort = 8000;

//
// ### @highestPort {Number}
// Largest port number is an unsigned short 2**16 -1=65335
//
exports.highestPort = 65535;

//
// ### @basePath {string}
// Default path to begin any socket search from
//
exports.basePath = '/tmp/portfinder'

//
// ### function getPort (options, callback)
// #### @options {Object} Settings to use when finding the necessary port
// #### @callback {function} Continuation to respond to when complete.
// Responds with a unbound port on the current machine.
//
exports.getPort = function (options, callback) {
  if (!callback) {
    callback = options;
    options = {};

  }

  options.port   = Number(options.port) || Number(exports.basePort);
  options.host   = options.host    || null;
  options.stopPort = Number(options.stopPort) || Number(exports.highestPort);

  if(!options.startPort) {
    options.startPort = Number(options.port);
    if(options.startPort < 0) {
      throw Error('Provided options.startPort(' + options.startPort + ') is less than 0, which are cannot be bound.');
    }
    if(options.stopPort < options.startPort) {
      throw Error('Provided options.stopPort(' + options.stopPort + 'is less than options.startPort (' + options.startPort + ')');
    }
  }

  if (options.host) {

    var hasUserGivenHost;
    for (var i = 0; i < exports._defaultHosts.length; i++) {
      if (exports._defaultHosts[i] === options.host) {
        hasUserGivenHost = true;
        break;
      }
    }

    if (!hasUserGivenHost) {
      exports._defaultHosts.push(options.host);
    }

  }

  var openPorts = [], currentHost;
  return async.eachSeries(exports._defaultHosts, function(host, next) {
    debugGetPort("in eachSeries() iteration callback: host is", host);

    return internals.testPort({ host: host, port: options.port }, function(err, port) {
      if (err) {
        debugGetPort("in eachSeries() iteration callback testPort() callback", "with an err:", err.code);
        currentHost = host;
        return next(err);
      } else {
        debugGetPort("in eachSeries() iteration callback testPort() callback",
                    "with a success for port", port);
        openPorts.push(port);
        return next();
      }
    });
  }, function(err) {

    if (err) {
      debugGetPort("in eachSeries() result callback: err is", err);
      // If we get EADDRNOTAVAIL it means the host is not bindable, so remove it
      // from exports._defaultHosts and start over. For ubuntu, we use EINVAL for the same
      if (err.code === 'EADDRNOTAVAIL' || err.code === 'EINVAL') {
        if (options.host === currentHost) {
          // if bad address matches host given by user, tell them
          //
          // NOTE: We may need to one day handle `my-non-existent-host.local` if users
          // report frustration with passing in hostnames that DONT map to bindable
          // hosts, without showing them a good error.
          var msg = 'Provided host ' + options.host + ' could NOT be bound. Please provide a different host address or hostname';
          return callback(Error(msg));
        } else {
          var idx = exports._defaultHosts.indexOf(currentHost);
          exports._defaultHosts.splice(idx, 1);
          return exports.getPort(options, callback);
        }
      } else {
        // error is not accounted for, file ticket, handle special case
        return callback(err);
      }
    }

    // sort so we can compare first host to last host
    openPorts.sort(function(a, b) {
      return a - b;
    });

    debugGetPort("in eachSeries() result callback: openPorts is", openPorts);

    if (openPorts[0] === openPorts[openPorts.length-1]) {
      // if first === last, we found an open port
      if(openPorts[0] <= options.stopPort) {
        return callback(null, openPorts[0]);
      }
      else {
        var msg = 'No open ports found in between '+ options.startPort + ' and ' + options.stopPort;
        return callback(Error(msg));
      }
    } else {
      // otherwise, try again, using sorted port, aka, highest open for >= 1 host
      return exports.getPort({ port: openPorts.pop(), host: options.host, startPort: options.startPort, stopPort: options.stopPort }, callback);
    }

  });
};

//
// ### function getPortPromise (options)
// #### @options {Object} Settings to use when finding the necessary port
// Responds a promise to an unbound port on the current machine.
//
exports.getPortPromise = function (options) {
  if (typeof Promise !== 'function') {
    throw Error('Native promise support is not available in this version of node.' +
      'Please install a polyfill and assign Promise to global.Promise before calling this method');
  }
  if (!options) {
    options = {};
  }
  return new Promise(function(resolve, reject) {
    exports.getPort(options, function(err, port) {
      if (err) {
        return reject(err);
      }
      resolve(port);
    });
  });
}

//
// ### function getPorts (count, options, callback)
// #### @count {Number} The number of ports to find
// #### @options {Object} Settings to use when finding the necessary port
// #### @callback {function} Continuation to respond to when complete.
// Responds with an array of unbound ports on the current machine.
//
exports.getPorts = function (count, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  var lastPort = null;
  async.timesSeries(count, function(index, asyncCallback) {
    if (lastPort) {
      options.port = exports.nextPort(lastPort);
    }

    exports.getPort(options, function (err, port) {
      if (err) {
        asyncCallback(err);
      } else {
        lastPort = port;
        asyncCallback(null, port);
      }
    });
  }, callback);
};

//
// ### function getSocket (options, callback)
// #### @options {Object} Settings to use when finding the necessary port
// #### @callback {function} Continuation to respond to when complete.
// Responds with a unbound socket using the specified directory and base
// name on the current machine.
//
exports.getSocket = function (options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  options.mod  = options.mod    || parseInt(755, 8);
  options.path = options.path   || exports.basePath + '.sock';

  //
  // Tests the specified socket
  //
  function testSocket () {
    fs.stat(options.path, function (err) {
      //
      // If file we're checking doesn't exist (thus, stating it emits ENOENT),
      // we should be OK with listening on this socket.
      //
      if (err) {
        if (err.code == 'ENOENT') {
          callback(null, options.path);
        }
        else {
          callback(err);
        }
      }
      else {
        //
        // This file exists, so it isn't possible to listen on it. Lets try
        // next socket.
        //
        options.path = exports.nextSocket(options.path);
        exports.getSocket(options, callback);
      }
    });
  }

  //
  // Create the target `dir` then test connection
  // against the socket.
  //
  function createAndTestSocket (dir) {
    mkdirp(dir, options.mod, function (err) {
      if (err) {
        return callback(err);
      }

      options.exists = true;
      testSocket();
    });
  }

  //
  // Check if the parent directory of the target
  // socket path exists. If it does, test connection
  // against the socket. Otherwise, create the directory
  // then test connection.
  //
  function checkAndTestSocket () {
    var dir = path.dirname(options.path);

    fs.stat(dir, function (err, stats) {
      if (err || !stats.isDirectory()) {
        return createAndTestSocket(dir);
      }

      options.exists = true;
      testSocket();
    });
  }

  //
  // If it has been explicitly stated that the
  // target `options.path` already exists, then
  // simply test the socket.
  //
  return options.exists
    ? testSocket()
    : checkAndTestSocket();
};

//
// ### function nextPort (port)
// #### @port {Number} Port to increment from.
// Gets the next port in sequence from the
// specified `port`.
//
exports.nextPort = function (port) {
  return port + 1;
};

//
// ### function nextSocket (socketPath)
// #### @socketPath {string} Path to increment from
// Gets the next socket path in sequence from the
// specified `socketPath`.
//
exports.nextSocket = function (socketPath) {
  var dir = path.dirname(socketPath),
      name = path.basename(socketPath, '.sock'),
      match = name.match(/^([a-zA-z]+)(\d*)$/i),
      index = parseInt(match[2]),
      base = match[1];
  if (isNaN(index)) {
    index = 0;
  }

  index += 1;
  return path.join(dir, base + index + '.sock');
};

/**
 * @desc List of internal hostnames provided by your machine. A user
 *       provided hostname may also be provided when calling portfinder.getPort,
 *       which would then be added to the default hosts we lookup and return here.
 *
 * @return {array}
 *
 * Long Form Explantion:
 *
 *    - Input: (os.networkInterfaces() w/ MacOS 10.11.5+ and running a VM)
 *
 *        { lo0:
 *         [ { address: '::1',
 *             netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
 *             family: 'IPv6',
 *             mac: '00:00:00:00:00:00',
 *             scopeid: 0,
 *             internal: true },
 *           { address: '127.0.0.1',
 *             netmask: '255.0.0.0',
 *             family: 'IPv4',
 *             mac: '00:00:00:00:00:00',
 *             internal: true },
 *           { address: 'fe80::1',
 *             netmask: 'ffff:ffff:ffff:ffff::',
 *             family: 'IPv6',
 *             mac: '00:00:00:00:00:00',
 *             scopeid: 1,
 *             internal: true } ],
 *        en0:
 *         [ { address: 'fe80::a299:9bff:fe17:766d',
 *             netmask: 'ffff:ffff:ffff:ffff::',
 *             family: 'IPv6',
 *             mac: 'a0:99:9b:17:76:6d',
 *             scopeid: 4,
 *             internal: false },
 *           { address: '10.0.1.22',
 *             netmask: '255.255.255.0',
 *             family: 'IPv4',
 *             mac: 'a0:99:9b:17:76:6d',
 *             internal: false } ],
 *        awdl0:
 *         [ { address: 'fe80::48a8:37ff:fe34:aaef',
 *             netmask: 'ffff:ffff:ffff:ffff::',
 *             family: 'IPv6',
 *             mac: '4a:a8:37:34:aa:ef',
 *             scopeid: 8,
 *             internal: false } ],
 *        vnic0:
 *         [ { address: '10.211.55.2',
 *             netmask: '255.255.255.0',
 *             family: 'IPv4',
 *             mac: '00:1c:42:00:00:08',
 *             internal: false } ],
 *        vnic1:
 *         [ { address: '10.37.129.2',
 *             netmask: '255.255.255.0',
 *             family: 'IPv4',
 *             mac: '00:1c:42:00:00:09',
 *             internal: false } ] }
 *
 *    - Output:
 *
 *         [
 *          '0.0.0.0',
 *          '::1',
 *          '127.0.0.1',
 *          'fe80::1',
 *          '10.0.1.22',
 *          'fe80::48a8:37ff:fe34:aaef',
 *          '10.211.55.2',
 *          '10.37.129.2'
 *         ]
 *
 *     Note we export this so we can use it in our tests, otherwise this API is private
 */
exports._defaultHosts = (function() {
  var interfaces = {};
  try{
    interfaces = os.networkInterfaces();
  }
  catch(e) {
    // As of October 2016, Windows Subsystem for Linux (WSL) does not support
    // the os.networkInterfaces() call and throws instead. For this platform,
    // assume 0.0.0.0 as the only address
    //
    // - https://github.com/Microsoft/BashOnWindows/issues/468
    //
    // - Workaround is a mix of good work from the community:
    //   - https://github.com/indexzero/node-portfinder/commit/8d7e30a648ff5034186551fa8a6652669dec2f2f
    //   - https://github.com/yarnpkg/yarn/pull/772/files
    if (e.syscall === 'uv_interface_addresses') {
      // swallow error because we're just going to use defaults
      // documented @ https://github.com/nodejs/node/blob/4b65a65e75f48ff447cabd5500ce115fb5ad4c57/doc/api/net.md#L231
    } else {
      throw e;
    }
  }

  var interfaceNames = Object.keys(interfaces),
      hiddenButImportantHost = '0.0.0.0', // !important - dont remove, hence the naming :)
      results = [hiddenButImportantHost];
  for (var i = 0; i < interfaceNames.length; i++) {
    var _interface = interfaces[interfaceNames[i]];
    for (var j = 0; j < _interface.length; j++) {
      var curr = _interface[j];
      results.push(curr.address);
    }
  }

  // add null value, For createServer function, do not use host.
  results.push(null);

  debugDefaultHosts("exports._defaultHosts is: %o", results);

  return results;
}());


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if ( true && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
            return async;
        }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
    // included directly via <script> tag
    else {}

}());


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(18);
} else {
  module.exports = __webpack_require__(21);
}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(19);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(20);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),
/* 20 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(22);
var util = __webpack_require__(23);

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(19);
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(3);
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(15);
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("tty");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var fs = __webpack_require__(3);
var _0777 = parseInt('0777', 8);

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    
    var cb = f || function () {};
    p = path.resolve(p);
    
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PANIC_RAW_SCRIPT = `
    AHKPanic(Kill=0, Pause=0, Suspend=0, SelfToo=0) {
    DetectHiddenWindows, On
    WinGet, IDList ,List, ahk_class AutoHotkey
    Loop %IDList%
      {
      ID:=IDList%A_Index%
      WinGet, PID, PID,   % "ahk_id " ID
      If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
        Continue
      WinGetTitle, ATitle, ahk_id %ID%
      IfNotInString, ATitle, %A_ScriptFullPath%
        {
        If Suspend
          PostMessage, 0x111, 65305,,, ahk_id %ID%  ; Suspend.
        If Pause
          PostMessage, 0x111, 65306,,, ahk_id %ID%  ; Pause.
        If Kill
          WinClose, ahk_id %ID% ;kill
        }
      }
    If SelfToo
      {
      If Suspend
        Suspend, Toggle  ; Suspend.
      If Pause
        Pause, Toggle, 1  ; Pause.
      If Kill
        ExitApp
      }
    }
    AHKPanic(1)
`;
exports.Kill_Target_Raw_Script = (target) => `AHKPanic_Kill(Target) {
    DetectHiddenWindows, On
    WinGet, IDList ,List, ahk_class AutoHotkey
    Loop %IDList%
      {
      ID:=IDList%A_Index%
      WinGet, PID, PID,   % "ahk_id " ID
      If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
        Continue
      WinGetTitle, ATitle, ahk_id %ID%
      IfInString, ATitle, %Target%
        {
          WinClose, ahk_id %ID% ;kill
          ExitApp
        }
      }
    }
    AHKPanic_Kill("${target}")`;
exports.List_All_ScriptStates = (pipe) => `DetectHiddenWindows, On

IsInState( PID, State ) {
  dhw := A_DetectHiddenWindows
  DetectHiddenWindows, On  ; This line can be important!
  hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
  SendMessage, 0x211  ; WM_ENTERMENULOOP
  SendMessage, 0x212  ; WM_EXITMENULOOP
  DetectHiddenWindows, %dhw%
  mainMenu := DllCall("GetMenu", "uint", hWnd)
  fileMenu := DllCall("GetSubMenu", "uint", mainMenu, "int", 0)
  state := DllCall("GetMenuState", "ptr", fileMenu, "uint", State, "uint", 0)
  isInState := state >> 3 & 1
  DllCall("CloseHandle", "ptr", fileMenu)
  DllCall("CloseHandle", "ptr", mainMenu)
  return isInState
}

WinGet, AHK, List, ahk_class AutoHotkey

Result := "["
Loop %AHK% {
  WinGetTitle, Title, % "ahk_id " AHK%A_Index%
  Title := StrReplace(Title,"\\","\\\\")
  UncompiledSignature =  - AutoHotkey v%A_AhkVersion%
  Title := StrReplace(Title,UncompiledSignature,"")
  WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
  If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
    Continue

  paused := IsInState( PID, 65403 ) == 0?"false":"true"
  suspended := IsInState( PID, 65404 ) == 0?"false":"true"
  line = {"title":"%Title%", "paused": %paused%, "suspended": %suspended%, "pid":"%PID%"}
  Result .= line . ","
}
Result := SubStr(Result,1,StrLen(Result)-1)
Result .= "]"
;MsgBox, % Result

pipe:= DllCall(
  (Join, Q C
    "CreateFile"                 ; http://goo.gl/3aJQg7
    "Str",  "${pipe}"            ; lpName
    "UInt", 0x40000000           ; iWrite
    "UInt", 0x1|0x2                    ; iShare
    "UInt",  0                    ;
    "UInt", 3                    ; iOpen
    "UInt", 0                    ; nInBufferSize
    "UInt",  0                    ; nDefaultTimeOut
  ))
  if(pipe = -1)
    MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(Result)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }
`;
exports.GetKeyState = (pipe, key) => `

Result := GetKeyState("${key}")

pipe:= DllCall(
  (Join, Q C
    "CreateFile"                 ; http://goo.gl/3aJQg7
    "Str",  "${pipe}"            ; lpName
    "UInt", 0x40000000           ; iWrite
    "UInt", 0x1|0x2                    ; iShare
    "UInt",  0                    ;
    "UInt", 3                    ; iOpen
    "UInt", 0                    ; nInBufferSize
    "UInt",  0                    ; nDefaultTimeOut
  ))
  if(pipe = -1)
    MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(Result)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }
`;
exports.SetScriptPausedState = (pid, turnOn) => SetScriptState(pid, turnOn, "65403");
exports.SetScriptSuspendedState = (pid, turnOn) => SetScriptState(pid, turnOn, "65404");
const SetScriptState = (pid, turnOn, consideredState) => `DetectHiddenWindows, On

IsInState( PID, State ) {
  dhw := A_DetectHiddenWindows
  DetectHiddenWindows, On  ; This line can be important!
  hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
  SendMessage, 0x211  ; WM_ENTERMENULOOP
  SendMessage, 0x212  ; WM_EXITMENULOOP
  DetectHiddenWindows, %dhw%
  mainMenu := DllCall("GetMenu", "uint", hWnd)
  fileMenu := DllCall("GetSubMenu", "uint", mainMenu, "int", 0)
  state := DllCall("GetMenuState", "ptr", fileMenu, "uint", State, "uint", 0)
  isInState := state >> 3 & 1
  DllCall("CloseHandle", "ptr", fileMenu)
  DllCall("CloseHandle", "ptr", mainMenu)
  return isInState
}

  PID = ${pid}
  state := IsInState( PID, ${consideredState} ) == ${turnOn}

  if(!state)
    SendMessage 0x111, ${consideredState},,, ahk_pid %PID%
`;
exports.FormatText = (pipe) => `/*
https://autohotkey.com/board/topic/55766-script-auto-formatter-very-basic-beginner-script/
https://autohotkey.com/board/topic/7169-auto-syntax-tidy-v12/
Copy a piece of code to the Clipboard.  The hotkey will reformat the code and paste it into any editor you have selected (sends Ctrl-v to the editor).

This script basically just determines proper line indentation by counting the number of open and closed braces encountered ("{").  However, it does a few other things, such as properly ignoring comments; there's also a little support for one-line indentation for if and loop statements, without the braces.
*/

; Indent(ol) will allow us to indent a line if the previous line was an if or loop, even without braces.

Indent(ol) {
    ol .= "\`n"
    return Regexmatch(ol, "if\\(|loop,|(if|loop)\\s") = 1
}
; LastChar(str) will return the last non-whitespace character of a string excluding any comment
; The idea is that if that character is a brace, then the following lines should be indented.

LastChar(str) {
str .= "\`n"
return Substr(str, RegExMatch(str, "\\S\\s*(;|\`n)") , 1)
}

skip = 0              ; skip is used to skip comments -- 0 means we are not currently in a comment section of code
dp = 0                ; how far to indent, in increments of 5 spaces
out := ""             ; out will ultimately hold the reformatted code
c := Clipboard
nows := ""            ; nows is a line of code with the white space removed
oe := ""              ; oe keeps track of the ending of the previous line, excluding white space and comments
loop, Parse, c, \`n
{
    ol := nows
    oe := ne
    pos := RegExMatch(A_LoopField, "\\S")
    nows := Substr(A_LoopField, pos)
    ne := LastChar(nows)
    if(InStr(nows, "/*") = 1)
    {
        skip = 1
    }
    if(skip)
        out .= A_LoopField . "\`n"
    if(!skip)
    {
        if(Substr(nows, 1, 1) = "}")                                ; reduce indentation after } encountered
        {
            dp--
        }
        if(Indent(ol) and Substr(nows, 1, 1) != "{" and oe != "{")  ; primitive one-line indentation for loop and if statements
            out := out . "     "
        loop %dp%                                                    ; silly loop to indent
        {
            out := out . "     "
        }
        out := out . nows . "\`n"                                     ; the line is now formatted
        if(Substr(nows, 1 , 1) = "{" or ne = "{")                    ; increase indentation of folowing lines due to { encountered
        {
            dp++
        }
    }
    if(InStr(nows, "*/") = 1)                                        ; comment block over -- now script will begin processing again
    {
        skip = 0
    }
}

pipe:= DllCall(
  (Join, Q C
    "CreateFile"                 ; http://goo.gl/3aJQg7
    "Str",  "${pipe}"            ; lpName
    "UInt", 0x40000000           ; iWrite
    "UInt", 0x1|0x2                    ; iShare
    "UInt",  0                    ;
    "UInt", 3                    ; iOpen
    "UInt", 0                    ; nInBufferSize
    "UInt",  0                    ; nDefaultTimeOut
  ))
  if(pipe = -1)
    MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(out)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }

;Clipboard := out                    ; Clipboard has the reformatted code
;Send ^v                             ; paste reformatted code
return
`;
exports.PerformOfflineDocsSearch = (docPath, command) => `
DetectHiddenWindows, On
WinGet, IDList ,List, AutoHotkey Help

Loop %IDList%
{
    IDk:=IDList%A_Index%
    WinClose, ahk_id %IDk% ;kill
    WinWaitClose, ahk_id %IDk% ;kill
}

Run ${docPath},,,pid
WinWait ahk_pid %pid%

;Sleep, 1000
;MsgBox, hey
C_Cmd = ${command}
StringReplace, C_Cmd, C_Cmd, #, {#}
Send, !n{home}+{end}%C_Cmd%{enter}
Sleep, 1000
Send, #{right}
Sleep, 800
Send, {Enter}`;
exports.SnapWindowToRigth = (title) => `
DetectHiddenWindows, On
IfWinNotExist, ahk_exe ${title}
WinWait, ahk_exe ${title}
WinActivate
Sleep, 1000
Send, #{right}
Sleep, 800
Send, {Enter}`;
exports.CheckIfWinExists = (pipe, winTitle) => `

out := WinExist("${winTitle}")

pipe:= DllCall(
  (Join, Q C
    "CreateFile"                 ; http://goo.gl/3aJQg7
    "Str",  "${pipe}"            ; lpName
    "UInt", 0x40000000           ; iWrite
    "UInt", 0x1|0x2                    ; iShare
    "UInt",  0                    ;
    "UInt", 3                    ; iOpen
    "UInt", 0                    ; nInBufferSize
    "UInt",  0                    ; nDefaultTimeOut
  ))
  if(pipe = -1)
    MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(out)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }
`;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const net = __webpack_require__(15);
/**
 * https://github.com/feross/connectivity
 * Detect if the network is up (do we have connectivity?)
 * @return {boolean}
 */
function checkConnection(cb) {
    var called = false;
    var socket = net.connect({
        port: 80,
        host: 'www.google.com'
    });
    // If no 'error' or 'connect' event after 5s, assume network is down
    var timer = setTimeout(function () {
        done(true);
    }, 5000);
    var done = (err) => {
        if (called)
            return;
        clearTimeout(timer);
        socket.unref();
        socket.end();
        cb(!err);
    };
    socket.on('error', done);
    socket.on('connect', done);
}
exports.checkConnection = checkConnection;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__filename) {
Object.defineProperty(exports, "__esModule", { value: true });
const process = __webpack_require__(5);
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const net = __webpack_require__(15);
const configuration_1 = __webpack_require__(6);
const enums_1 = __webpack_require__(7);
const panic_1 = __webpack_require__(25);
var ConnectionPhases;
(function (ConnectionPhases) {
    ConnectionPhases[ConnectionPhases["GetAttribute"] = 0] = "GetAttribute";
    ConnectionPhases[ConnectionPhases["WriteCode"] = 1] = "WriteCode";
    ConnectionPhases[ConnectionPhases["ReadResult"] = 2] = "ReadResult";
})(ConnectionPhases || (ConnectionPhases = {}));
/**
 * It manages all the running scripts
 */
class ScriptManagerProvider {
    /**
     *  It manages all the running scripts
     */
    constructor( /*public _executablePath: string | undefined*/) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element)
            return Promise.resolve([]);
        return Promise.resolve(this.listScripts());
    }
    listScripts() {
        if (!configuration_1.cfg.executablePath)
            return Promise.reject();
        const promise = new Promise((resolve, reject) => {
            this.ExecuteAHKCode(configuration_1.cfg.executablePath, (pipe_path) => panic_1.List_All_ScriptStates(pipe_path), (err) => reject(err), true, (result) => {
                let list = new Array();
                let serialized_data = new Buffer(result.buffer).toString('utf8');
                let script_list = JSON.parse(serialized_data);
                script_list.forEach(element => {
                    list.push(new Script(element.pid.toString(), path.basename(element.title), this, vscode.Uri.file(element.title), element.paused, element.suspended));
                });
                if (!this.firstChild)
                    this.firstChild = list[0];
                resolve(list);
            });
        });
        return promise;
    }
    ExecuteAHKCode(executablePath, request_callback, error_callback, waitForResponse = false, response_callback) {
        ScriptManagerProvider.ExecuteAHKCode(executablePath, request_callback, error_callback, waitForResponse, response_callback);
    }
    static ExecuteAHKCode(executablePath, request_callback, error_callback, waitForResponse = false, response_callback) {
        try {
            const pipe_path = "\\\\.\\pipe\\AHK_" + Date.now();
            let connection_phase = ConnectionPhases.GetAttribute;
            const server = net.createServer(function (stream) {
                switch (connection_phase) {
                    case ConnectionPhases.GetAttribute:
                        stream.destroy();
                        break;
                    case ConnectionPhases.WriteCode:
                        stream.write(request_callback(pipe_path));
                        stream.end();
                        if (!waitForResponse)
                            return;
                        break;
                    case ConnectionPhases.ReadResult:
                        stream.on('data', (result) => {
                            try {
                                stream.end();
                                server.close();
                                if (response_callback)
                                    response_callback(result);
                            }
                            catch (err) {
                                if (error_callback)
                                    error_callback(err);
                                else
                                    console.log(err);
                            }
                        });
                        break;
                }
                connection_phase++;
            });
            server.listen(pipe_path, function () {
                launchProcess(executablePath, false, pipe_path);
            });
        }
        catch (err) {
            vscode.window.showErrorMessage('An error has occured while interacting with AHK: ', err);
            if (error_callback)
                error_callback(err);
        }
    }
}
exports.ScriptManagerProvider = ScriptManagerProvider;
function launchProcess(name, quiet, ...args) {
    try {
        let command = name.concat(' ', args.join(' '));
        process.exec(command, function callback(error, stdout, stderr) {
            if (error) {
                if (quiet)
                    console.log('error: ' + error);
                else
                    vscode.window.showErrorMessage("An error has occured while launching the executable: " + error);
            }
        });
    }
    catch (err) {
        if (quiet)
            console.log(err);
        else
            vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
    }
}
class Script extends vscode.TreeItem {
    constructor(id, label, parent, resourceUri, paused, suspended) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.id = id;
        this.label = label;
        this.parent = parent;
        this.resourceUri = resourceUri;
        this.paused = paused;
        this.suspended = suspended;
        this.command = { title: "showInExplorer", command: enums_1.COMMAND_IDS.TREE_COMMANDS.SHOW_IN_EXPLORER, arguments: [this.resourceUri] };
    }
    get contextValue() {
        return `.${this.suspended ? 'suspended' : 'unsuspended'}.${this.paused ? 'paused' : 'unpaused'}`;
    }
    get iconPath() {
        return path.join(__filename, '..', '..', 'media', 'states', `${this.contextValue.replace(/\./g, '_')}.ico`);
    }
    // contextValue = ".unsuspended.unpaused";
    //iconPath = path.join(__filename, '..', '..', 'resources', 'light', 'script-running.svg');
    // {
    // 	light: path.join(__filename, '..', '..', 'resources', 'light', 'script-running.svg'),
    // 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'script-running.svg')
    // };
    execAndRefresh(command) {
        try {
            this.parent.ExecuteAHKCode(configuration_1.cfg.executablePath, (pipe) => command, (error) => { throw error; });
            this.parent.refresh();
        }
        catch (err) {
            vscode.window.showErrorMessage('An error has occured while interacting with the specified script ', err);
        }
    }
    /**
     * suspend
     */
    suspend() {
        this.execAndRefresh(panic_1.SetScriptSuspendedState(this.id, true));
    }
    /**
     * unSuspend
     */
    unSuspend() {
        this.execAndRefresh(panic_1.SetScriptSuspendedState(this.id, false));
    }
    /**
     * pause
     */
    pause() {
        this.execAndRefresh(panic_1.SetScriptPausedState(this.id, true));
    }
    /**
     * resume
     */
    resume() {
        this.execAndRefresh(panic_1.SetScriptPausedState(this.id, false));
    }
    /**
     * kill
     */
    kill() {
        this.execAndRefresh(panic_1.Kill_Target_Raw_Script(this.resourceUri.fsPath));
    }
}
exports.Script = Script;

/* WEBPACK VAR INJECTION */}.call(this, "/index.js"))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
const {promisify} = __webpack_require__(23);
const path = __webpack_require__(2);
const childProcess = __webpack_require__(5);
const fs = __webpack_require__(3);
const isWsl = __webpack_require__(29);

const pAccess = promisify(fs.access);
const pExecFile = promisify(childProcess.execFile);

// Path to included `xdg-open`
const localXdgOpenPath = path.join(__dirname, 'xdg-open');

// Convert a path from WSL format to Windows format:
// `/mnt/c/Program Files/Example/MyApp.exe` → `C:\Program Files\Example\MyApp.exe`
const wslToWindowsPath = async path => {
	const {stdout} = await pExecFile('wslpath', ['-w', path]);
	return stdout.trim();
};

module.exports = async (target, options) => {
	if (typeof target !== 'string') {
		throw new TypeError('Expected a `target`');
	}

	options = {
		wait: false,
		background: false,
		...options
	};

	let command;
	let appArguments = [];
	const cliArguments = [];
	const childProcessOptions = {};

	if (Array.isArray(options.app)) {
		appArguments = options.app.slice(1);
		options.app = options.app[0];
	}

	if (process.platform === 'darwin') {
		command = 'open';

		if (options.wait) {
			cliArguments.push('--wait-apps');
		}

		if (options.background) {
			cliArguments.push('--background');
		}

		if (options.app) {
			cliArguments.push('-a', options.app);
		}
	} else if (process.platform === 'win32' || isWsl) {
		command = 'cmd' + (isWsl ? '.exe' : '');
		cliArguments.push('/c', 'start', '""', '/b');
		target = target.replace(/&/g, '^&');

		if (options.wait) {
			cliArguments.push('/wait');
		}

		if (options.app) {
			if (isWsl && options.app.startsWith('/mnt/')) {
				const windowsPath = await wslToWindowsPath(options.app);
				options.app = windowsPath;
			}

			cliArguments.push(options.app);
		}

		if (appArguments.length > 0) {
			cliArguments.push(...appArguments);
		}
	} else {
		if (options.app) {
			command = options.app;
		} else {
			// When bundled by Webpack, there's no actual package file path and no local `xdg-open`.
			const isBundled =  false || __dirname === '/';

			// Check if local `xdg-open` exists and is executable.
			let exeLocalXdgOpen = false;
			try {
				await pAccess(localXdgOpenPath, fs.constants.X_OK);
				exeLocalXdgOpen = true;
			} catch (error) {}

			const useSystemXdgOpen = process.versions.electron ||
				process.platform === 'android' || isBundled || !exeLocalXdgOpen;
			command = useSystemXdgOpen ? 'xdg-open' : localXdgOpenPath;
		}

		if (appArguments.length > 0) {
			cliArguments.push(...appArguments);
		}

		if (!options.wait) {
			// `xdg-open` will block the process unless stdio is ignored
			// and it's detached from the parent even if it's unref'd.
			childProcessOptions.stdio = 'ignore';
			childProcessOptions.detached = true;
		}
	}

	cliArguments.push(target);

	if (process.platform === 'darwin' && appArguments.length > 0) {
		cliArguments.push('--args', ...appArguments);
	}

	const subprocess = childProcess.spawn(command, cliArguments, childProcessOptions);

	if (options.wait) {
		return new Promise((resolve, reject) => {
			subprocess.once('error', reject);

			subprocess.once('close', exitCode => {
				if (exitCode > 0) {
					reject(new Error(`Exited with code ${exitCode}`));
					return;
				}

				resolve(subprocess);
			});
		});
	}

	subprocess.unref();

	return subprocess;
};

/* WEBPACK VAR INJECTION */}.call(this, "/"))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const os = __webpack_require__(14);
const fs = __webpack_require__(3);

const isWsl = () => {
	if (process.platform !== 'linux') {
		return false;
	}

	if (os.release().includes('Microsoft')) {
		return true;
	}

	try {
		return fs.readFileSync('/proc/version', 'utf8').includes('Microsoft');
	} catch (err) {
		return false;
	}
};

if (process.env.__IS_WSL_TEST__) {
	module.exports = isWsl;
} else {
	module.exports = isWsl();
}


/***/ })
/******/ ]);
//# sourceMappingURL=extension.js.map