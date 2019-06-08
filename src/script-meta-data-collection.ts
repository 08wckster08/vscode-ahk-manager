import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { EXTENSION_NAME } from "./enums";

export class ScriptMetaDataCollection {
    private metaDataFilePath: string;
    private lastWrittenData: string = '';
    private collection: ScriptMetaData[] = new Array();

    public current: ScriptMetaData | undefined;

    constructor() {
        this.metaDataFilePath = path.join(process.env.APPDATA || 'C:/', EXTENSION_NAME, 'script-meta-data.json');
        this.loadScriptMetaData();
    }

    /**
     * loadScriptMetaData
     */
    public loadScriptMetaData() {
        this.fromFile().then((data) => {
            this.lastWrittenData = data;
            this.collection = data.length ? <ScriptMetaData[]>JSON.parse(data) : new Array();
        }).catch((ex) => vscode.window.showErrorMessage('Unable to load scripts\' metadata ' + ex));
    }

    /**
    * saveScriptMetaData
    */
    public saveScriptMetaData() {
        var data = JSON.stringify(this.collection);
        if (data !== this.lastWrittenData) {
            if (this.makeSureDirExists())
                fs.writeFile(this.metaDataFilePath, data, (err) => {// TODO NOEOENT ?
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