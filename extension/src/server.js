const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    CompletionItemKind,
    TextDocumentSyncKind
} = require('vscode-languageserver');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();

const openScenarioCompletionItems = [
    { label: 'OpenSCENARIO', kind: CompletionItemKind.Module },
    { label: 'Storyboard', kind: CompletionItemKind.Class },
    { label: 'Init', kind: CompletionItemKind.Method },
    { label: 'Entities', kind: CompletionItemKind.Class },
    { label: 'ScenarioObject', kind: CompletionItemKind.Class },
    { label: 'Catalogs', kind: CompletionItemKind.Class },
    { label: 'RoadNetwork', kind: CompletionItemKind.Class },
    { label: 'LogicFile', kind: CompletionItemKind.Field },
    { label: 'Traffic', kind: CompletionItemKind.Class },
    { label: 'Vehicle', kind: CompletionItemKind.Class },
    { label: 'Pedestrian', kind: CompletionItemKind.Class },
    { label: 'PedestrianController', kind: CompletionItemKind.Class },
    { label: 'MiscObject', kind: CompletionItemKind.Class },
    { label: 'ParameterDeclaration', kind: CompletionItemKind.Field },
    { label: 'ParameterValue', kind: CompletionItemKind.Field },
    { label: 'Action', kind: CompletionItemKind.Method },
    { label: 'Environment', kind: CompletionItemKind.Class },
    { label: 'Weather', kind: CompletionItemKind.Class },
    { label: 'TimeOfDay', kind: CompletionItemKind.Field },
    { label: 'Sun', kind: CompletionItemKind.Field },
    { label: 'Fog', kind: CompletionItemKind.Field },
    { label: 'Precipitation', kind: CompletionItemKind.Field },
    { label: 'CatalogReference', kind: CompletionItemKind.Field },
    { label: 'CatalogName', kind: CompletionItemKind.Field },
    { label: 'Entry', kind: CompletionItemKind.Field }
];

const openDriveCompletionItems = [
    { label: 'OpenDRIVE', kind: CompletionItemKind.Module },
    { label: 'road', kind: CompletionItemKind.Class },
    { label: 'laneSection', kind: CompletionItemKind.Class },
    { label: 'lane', kind: CompletionItemKind.Class },
    { label: 'laneOffset', kind: CompletionItemKind.Method },
    { label: 'elevation', kind: CompletionItemKind.Method },
    { label: 'elevationProfile', kind: CompletionItemKind.Class },
    { label: 'lateralProfile', kind: CompletionItemKind.Class },
    { label: 'superelevation', kind: CompletionItemKind.Method },
    { label: 'crossfall', kind: CompletionItemKind.Method },
    { label: 'roadLink', kind: CompletionItemKind.Field },
    { label: 'roadType', kind: CompletionItemKind.Field },
    { label: 'speed', kind: CompletionItemKind.Field },
    { label: 'object', kind: CompletionItemKind.Class },
    { label: 'signal', kind: CompletionItemKind.Class },
    { label: 'surface', kind: CompletionItemKind.Class },
    { label: 'roadMark', kind: CompletionItemKind.Field },
    { label: 'userData', kind: CompletionItemKind.Field }
];

connection.onInitialize(() => {
    console.log('Language server is initializing');
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

connection.onCompletion((textDocumentPosition) => {
    console.log('Completion request received');
    const document = documents.get(textDocumentPosition.textDocument.uri);
    const text = document.getText();
    if (text.includes('<OpenSCENARIO')) {
        console.log('Providing OpenSCENARIO completions');
        return openScenarioCompletionItems;
    } else if (text.includes('<OpenDRIVE')) {
        console.log('Providing OpenDRIVE completions');
        return openDriveCompletionItems;
    }
    return [];
});

documents.listen(connection);
connection.listen();
