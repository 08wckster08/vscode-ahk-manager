export const COMMAND_IDS: any = {
	COMPILE: "ahk.compile",
	COMPILE_AS: "ahk.compile-as",
	RUN: "ahk.run",
	RUNBUFFERED: "ahk.run-buffer",
	KILL: "ahk.kill",
	SPY: "ahk.spy",
	DOCS: "ahk.docs",
	SWITCH: "ahk.temporary-switch-executable",

	TREE_COMMANDS: {
		REFRESH: "ahk.scripts-manager.refresh",
		SUSPEND_ON: "ahk.scripts-manager.suspend-on",
		SUSPEND_OFF: "ahk.scripts-manager.suspend-off",
		PAUSE_ON: "ahk.scripts-manager.pause-on",
		PAUSE_OFF: "ahk.scripts-manager.pause-off",
		KILL: "ahk.scripts-manager.kill",
		SHOW_IN_EXPLORER:"ahk.scripts-manager.show-in-explorer"
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
	OnSearchTargetBrowser: "ahk.onSearch.targetBrowser"
};

export const DEFAULT_HEADER_SNIPPET_NAME = "Default Sublime Header";
