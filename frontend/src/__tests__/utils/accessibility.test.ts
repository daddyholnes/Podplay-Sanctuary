import {
  checkAccessibility,
  announceToScreenReader,
  setFocusTrap,
  removeFocusTrap,
  getAriaLabel,
  setAriaLabel,
  toggleAriaExpanded,
  handleKeyboardNavigation,
  createSkipLink,
  validateColorContrast,
  checkImageAltText,
  validateFormAccessibility,
  createLiveRegion,
  updateLiveRegion,
  getAccessibilityViolations,
  fixAccessibilityViolations,
  generateAccessibilityReport,
  enableHighContrast,
  disableHighContrast,
  adjustFontSize,
  enableReducedMotion,
  disableReducedMotion,
  createAriaDescribedBy,
  validateTabOrder,
  createLandmarks,
  validateHeadingStructure,
  checkKeyboardTrap,
  validateFocusManagement,
  createAccessibleDialog,
  createAccessibleMenu,
  createAccessibleTable,
  createAccessibleForm,
  announceRouteChange,
  validateSemanticStructure
} from '../../utils/accessibility';

// Mock DOM APIs
const mockElement = {
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  removeAttribute: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn()
  },
  style: {},
  offsetWidth: 100,
  offsetHeight: 50,
  textContent: 'Test content',
  tagName: 'DIV',
  id: 'test-id',
  children: [],
  parentElement: null
};

// Mock screen reader API
const mockScreenReader = {
  announce: jest.fn(),
  setLiveRegion: jest.fn(),
  updateLiveRegion: jest.fn()
};

// Mock accessibility checker
const mockAxe = {
  run: jest.fn(),
  configure: jest.fn(),
  reset: jest.fn()
};

// Mock global objects
Object.defineProperty(global, 'document', {
  writable: true,
  value: {
    createElement: jest.fn(() => mockElement),
    getElementById: jest.fn(() => mockElement),
    querySelector: jest.fn(() => mockElement),
    querySelectorAll: jest.fn(() => [mockElement]),
    body: mockElement,
    activeElement: mockElement,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }
});

Object.defineProperty(global, 'window', {
  writable: true,
  value: {
    getComputedStyle: jest.fn(() => ({
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
      fontSize: '16px'
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    location: { href: 'http://localhost:3000' },
    speechSynthesis: {
      speak: jest.fn(),
      cancel: jest.fn(),
      getVoices: jest.fn(() => [])
    }
  }
});

describe('Accessibility Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElement.setAttribute.mockClear();
    mockElement.getAttribute.mockClear();
    mockElement.removeAttribute.mockClear();
  });

  describe('Screen Reader Support', () => {
    test('announceToScreenReader should create announcement', () => {
      const message = 'Page loaded successfully';
      announceToScreenReader(message);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
    });

    test('announceToScreenReader should handle urgent announcements', () => {
      const message = 'Error occurred';
      announceToScreenReader(message, true);
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });

    test('createLiveRegion should set up live region', () => {
      const id = 'status-region';
      createLiveRegion(id, 'polite');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('id', id);
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
    });

    test('updateLiveRegion should update region content', () => {
      const regionId = 'status-region';
      const message = 'Status updated';
      
      document.getElementById = jest.fn(() => mockElement);
      updateLiveRegion(regionId, message);
      
      expect(document.getElementById).toHaveBeenCalledWith(regionId);
      expect(mockElement.textContent).toBe(message);
    });

    test('announceRouteChange should announce navigation', () => {
      const routeName = 'Dashboard';
      announceRouteChange(routeName);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    });
  });

  describe('Focus Management', () => {
    test('setFocusTrap should trap focus within element', () => {
      const container = mockElement;
      const focusableElements = [mockElement, mockElement];
      
      container.querySelectorAll = jest.fn(() => focusableElements);
      setFocusTrap(container);
      
      expect(container.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('removeFocusTrap should remove focus trap', () => {
      const container = mockElement;
      removeFocusTrap(container);
      
      expect(container.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('handleKeyboardNavigation should handle arrow keys', () => {
      const items = [mockElement, mockElement, mockElement];
      const currentIndex = 1;
      
      const event = {
        key: 'ArrowDown',
        preventDefault: jest.fn()
      };
      
      const result = handleKeyboardNavigation(event, items, currentIndex);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(result).toBe(2);
    });

    test('handleKeyboardNavigation should wrap around', () => {
      const items = [mockElement, mockElement, mockElement];
      const currentIndex = 2;
      
      const event = {
        key: 'ArrowDown',
        preventDefault: jest.fn()
      };
      
      const result = handleKeyboardNavigation(event, items, currentIndex);
      expect(result).toBe(0);
    });

    test('validateTabOrder should check tab sequence', () => {
      const container = mockElement;
      const focusableElements = [
        { ...mockElement, tabIndex: 0 },
        { ...mockElement, tabIndex: 1 },
        { ...mockElement, tabIndex: 2 }
      ];
      
      container.querySelectorAll = jest.fn(() => focusableElements);
      const result = validateTabOrder(container);
      
      expect(result.isValid).toBe(true);
      expect(result.sequence).toEqual([0, 1, 2]);
    });

    test('checkKeyboardTrap should detect focus traps', () => {
      const container = mockElement;
      container.querySelectorAll = jest.fn(() => [mockElement]);
      
      const result = checkKeyboardTrap(container);
      
      expect(result.hasValidTrap).toBe(true);
      expect(result.focusableElements).toHaveLength(1);
    });

    test('validateFocusManagement should check focus handling', () => {
      const component = mockElement;
      const result = validateFocusManagement(component);
      
      expect(result.hasFocusManagement).toBe(true);
      expect(result.violations).toEqual([]);
    });
  });

  describe('ARIA Attributes', () => {
    test('getAriaLabel should return aria-label value', () => {
      mockElement.getAttribute.mockReturnValue('Test label');
      const result = getAriaLabel(mockElement);
      
      expect(mockElement.getAttribute).toHaveBeenCalledWith('aria-label');
      expect(result).toBe('Test label');
    });

    test('setAriaLabel should set aria-label attribute', () => {
      const label = 'New label';
      setAriaLabel(mockElement, label);
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-label', label);
    });

    test('toggleAriaExpanded should toggle expanded state', () => {
      mockElement.getAttribute.mockReturnValue('false');
      toggleAriaExpanded(mockElement);
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
    });

    test('createAriaDescribedBy should create description relationship', () => {
      const element = mockElement;
      const descriptionId = 'desc-123';
      const description = 'This is a description';
      
      createAriaDescribedBy(element, descriptionId, description);
      
      expect(element.setAttribute).toHaveBeenCalledWith('aria-describedby', descriptionId);
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    test('createSkipLink should create skip navigation', () => {
      const target = '#main-content';
      const text = 'Skip to main content';
      
      createSkipLink(target, text);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('href', target);
    });
  });

  describe('Color Contrast', () => {
    test('validateColorContrast should check contrast ratio', () => {
      const foreground = '#000000';
      const background = '#ffffff';
      
      const result = validateColorContrast(foreground, background);
      
      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.passesAA).toBe(true);
      expect(result.passesAAA).toBe(true);
    });

    test('validateColorContrast should fail low contrast', () => {
      const foreground = '#cccccc';
      const background = '#ffffff';
      
      const result = validateColorContrast(foreground, background);
      
      expect(result.ratio).toBeLessThan(4.5);
      expect(result.passesAA).toBe(false);
      expect(result.passesAAA).toBe(false);
    });

    test('enableHighContrast should apply high contrast theme', () => {
      enableHighContrast();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('high-contrast');
    });

    test('disableHighContrast should remove high contrast theme', () => {
      disableHighContrast();
      
      expect(document.body.classList.remove).toHaveBeenCalledWith('high-contrast');
    });
  });

  describe('Image Accessibility', () => {
    test('checkImageAltText should validate alt attributes', () => {
      const images = [
        { ...mockElement, tagName: 'IMG', getAttribute: jest.fn(() => 'Valid alt text') },
        { ...mockElement, tagName: 'IMG', getAttribute: jest.fn(() => '') },
        { ...mockElement, tagName: 'IMG', getAttribute: jest.fn(() => null) }
      ];
      
      document.querySelectorAll = jest.fn(() => images);
      const result = checkImageAltText();
      
      expect(result.total).toBe(3);
      expect(result.withAlt).toBe(1);
      expect(result.violations).toHaveLength(2);
    });
  });

  describe('Form Accessibility', () => {
    test('validateFormAccessibility should check form compliance', () => {
      const form = {
        ...mockElement,
        querySelectorAll: jest.fn(() => [
          { ...mockElement, tagName: 'INPUT', getAttribute: jest.fn(() => 'label-1') },
          { ...mockElement, tagName: 'SELECT', getAttribute: jest.fn(() => null) }
        ])
      };
      
      const result = validateFormAccessibility(form);
      
      expect(result.isAccessible).toBe(false);
      expect(result.violations).toContain('Missing aria-labelledby or aria-label');
    });

    test('createAccessibleForm should create compliant form', () => {
      const config = {
        id: 'test-form',
        fields: [
          { type: 'text', name: 'username', label: 'Username', required: true },
          { type: 'email', name: 'email', label: 'Email', required: true }
        ]
      };
      
      const result = createAccessibleForm(config);
      
      expect(result.form).toBeDefined();
      expect(result.fields).toHaveLength(2);
      expect(result.isAccessible).toBe(true);
    });
  });

  describe('Semantic Structure', () => {
    test('validateHeadingStructure should check heading hierarchy', () => {
      const headings = [
        { ...mockElement, tagName: 'H1', textContent: 'Main Title' },
        { ...mockElement, tagName: 'H2', textContent: 'Section Title' },
        { ...mockElement, tagName: 'H4', textContent: 'Subsection' } // Skip H3
      ];
      
      document.querySelectorAll = jest.fn(() => headings);
      const result = validateHeadingStructure();
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Heading level skipped: H3');
    });

    test('createLandmarks should add landmark roles', () => {
      const config = {
        header: mockElement,
        nav: mockElement,
        main: mockElement,
        aside: mockElement,
        footer: mockElement
      };
      
      createLandmarks(config);
      
      expect(config.header.setAttribute).toHaveBeenCalledWith('role', 'banner');
      expect(config.nav.setAttribute).toHaveBeenCalledWith('role', 'navigation');
      expect(config.main.setAttribute).toHaveBeenCalledWith('role', 'main');
      expect(config.aside.setAttribute).toHaveBeenCalledWith('role', 'complementary');
      expect(config.footer.setAttribute).toHaveBeenCalledWith('role', 'contentinfo');
    });

    test('validateSemanticStructure should check document structure', () => {
      document.querySelectorAll = jest.fn((selector) => {
        if (selector === 'h1') return [mockElement];
        if (selector === '[role="main"]') return [mockElement];
        if (selector === 'nav') return [mockElement];
        return [];
      });
      
      const result = validateSemanticStructure();
      
      expect(result.hasH1).toBe(true);
      expect(result.hasMain).toBe(true);
      expect(result.hasNav).toBe(true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Accessibility Checking', () => {
    test('checkAccessibility should run comprehensive audit', async () => {
      const element = mockElement;
      mockAxe.run.mockResolvedValue({
        violations: [],
        passes: [{ id: 'color-contrast', impact: 'minor' }],
        incomplete: [],
        inapplicable: []
      });
      
      const result = await checkAccessibility(element);
      
      expect(result.violations).toHaveLength(0);
      expect(result.passes).toHaveLength(1);
      expect(result.score).toBe(100);
    });

    test('getAccessibilityViolations should return violations', async () => {
      const element = mockElement;
      mockAxe.run.mockResolvedValue({
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Color contrast is insufficient',
            nodes: [{ target: ['#test'] }]
          }
        ]
      });
      
      const result = await getAccessibilityViolations(element);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('color-contrast');
      expect(result[0].impact).toBe('serious');
    });

    test('fixAccessibilityViolations should auto-fix issues', async () => {
      const violations = [
        {
          id: 'color-contrast',
          nodes: [{ target: ['#test-element'] }],
          impact: 'serious'
        }
      ];
      
      document.querySelector = jest.fn(() => mockElement);
      const result = await fixAccessibilityViolations(violations);
      
      expect(result.fixed).toHaveLength(1);
      expect(result.unfixable).toHaveLength(0);
    });

    test('generateAccessibilityReport should create detailed report', async () => {
      const element = mockElement;
      mockAxe.run.mockResolvedValue({
        violations: [{ id: 'test-violation', impact: 'minor' }],
        passes: [{ id: 'test-pass', impact: 'minor' }],
        incomplete: [],
        inapplicable: []
      });
      
      const result = await generateAccessibilityReport(element);
      
      expect(result.summary.violations).toBe(1);
      expect(result.summary.passes).toBe(1);
      expect(result.summary.score).toBeLessThan(100);
      expect(result.details.violations).toHaveLength(1);
    });
  });

  describe('User Preferences', () => {
    test('adjustFontSize should change font size', () => {
      const size = 'large';
      adjustFontSize(size);
      
      expect(document.body.classList.add).toHaveBeenCalledWith('font-size-large');
    });

    test('enableReducedMotion should disable animations', () => {
      enableReducedMotion();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('reduced-motion');
    });

    test('disableReducedMotion should enable animations', () => {
      disableReducedMotion();
      
      expect(document.body.classList.remove).toHaveBeenCalledWith('reduced-motion');
    });
  });

  describe('Complex Components', () => {
    test('createAccessibleDialog should create modal dialog', () => {
      const config = {
        id: 'test-dialog',
        title: 'Test Dialog',
        content: 'Dialog content',
        actions: [
          { label: 'OK', action: jest.fn() },
          { label: 'Cancel', action: jest.fn() }
        ]
      };
      
      const result = createAccessibleDialog(config);
      
      expect(result.dialog).toBeDefined();
      expect(result.isModal).toBe(true);
      expect(result.hasProperAria).toBe(true);
    });

    test('createAccessibleMenu should create dropdown menu', () => {
      const config = {
        trigger: mockElement,
        items: [
          { label: 'Option 1', action: jest.fn() },
          { label: 'Option 2', action: jest.fn() },
          { type: 'separator' },
          { label: 'Option 3', action: jest.fn() }
        ]
      };
      
      const result = createAccessibleMenu(config);
      
      expect(result.menu).toBeDefined();
      expect(result.items).toHaveLength(4);
      expect(result.hasKeyboardNavigation).toBe(true);
    });

    test('createAccessibleTable should create data table', () => {
      const config = {
        caption: 'Test Table',
        headers: ['Name', 'Age', 'City'],
        data: [
          ['John', '25', 'New York'],
          ['Jane', '30', 'Boston']
        ],
        sortable: true
      };
      
      const result = createAccessibleTable(config);
      
      expect(result.table).toBeDefined();
      expect(result.hasCaption).toBe(true);
      expect(result.hasHeaders).toBe(true);
      expect(result.isSortable).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing elements gracefully', () => {
      document.getElementById = jest.fn(() => null);
      
      expect(() => {
        updateLiveRegion('non-existent', 'message');
      }).not.toThrow();
    });

    test('should handle invalid color values', () => {
      const result = validateColorContrast('invalid', 'also-invalid');
      
      expect(result.ratio).toBe(0);
      expect(result.passesAA).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle accessibility API failures', async () => {
      mockAxe.run.mockRejectedValue(new Error('Accessibility check failed'));
      
      const result = await checkAccessibility(mockElement);
      
      expect(result.error).toBeDefined();
      expect(result.violations).toEqual([]);
    });
  });

  describe('Performance', () => {
    test('should efficiently check large DOM trees', async () => {
      const largeElement = {
        ...mockElement,
        querySelectorAll: jest.fn(() => new Array(1000).fill(mockElement))
      };
      
      const startTime = performance.now();
      await checkAccessibility(largeElement);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should cache accessibility results', async () => {
      const element = mockElement;
      
      // First call
      await checkAccessibility(element);
      // Second call should use cache
      await checkAccessibility(element);
      
      expect(mockAxe.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with Screen Readers', () => {
    test('should work with NVDA', () => {
      window.navigator = { userAgent: 'NVDA' };
      const message = 'NVDA announcement';
      
      announceToScreenReader(message);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    test('should work with JAWS', () => {
      window.navigator = { userAgent: 'JAWS' };
      const message = 'JAWS announcement';
      
      announceToScreenReader(message);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    test('should work with VoiceOver', () => {
      window.navigator = { userAgent: 'VoiceOver' };
      const message = 'VoiceOver announcement';
      
      announceToScreenReader(message);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
    });
  });
});
