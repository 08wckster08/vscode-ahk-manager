import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { SETTINGS_KEYS, DEFAULT_HEADER_SNIPPET_NAME } from './enums';

export class ScriptMetaData {
    public constructor(scripFilePath: string, compiledDestination: string, scripts_arguments: string) {

    }
}

export class Configuration {
    public executablePath: string = "";
    public executableDir: vscode.Uri | undefined;
    public compilerPath: string = "";
    public docsPath: string = "";
    public winSpyPath: string = "";
    public open_script_folders_in_new_instance: boolean = true;
    public on_search_query_template: string = "";
    public on_search_target_browser: string = "";

    public compile_on_save: boolean = false;
    public run_on_save: boolean = false;

    public overriddenCompiledDestination: string | undefined;
    public is_overridden = false;

    private initializeWithHeaderSnippet: boolean | undefined;
    private headerSnippetName: string | undefined;

    public scriptMetaData: ScriptMetaData[] = new Array();
    private manifest: any = {};

    public readonly metaDataFilePath: string;
    public appName = 'ahk';
    constructor() {
        try {
            this.manifest = JSON.parse(fs.readFileSync(path.join(__filename, '..', '..', 'package.json')).toString());
            this.appName = this.manifest.name;

        } catch (err) {
            vscode.window.showErrorMessage('Unable to load the manifest... ' + err);
        }
        this.metaDataFilePath = path.join(process.env.APPDATA || 'C:/', this.appName, 'script-meta-data.json');
    }

    /**
     * parse
     */
    public parseConfiguration(uri?: vscode.Uri, len?: number) {
        try {
            const configuration = uri ? vscode.workspace.getConfiguration('', uri) : vscode.workspace.getConfiguration();
            this.initializeWithHeaderSnippet = configuration.get(SETTINGS_KEYS.InitializeWithHeaderSnippet);
            this.headerSnippetName = configuration.get(SETTINGS_KEYS.OverrideHeaderSnippet, DEFAULT_HEADER_SNIPPET_NAME);
            // this.initializeEmptyWithHeaderSnippetIfNeeded(len);
            const filePath: string = configuration.get(SETTINGS_KEYS.ExecutablePath) || "";
            if (filePath && !this.is_overridden) {
                this.executableDir = vscode.Uri.file(path.dirname(filePath));
                this.setExecutablePaths(filePath);
            }
            this.compile_on_save = configuration.get(SETTINGS_KEYS.CompileOnSave, false);
            this.run_on_save = configuration.get(SETTINGS_KEYS.RunOnSave, false);

            this.on_search_target_browser = configuration.get(SETTINGS_KEYS.OnSearchTargetBrowser) || "";
            this.on_search_query_template = configuration.get(SETTINGS_KEYS.OnSearchQueryTemplate) || "";
            this.open_script_folders_in_new_instance = configuration.get(SETTINGS_KEYS.OpenScriptFoldersInNewInstance, true);

            this.loadScriptMetaData();
        } catch (err) {
            console.error(err);
            vscode.window.showErrorMessage(err.message);
        }
    }

    /**
     * saveScriptMetaData
     */
    public saveScriptMetaData() {

        var data = "New File Contents";

        fs.writeFile("temp.txt", data, (err) => {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
        });
    }

    private loadScriptMetaData() {
        fs.readFile(this.metaDataFilePath, "utf-8", (err, data) => {
            try {
                if (err) {
                    vscode.window.showErrorMessage('Unable to load scripts\' metadata ' + err);
                }
                else {
                    this.scriptMetaData = <ScriptMetaData[]>JSON.parse(data);
                }
            } catch (ex) {
                vscode.window.showErrorMessage('Unable to load scripts\' metadata ' + ex);
            }
        });
    }

    public initializeEmptyWithHeaderSnippetIfNeeded(len: number) {
        if (this.initializeWithHeaderSnippet && len === 0) {
            vscode.commands.executeCommand('editor.action.insertSnippet', { name: this.headerSnippetName });
        }
    }

    public setExecutablePaths(filePath: string) {
        // if (treeDataProvider)`// TODO import cfg from treedataprovider
        //     treeDataProvider.executablePath = pathify(filePath);
        this.winSpyPath = this.pathify(path.join(path.dirname(filePath), 'WindowSpy.ahk'));
        this.docsPath = this.pathify(path.join(path.dirname(filePath), 'AutoHotkey.chm'));
        this.compilerPath = this.pathify(path.join(path.dirname(filePath), 'Compiler', 'Ahk2Exe.exe'));
        this.executablePath = this.pathify(filePath);
    }

    public pathify(stringPath: string): string {
        const stringPathDelimiter = '"';
        const path = vscode.Uri.file(stringPath).fsPath;
        return stringPathDelimiter.concat(path, stringPathDelimiter);
    }

    public overrideExecutablePaths(filePath: string) {
        this.setExecutablePaths(filePath);
        this.is_overridden = true;
    }
}

export const cfg: Configuration = new Configuration();