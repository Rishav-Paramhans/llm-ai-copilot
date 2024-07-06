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


const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments();
const { exit } = require('./methods/exit.js')
const xml2js = require('xml2js'); // Import XML parsing library

console.log('Language server is starting...');


// Example completion items
const staticCompletionItems = [
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
    { label: 'Entry', kind: CompletionItemKind.Field },
    {
        label: 'ParameterDeclarations',
        kind: CompletionItemKind.Snippet,
        insertText: '<ParameterDeclarations>\n\t<ParameterDeclaration name="" parameterType="" value=""/>\n</ParameterDeclarations>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert ParameterDeclarations block'
    },
    {
        label: 'Environment',
        kind: CompletionItemKind.Snippet,
        insertText: '<Environment>\n\t<Weather>\n\t\t<TimeOfDay animation="" hour=""/>\n\t</Weather>\n</Environment>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Environment block'
    },
    {
        label: 'FileHeader',
        kind: CompletionItemKind.Snippet,
        insertText: '<FileHeader revMajor="" revMinor="" date="" description="" author=""/>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert FileHeader block'
    },
    {
        label: 'CatalogLocations',
        kind: CompletionItemKind.Snippet,
        insertText: '<CatalogLocations>\n\t<VehicleCatalog>\n\t\t<Directory path=""/>\n\t</VehicleCatalog>\n</CatalogLocations>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert CatalogLocations block'
    },
    {
        label: 'RoadNetwork',
        kind: CompletionItemKind.Snippet,
        insertText: '<RoadNetwork>\n\t<LogicFile filepath=""/>\n\t<SceneGraphFile filepath=""/>\n</RoadNetwork>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert RoadNetwork block'
    },
    {
        label: 'Entities',
        kind: CompletionItemKind.Snippet,
        insertText: '<Entities>\n\t<ScenarioObject name="">\n\t\t<CatalogReference catalogName="" entryName=""/>\n\t</ScenarioObject>\n\t<ScenarioObject name="">\n\t\t<CatalogReference catalogName="" entryName=""/>\n\t</ScenarioObject>\n</Entities>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Entities block'
    },
    {
        label: 'Storyboard',
        kind: CompletionItemKind.Snippet,
        insertText: '<Storyboard>\n\t<Init>\n\t\t<Actions>\n\t\t\t<Private entityRef="">\n\t\t\t\t<PrivateAction>\n\t\t\t\t\t<LongitudinalAction>\n\t\t\t\t\t\t<SpeedAction>\n\t\t\t\t\t\t\t<SpeedActionDynamics dynamicsShape="" dynamicsDimension="" value=""/>\n\t\t\t\t\t\t\t<SpeedActionTarget>\n\t\t\t\t\t\t\t\t<AbsoluteTargetSpeed value=""/>\n\t\t\t\t\t\t\t</SpeedActionTarget>\n\t\t\t\t\t\t</SpeedAction>\n\t\t\t\t\t</LongitudinalAction>\n\t\t\t\t</PrivateAction>\n\t\t\t\t<PrivateAction>\n\t\t\t\t\t<TeleportAction>\n\t\t\t\t\t\t<Position>\n\t\t\t\t\t\t\t<LanePosition roadId="" laneId="" offset="" s=""/>\n\t\t\t\t\t\t</Position>\n\t\t\t\t\t</TeleportAction>\n\t\t\t\t</PrivateAction>\n\t\t\t</Private>\n\t\t</Actions>\n\t</Init>\n\t<Story name="">\n\t\t<Act name="">\n\t\t\t<ManeuverGroup maximumExecutionCount="" name="">\n\t\t\t\t<Actors selectTriggeringEntities="">\n\t\t\t\t\t<EntityRef entityRef=""/>\n\t\t\t\t</Actors>\n\t\t\t\t<Maneuver name="">\n\t\t\t\t\t<Event name="" priority="" maximumExecutionCount="">\n\t\t\t\t\t\t<Action name="">\n\t\t\t\t\t\t\t<PrivateAction>\n\t\t\t\t\t\t\t\t<LateralAction>\n\t\t\t\t\t\t\t\t\t<LaneChangeAction>\n\t\t\t\t\t\t\t\t\t\t<LaneChangeActionDynamics dynamicsShape="" value="" dynamicsDimension=""/>\n\t\t\t\t\t\t\t\t\t\t<LaneChangeTarget>\n\t\t\t\t\t\t\t\t\t\t\t<RelativeTargetLane entityRef="" value=""/>\n\t\t\t\t\t\t\t\t\t\t</LaneChangeTarget>\n\t\t\t\t\t\t\t\t\t</LaneChangeAction>\n\t\t\t\t\t\t\t\t</LateralAction>\n\t\t\t\t\t\t\t</PrivateAction>\n\t\t\t\t\t\t</Action>\n\t\t\t\t\t\t<StartTrigger>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Storyboard block'
    },
    {
        label: 'Init',
        kind: CompletionItemKind.Snippet,
        insertText: '<Init>\n\t<Actions>\n\t\t<Private entityRef="">\n\t\t\t<PrivateAction>\n\t\t\t\t<LongitudinalAction>\n\t\t\t\t\t<SpeedAction>\n\t\t\t\t\t\t<SpeedActionDynamics dynamicsShape="" dynamicsDimension="" value=""/>\n\t\t\t\t\t\t<SpeedActionTarget>\n\t\t\t\t\t\t\t<AbsoluteTargetSpeed value=""/>\n\t\t\t\t\t\t</SpeedActionTarget>\n\t\t\t\t\t</SpeedAction>\n\t\t\t\t</LongitudinalAction>\n\t\t\t</PrivateAction>\n\t\t\t<PrivateAction>\n\t\t\t\t<TeleportAction>\n\t\t\t\t\t<Position>\n\t\t\t\t\t\t<LanePosition roadId="" laneId="" offset="" s=""/>\n\t\t\t\t\t</Position>\n\t\t\t\t</TeleportAction>\n\t\t\t</PrivateAction>\n\t\t</Private>\n\t</Actions>\n</Init>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Init block'
    },
    {
        label: 'Act',
        kind: CompletionItemKind.Snippet,
        insertText: '<Act name="">\n\t<ManeuverGroup maximumExecutionCount="" name="">\n\t\t<Actors selectTriggeringEntities="">\n\t\t\t<EntityRef entityRef=""/>\n\t\t</Actors>\n\t\t<Maneuver name="">\n\t\t\t<Event name="" priority="" maximumExecutionCount="">\n\t\t\t\t<Action name="">\n\t\t\t\t\t<PrivateAction>\n\t\t\t\t\t\t<LateralAction>\n\t\t\t\t\t\t\t<LaneChangeAction dynamicsShape="" value="" dynamicsDimension=""/>\n\t\t\t\t\t\t\t<LaneChangeTarget>\n\t\t\t\t\t\t\t\t<RelativeTargetLane entityRef="" value=""/>\n\t\t\t\t\t\t\t</LaneChangeTarget>\n\t\t\t\t\t\t</LaneChangeAction>\n\t\t\t\t\t</LateralAction>\n\t\t\t\t</PrivateAction>\n\t\t\t</Action>\n\t\t\t<StartTrigger>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Act block'
    },
    { label: 'OpenDRIVE', kind: CompletionItemKind.Module },
    { label: 'road', kind: CompletionItemKind.Class },
    { label: 'link', kind: CompletionItemKind.Method },
    { label: 'type', kind: CompletionItemKind.Class },
    { label: 'planView', kind: CompletionItemKind.Class },
    { label: 'geometry', kind: CompletionItemKind.Field },
    { label: 'spiral', kind: CompletionItemKind.Class },
    { label: 'arc', kind: CompletionItemKind.Class },
    { label: 'line', kind: CompletionItemKind.Class },
    { label: 'junction', kind: CompletionItemKind.Class },
    { label: 'connection', kind: CompletionItemKind.Class },
    { label: 'laneSection', kind: CompletionItemKind.Class },
    { label: 'lane', kind: CompletionItemKind.Class },
    { label: 'width', kind: CompletionItemKind.Field },
    { label: 'laneOffset', kind: CompletionItemKind.Field },
    { label: 'elevation', kind: CompletionItemKind.Field },
    { label: 'lateralProfile', kind: CompletionItemKind.Field },
    { label: 'roadMark', kind: CompletionItemKind.Field },
    { label: 'laneRoadMark', kind: CompletionItemKind.Field },
    { label: 'signal', kind: CompletionItemKind.Field },
    { label: 'object', kind: CompletionItemKind.Field },
    { label: 'tunnel', kind: CompletionItemKind.Field },
    { label: 'bridge', kind: CompletionItemKind.Field },
    { label: 'surface', kind: CompletionItemKind.Field },
    {
        label: 'road',
        kind: CompletionItemKind.Snippet,
        insertText: '<road name="" length="" id="" junction="">\n\t<type>\n\t\t<speed max="" unit=""/>\n\t</type>\n\t<planView>\n\t\t<geometry s="" x="" y="" hdg="" length="">\n\t\t\t<line/>\n\t\t</geometry>\n\t</planView>\n\t<elevationProfile>\n\t\t<elevation s="" a="" b="" c="" d=""/>\n\t</elevationProfile>\n\t<lateralProfile>\n\t\t<superelevation s="" a="" b="" c="" d=""/>\n\t\t<crossfall s="" side="" a="" b="" c="" d=""/>\n\t\t<shape s="" t="" z="" a="" b="" c="" d=""/>\n\t</lateralProfile>\n\t<lanes>\n\t\t<laneSection s="">\n\t\t\t<left>\n\t\t\t\t<lane id="" type="" level="">\n\t\t\t\t\t<width sOffset="" a="" b="" c="" d=""/>\n\t\t\t\t\t<roadMark sOffset="" type="" weight="" color="" material="" width="" laneChange="" height=""/>\n\t\t\t\t</lane>\n\t\t\t</left>\n\t\t\t<center>\n\t\t\t\t<lane id="" type="" level="">\n\t\t\t\t\t<width sOffset="" a="" b="" c="" d=""/>\n\t\t\t\t\t<roadMark sOffset="" type="" weight="" color="" material="" width="" laneChange="" height=""/>\n\t\t\t\t</lane>\n\t\t\t</center>\n\t\t\t<right>\n\t\t\t\t<lane id="" type="" level="">\n\t\t\t\t\t<width sOffset="" a="" b="" c="" d=""/>\n\t\t\t\t\t<roadMark sOffset="" type="" weight="" color="" material="" width="" laneChange="" height=""/>\n\t\t\t\t</lane>\n\t\t\t</right>\n\t\t</laneSection>\n\t</lanes>\n</road>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert road block'
    },
    {
        label: 'junction',
        kind: CompletionItemKind.Snippet,
        insertText: '<junction id="" name="">\n\t<connection id="" incomingRoad="" connectingRoad="" contactPoint="">\n\t\t<link elementType="" elementId="" contactPoint=""/>\n\t\t<laneLink from="" to=""/>\n\t</connection>\n</junction>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert junction block'
    }
];

connection.onInitialized(() => {
    console.log('Language server fully initialized');
});

// Handle document lifecycle events
documents.onDidOpen((event) => {
    const document = event.document;
    console.log(`Document opened: ${document.uri}`);
});

documents.onDidChangeContent((change) => {
    const document = change.document;
    console.log(`Document changed: ${document.uri}`);
});

documents.onDidClose((event) => {
    const document = event.document;
    console.log(`Document closed: ${document.uri}`);
});

documents.listen(connection);

// Completion handler
connection.onCompletion((textDocumentPosition) => {
    console.log('Completion request received for:', textDocumentPosition.textDocument.uri);

    // Provide static completion items
    return staticCompletionItems.map(item => ({
        ...item,
        data: { uri: textDocumentPosition.textDocument.uri }
    }));
});

// Initialize handler
connection.onInitialize((params) => {
    console.log('Server initialized');
    const result = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
    return result;
});

// Resolve completion item handler
connection.onCompletionResolve((item) => {
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
