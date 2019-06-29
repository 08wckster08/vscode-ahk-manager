import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function makeSureDirExists(dirPath: string): boolean {
    if (dirPath)
        try {
            const dir = path.dirname(dirPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            return true;
        }
        catch (err) {
            vscode.window.showErrorMessage('Unable to create a directory on path `' + dirPath + '`: ' + err);
        }
    return false;
}


export function readFile(filePath: string): Promise<string> {
    let promise: Promise<string> = new Promise((r, c) => {
        if (fs.existsSync(filePath))
            fs.readFile(filePath, "utf-8", (err, data) => {
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

export function pathify(stringPath: string): string {
    const stringPathDelimiter = '"';
    const path = vscode.Uri.file(stringPath).fsPath;
    return stringPathDelimiter.concat(path, stringPathDelimiter);
}