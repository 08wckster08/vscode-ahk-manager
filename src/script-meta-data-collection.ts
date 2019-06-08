import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { EXTENSION_NAME } from "./enums";

export class ScriptMetaDataCollection {
    private metaDataFilePath: string;
    private lastWrittenData: string = '';
    private collection: ScriptMetaData[] = new Array();

    private isCollectionLoaded: boolean = false;
    private delayedSetCurrentUri: vscode.Uri | undefined;
    public current: ScriptMetaData | undefined;

    constructor() {
        this.metaDataFilePath = path.join(process.env.APPDATA || 'C:/', EXTENSION_NAME, 'script-meta-data.json');
        this.loadScriptMetaData();
    }

    /**
     * loadScriptMetaData
     */
    public loadScriptMetaData() {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Script Metadata loading ...",
        }, (progress, token) => {
            return this.fromFile().then((data) => {
                progress.report({ message: 'file loaded' });
                this.lastWrittenData = data;
                this.collection = data.length ? <ScriptMetaData[]>JSON.parse(data) : new Array();
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
    public saveScriptMetaData() {
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

    private makeSureDirExists(): boolean {
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

    private fromFile(): Promise<string> {
        this.isCollectionLoaded = false;
        let promise: Promise<string> = new Promise((r, c) => {
            if (fs.existsSync(this.metaDataFilePath))
                fs.readFile(this.metaDataFilePath, "utf-8", (err, data) => {
                    try {
                        if (err)
                            c(err);
                        else
                            r(data);
                    } catch (ex) {
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
    public setCurrent(uri: vscode.Uri) {
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
    public setCurrentDestination(path: string) {
        if (this.current) {
            this.current.compiledDestination = path;
            this.saveScriptMetaData();
        }
    }

    /**
     * getCurrentDestination
     */
    public getCurrentDestination(): string {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.compiledDestination;
    }

    /**
 * getCurrentDestination
 */
    public getCurrentIcon(): string {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.iconPath;
    }

    public setCurrentIcon(fsPath: string) {
        if (this.current) {
            this.current.iconPath = fsPath;
            this.saveScriptMetaData();
        }
    }

    /**
 * getCurrentDestination
 */
    public getCurrentTrayIcon(): string {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.trayIconPath;
    }

    public setCurrentTrayIcon(fsPath: string) {
        if (this.current) {
            this.current.trayIconPath = fsPath;
            this.saveScriptMetaData();
        }
    }


    /**
     * getCurrentDestination
     */
    public getCurrentScriptFilePath(): string {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.scripFilePath;
    }

    public setCurrentScriptArguments(args: string) {
        if (this.current) {
            this.current.scriptArguments = args;
            this.saveScriptMetaData();
        }
    }

    /**
     * getCurrentDestination
     */
    public getCurrentScriptArguments(): string {
        if (!this.current)
            throw new Error("Current is null...");
        return this.current.scriptArguments;
    }

    public clear() {
        if (this.isCollectionLoaded) {

            if (this.current) {
                const filePath = this.current.scripFilePath;
                this.collection = new Array();
                this.setCurrent(vscode.Uri.parse(filePath));
            }
            else
                this.collection = new Array();

            fs.unlink(this.metaDataFilePath, (err) => {
                if (err)
                    vscode.window.showErrorMessage('Unable to remove the scripts\' metadata file: ' + err);
            });
        }
        else
            vscode.window.showWarningMessage('Script Metadata load is in progress...')

    }
}

export class ScriptMetaData {
    public compiledDestination: string;
    public scriptArguments: string;
    public iconPath: string;
    public trayIconPath: string;
    public constructor(public scripFilePath: string) {
        this.compiledDestination = this.scripFilePath.replace('.ahk', '.exe');
        this.trayIconPath = this.iconPath = this.scripFilePath.replace('.ahk', '.ico');
        this.scriptArguments = '';
    }
}

export const scriptCollection: ScriptMetaDataCollection = new ScriptMetaDataCollection();