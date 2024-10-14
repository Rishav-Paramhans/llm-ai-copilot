const {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind, 
    InsertTextFormat,
    InitializeResult
} = require('vscode-languageserver');
const { openScenarioCompletionItems, openDriveCompletionItems } = require('./methods/openScenarioDocument/completion');
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();
const { exit } = require('./methods/exit.js')
const xml2js = require('xml2js'); // Import XML parsing library
const fs = require('fs');
const { validate } = require('jsonschema');
const { runDiagnostics } = require('./methods/openScenarioDocument/diagnostic.js');  // Import the diagnostics function

console.log('Language server is starting...');

connection.onInitialize((params) => {
    console.log('Server initialized');

    const capabilities = {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
            resolveProvider: true,
            triggerCharacters: ['<', ';']  // Ensure trigger characters are correctly set
        },
        textDocument: {
            synchronization: {
                didChange: true,
                didOpen: true,
                willSave: true,
                willSaveWaitUntil: true,
                didSave: true,
                didClose: true
            }
        }
    };

    return { capabilities };
});
connection.onInitialized(() => {
    console.log('Language server fully initialized');
});
// Document content change handler
documents.onDidChangeContent(change => {
    console.log('Document changes')
    console.log(`Document changed: ${change.document.uri}`);
    const textDocument = change.document;
    const content = textDocument.getText();
    // Validate the document whenever content changes
    validateTextDocument(textDocument);
    
    xml2js.parseString(content, (err, result) => {
        if (err) {
            console.error('XML parsing error:', err);
            // Report error diagnostics
            const diagnostics = [{
                severity: 1, // 1: Error, 2: Warning, 3: Information, 4: Hint
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 1 }
                },
                message: `XML parsing error: ${err.message}`
            }];
            connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
            return;
        }
        
        // Clear existing diagnostics (if any) when no errors
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
        console.log('Parsed XML:', result);
    });
});
async function validateTextDocument(textDocument) {
    const text = textDocument.getText();
    const diagnostics = [];

    const requiredTags = ['<OpenSCENARIO>'];
    requiredTags.forEach(tag => {
        if (!text.includes(tag)) {
            diagnostics.push({
                severity: 1,
                range: {
                    start: textDocument.positionAt(0),
                    end: textDocument.positionAt(tag.length)
                },
                message: `Missing required tag: ${tag}`,
                source: 'ex'
            });
        }
    });

    // Asynchronous delay to simulate asynchronous operations
    await new Promise(resolve => setTimeout(resolve, 100));

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidClose((event) => {
    console.log('Document closed:', event.document.uri);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// Handler for 'textDocument/completion'
connection.onCompletion((textDocumentPosition) => {
    const uri = textDocumentPosition.textDocument.uri;
    console.log('Completion request received for:', uri);

    // Determine the file type based on the URI
    if (uri.endsWith('.xosc')) {
        // Provide OpenScenario completion items for .xosc files
        return openScenarioCompletionItems.map(item => ({
            ...item,
            data: { uri: textDocumentPosition.textDocument.uri }
        }));
    } else if (uri.endsWith('.xodr')) {
        // Provide OpenDrive completion items for .xodr files
        return openDriveCompletionItems.map(item => ({
            ...item,
            data: { uri: textDocumentPosition.textDocument.uri }
        }));
    } else {
        // Return an empty list or a default set of completion items for other file types
        return [];
    }
});
// Resolve completion item handler
connection.onCompletionResolve((item) => {
    console.log('Completion item resolve request received for:', item.label);

    // You can add additional information to the item here if needed
    // For this example, we simply return the item as is
    return item;
});

documents.listen(connection);
connection.listen();


connection.onShutdown(() => {
    console.log('Language server shutting down');
});

connection.onExit(() => {
    console.log('Language server exited');
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});


// Example handler for 'textDocument/didOpen'
connection.onDidOpenTextDocument(async (params) => {
    let document = params.textDocument;

     // Check if document is empty
     if (!document.text || document.text.trim() === '') {
        console.log('Document is empty.');
        return;
    }
    // Parse XML content using xml2js (or any other XML parsing library)
    try {
        const parser = new xml2js.Parser({ explicitArray: false });
        const parsedData = await parser.parseStringPromise(document.text);

        // Extract specific blocks from parsed data
        const openScenario = parsedData.OpenSCENARIO;
        if (openScenario) {
            const fileHeader = openScenario.FileHeader;
            const parameterDeclarations = openScenario.ParameterDeclarations;
            const entities = openScenario.Entities;
            const storyboard = openScenario.Storyboard;

            // Example log outputs or further processing
            if (fileHeader) {
                console.log('FileHeader:', fileHeader);
            } else {
                console.log('FileHeader not found');
            }

            if (parameterDeclarations) {
                console.log('ParameterDeclarations:', parameterDeclarations);
            } else {
                console.log('ParameterDeclarations not found');
            }

            if (entities) {
                console.log('Entities:', entities);
            } else {
                console.log('Entities not found');
            }

            if (storyboard) {
                console.log('Storyboard:', storyboard);
            } else {
                console.log('Storyboard not found');
            }

            // You can perform further processing or analysis based on extracted data
        } else {
            console.error('Invalid OpenSCENARIO structure');
        }
    } catch (error) {
        console.error('Error parsing XML:', error);
    }
});
// Listen for custom notification from client
connection.onNotification('onDidChangeContentTriggered', (params) => {
    // Retrieve the URI from the client request
    let { uri } = params;
    console.log('Received onDidChangeContentTriggered with URI:', uri);
    
    // Find the corresponding document
    let document = documents.get(uri);
    if (document) {
        // Simulate a change in content (replace with your actual logic)
        let change = {
            document: document,
            contentChanges: [{
                text: 'Simulated content change',
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                }
            }]
        };
        
        // Trigger onDidChangeContent handler
        documents.onDidChangeContent(change);
    } else {
        console.error('Document not found:', uri);
    }
});


connection.onRequest('runDiagnosticsCommand', () => {
    // Get the active document from the TextDocuments instance
    const activeDocuments = documents.all(); // Gets all currently open documents

    if (activeDocuments.length > 0) {
        // Assuming the first document is the active one
        const textDocument = activeDocuments[0];

        console.log(`Running diagnostics on active document: ${textDocument.uri}`);

        // Fetch the content of the document
        const content = textDocument.getText();

        // Call the runDiagnostics function (modify as per your implementation)
        runDiagnostics(content).then(diagnostics => {
            // Send diagnostics to the client
            connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
            console.log('Diagnostics sent to client');
        }).catch(error => {
            console.error('Error running diagnostics:', error);
        });
    } else {
        console.log('No active documents found.');
    }
});