import * as vscode from "vscode";
import * as fs from "fs";
import * as dgram from "dgram";
import * as http from "https";
import * as path from "path";
import * as portfinder from "portfinder";
import { EXTENSION_NAME, DOCS_INDEX, BROWSER_EXECUTABLE_NAME } from "./enums";
import { launchProcess } from "./process-utils";
import { readFile, pathify } from "./file-utils";
import { JSDOM } from 'jsdom';
import { PerformOfflineDocsSearch, SnapWindowToRigth } from "./panic";
import { ScriptManagerProvider } from "./script-manager-provider";

export class OfflineDocsManager {
    private docsDirectoryPath: string;

    private browserPath: string;
    private udp_port: number = 0;

    private docsThemePath: string;
    private docsOverriddenThemePath: string | undefined;
    private docsDefaultThemePath: string;

    private docsIndexPath: string;
    private collection: OfflineDocItem[] = new Array();

    private isLoadingInProgress: boolean = false;
    private isCollectionLoaded: boolean = false;
    private delayedSetCurrentUri: vscode.Uri | undefined;
    public current: OfflineDocItem | undefined;

    public docsPanel: vscode.WebviewPanel | undefined;
    private isDocsPanelDisposed: boolean = false;
    private updateDocsTimeout: NodeJS.Timeout | undefined;

    public lastOpenedPanelNumber: number = 2;

    constructor() {
        this.docsDirectoryPath = path.join(process.env.APPDATA || 'C:/', EXTENSION_NAME, 'Docs');
        this.docsIndexPath = path.join(this.docsDirectoryPath, DOCS_INDEX);
        this.docsThemePath = path.join(this.docsDirectoryPath, 'docs', 'static', 'theme.css');
        this.docsDefaultThemePath = path.join(this.docsDirectoryPath, 'docs', 'theme.css');
        this.browserPath = path.join(this.docsDirectoryPath, BROWSER_EXECUTABLE_NAME);
    }

    /**
     * initialize
     * sourceChm is stringhyfied
     */
    public initialize(sourceChm: string, overriddenStylePath: string): Promise<boolean> {
        this.docsOverriddenThemePath = overriddenStylePath;
        let p: Promise<boolean> = new Promise((r, c) => {
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
                    return launchProcess('hh.exe', false, '-decompile', this.docsDirectoryPath, sourceChm)//.replace(/\\/g,'/') .replace(/\\/g,'/')
                        .then((result) => {
                            if (result) {
                                fs.copyFileSync(this.docsThemePath, this.docsDefaultThemePath);
                                r(true);//this.loadDocs(overriddenStylePath);
                            }
                        })
                        .catch((ex) => vscode.window.showErrorMessage('Unable to decompiling ahk\'s docs ' + ex))
                        .finally(() => {
                            this.isLoadingInProgress = false;
                        });
                });
            }
            else
                r(true);//this.loadDocs(overriddenStylePath);
        });
        return p;
    }

    public loadBrowser(): Promise<boolean> {
        return new Promise<boolean>((rp, cp) => {
            if (fs.existsSync(offlineDocsManager.browserPath)) {
                const creation_time = fs.statSync(offlineDocsManager.browserPath).birthtime;
                const last_push_time = new Date(2019, 6, 14); //month is 0 based
                if (creation_time > last_push_time) {
                    rp(true);
                    return;
                }
                else
                    fs.unlinkSync(offlineDocsManager.browserPath);
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Downloading the AutoHotkeyBrowser",
            }, (progress, token) => {
                return new Promise<boolean>((r, c) => {
                    const link = 'https://raw.githubusercontent.com/Denis-net/AutoHotkeyBrowser/master/AutoHotkeyBrowser/bin/Debug/AutoHotkeyBrowser.exe';
                    const dest = offlineDocsManager.browserPath;
                    var file = fs.createWriteStream(dest);
                    var request = http.get(link, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            file.close();  // close() is async, call cb after close completes.
                            r(true);
                        });
                    }).on('error', function (err) { // Handle errors
                        fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
                        c(err.message);
                    });
                });
            }).then(rp);
        });
    }

    public loadDocs(): Promise<boolean> {
        return new Promise<boolean>((r, c) => {
            if (fs.existsSync(offlineDocsManager.docsIndexPath)) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Loading Ahk Offline docs ...",
                }, (progress, token) => {
                    offlineDocsManager.isCollectionLoaded = false;
                    return readFile(offlineDocsManager.docsIndexPath).then((data) => {
                        progress.report({ message: 'file loaded' });
                        const dom = new JSDOM(data);
                        offlineDocsManager.collection = new Array();
                        if (dom) {
                            var listItems = dom.window.document.getElementsByTagName('param');
                            let lastName: string = '';
                            for (let i = 0; i < listItems.length; i++) {
                                const item = listItems[i];
                                if (item.name === "Local") {
                                    offlineDocsManager.collection.push(new OfflineDocItem('', lastName, item.value!.toString()));
                                }
                                else
                                    lastName = item.value.toString();
                            }
                        }
                        progress.report({ message: 'data parsed' });
                        offlineDocsManager.isCollectionLoaded = true;
                        progress.report({ message: 'docs ready !' });

                        try {
                            // set the theme:
                            fs.copyFileSync(offlineDocsManager.docsOverriddenThemePath ? offlineDocsManager.docsOverriddenThemePath : offlineDocsManager.docsDefaultThemePath, offlineDocsManager.docsThemePath);
                        } catch (err) {
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
    public browseDocs(isAlreadyOpened: boolean, runBuffered: (buffer: string) => void) {
        let input = this.getInput();
        if (input instanceof Promise) {
            input.then((r) => {
                this.searchWithBrowser(isAlreadyOpened, r, runBuffered);
            });
        } else {
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
    public searchWithBrowser(isAlreadyOpened: boolean, keyword: string, runBuffered: (buffer: string) => void) {
        var url = path.join(this.docsDirectoryPath, 'docs\\Welcome.htm');

        if (this.udp_port === 0 && isAlreadyOpened) {
            launchProcess('taskkill.exe', false, '/F', '/IM', BROWSER_EXECUTABLE_NAME, '/T');
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
        } else if (!isAlreadyOpened) {
            launchProcess(this.browserPath, false, pathify(url), JSON.stringify(keyword), this.udp_port.toString(), process.pid.toString());
            runBuffered(SnapWindowToRigth(BROWSER_EXECUTABLE_NAME));
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
    public launchDocs(docsPath: string, runBuffered: (buffer: string) => void) {
        let input = this.getInput();
        if (input instanceof Promise) {
            input.then((r) => {
                let command = PerformOfflineDocsSearch(docsPath, r);//path.join(this.docsDirectoryPath, 'docs', 'Welcome.htm'),
                runBuffered(command);
            });
        } else {
            let command = PerformOfflineDocsSearch(docsPath, input);//path.join(this.docsDirectoryPath, 'docs', 'Welcome.htm')
            runBuffered(command);
        }
    }

    public openTheDocsPanel(column: number, pagePath: string) {
        this.lastOpenedPanelNumber = column;
        if (!this.docsPanel || this.isDocsPanelDisposed) {
            this.docsPanel = vscode.window.createWebviewPanel('ahk-offline-docs', 'Documentation', { viewColumn: vscode.ViewColumn.Two, preserveFocus: true }, {
                enableScripts: true,
                enableFindWidget: true,
                enableCommandUris: true,
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
                fs.readFile(pagePath, { encoding: "utf-8" }, (err, data) => {
                    if (!this.docsPanel)
                        return;
                    if (err) {
                        vscode.window.showErrorMessage('An error has occured while opening the page: ' + err);
                    }
                    let url = vscode.Uri.file(path.join(this.docsDirectoryPath, 'docs/')).with({ scheme: 'vscode-resource' });
                    const dom = new JSDOM(data.replace('<head>', `<head>\n<base href="${url.toString()}/">`), { runScripts: "dangerously", url: vscode.Uri.file(pagePath).toString() });
                    const aTags = dom.window.document.getElementsByTagName('a');
                    const len = aTags.length;
                    const basePath = url.toString();
                    for (let i = 0; i < len; i++) {
                        const a = aTags[i];
                        if (
                            !a.href.includes('about:blank') &&
                            !a.href.includes('http:') &&
                            !a.href.includes('https:') &&
                            !a.href.includes('//#')) {
                            // const commentCommandUri = vscode.Uri.parse(`command:ahk.spy`);
                            const commentCommandUri = vscode.Uri.parse(
                                `command:ahk.docs-go-page?${encodeURIComponent(JSON.stringify(a.href))}`
                            );
                            // a.href = basePath + a.href;
                            a.href = commentCommandUri.toString();
                            // a.removeAttribute('href');
                            // a.setAttribute('onclick', '{command:ahk.spy}');
                        }
                    }
                    let html = dom.serialize();
                    this.docsPanel.webview.html = /*data/*ser*/html.toString();
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

    public getDefaultStyle(): Promise<string> {
        return new Promise((r, c) => {
            fs.readFile(offlineDocsManager.docsDefaultThemePath, (err, data) => {
                if (err)
                    c(err);
                else
                    r(data.toString());
            });
        });
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

    private getInput(): string | Promise<string> {
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
        } else if (editor.document.getText().length === 0) {
            vscode.window.showWarningMessage('Write some text first !');
            return '';
        }
        else {
            let word: string | Promise<string> = editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.active));
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

    private parseLine(lineNumber: number): string | Promise<string> {
        if (!vscode.window.activeTextEditor)
            return '';
        let editor = vscode.window.activeTextEditor;
        let line = editor.document.lineAt(lineNumber).text;
        if (line.length) {
            return this.tokenizeText(line);
        } else
            return '';
    }

    private tokenizeText(line: string): Promise<string> | string {
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

        function onlyUnique(value: any, index: number, self: any[]) {
            return self.indexOf(value) === index;
        }
        usedParts = usedParts.filter(onlyUnique);
        let promise: Promise<string> = new Promise<string>((r, c) => {
            vscode.window.showQuickPick(usedParts, { placeHolder: 'Select the most intresting part' }).then((result) => {
                if(result)
                    r(result);
                else
                    c('User cancelled the operation');
            });
        });
        return promise;
    }
}


export class OfflineDocItem {
    public constructor(public compiledDestination: string, public name: string, public local: string) {
        // this.compiledDestination = this.name;
    }
}

export const offlineDocsManager: OfflineDocsManager = new OfflineDocsManager();