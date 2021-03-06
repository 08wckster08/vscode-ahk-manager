import * as vscode from "vscode";
import * as path from "path";
import { SETTINGS_KEYS, DEFAULT_HEADER_SNIPPET_NAME, DOCS_STYLES } from './enums';
import { scriptCollection } from './script-meta-data-collection';
import { pathify } from "./file-utils";

export class Configuration {

    public extensionPath: string = '';

    public executablePath: string = "";
    public executableDir: vscode.Uri | undefined;
    public compilerPath: string = "";
    public docsPath: string = "";
    public winSpyPath: string = "";
    public open_script_folders_in_new_instance: boolean = true;
    public on_search_query_template: string = "";
    public on_search_target_browser: string = "";
    public on_search_docs_style: string = DOCS_STYLES.online;
    public offline_docs_style_path: string = "";

    public compile_on_save: boolean = false;
    public run_on_save: boolean = false;
    public run_on_args: boolean = false;

    // public overriddenCompiledDestination: string | undefined;
    public is_overridden = false;

    private initializeWithHeaderSnippet: boolean | undefined;
    private headerSnippetName: string | undefined;

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
            this.on_search_docs_style = configuration.get(SETTINGS_KEYS.DocsStyle, DOCS_STYLES.online);
            this.offline_docs_style_path = configuration.get(SETTINGS_KEYS.OverrideOfflineDocsStylePath, "");

            this.open_script_folders_in_new_instance = configuration.get(SETTINGS_KEYS.OpenScriptFoldersInNewInstance, true);
            this.run_on_args = configuration.get(SETTINGS_KEYS.RunOnArgs, false);
            if (uri)
                scriptCollection.setCurrent(uri);
        } catch (err) {
            console.error(err);
            vscode.window.showErrorMessage(err.message);
        }
    }

    public initializeEmptyWithHeaderSnippetIfNeeded(len: number) {
        if (this.initializeWithHeaderSnippet && len === 0) {
            vscode.commands.executeCommand('editor.action.insertSnippet', { name: this.headerSnippetName });
        }
    }

    public setExecutablePaths(filePath: string) {
        this.winSpyPath = pathify(path.join(path.dirname(filePath), 'WindowSpy.ahk'));
        this.docsPath = pathify(path.join(path.dirname(filePath), 'AutoHotkey.chm'));
        this.compilerPath = pathify(path.join(path.dirname(filePath), 'Compiler', 'Ahk2Exe.exe'));
        this.executablePath = pathify(filePath);
    }



    public overrideExecutablePaths(filePath: string) {
        this.setExecutablePaths(filePath);
        this.is_overridden = true;
    }
}

export const cfg: Configuration = new Configuration();