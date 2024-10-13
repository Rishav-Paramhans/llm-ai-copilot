const fs = require('fs');
const { validate } = require('jsonschema');
const xml2js = require('xml2js');

// Load OpenScenario file
function loadOpenScenario(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data;
}

// Parse XML to JSON
function parseXml(xmlContent) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlContent, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// Define JSON Schema rules for OpenScenario
const scenarioSchema = {
    type: 'object',
    properties: {
        OpenScenario: {
            type: 'object',
            required: ['Scenario'],
            properties: {
                Scenario: {
                    type: 'object',
                    required: ['Entities', 'StoryBoard'],
                    properties: {
                        Entities: {
                            type: 'array',
                            description: 'All the entities used in the scenario'
                        },
                        StoryBoard: {
                            type: 'object',
                            description: 'StoryBoard is the timeline structure of the scenario',
                            required: ['Init', 'Story']
                        }
                    }
                }
            }
        }
    }
};

// Validate against the schema
function validateScenario(parsedScenario) {
    const result = validate(parsedScenario, scenarioSchema);
    if (result.errors.length > 0) {
        console.error('Validation Errors Found:', result.errors);
        return false;
    }
    console.log('Scenario is valid');
    return true;
}

// Diagnostics for logic checks
function customLogicChecks(parsedScenario) {
    const errors = [];
    const scenario = parsedScenario.OpenScenario.Scenario;

    // Example: Ensure there is at least one entity in Entities
    if (!scenario.Entities || scenario.Entities.length === 0) {
        errors.push('Scenario must contain at least one entity.');
    }

    // Example: Ensure that the Story has at least one Act
    if (!scenario.StoryBoard.Story || scenario.StoryBoard.Story.length === 0) {
        errors.push('StoryBoard must contain at least one Story.');
    }

    return errors;
}

// Main Diagnostic Function
//async function runDiagnostics(filePath) {
//    try {
//        const xmlContent = loadOpenScenario(filePath);
//        const parsedScenario = await parseXml(xmlContent);

        // Step 1: Validate structure against schema
//        const isValid = validateScenario(parsedScenario);

        // Step 2: Run custom logic checks
//        if (isValid) {
//            const logicErrors = customLogicChecks(parsedScenario);
//            if (logicErrors.length > 0) {
//                console.error('Logic Errors Found:', logicErrors);
//            } else {
//                console.log('Scenario logic is correct.');
//            }
//        }

//    } catch (err) {
//        console.error('Error during diagnostics:', err);
//    }
//}

// Function to validate the opened text document
async function runDiagnostics(textDocument) {
    const text = textDocument.getText();
    const diagnostics = [];

    try {
        // Parse the XML content to JSON
        const parsedScenario = await parseXml(text);

        // Step 1: Validate the structure against schema
        const schemaErrors = validateScenario(parsedScenario);

        // Step 2: Run custom logic checks
        const logicErrors = customLogicChecks(parsedScenario);

        // Combine all errors
        const allErrors = [...schemaErrors, ...logicErrors];

        // Generate diagnostics for each error
        allErrors.forEach((error, index) => {
            diagnostics.push({
                severity: 1, // Error
                range: {
                    start: textDocument.positionAt(0), // You can enhance this by calculating error positions
                    end: textDocument.positionAt(50) // Arbitrary position for now
                },
                message: error,
                source: 'OpenScenario Validator'
            });
        });

    } catch (err) {
        console.error('Error during diagnostics:', err);
        diagnostics.push({
            severity: 1,
            range: {
                start: textDocument.positionAt(0),
                end: textDocument.positionAt(50)
            },
            message: `Error parsing OpenScenario document: ${err.message}`,
            source: 'OpenScenario Validator'
        });
    }

    // Send the diagnostics to the VSCode client
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Export the runDiagnostics function
module.exports = {
    runDiagnostics
};
// Run diagnostics on a file
//const scenarioFilePath = './example_scenario.xosc';
//runDiagnostics(scenarioFilePath);
