/**
 * UI Types - User Interface Component and State Type Definitions
 * 
 * Comprehensive TypeScript types for UI components, layouts, themes,
 * interactions, accessibility, responsive design, and user interface state management.
 */

// ============================================================================
// CORE UI TYPES
// ============================================================================

/**
 * Base UI component properties and state
 */
export interface BaseUIProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
  disabled?: boolean;
  hidden?: boolean;
  ref?: React.Ref<any>;
}

export interface ComponentState {
  loading: boolean;
  error: Error | null;
  mounted: boolean;
  visible: boolean;
  interactive: boolean;
  dirty: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

// ============================================================================
// THEME AND STYLING TYPES
// ============================================================================

/**
 * Theme configuration and design system types
 */
export interface Theme {
  name: string;
  mode: ThemeMode;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  breakpoints: Breakpoints;
  shadows: Shadows;
  borders: Borders;
  animations: Animations;
  zIndex: ZIndexLevels;
  components: ComponentThemes;
  custom?: Record<string, any>;
}

export type ThemeMode = 'light' | 'dark' | 'auto' | 'high-contrast';

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  text: TextColors;
  background: BackgroundColors;
  border: BorderColors;
  overlay: OverlayColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  link: string;
  linkHover: string;
}

export interface BackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
  surface: string;
  overlay: string;
  modal: string;
  tooltip: string;
}

export interface BorderColors {
  default: string;
  muted: string;
  accent: string;
  focus: string;
  error: string;
  success: string;
}

export interface OverlayColors {
  backdrop: string;
  modal: string;
  tooltip: string;
  popover: string;
}

export interface Typography {
  fontFamilies: FontFamilies;
  fontSizes: FontSizes;
  fontWeights: FontWeights;
  lineHeights: LineHeights;
  letterSpacing: LetterSpacing;
  textStyles: TextStyles;
}

export interface FontFamilies {
  sans: string;
  serif: string;
  mono: string;
  display: string;
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeights {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacing {
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface TextStyles {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
  code: TextStyle;
}

export interface TextStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface Spacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Shadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface Borders {
  none: string;
  thin: string;
  base: string;
  thick: string;
  radius: BorderRadius;
}

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Animations {
  duration: AnimationDuration;
  easing: AnimationEasing;
  keyframes: AnimationKeyframes;
}

export interface AnimationDuration {
  fast: string;
  normal: string;
  slow: string;
  slower: string;
}

export interface AnimationEasing {
  linear: string;
  ease: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  spring: string;
}

export interface AnimationKeyframes {
  fadeIn: string;
  fadeOut: string;
  slideUp: string;
  slideDown: string;
  slideLeft: string;
  slideRight: string;
  scaleIn: string;
  scaleOut: string;
  bounce: string;
  pulse: string;
  spin: string;
}

export interface ZIndexLevels {
  hide: number;
  auto: number;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

/**
 * Layout and responsive design types
 */
export interface LayoutProps extends BaseUIProps {
  variant?: LayoutVariant;
  direction?: FlexDirection;
  align?: AlignItems;
  justify?: JustifyContent;
  wrap?: FlexWrap;
  gap?: SpacingValue;
  padding?: SpacingValue | SpacingObject;
  margin?: SpacingValue | SpacingObject;
  width?: SizeValue;
  height?: SizeValue;
  minWidth?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  maxHeight?: SizeValue;
  overflow?: OverflowValue;
  position?: PositionValue;
  top?: SizeValue;
  right?: SizeValue;
  bottom?: SizeValue;
  left?: SizeValue;
  zIndex?: number;
}

export type LayoutVariant = 
  | 'container'
  | 'flex'
  | 'grid'
  | 'stack'
  | 'cluster'
  | 'sidebar'
  | 'center'
  | 'cover'
  | 'frame';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type SpacingValue = keyof Spacing | 'auto';
export interface SpacingObject {
  top?: SpacingValue;
  right?: SpacingValue;
  bottom?: SpacingValue;
  left?: SpacingValue;
  x?: SpacingValue;
  y?: SpacingValue;
}

export type SizeValue = string | number | 'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit';
export type OverflowValue = 'visible' | 'hidden' | 'scroll' | 'auto';
export type PositionValue = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface GridProps extends LayoutProps {
  columns?: number | string;
  rows?: number | string;
  areas?: string;
  autoColumns?: string;
  autoRows?: string;
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  columnGap?: SpacingValue;
  rowGap?: SpacingValue;
}

export interface ResponsiveProps<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export type ResponsiveValue<T> = T | ResponsiveProps<T>;

// ============================================================================
// COMPONENT TYPES
// ============================================================================

/**
 * Common UI component types
 */
export interface ButtonProps extends BaseUIProps {
  variant?: ButtonVariant;
  size?: ComponentSize;
  color?: ColorVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'text';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

export interface InputProps extends BaseUIProps {
  type?: InputType;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: ComponentSize;
  variant?: InputVariant;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: number;
  min?: number;
  max?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color'
  | 'file'
  | 'range'
  | 'hidden';

export type InputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';

export interface SelectProps extends BaseUIProps {
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  size?: ComponentSize;
  variant?: InputVariant;
  isMultiple?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  options: SelectOption[];
  onChange?: (value: string | string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  noOptionsMessage?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface ModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  placement?: ModalPlacement;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  trapFocus?: boolean;
  preserveScrollBarGap?: boolean;
  returnFocusOnClose?: boolean;
  blockScrollOnMount?: boolean;
  allowPinchZoom?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  finalFocusRef?: React.RefObject<HTMLElement>;
  initialFocusRef?: React.RefObject<HTMLElement>;
  motionPreset?: MotionPreset;
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
export type ModalPlacement = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type MotionPreset = 'slideInBottom' | 'slideInTop' | 'slideInLeft' | 'slideInRight' | 'scale' | 'none';

export interface TooltipProps extends BaseUIProps {
  label: string;
  placement?: TooltipPlacement;
  hasArrow?: boolean;
  arrowSize?: number;
  arrowShadowColor?: string;
  delay?: number | [number, number];
  closeDelay?: number;
  defaultIsOpen?: boolean;
  isOpen?: boolean;
  isDisabled?: boolean;
  shouldWrapChildren?: boolean;
  openDelay?: number;
  motionProps?: any;
  onOpen?: () => void;
  onClose?: () => void;
}

export type TooltipPlacement = 
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface AlertProps extends BaseUIProps {
  status?: AlertStatus;
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
  colorScheme?: ColorVariant;
}

export type AlertStatus = 'success' | 'error' | 'warning' | 'info';
export type AlertVariant = 'subtle' | 'solid' | 'left-accent' | 'top-accent';

export interface TabsProps extends BaseUIProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: TabsVariant;
  size?: ComponentSize;
  align?: 'start' | 'center' | 'end';
  isFitted?: boolean;
  isLazy?: boolean;
  lazyBehavior?: 'keepMounted' | 'unmount';
  defaultIndex?: number;
  index?: number;
  onChange?: (index: number) => void;
  colorScheme?: ColorVariant;
}

export type TabsVariant = 'line' | 'enclosed' | 'enclosed-colored' | 'soft-rounded' | 'solid-rounded' | 'unstyled';

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form handling and validation types
 */
export interface FormProps extends BaseUIProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset?: (event: React.FormEvent<HTMLFormElement>) => void;
  noValidate?: boolean;
  autoComplete?: 'on' | 'off';
  encoding?: string;
  method?: 'get' | 'post';
  target?: string;
  action?: string;
}

export interface FormFieldProps extends BaseUIProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  requiredIndicator?: React.ReactNode;
  optionalIndicator?: React.ReactNode;
}

export interface FormControlProps extends FormFieldProps {
  children: React.ReactNode;
}

export interface FieldsetProps extends BaseUIProps {
  legend?: string;
  disabled?: boolean;
}

export interface FormValidation {
  rules: ValidationRule[];
  mode: ValidationMode;
  reValidateMode: ValidationMode;
  defaultValues?: Record<string, any>;
  resetOptions?: ResetOptions;
}

export interface ValidationRule {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  validate?: ValidationFunction | Record<string, ValidationFunction>;
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
  setValueAs?: (value: any) => any;
  disabled?: boolean;
  deps?: string | string[];
}

export type ValidationFunction = (value: any, formValues: Record<string, any>) => boolean | string | Promise<boolean | string>;

export type ValidationMode = 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';

export interface ResetOptions {
  keepErrors?: boolean;
  keepDirty?: boolean;
  keepIsSubmitted?: boolean;
  keepTouched?: boolean;
  keepIsValid?: boolean;
  keepSubmitCount?: boolean;
}

export interface FormState {
  isDirty: boolean;
  isLoading: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  isValid: boolean;
  isValidating: boolean;
  submitCount: number;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  errors: Record<string, ValidationError>;
  defaultValues?: Record<string, any>;
}

// ============================================================================
// INTERACTION TYPES
// ============================================================================

/**
 * User interaction and event types
 */
export interface InteractionProps {
  onHover?: (isHovering: boolean) => void;
  onPress?: (event: PressEvent) => void;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPressChange?: (isPressed: boolean) => void;
  onPressUp?: (event: PressEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  isDisabled?: boolean;
  preventFocusOnPress?: boolean;
  shouldCancelOnPointerExit?: boolean;
  allowTextSelectionOnPress?: boolean;
}

export interface PressEvent {
  type: 'pressstart' | 'pressend' | 'pressup' | 'press';
  pointerType: 'mouse' | 'pen' | 'touch' | 'keyboard' | 'virtual';
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  x: number;
  y: number;
}

export interface FocusEvent {
  type: 'focus' | 'blur';
  target: Element;
  relatedTarget: Element | null;
}

export interface KeyboardEvent {
  type: 'keydown' | 'keyup' | 'keypress';
  key: string;
  code: string;
  keyCode: number;
  charCode: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  repeat: boolean;
  location: number;
  target: Element;
  currentTarget: Element;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface DragEvent {
  type: 'dragstart' | 'drag' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop';
  target: Element;
  currentTarget: Element;
  dataTransfer: DataTransfer;
  x: number;
  y: number;
  clientX: number;
  clientY: number;
}

export interface DropEvent {
  type: 'drop';
  target: Element;
  items: DropItem[];
  x: number;
  y: number;
}

export interface DropItem {
  kind: 'file' | 'directory' | 'text';
  type: string;
  name: string;
  getText?: () => Promise<string>;
  getFile?: () => Promise<File>;
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

/**
 * Accessibility and ARIA types
 */
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-details'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-pressed'?: boolean | 'mixed';
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-activedescendant'?: string;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-level'?: number;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  'aria-busy'?: boolean;
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
  'aria-grabbed'?: boolean;
  role?: AriaRole;
}

export type AriaRole = 
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

export interface FocusManager {
  focusNext: (opts?: FocusManagerOptions) => HTMLElement | null;
  focusPrevious: (opts?: FocusManagerOptions) => HTMLElement | null;
  focusFirst: (opts?: FocusManagerOptions) => HTMLElement | null;
  focusLast: (opts?: FocusManagerOptions) => HTMLElement | null;
}

export interface FocusManagerOptions {
  from?: HTMLElement;
  tabbable?: boolean;
  wrap?: boolean;
  accept?: (element: HTMLElement) => boolean;
}

export interface LiveAnnouncer {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clear: () => void;
  destroy: () => void;
}

// ============================================================================
// ANIMATION AND MOTION TYPES
// ============================================================================

/**
 * Animation and motion system types
 */
export interface MotionProps {
  initial?: MotionValue;
  animate?: MotionValue;
  exit?: MotionValue;
  whileHover?: MotionValue;
  whileTap?: MotionValue;
  whileFocus?: MotionValue;
  whileDrag?: MotionValue;
  whileInView?: MotionValue;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: DragConstraints;
  dragElastic?: boolean | number;
  dragMomentum?: boolean;
  dragPropagation?: boolean;
  dragSnapToOrigin?: boolean;
  dragTransition?: DragTransition;
  layout?: boolean | string;
  layoutId?: string;
  layoutDependency?: any;
  transition?: Transition;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  onHoverStart?: (event: any) => void;
  onHoverEnd?: (event: any) => void;
  onTap?: (event: any) => void;
  onTapStart?: (event: any) => void;
  onTapCancel?: (event: any) => void;
  onDrag?: (event: any, info: PanInfo) => void;
  onDragStart?: (event: any, info: PanInfo) => void;
  onDragEnd?: (event: any, info: PanInfo) => void;
  onDirectionLock?: (axis: 'x' | 'y') => void;
  onViewportEnter?: (entry: IntersectionObserverEntry | null) => void;
  onViewportLeave?: (entry: IntersectionObserverEntry | null) => void;
}

export interface MotionValue {
  x?: number | string;
  y?: number | string;
  z?: number | string;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  skew?: number | string;
  skewX?: number | string;
  skewY?: number | string;
  opacity?: number;
  background?: string;
  backgroundColor?: string;
  color?: string;
  borderRadius?: number | string;
  borderWidth?: number | string;
  borderColor?: string;
  width?: number | string;
  height?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  margin?: number | string;
  padding?: number | string;
  fontSize?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  clipPath?: string;
  transformOrigin?: string;
  transformPerspective?: number;
  transformStyle?: 'flat' | 'preserve-3d';
  backfaceVisibility?: 'visible' | 'hidden';
  originX?: number | string;
  originY?: number | string;
  originZ?: number | string;
  pathLength?: number;
  pathSpacing?: number;
  pathOffset?: number;
}

export interface DragConstraints {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface DragTransition {
  bounceStiffness?: number;
  bounceDamping?: number;
  power?: number;
  timeConstant?: number;
  restDelta?: number;
  modifyTarget?: (target: number) => number;
}

export interface Transition {
  type?: 'spring' | 'tween' | 'keyframes' | 'inertia';
  duration?: number;
  delay?: number;
  ease?: string | number[] | EasingFunction;
  times?: number[];
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  repeatDelay?: number;
  from?: number | string;
  velocity?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  restSpeed?: number;
  restDelta?: number;
  when?: 'beforeChildren' | 'afterChildren' | string;
  delayChildren?: number;
  staggerChildren?: number;
  staggerDirection?: 1 | -1;
}

export type EasingFunction = (t: number) => number;

export interface PanInfo {
  point: Point;
  delta: Point;
  offset: Point;
  velocity: Point;
}

export interface Point {
  x: number;
  y: number;
}

// ============================================================================
// COMPONENT THEMES
// ============================================================================

/**
 * Component-specific theme configurations
 */
export interface ComponentThemes {
  Button: ComponentTheme<ButtonProps>;
  Input: ComponentTheme<InputProps>;
  Select: ComponentTheme<SelectProps>;
  Modal: ComponentTheme<ModalProps>;
  Tooltip: ComponentTheme<TooltipProps>;
  Alert: ComponentTheme<AlertProps>;
  Tabs: ComponentTheme<TabsProps>;
  Card: ComponentTheme<BaseUIProps>;
  Badge: ComponentTheme<BaseUIProps>;
  Avatar: ComponentTheme<BaseUIProps>;
  Progress: ComponentTheme<BaseUIProps>;
  Spinner: ComponentTheme<BaseUIProps>;
  Skeleton: ComponentTheme<BaseUIProps>;
  Divider: ComponentTheme<BaseUIProps>;
  Breadcrumb: ComponentTheme<BaseUIProps>;
  Menu: ComponentTheme<BaseUIProps>;
  Popover: ComponentTheme<BaseUIProps>;
  Drawer: ComponentTheme<BaseUIProps>;
  Toast: ComponentTheme<BaseUIProps>;
}

export interface ComponentTheme<T = BaseUIProps> {
  baseStyle?: ComponentStyle<T>;
  sizes?: Record<string, ComponentStyle<T>>;
  variants?: Record<string, ComponentStyle<T>>;
  defaultProps?: Partial<T>;
}

export interface ComponentStyle<T = BaseUIProps> {
  container?: React.CSSProperties;
  content?: React.CSSProperties;
  header?: React.CSSProperties;
  body?: React.CSSProperties;
  footer?: React.CSSProperties;
  overlay?: React.CSSProperties;
  closeButton?: React.CSSProperties;
  icon?: React.CSSProperties;
  label?: React.CSSProperties;
  description?: React.CSSProperties;
  [key: string]: React.CSSProperties | undefined;
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Global UI state and context types
 */
export interface UIState {
  theme: Theme;
  colorMode: ThemeMode;
  breakpoint: keyof Breakpoints;
  viewport: ViewportState;
  modals: ModalState[];
  toasts: ToastState[];
  loading: LoadingState;
  notifications: NotificationState[];
  preferences: UIPreferences;
  accessibility: AccessibilityState;
}

export interface ViewportState {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  isScrolling: boolean;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
}

export interface ModalState {
  id: string;
  isOpen: boolean;
  component: React.ComponentType<any>;
  props: any;
  options: ModalOptions;
  zIndex: number;
}

export interface ModalOptions {
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  preserveScrollBarGap?: boolean;
  returnFocusOnClose?: boolean;
  blockScrollOnMount?: boolean;
}

export interface ToastState {
  id: string;
  title?: string;
  description?: string;
  status: AlertStatus;
  duration: number;
  isClosable: boolean;
  position: ToastPosition;
  render?: (props: any) => React.ReactNode;
  onCloseComplete?: () => void;
}

export type ToastPosition = 
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right';

export interface LoadingState {
  global: boolean;
  components: Record<string, boolean>;
  operations: Record<string, boolean>;
}

export interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface UIPreferences {
  colorMode: ThemeMode;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  sounds: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: 'US' | 'EU' | 'IN';
}

export interface AccessibilityState {
  screenReader: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: number;
  focusVisible: boolean;
  announcements: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Utility and helper types for UI components
 */
export type StyleProps = React.CSSProperties & {
  [key: string]: any;
};

export type ComponentRef<T extends HTMLElement = HTMLElement> = React.RefObject<T>;

export type EventHandler<T = Event> = (event: T) => void;

export type StyleFunction<T = any> = (props: T) => React.CSSProperties;

export type ConditionalStyle<T = any> = React.CSSProperties | StyleFunction<T>;

export interface MediaQuery {
  query: string;
  matches: boolean;
}

export interface BreakpointContext {
  breakpoint: keyof Breakpoints;
  isSmaller: (breakpoint: keyof Breakpoints) => boolean;
  isLarger: (breakpoint: keyof Breakpoints) => boolean;
  isBetween: (min: keyof Breakpoints, max: keyof Breakpoints) => boolean;
}

export interface ColorModeContext {
  colorMode: ThemeMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ThemeMode) => void;
}

export interface ThemeContext {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  components: ComponentThemes;
}

/**
 * Type guards for UI types
 */
export const isTheme = (obj: any): obj is Theme => {
  return obj && typeof obj.name === 'string' && obj.colors && obj.typography;
};

export const isMotionValue = (obj: any): obj is MotionValue => {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
};

/**
 * Component factory types
 */
export type ComponentFactory<T = BaseUIProps> = (props: T) => React.ReactElement;

export type StyledComponent<T = BaseUIProps> = React.ForwardRefExoticComponent<
  T & React.RefAttributes<HTMLElement>
>;

export type PolymorphicComponent<T = BaseUIProps> = <C extends React.ElementType = 'div'>(
  props: T & { as?: C } & Omit<React.ComponentPropsWithoutRef<C>, keyof T>
) => React.ReactElement;
