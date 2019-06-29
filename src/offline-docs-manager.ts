import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { EXTENSION_NAME, DOCS_INDEX } from "./enums";
import { launchProcess } from "./process-utils";
import { readFile, pathify } from "./file-utils";

export class OfflineDocsManager {
    private docsDirectoryPath: string;
    private docsIndexPath: string;
    private collection: OfflineDocItem[] = new Array();

    private isLoadingInProgress: boolean = false;
    private isCollectionLoaded: boolean = false;
    private delayedSetCurrentUri: vscode.Uri | undefined;
    public current: OfflineDocItem | undefined;

    constructor() {
        this.docsDirectoryPath = path.join(process.env.APPDATA || 'C:/', EXTENSION_NAME, 'Docs');
        this.docsIndexPath = path.join(this.docsDirectoryPath, DOCS_INDEX);
    }

    /**
     * initialize
     * sourceChm is stringhyfied
     */
    public initialize(sourceChm: string, overriddenDestination: string) {

        sourceChm = sourceChm.substring(1, sourceChm.length - 1);
        if (this.isLoadingInProgress)
            return;

        if (!sourceChm || !fs.existsSync(sourceChm)) {
            vscode.window.showErrorMessage('Source CHM not found !');
            return;
        }

        if (overriddenDestination) {
            this.docsDirectoryPath = overriddenDestination;
            this.docsIndexPath = path.join(overriddenDestination, DOCS_INDEX);
        }

        if (!fs.existsSync(this.docsIndexPath)) {
            this.isLoadingInProgress = true;
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Decompiling Ahk Offline docs ...",
            }, (progress, token) => {
                return launchProcess('hh.exe', false, '-decompile', this.docsDirectoryPath, sourceChm)
                    .then((result) => {
                        if (result)
                            this.loadDocs();
                    })
                    .catch((ex) => vscode.window.showErrorMessage('Unable to decompiling ahk\'s docs ' + ex))
                    .finally(() => {
                        this.isLoadingInProgress = false;
                    });
            });
        }
        else
            this.loadDocs();
    }

    private loadDocs() {
        if (fs.existsSync(this.docsIndexPath)) {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Loading Ahk Offline docs ...",
            }, (progress, token) => {
                this.isCollectionLoaded = false;
                return readFile(this.docsIndexPath).then((data) => {
                    progress.report({ message: 'file loaded' });
                    // this.lastWrittenData = data;
                    this.collection = data.length ? <OfflineDocItem[]>JSON.parse(data) : new Array();
                    progress.report({ message: 'data parsed' });
                    this.isCollectionLoaded = true;
                    if (this.delayedSetCurrentUri) {
                        // this.setCurrent(this.delayedSetCurrentUri);
                        progress.report({ message: 'docs ready !' });
                    }
                }).catch((ex) => vscode.window.showErrorMessage('Unable to load ahk\'s docs ' + ex));
            });
        }
    }

    public clear() {
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
            vscode.window.showWarningMessage('Script Metadata load is in progress...')
    }
}

export class OfflineDocItem {
    public constructor(public compiledDestination: string, public name: string, public local:string) {
        // this.compiledDestination = this.name;
    }
}

export const offlineDocsManager: OfflineDocsManager = new OfflineDocsManager();