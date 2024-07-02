const vscode = require('vscode');
const { execFile } = require('child_process');
const fs = require('fs');

function activate(context) {
    console.log('Congratulations, your extension "llm-ai-copilot" is now active!');

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

    // Default flags
    const defaultFlags = {
        '--aa_mode': '4',
        '--camera_mode': 'orbit',
        '--osi_file': 'on',
        '--window': '60 60 1024 576'
    };

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

            // Collect all flags and arguments
            let esminiArgs = [
                '--osc', xoscFilePath
            ];

            // Add default flags
            for (const flag in defaultFlags) {
                esminiArgs.push(flag, defaultFlags[flag]);
            }

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

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
