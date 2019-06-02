import * as process from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as net from 'net';
import { COMMAND_IDS } from './enums';
import { List_All_ScriptStates } from './panic';

enum ConnectionPhases {
    GetAttribute,
    WriteCode,
    ReadResult
}

interface RawScript {
    title: string;
    pid: number;
    paused: boolean;
    suspended: boolean;
}

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

    // private listScripts(): Promise<Script[]> {
    //     if (!this.executablePath)
    //         return Promise.reject();
    //     const promise = new Promise<Script[]>((resolve, reject) => {
    //         const executablePath = this.executablePath;
    //         try {
    //             const pipe_path = "\\\\.\\pipe\\AHK_" + Date.now();
    //             let connection_phase: ConnectionPhases = ConnectionPhases.GetAttribute;
    //             const server = net.createServer(function (stream) {
    //                 switch (connection_phase) {
    //                     case ConnectionPhases.GetAttribute:
    //                         stream.destroy();
    //                         break;
    //                     case ConnectionPhases.WriteCode:
    //                         stream.write(List_All_ScriptStates(pipe_path));
    //                         stream.end();
    //                         break;
    //                     case ConnectionPhases.ReadResult:
    //                         stream.on('data', (result) => {
    //                             try {
    //                                 let list: Script[] = new Array();
    //                                 let serialized_data = new Buffer(result.buffer).toString('utf8');

    //                                 stream.end();
    //                                 server.close();

    //                                 let script_list: RawScript[] = JSON.parse(serialized_data);
    //                                 script_list.forEach(element => {
    //                                     list.push(new Script(element.pid.toString(), path.basename(element.title), executablePath, vscode.Uri.file(element.title), element.paused, element.suspended));
    //                                 });
    //                                 resolve(list);
    //                             } catch (err) {
    //                                 reject(err);
    //                             }
    //                         });
    //                         break;
    //                 }
    //                 connection_phase++;
    //             });
    //             server.listen(pipe_path, function () {
    //                 launchProcess(executablePath, false, pipe_path);
    //             });

    //         } catch (err) {
    //             vscode.window.showErrorMessage('An error has occured while interacting with AHK: ', err);
    //             reject(err);
    //         }
    //     });
    //     return promise;
    // }

    private listScripts(): Promise<Script[]> {
        if (!this.executablePath)
            return Promise.reject();
        const promise = new Promise<Script[]>((resolve, reject) => {
            this.ExecuteAHKCode(this.executablePath, (pipe_path) => List_All_ScriptStates(pipe_path), (err) => reject(err), true, (result) => {
                let list: Script[] = new Array();
                let serialized_data = new Buffer(result.buffer).toString('utf8');
                let script_list: RawScript[] = JSON.parse(serialized_data);
                script_list.forEach(element => {
                    list.push(new Script(element.pid.toString(), path.basename(element.title), this.executablePath, vscode.Uri.file(element.title), element.paused, element.suspended));
                });
                resolve(list);
            });
        });
        return promise;
    }

    public ExecuteAHKCode(executablePath: string, request_callback: (pipe: string) => string, error_callback?: (error: any) => void, waitForResponse: boolean = false, response_callback?: (data: Buffer) => void) {
        try {
            const pipe_path = "\\\\.\\pipe\\AHK_" + Date.now();
            let connection_phase: ConnectionPhases = ConnectionPhases.GetAttribute;
            const server = net.createServer(function (stream) {
                switch (connection_phase) {
                    case ConnectionPhases.GetAttribute:
                        stream.destroy();
                        break;
                    case ConnectionPhases.WriteCode:
                        stream.write(request_callback(pipe_path));
                        stream.end();
                        if (!waitForResponse)
                            return;
                        break;
                    case ConnectionPhases.ReadResult:
                        stream.on('data', (result) => {
                            try {

                                stream.end();
                                server.close();

                                if (response_callback)
                                    response_callback(result);

                            } catch (err) {
                                if (error_callback)
                                    error_callback(err);
                                else
                                    console.log(err);
                            }
                        });
                        break;
                }
                connection_phase++;
            });
            server.listen(pipe_path, function () {
                launchProcess(executablePath, false, pipe_path);
            });

        } catch (err) {
            vscode.window.showErrorMessage('An error has occured while interacting with AHK: ', err);
            if (error_callback)
                error_callback(err);
        }
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
        public readonly id: string,
        public readonly label: string,
        public executablePath: string,
        public resourceUri: vscode.Uri,
        public paused: boolean,
        public suspended: boolean,
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = { title: "showInExplorer", command: COMMAND_IDS.TREE_COMMANDS.SHOW_IN_EXPLORER, arguments: [this.resourceUri] };
    }

    public get contextValue(): string {
        return `.${this.suspend ? 'suspended' : 'unsuspended'}.${this.paused ? 'paused' : 'unpaused'}`;
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