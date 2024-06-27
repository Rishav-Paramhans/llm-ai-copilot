const path = require('path');
const vscode = require('vscode');
const axios = require('axios');
const { LanguageClient, TransportKind } = require('vscode-languageclient');
const { exec } = require('child_process');

let client;

function activate(context) {
    console.log('Congratulations, your extension "llm-ai-copilot" is now active!');

    // Register command for getting local copilot suggestions
    let disposable = vscode.commands.registerCommand('extension.getLocalCopilotSuggestions', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file first to get coding suggestions.');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);

        // Get the line number where the cursor is
        const cursorPosition = selection.active;
        const line = document.lineAt(cursorPosition.line);

        // Find the comment line starting with //
        let commentLine = '';
        for (let i = cursorPosition.line; i >= 0; i--) {
            const currentLine = document.lineAt(i);
            if (currentLine.text.trim().startsWith('//')) {
                commentLine = currentLine.text.trim();
                break;
            }
        }

        // Build the prompt combining comment line and selected text
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

    // Function to run esmini with the selected file
    function runEsmini(filePath) {
        const command = `esmini ${filePath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error running esmini: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(stderr);
            }
            vscode.window.showInformationMessage('esmini output: ' + stdout);
        });
    }

    // Register the command for selecting .xosc files and running esmini
    let selectXOSCFile = vscode.commands.registerCommand('extension.selectXOSCFile', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select .xosc File',
            filters: {
                'OpenScenario Files': ['xosc']
            }
        });

        if (fileUri && fileUri[0]) {
            const filePath = fileUri[0].fsPath;
            vscode.window.showInformationMessage('Selected XOSC File: ' + filePath);
            runEsmini(filePath);
        }
    });

    // Register the command for selecting .xodr files and running esmini
    let selectXODRFile = vscode.commands.registerCommand('extension.selectXODRFile', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select .xodr File',
            filters: {
                'OpenDRIVE Files': ['xodr']
            }
        });

        if (fileUri && fileUri[0]) {
            const filePath = fileUri[0].fsPath;
            vscode.window.showInformationMessage('Selected XODR File: ' + filePath);
            runEsmini(filePath);
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(selectXOSCFile);
    context.subscriptions.push(selectXODRFile);

    // Language Server setup
    let serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    let serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    let clientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'openscenario' },
            { scheme: 'file', language: 'opendrive' }
        ],
        synchronize: {
            configurationSection: 'openscenarioLanguageServer',
        }
    };

    client = new LanguageClient(
        'openscenarioLanguageServer',
        'OpenSCENARIO Language Server',
        serverOptions,
        clientOptions
    );

    client.start();
}

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

module.exports = {
    activate,
    deactivate
};
