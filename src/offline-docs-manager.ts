import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { EXTENSION_NAME, DOCS_INDEX } from "./enums";
import { launchProcess } from "./process-utils";
import { readFile, pathify } from "./file-utils";
import { JSDOM } from 'jsdom';

export class OfflineDocsManager {
    private docsDirectoryPath: string;
    private docsIndexPath: string;
    private collection: OfflineDocItem[] = new Array();

    private isLoadingInProgress: boolean = false;
    private isCollectionLoaded: boolean = false;
    private delayedSetCurrentUri: vscode.Uri | undefined;
    public current: OfflineDocItem | undefined;

    public docsPanel: vscode.WebviewPanel | undefined;
    private isDocsPanelDisposed: boolean = false;
    private updateDocsTimeout: NodeJS.Timeout | undefined;

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

                    const dom = new JSDOM(data);
                    // console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
                    // this.lastWrittenData = data;
                    this.collection = new Array();
                    if (dom) {
                        var listItems = dom.window.document.getElementsByTagName('param');
                        // let index: number = 0;
                        let lastName: string = '';
                        for (let i = 0; i < listItems.length; i++) {
                            const item = listItems[i];
                            if (item.name === "Local") {
                                this.collection.push(new OfflineDocItem('', lastName, item.value!.toString()));
                                // index++;
                            }
                            else
                                lastName = item.value.toString();
                        }
                        // var x = 5;
                    }
                    progress.report({ message: 'data parsed' });
                    this.isCollectionLoaded = true;
                    // if (this.delayedSetCurrentUri) {
                    // this.setCurrent(this.delayedSetCurrentUri);
                    progress.report({ message: 'docs ready !' });
                    this.openTheDocsPanel(vscode.window.visibleTextEditors.length + 1);
                    // }
                }).catch((ex) => vscode.window.showErrorMessage('Unable to load ahk\'s docs ' + ex));
            });
        }
    }


    openTheDocsPanel(column: number) {

        if (!this.docsPanel || this.isDocsPanelDisposed) {
            this.docsPanel = vscode.window.createWebviewPanel('ahk-offline-docs', 'Documentations', { viewColumn: vscode.ViewColumn.One, preserveFocus: true }, {
                enableScripts: true,
                enableFindWidget: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs//')).with({ scheme: 'vscode-resource' })]
            });
            this.docsPanel.onDidDispose((e) => {
                this.isDocsPanelDisposed = true;
            });
        }

        if (!this.docsPanel.visible)
            this.docsPanel.reveal();

        if (this.updateDocsTimeout)
            clearTimeout(this.updateDocsTimeout);

        this.updateDocsTimeout = setTimeout(() => {
            if (!this.isDocsPanelDisposed)
                fs.readFile(path.join(this.docsDirectoryPath, 'docs', 'Hotkeys.htm'), { encoding: "utf-8" }, (err, data) => {
                    if (!this.docsPanel)
                        return;
                    if (err) {
                        vscode.window.showErrorMessage('An error has occured while opening the page: ' + err);
                    }
                    let url = vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs/')).with({ scheme: 'vscode-resource' });
                    const dom = new JSDOM(data);//, { url: url.toString() }
                    // vscode-workspace-resource:
                    const aTags = dom.window.document.getElementsByTagName('a');
                    const len = aTags.length;
                    const basePath = url.toString();
                    for (let i = 0; i < len; i++) {
                        const a = aTags[i];
                        if (!a.href.includes('about:blank'))
                            a.href = basePath + a.href;
                    }
                    let ser = dom.serialize();
                    //.replace('file://','vscode-resource://')
                    this.docsPanel.webview.html = /*data*/ser.toString().replace('<head>', `<head>\n<base href="${url.toString()}/">`);
                });
        }, 2000);


        // let exists = false;
        // let legacyMatchesFileUri: vscode.Uri = vscode.Uri.file("lol");
        // return vscode.workspace.openTextDocument(encodeURI('command:vscode.previewHtml?' + JSON.stringify(vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs', 'Hotkeys.htm')))))
        //     //  (exists ? vscode.workspace.openTextDocument(legacyMatchesFileUri.with({ scheme: 'file' })) :
        //     //     vscode.workspace.openTextDocument({ language: 'text', content: 'lol' }))
        //     .then(document => {
        //         let d1 = vscode.window.showTextDocument(document, column, true);
        //         return d1;
        //     }).then(editor => {
        //         let ok = true;
        //     });
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
    public constructor(public compiledDestination: string, public name: string, public local: string) {
        // this.compiledDestination = this.name;
    }
}

export const offlineDocsManager: OfflineDocsManager = new OfflineDocsManager();