import * as vscode from 'vscode';
import * as child_process from 'child_process';

export function launchProcess(name: string, quiet: boolean, ...args: string[]): Promise<boolean> {
    let p: Promise<boolean> = new Promise((r, c) => {
        try {
            let command = name.concat(' ', args.join(' '));
            child_process.exec(command, function callback(error: any, stdout: any, stderr: any) {
                if (error) {
                    if (quiet) {
                        console.log('error: ' + error);
                    }
                    else
                        vscode.window.showErrorMessage("An error has occured while launching the executable: " + error);
                    c(error);
                }
                else
                    r(true);
            });
        } catch (err) {
            if (quiet)
                console.log(err);
            else
                vscode.window.showErrorMessage("unable to launch the executable: " + err.message);
            c(err);
        }
    });
    return p;
}