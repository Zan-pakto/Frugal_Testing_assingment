# Q3: Shadow DOM Pathfinding & Accessibility Tree Refactoring

This directory contains utility functions to traverse the Shadow DOM using accessibility properties and an expert system prompt to guide LLMs in locating elements exclusively via the accessibility tree.

## Features

1. **Shadow DOM Pathfinding**:
   - `findElementInShadowTree(root, predicate)`: Traverses elements recursively, seamlessly crossing open Shadow DOM boundaries.
   - `findByRole(root, role, attributes)`: Finds elements based on WAI-ARIA accessibility roles (supporting explicit and implicit HTML mapping) and attributes/states (e.g. `name`, `checked`, `expanded`, `disabled`).
2. **Accessible Name Resolution**: Calculates accessible names following WAI-ARIA guidelines, inspecting `aria-label`, `aria-labelledby`, `title`, `placeholder`, and inner text content.
3. **Robust Test Harness**: Integrated validation script using `jsdom` to build a multi-tiered nested custom element shadow tree to test the traverser with state-based assertions.
4. **Expert AI Prompt (`accessibilityPrompt.md`)**: A system prompt designed to restrict LLMs to locating elements exclusively via the Accessibility Tree, strictly forbidding HTML tags, CSS classes, IDs, XPath, and superficial text lookups.

## Folder Structure

```
q3-shadow-dom-accessibility/
├── shadowTraversal.js       # Core traversal utilities
├── test.js                  # JSDOM-based unit test suite
├── accessibilityPrompt.md   # Expert AI system prompt
├── package.json
└── README.md
```

## How to Run the Tests

1. Install dependencies:
   ```bash
   cd q3-shadow-dom-accessibility
   npm install
   ```

2. Run the unit tests:
   ```bash
   npm test
   ```
