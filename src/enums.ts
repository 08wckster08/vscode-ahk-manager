export const EXTENSION_NAME: string = 'vscode-ahk-manager';

export const COMMAND_IDS: any = {
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

export const SETTINGS_KEYS: any = {
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

export const DEFAULT_HEADER_SNIPPET_NAME = "Default Sublime Header";

export const REVEAL_FILE_IN_OS = "Reveal file in OS";
export const LAUNCH = "Launch now";

export const DOCS_INDEX = 'index.hhk';
export const OFFLINE_DOCS_BROWSER_TITLE = 'AutoHotkey Documentation';
export const BROWSER_EXECUTABLE_NAME = 'AutoHotkeyBrowser.exe';

export const enum DOCS_STYLES {
	online = 'online',
	chm = 'chm',
	html = 'html'
}