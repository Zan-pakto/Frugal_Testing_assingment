/**
 * Q3: Shadow DOM Pathfinding & Accessibility Tree Traversal Utilities
 */

// Mapping of common HTML tags to their implicit WAI-ARIA roles
const IMPLICIT_ROLES = {
  button: 'button',
  a: (el) => el.hasAttribute('href') ? 'link' : null,
  input: (el) => {
    const type = el.getAttribute('type');
    if (!type) return 'textbox';
    switch (type.toLowerCase()) {
      case 'checkbox': return 'checkbox';
      case 'radio': return 'radio';
      case 'button':
      case 'submit':
      case 'reset':
        return 'button';
      case 'text':
      case 'email':
      case 'search':
      case 'tel':
      case 'url':
        return 'textbox';
      case 'number': return 'spinbutton';
      default: return 'textbox';
    }
  },
  textarea: 'textbox',
  select: 'combobox',
  nav: 'navigation',
  header: 'banner',
  footer: 'contentinfo',
  main: 'main',
  aside: 'complementary',
  article: 'article',
  section: 'region',
  form: 'form',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  li: 'listitem',
  ul: 'list',
  ol: 'list',
  table: 'table',
  tr: 'row',
  td: 'gridcell',
  th: 'columnheader'
};

/**
 * Resolves the ARIA role of a given element, accounting for explicit role
 * attributes and implicit HTML element mappings.
 * 
 * @param {Element} el - The DOM element.
 * @returns {string|null} The resolved role, or null.
 */
function getElementRole(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;

  // 1. Explicit role attribute
  const explicitRole = el.getAttribute('role');
  if (explicitRole) {
    return explicitRole.toLowerCase().trim();
  }

  // 2. Implicit mapping
  const tagName = el.tagName.toLowerCase();
  const mapper = IMPLICIT_ROLES[tagName];
  
  if (typeof mapper === 'function') {
    return mapper(el);
  }
  if (typeof mapper === 'string') {
    return mapper;
  }
  
  return null;
}

/**
 * Resolves the accessible name of an element using the WAI-ARIA Accessible Name Computation logic.
 * Supports: aria-label, aria-labelledby reference, title, placeholder, and node textContent.
 * 
 * @param {Element} el - The DOM element.
 * @returns {string} The accessible name.
 */
function getAccessibleName(el) {
  if (!el) return '';

  // 1. aria-label
  if (el.hasAttribute('aria-label')) {
    return el.getAttribute('aria-label').trim();
  }

  // 2. aria-labelledby references
  if (el.hasAttribute('aria-labelledby')) {
    const idList = el.getAttribute('aria-labelledby').split(/\s+/);
    const resolvedNames = [];
    const rootDoc = el.getRootNode(); // Works for shadow roots as well
    
    for (const id of idList) {
      if (id) {
        const labelEl = rootDoc.getElementById ? rootDoc.getElementById(id) : null;
        if (labelEl) {
          resolvedNames.push(labelEl.textContent.trim());
        }
      }
    }
    if (resolvedNames.length > 0) {
      return resolvedNames.join(' ');
    }
  }

  // 3. title attribute
  if (el.hasAttribute('title')) {
    return el.getAttribute('title').trim();
  }

  // 4. placeholder attribute (for input/textarea elements)
  if (el.hasAttribute('placeholder')) {
    return el.getAttribute('placeholder').trim();
  }

  // 5. Fallback to element text content
  return el.textContent ? el.textContent.trim() : '';
}

/**
 * Validates whether an element matches the provided filter attributes.
 * Matches: name (via accessible name computation), and state (checked, expanded, etc.)
 * 
 * @param {Element} el - The element.
 * @param {object} attributes - Attributes to check.
 * @returns {boolean} True if matching, false otherwise.
 */
function matchesAttributes(el, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'name') {
      const accessibleName = getAccessibleName(el);
      if (value instanceof RegExp) {
        if (!value.test(accessibleName)) return false;
      } else {
        if (!accessibleName.toLowerCase().includes(String(value).toLowerCase())) {
          return false;
        }
      }
    } else {
      // Normal ARIA state checks (e.g. checked, expanded, disabled)
      // Checks both WAI-ARIA and native HTML equivalent properties
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      
      const attrVal = el.getAttribute(ariaKey) || el.getAttribute(key);
      const propVal = el[key];

      const expectedVal = String(value).toLowerCase();
      const actualAttrVal = attrVal !== null ? String(attrVal).toLowerCase() : null;
      const actualPropVal = propVal !== undefined ? String(propVal).toLowerCase() : null;

      if (actualAttrVal !== expectedVal && actualPropVal !== expectedVal) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Recursively traverses the DOM (crossing Shadow DOM boundaries) to find
 * the first element satisfying the predicate.
 * 
 * @param {Element|Document|ShadowRoot} node - The starting node.
 * @param {function(Element): boolean} predicate - Matches elements.
 * @returns {Element|null} The matching element.
 */
function findElementInShadowTree(node, predicate) {
  if (!node) return null;

  // 1. Test current node if it's an element
  if (node.nodeType === Node.ELEMENT_NODE && predicate(node)) {
    return node;
  }

  // 2. Traverse into open Shadow DOM if it exists
  if (node.shadowRoot) {
    const foundInShadow = findElementInShadowTree(node.shadowRoot, predicate);
    if (foundInShadow) return foundInShadow;
  }

  // 3. Traverse light DOM children
  const children = Array.from(node.children || []);
  for (const child of children) {
    const foundInChild = findElementInShadowTree(child, predicate);
    if (foundInChild) return foundInChild;
  }

  // 4. Catch-all for Document / ShadowRoot node childNodes
  if (node.childNodes && children.length === 0) {
    const nodes = Array.from(node.childNodes);
    for (const childNode of nodes) {
      if (childNode.nodeType === Node.ELEMENT_NODE) {
        const found = findElementInShadowTree(childNode, predicate);
        if (found) return found;
      }
    }
  }

  return null;
}

/**
 * Finds an element by its accessibility role and optional attributes in the Shadow Tree.
 * 
 * @param {Element|Document|ShadowRoot} root - The starting node.
 * @param {string} role - The target WAI-ARIA role.
 * @param {object} [attributes={}] - Additional attributes like name, checked, expanded, etc.
 * @returns {Element|null} The matching element.
 */
function findByRole(root, role, attributes = {}) {
  return findElementInShadowTree(root, (el) => {
    const resolvedRole = getElementRole(el);
    if (!resolvedRole || resolvedRole !== role.toLowerCase()) {
      return false;
    }
    return matchesAttributes(el, attributes);
  });
}

// Export module for Node environment testing, and bind to window for browser context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findElementInShadowTree,
    findByRole,
    getElementRole,
    getAccessibleName
  };
}

if (typeof window !== 'undefined') {
  window.shadowTraversal = {
    findElementInShadowTree,
    findByRole,
    getElementRole,
    getAccessibleName
  };
}
