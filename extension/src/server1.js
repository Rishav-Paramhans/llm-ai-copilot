const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    CompletionItemKind,
    TextDocumentSyncKind, 
    InsertTextFormat
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
        insertText: '<Act name="">\n\t<ManeuverGroup maximumExecutionCount="" name="">\n\t\t<Actors selectTriggeringEntities="">\n\t\t\t<EntityRef entityRef=""/>\n\t\t</Actors>\n\t\t<Maneuver name="">\n\t\t\t<Event name="" priority="" maximumExecutionCount="">\n\t\t\t\t<Action name="">\n\t\t\t\t\t<PrivateAction>\n\t\t\t\t\t\t<LateralAction>\n\t\t\t\t\t\t\t<LaneChangeAction>\n\t\t\t\t\t\t\t\t<LaneChangeActionDynamics dynamicsShape="" value="" dynamicsDimension=""/>\n\t\t\t\t\t\t\t\t<LaneChangeTarget>\n\t\t\t\t\t\t\t\t\t<RelativeTargetLane entityRef="" value=""/>\n\t\t\t\t\t\t\t\t</LaneChangeTarget>\n\t\t\t\t\t\t\t</LaneChangeAction>\n\t\t\t\t\t\t</LateralAction>\n\t\t\t\t\t</PrivateAction>\n\t\t\t\t</Action>\n\t\t\t\t<StartTrigger>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Act block'
    },
    {
        label: 'Maneuver',
        kind: CompletionItemKind.Snippet,
        insertText: '<Maneuver name="">\n\t<Event name="" priority="" maximumExecutionCount="">\n\t\t<Action name="">\n\t\t\t<PrivateAction>\n\t\t\t\t<LateralAction>\n\t\t\t\t\t<LaneChangeAction>\n\t\t\t\t\t\t<LaneChangeActionDynamics dynamicsShape="" value="" dynamicsDimension=""/>\n\t\t\t\t\t\t<LaneChangeTarget>\n\t\t\t\t\t\t\t<RelativeTargetLane entityRef="" value=""/>\n\t\t\t\t\t\t</LaneChangeTarget>\n\t\t\t\t\t</LaneChangeAction>\n\t\t\t\t</LateralAction>\n\t\t\t</PrivateAction>\n\t\t</Action>\n\t\t<StartTrigger>',
        insertTextFormat: InsertTextFormat.Snippet,
        detail: 'Insert Maneuver block'
    }
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

documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument) {
    const text = textDocument.getText();
    const diagnostics = [];

    // Example validation: Check if all required tags are present
    const requiredTags = ['<OpenSCENARIO>', '<FileHeader', '<Storyboard>', '<Entities>', '<RoadNetwork>'];
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

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidClose((event) => {
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

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
    }
    return [];
});

documents.listen(connection);
connection.listen();
