import { spawnSync } from "child_process";
import log from "./log";

// Define your completion items arrays
const openScenarioCompletionItems = [
    { label: 'OpenSCENARIO', kind: 'Module' },
    { label: 'Storyboard', kind: 'Class' },
    { label: 'Init', kind: 'Method' },
    { label: 'Entities', kind: 'Class' },
    { label: 'ScenarioObject', kind: 'Class' },
    { label: 'MiscObject', kind: 'Class' },
    { label: 'ParameterDeclaration', kind: 'Field' },
    { label: 'ParameterValue', kind: 'Field' },
    { label: 'Action', kind: 'Method' },
    { label: 'Environment', kind: 'Class' },
    { label: 'Weather', kind: 'Class' },
    { label: 'TimeOfDay', kind: 'Field' },
    { label: 'Sun', kind: 'Field'  },
    { label: 'Fog', kind: 'Field' },
    { label: 'Precipitation', kind: 'Field'  },
    { label: 'CatalogReference', kind: 'Field' },
    { label: 'CatalogName', kind: 'Field' },
    { label: 'Entry', kind: 'Field' },
    // Add more items as needed
];

const openDriveCompletionItems = [
    { label: 'OpenDRIVE', kind: 'Module' },
    { label: 'road', kind: 'Class' },
    { label: 'link', kind: 'Method' },
    { label: 'type', kind: 'Class' },
    { label: 'planView', kind: 'Class' },
    // Add more items as needed
];

export const spellingSuggestions = (
  content: string
): Record<string, string[]> => {
  const invalidWordsAndSuggestions: Record<string, string[]> = {};

  const allOutput = spawnSync("aspell", ["pipe"], {
    input: content,
    encoding: "utf-8",
  })
    .stdout.trim()
    .split("\n");

  log.write({ allOutput });

  allOutput.forEach((line) => {
    const prefix = line.slice(0, 1);

    switch (prefix) {
      case "&":
        // handle good suggestion
        const suggestionMatch = line.match(/^& (.*?) \d.*: (.*)$/);

        if (!suggestionMatch) {
          log.write({ spellingSuggestions: { invalidMatch: line } });
          return;
        }

        // Check if the word matches any openScenarioCompletionItems label
        const matchedScenarioItem = openScenarioCompletionItems.find(item => item.label === suggestionMatch[1]);
        if (matchedScenarioItem) {
          invalidWordsAndSuggestions[suggestionMatch[1]] =
            suggestionMatch[2].split(", ");
        }

        // Check if the word matches any openDriveCompletionItems label
        const matchedDriveItem = openDriveCompletionItems.find(item => item.label === suggestionMatch[1]);
        if (matchedDriveItem) {
          invalidWordsAndSuggestions[suggestionMatch[1]] =
            suggestionMatch[2].split(", ");
        }
        break;
      case "#":
        // handle invalid
        const match = line.match(/^# (.*?) \d/);

        if (!match) {
          log.write({ spellingSuggestions: { invalidMatch: line } });
          return;
        }

        // Check if the word matches any openScenarioCompletionItems label
        const matchedScenarioItemInvalid = openScenarioCompletionItems.find(item => item.label === match[1]);
        if (matchedScenarioItemInvalid) {
          invalidWordsAndSuggestions[match[1]] = [];
        }

        // Check if the word matches any openDriveCompletionItems label
        const matchedDriveItemInvalid = openDriveCompletionItems.find(item => item.label === match[1]);
        if (matchedDriveItemInvalid) {
          invalidWordsAndSuggestions[match[1]] = [];
        }
        break;
    }
  });

  return invalidWordsAndSuggestions;
};
