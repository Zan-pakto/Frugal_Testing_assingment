const { JSDOM } = require('jsdom');
const { findElementInShadowTree, findByRole, getElementRole, getAccessibleName } = require('./shadowTraversal');

// Set up JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>');
const document = dom.window.document;
const Node = dom.window.Node;
const Element = dom.window.Element;
const ShadowRoot = dom.window.ShadowRoot;

// Expose DOM globals to shadowTraversal module execution context
global.document = document;
global.Node = dom.window.Node;
global.Element = dom.window.Element;
global.ShadowRoot = dom.window.ShadowRoot;

function runTests() {
  console.log('--- Initializing Mock Nested Shadow DOM Tree ---');

  const rootDiv = document.getElementById('root');

  // 1. Create a banner header in light DOM
  const banner = document.createElement('header');
  banner.setAttribute('role', 'banner');
  banner.textContent = 'Frugal Dashboard';
  rootDiv.appendChild(banner);

  // 2. Create custom element: custom-navbar
  const customNavbar = document.createElement('custom-navbar');
  rootDiv.appendChild(customNavbar);

  // Attach shadow root to custom-navbar
  const navShadow = customNavbar.attachShadow({ mode: 'open' });
  const navElement = document.createElement('nav'); // Implicit role: navigation
  navShadow.appendChild(navElement);

  // 3. Create nested custom element: custom-menu-button inside custom-navbar shadow DOM
  const customMenuButton = document.createElement('custom-menu-button');
  navElement.appendChild(customMenuButton);

  // Attach nested shadow root
  const menuShadow = customMenuButton.attachShadow({ mode: 'open' });
  
  // A. Button with explicit aria attributes and inner text
  const menuBtn = document.createElement('button');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.textContent = 'Menu Options';
  menuShadow.appendChild(menuBtn);

  // B. Input with implicit checkbox role and checked state
  const checkboxInput = document.createElement('input');
  checkboxInput.setAttribute('type', 'checkbox');
  checkboxInput.checked = true;
  menuShadow.appendChild(checkboxInput);

  // C. Input with implicit textbox role and placeholder name
  const searchInput = document.createElement('input');
  searchInput.setAttribute('type', 'text');
  searchInput.setAttribute('placeholder', 'Search items...');
  menuShadow.appendChild(searchInput);

  // D. Custom role div button with aria-label
  const customBtn = document.createElement('div');
  customBtn.setAttribute('role', 'button');
  customBtn.setAttribute('aria-label', 'Submit Action');
  menuShadow.appendChild(customBtn);

  console.log('DOM Tree initialized successfully.');

  // Assertions
  console.log('\n--- Running Assertions ---');

  // Assertion 1: Find implicit banner in Light DOM
  const foundBanner = findByRole(document, 'banner');
  if (!foundBanner || foundBanner.textContent !== 'Frugal Dashboard') {
    throw new Error('Assertion failed: Could not find banner in light DOM');
  }
  console.log('✓ Found banner in Light DOM.');

  // Assertion 2: Find implicit navigation in first shadow DOM level
  const foundNav = findByRole(document, 'navigation');
  if (!foundNav || foundNav.tagName.toLowerCase() !== 'nav') {
    throw new Error('Assertion failed: Could not find navigation role inside custom-navbar shadow root');
  }
  console.log('✓ Found navigation inside custom-navbar shadow root.');

  // Assertion 3: Find deep nested button with accessible name matching textContent
  const foundBtn1 = findByRole(document, 'button', { name: 'Menu Options' });
  if (!foundBtn1 || foundBtn1.getAttribute('aria-expanded') !== 'false') {
    throw new Error('Assertion failed: Could not find button with name "Menu Options" and aria-expanded=false in nested shadow root');
  }
  console.log('✓ Found button "Menu Options" in nested shadow root.');

  // Assertion 4: Find deep nested button with state verification
  const foundBtn2 = findByRole(document, 'button', { name: 'Menu Options', expanded: false });
  if (!foundBtn2) {
    throw new Error('Assertion failed: Could not find button matching expanded: false');
  }
  console.log('✓ Found button matching state filter { expanded: false }.');

  // Assertion 5: Find implicit checkbox with state checking
  const foundCheckbox = findByRole(document, 'checkbox', { checked: true });
  if (!foundCheckbox || foundCheckbox.tagName.toLowerCase() !== 'input') {
    throw new Error('Assertion failed: Could not find checked checkbox input in nested shadow root');
  }
  console.log('✓ Found checked checkbox input in nested shadow root.');

  // Assertion 6: Find implicit textbox using placeholder as accessible name
  const foundTextbox = findByRole(document, 'textbox', { name: 'Search items...' });
  if (!foundTextbox || foundTextbox.getAttribute('placeholder') !== 'Search items...') {
    throw new Error('Assertion failed: Could not find textbox with placeholder "Search items..."');
  }
  console.log('✓ Found textbox input using placeholder name in nested shadow root.');

  // Assertion 7: Find explicit button role matching aria-label
  const foundCustomBtn = findByRole(document, 'button', { name: 'Submit Action' });
  if (!foundCustomBtn || foundCustomBtn.getAttribute('aria-label') !== 'Submit Action') {
    throw new Error('Assertion failed: Could not find explicit button with aria-label "Submit Action"');
  }
  console.log('✓ Found custom div button with aria-label in nested shadow root.');

  console.log('\n[TEST PASSED] All shadow DOM accessibility traversal tests passed successfully!');
}

try {
  runTests();
} catch (e) {
  console.error('\n[TEST FAILED]:', e.message);
  process.exit(1);
}
