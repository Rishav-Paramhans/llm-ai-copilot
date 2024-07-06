const { RequestMessage } = require("../server");
const serverInfo = require("../extension");

const initialize = (message) => {
  return {
    capabilities: {
      completionProvider: {},
      textDocumentSync: 1,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      codeActionProvider: true,
      hoverProvider: true,
    },
    serverInfo: serverInfo,
  };
};

module.exports = initialize;
