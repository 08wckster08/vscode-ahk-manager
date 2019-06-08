export const EXTENSION_NAME: string = 'vscode-ahk-manager';

export const COMMAND_IDS: any = {
	COMPILE: "ahk.compile",
	COMPILE_AS: "ahk.compile-as",
	RUN: "ahk.run",
	RUNBUFFERED: "ahk.run-buffer",
	KILL: "ahk.kill",
	SPY: "ahk.spy",
	DOCS: "ahk.docs",
	SET_TRAY_ICON: "ahk.set-tray-icon",
	SET_SCRIPT_ARGS: "ahk.set-script-arguments",
	SWITCH: "ahk.temporary-switch-executable",
	REMOVE_METADATA: "ahk.remove-script-metadata",

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
	OpenScriptFoldersInNewInstance: "ahk.scriptFolders.openInNewInstance"
};

export const DEFAULT_HEADER_SNIPPET_NAME = "Default Sublime Header";

export const REVEAL_FILE_IN_OS = "Reveal file in OS";
export const LAUNCH = "Launch now";
