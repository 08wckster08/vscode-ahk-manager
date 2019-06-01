import * as process from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as net from 'net';
import { List_All_ScriptStates } from './panic';
import * as http from 'http';
/**
 * It manages all the running scripts
 */
export class ScriptManagerProvider implements vscode.TreeDataProvider<Script>{

    private _onDidChangeTreeData: vscode.EventEmitter<Script | undefined> = new vscode.EventEmitter<Script | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Script | undefined> = this._onDidChangeTreeData.event;

    /**
     *  It manages all the running scripts
     */
    constructor(public _executablePath: string | undefined) {
    }

    public set executablePath(v: string) {
        this._executablePath = v;
        this.refresh();
    }


    public get executablePath(): string {
        return this._executablePath || "";
    }


    public refresh(): any {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: Script) {
        return element;
    }

    public getChildren(element?: Script | undefined): vscode.ProviderResult<Script[]> {
        if (element)
            return Promise.resolve([]);
        return Promise.resolve(this.listScripts());
    }

    private listScripts(): Promise<Script[]> {
        if (!this.executablePath)
            return Promise.reject();
        const promise = new Promise<Script[]>((resolve, reject) => {
            let list: Script[] = new Array();
            const executablePath = this.executablePath;
            try {
                const port = 3000;
                const host = '127.0.0.1';
                const server = http.createServer((request, response) => {
                    if (request.method === 'POST') {
                        var body = '';
                        request.on('data', function (data) {
                            body += data;
                            // console.log('Partial body: ' + body)
                        })
                        request.on('end', function () {
                            console.log('Body: ' + body)
                            list.push(new Script('pippo', executablePath, vscode.Uri.parse('path1'), '.unsuspended.unpaused'));
                            list.push(new Script('pluto', executablePath, vscode.Uri.parse('path2'), '.unsuspended.paused'));
                            resolve(list);
                        });
                    }
                });
                server.listen(port, host);

                const pipe_path = "\\\\.\\pipe\\AHK_" + Date.now();
                let is_the_second_connection = false;
                let launcher = net.createServer(function (stream) {

                    // stream.on('data', function (rlist) {
                    //     let l = rlist;
                    //     stream.end();
                    // });

                    if (is_the_second_connection)
                        stream.write(List_All_ScriptStates(`http://${host}:${port}`));
                    else
                        is_the_second_connection = true;
                    stream.end();
                });
                launcher.listen(pipe_path, function () {
                    launchProcess(executablePath, false, pipe_path);
                });

            } catch (err) {
                vscode.window.showErrorMessage('An error has occured while interacting with AHK: ', err);
                reject(err);
            }
        });
        return promise;
    }
}

function launchProcess(name: string, quiet: boolean, ...args: string[]) {
    try {
        let command = name.concat(' ', args.join(' '));
        process.exec(command, function callback(error: any, stdout: any, stderr: any) {
            if (error) {
                if (quiet)
                    console.log('error: ' + error);
                else
                    vscode.window.showErrorMessage("An error has occured while launching the executable: " + error);
            }
        });
    } catch (err) {
        if (quiet)
            console.log(err);
        else
            vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
    }
}

export class Script extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public executablePath: string,
        public resourceUri: vscode.Uri,
        public contextValue: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
    }

    // contextValue = ".unsuspended.unpaused";
    iconPath = path.join(__filename, '..', '..', 'resources', 'light', 'script-running.svg');
    // {
    // 	light: path.join(__filename, '..', '..', 'resources', 'light', 'script-running.svg'),
    // 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'script-running.svg')
    // };

    /**
     * suspend
     */
    public suspend() {

    }

    /**
     * unSuspend
     */
    public unSuspend() {

    }

    /**
     * pause
     */
    public pause() {

    }

    /**
     * resume
     */
    public resume() {

    }

    /**
     * kill
     */
    public kill() {

    }
}