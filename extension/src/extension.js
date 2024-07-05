const vscode = require('vscode');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

let client;

function activate(context) {
    console.log('Congratulations, your extension "llm-ai-copilot" is now active!');

    // The server is implemented in Node.js
    const serverModule = context.asAbsolutePath(
        path.join('extension', 'src', 'server', 'lsp_server','src','server.js') // Adjust this path as per your server implementation
    );

    // Options to control the language client
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'openscenario' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.xosc')
        },
        initializationOptions: {},
        middleware: {},
        errorHandler: {
            error: (error, message, count) => {
                console.error('Client error:', error, message, count);
                return { action: vscode_languageclient_1.ErrorAction.Continue };
            },
            closed: () => {
                console.error('Client closed');
                return { action: vscode_languageclient_1.CloseAction.Restart };
            }
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'llm-ai-copilot', // Replace with your language server ID
        'LLM AI Copilot', // Replace with your language server name
        {
            run: { module: serverModule, transport: TransportKind.stdio },
            debug: { module: serverModule, transport: TransportKind.stdio }
        },
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();

    context.subscriptions.push(client);

    // Register your existing commands
    let disposable = vscode.commands.registerCommand('extension.getLocalCopilotSuggestions', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file first to get coding suggestions.');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);

        const cursorPosition = selection.active;
        const line = document.lineAt(cursorPosition.line);

        let commentLine = '';
        for (let i = cursorPosition.line; i >= 0; i--) {
            const currentLine = document.lineAt(i);
            if (currentLine.text.trim().startsWith('//')) {
                commentLine = currentLine.text.trim();
                break;
            }
        }

        const prompt = `${commentLine}\n${selectedText}`;

        try {
            const response = await axios.post('http://localhost:5000/suggest', { text: prompt });
            const suggestion = response.data.suggestion;

            editor.edit(editBuilder => {
                editBuilder.insert(selection.end, `\n${suggestion}`);
            });
        } catch (error) {
            vscode.window.showErrorMessage('Error fetching suggestions from the local LLM.');
            console.error(error);
        }
    });

    let selectXOSCFile = vscode.commands.registerCommand('extension.selectXOSCFile', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select .xosc File',
            filters: { 'OpenScenario Files': ['xosc'] }
        });

        if (fileUri && fileUri[0]) {
            vscode.window.showInformationMessage('Selected XOSC File: ' + fileUri[0].fsPath);
            console.log('Selected XOSC File: ' + fileUri[0].fsPath);
        }
    });

    // Command to run esmini with the selected file
    let runEsmini = vscode.commands.registerCommand('extension.runEsmini', async () => {
        const xoscFileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select .xosc File',
            filters: { 'OpenScenario Files': ['xosc'] }
        });

        if (xoscFileUri && xoscFileUri[0]) {
            const esminiPath = 'D:\\Project\\llm-ai-copilot\\extension\\esmini\\bin\\esmini.exe'; // Path to embedded Esmini executable

            if (!fs.existsSync(esminiPath)) {
                vscode.window.showErrorMessage(`esmini not found at ${esminiPath}. Please check the extension installation.`);
                return;
            }

            const xoscFilePath = xoscFileUri[0].fsPath;

            const esminiArgs = [
                '--window', '60', '60', '1024', '576',
                '--osc', xoscFilePath,
                '--osi_file', 'on'
            ];

            execFile(esminiPath, esminiArgs, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error running esmini: ${error.message}`);
                    console.error(`Error running esmini: ${error.message}`);
                    return;
                }
                if (stderr) {
                    vscode.window.showErrorMessage(`esmini stderr: ${stderr}`);
                    console.error(`esmini stderr: ${stderr}`);
                    return;
                }
                vscode.window.showInformationMessage('esmini ran successfully');
                console.log(stdout);
            });
        } else {
            vscode.window.showInformationMessage('Please select a .xosc file.');
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(selectXOSCFile);
    context.subscriptions.push(runEsmini);
}

function deactivate() {
    if (client) {
        client.stop();
    }

    // Dispose of all subscriptions
    context.subscriptions.forEach((item) => item.dispose());
}

module.exports = {
    activate,
    deactivate
};
