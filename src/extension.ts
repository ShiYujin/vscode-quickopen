// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const connector = '\\';
function calculateScore(inExtName: string): string {
    if(inExtName == 'h')
    {
        return 'cpp';
    }
    else if(inExtName == 'cpp')
    {
        return 'h';
    }
    else
    {
        return '';
    }
};

function L3Search(inName: string): void{
    // vscode.window.showInformationMessage("L3 search");
    let L3 = inName;
    vscode.workspace.findFiles(L3).then(uris =>{
        if(uris.length > 1){
            vscode.window.showInformationMessage("Found more than 1 results in L3 search, aborted!");
        } else {
            for (let uri of uris) {
                vscode.workspace.openTextDocument(uri).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        }
    });
}

async function consolidateTempFile(){
    await vscode.commands.executeCommand('workbench.action.keepEditor');
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "QuickOpen" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('quickopen.gotohcpp', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World from QuickOpen!');

        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let fileName = editor.document.fileName;

            let workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
            if (workspaceFolder) {
                let workspacePath = workspaceFolder.uri.fsPath;
                let relativeName = fileName.substring(workspacePath.length + 1);
                // vscode.window.showInformationMessage("Current file path: " + relativeName);

                let directory = relativeName.substring(0, relativeName.lastIndexOf(connector));
                let baseName = relativeName.substring(relativeName.lastIndexOf(connector) + 1, relativeName.lastIndexOf('.'));
                let extName = relativeName.substring(relativeName.lastIndexOf('.') + 1, relativeName.length);
    
                if( extName == 'h' || extName == 'cpp') {
                    consolidateTempFile();
                    let targetExtName = calculateScore(extName);

                    // L1 search, under same folder
                    let L1 = `${directory}${connector}${baseName}.${targetExtName}`;
                    // vscode.window.showInformationMessage("L1 search");
                    vscode.workspace.findFiles(L1, null, 1).then(uris =>{
                        if(uris.length > 0) {
                            for (let uri of uris) {
                                vscode.workspace.openTextDocument(uri).then(doc => {
                                    vscode.window.showTextDocument(doc);
                                });
                            }
                        } else { // L1 search failed
                            // L2 search, search Private/Public folder
                            let L2 = undefined;
                            if(extName == 'h' && directory.search('Public') >= 0) {
                                L2 = `${directory.replace('Public', 'Private')}${connector}${baseName}.${targetExtName}`;
                            } else if(extName == 'cpp' && directory.search('Private') >= 0) {
                                L2 = `${directory.replace('Private', 'Public')}${connector}${baseName}.${targetExtName}`;
                            }
                            if(L2 != undefined) {
                                // vscode.window.showInformationMessage("L2 search");
                                vscode.workspace.findFiles(L2, null, 1).then(uris =>{
                                    if(uris.length > 0) {
                                        for (let uri of uris) {
                                            vscode.workspace.openTextDocument(uri).then(doc => {
                                                vscode.window.showTextDocument(doc);
                                            });
                                        }
                                    } else { // L2 search failed
                                        // L3 search, search the whole workspace
                                        let L3 = `${baseName}.${targetExtName}`;
                                        L3Search(L3);
                                    }
                                });
                            } else {
                                // L3 search, search the whole workspace
                                let L3 = `${baseName}.${targetExtName}`;
                                L3Search(L3);
                            }
                        } // L1 search failed.
                    });
                } else {
                    vscode.window.showInformationMessage("This is not a .h or .cpp file!");
                } // if extName == h || extName == cpp
            } else {
                vscode.window.showInformationMessage("No workspace opened!");
            } // if workspaceFolder
        } // if editor
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
