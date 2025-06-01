// filepath: c:\Users\woodyholne\Desktop\Podplay-Sanctuary\frontend\src\__tests__\setup\polyfills.ts
/**
 * Browser Compatibility Polyfills
 * 
 * This file provides polyfills for browser APIs and features that may not be
 * available in the test environment or older browsers.
 */

// ============================================================================
// CORE WEB APIS POLYFILLS
// ============================================================================

// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encoding = 'utf-8';
    
    encode(input?: string): Uint8Array {
      const str = input || '';
      const buffer = new ArrayBuffer(str.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
      }
      return view;
    }
    
    encodeInto(source: string, destination: Uint8Array): { read: number; written: number } {
      const encoded = this.encode(source);
      const length = Math.min(encoded.length, destination.length);
      destination.set(encoded.subarray(0, length));
      return { read: source.length, written: length };
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    encoding: string;
    fatal: boolean;
    ignoreBOM: boolean;
    
    constructor(encoding = 'utf-8', options: { fatal?: boolean; ignoreBOM?: boolean } = {}) {
      this.encoding = encoding;
      this.fatal = options.fatal || false;
      this.ignoreBOM = options.ignoreBOM || false;
    }
    
    decode(input?: BufferSource): string {
      if (!input) return '';
      
      const view = input instanceof ArrayBuffer ? new Uint8Array(input) : new Uint8Array(input.buffer);
      let result = '';
      
      for (let i = 0; i < view.length; i++) {
        result += String.fromCharCode(view[i]);
      }
      
      return result;
    }
  };
}

// AbortController polyfill
if (typeof global.AbortController === 'undefined') {
  global.AbortController = class AbortController {
    signal: AbortSignal;
    
    constructor() {
      this.signal = new AbortSignal();
    }
    
    abort(reason?: any) {
      (this.signal as any)._aborted = true;
      (this.signal as any)._reason = reason;
      
      // Trigger abort event
      if ((this.signal as any)._onabort) {
        (this.signal as any)._onabort();
      }
      
      // Trigger event listeners
      if ((this.signal as any)._listeners) {
        (this.signal as any)._listeners.forEach((listener: any) => listener());
      }
    }
  };
  
  global.AbortSignal = class AbortSignal extends EventTarget {
    _aborted: boolean = false;
    _reason: any = undefined;
    _onabort: (() => void) | null = null;
    _listeners: (() => void)[] = [];
    
    get aborted(): boolean {
      return this._aborted;
    }
    
    get reason(): any {
      return this._reason;
    }
    
    get onabort(): (() => void) | null {
      return this._onabort;
    }
    
    set onabort(handler: (() => void) | null) {
      this._onabort = handler;
    }
    
    addEventListener(type: string, listener: () => void) {
      if (type === 'abort') {
        this._listeners.push(listener);
      }
      super.addEventListener(type, listener);
    }
    
    removeEventListener(type: string, listener: () => void) {
      if (type === 'abort') {
        const index = this._listeners.indexOf(listener);
        if (index > -1) {
          this._listeners.splice(index, 1);
        }
      }
      super.removeEventListener(type, listener);
    }
    
    throwIfAborted() {
      if (this._aborted) {
        throw new DOMException('The operation was aborted', 'AbortError');
      }
    }
    
    static abort(reason?: any): AbortSignal {
      const signal = new AbortSignal();
      (signal as any)._aborted = true;
      (signal as any)._reason = reason;
      return signal;
    }
    
    static timeout(delay: number): AbortSignal {
      const signal = new AbortSignal();
      setTimeout(() => {
        (signal as any)._aborted = true;
        (signal as any)._reason = new DOMException('The operation timed out', 'TimeoutError');
      }, delay);
      return signal;
    }
  };
}

// DOMException polyfill
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    name: string;
    code: number;
    
    static readonly INDEX_SIZE_ERR = 1;
    static readonly DOMSTRING_SIZE_ERR = 2;
    static readonly HIERARCHY_REQUEST_ERR = 3;
    static readonly WRONG_DOCUMENT_ERR = 4;
    static readonly INVALID_CHARACTER_ERR = 5;
    static readonly NO_DATA_ALLOWED_ERR = 6;
    static readonly NO_MODIFICATION_ALLOWED_ERR = 7;
    static readonly NOT_FOUND_ERR = 8;
    static readonly NOT_SUPPORTED_ERR = 9;
    static readonly INUSE_ATTRIBUTE_ERR = 10;
    static readonly INVALID_STATE_ERR = 11;
    static readonly SYNTAX_ERR = 12;
    static readonly INVALID_MODIFICATION_ERR = 13;
    static readonly NAMESPACE_ERR = 14;
    static readonly INVALID_ACCESS_ERR = 15;
    static readonly VALIDATION_ERR = 16;
    static readonly TYPE_MISMATCH_ERR = 17;
    static readonly SECURITY_ERR = 18;
    static readonly NETWORK_ERR = 19;
    static readonly ABORT_ERR = 20;
    static readonly URL_MISMATCH_ERR = 21;
    static readonly QUOTA_EXCEEDED_ERR = 22;
    static readonly TIMEOUT_ERR = 23;
    static readonly INVALID_NODE_TYPE_ERR = 24;
    static readonly DATA_CLONE_ERR = 25;
    
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'Error';
      this.code = 0;
    }
  };
}

// Headers polyfill
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private _headers: Map<string, string> = new Map();
    
    constructor(init?: HeadersInit) {
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    append(name: string, value: string) {
      const existing = this.get(name);
      if (existing) {
        this.set(name, `${existing}, ${value}`);
      } else {
        this.set(name, value);
      }
    }
    
    delete(name: string) {
      this._headers.delete(name.toLowerCase());
    }
    
    get(name: string): string | null {
      return this._headers.get(name.toLowerCase()) || null;
    }
    
    has(name: string): boolean {
      return this._headers.has(name.toLowerCase());
    }
    
    set(name: string, value: string) {
      this._headers.set(name.toLowerCase(), value);
    }
    
    forEach(callback: (value: string, key: string, parent: Headers) => void) {
      this._headers.forEach((value, key) => callback(value, key, this));
    }
    
    keys(): IterableIterator<string> {
      return this._headers.keys();
    }
    
    values(): IterableIterator<string> {
      return this._headers.values();
    }
    
    entries(): IterableIterator<[string, string]> {
      return this._headers.entries();
    }
    
    [Symbol.iterator](): IterableIterator<[string, string]> {
      return this.entries();
    }
  };
}

// Request polyfill (basic implementation)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    body: ReadableStream<Uint8Array> | null;
    bodyUsed: boolean = false;
    cache: RequestCache;
    credentials: RequestCredentials;
    destination: RequestDestination;
    integrity: string;
    keepalive: boolean;
    mode: RequestMode;
    redirect: RequestRedirect;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
    signal: AbortSignal;
    
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body as ReadableStream<Uint8Array> || null;
      this.cache = init?.cache || 'default';
      this.credentials = init?.credentials || 'same-origin';
      this.destination = '' as RequestDestination;
      this.integrity = init?.integrity || '';
      this.keepalive = init?.keepalive || false;
      this.mode = init?.mode || 'cors';
      this.redirect = init?.redirect || 'follow';
      this.referrer = init?.referrer || '';
      this.referrerPolicy = init?.referrerPolicy || '';
      this.signal = init?.signal || new AbortSignal();
    }
    
    clone(): Request {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        cache: this.cache,
        credentials: this.credentials,
        integrity: this.integrity,
        keepalive: this.keepalive,
        mode: this.mode,
        redirect: this.redirect,
        referrer: this.referrer,
        referrerPolicy: this.referrerPolicy,
        signal: this.signal
      });
    }
    
    async arrayBuffer(): Promise<ArrayBuffer> {
      this.bodyUsed = true;
      return new ArrayBuffer(0);
    }
    
    async blob(): Promise<Blob> {
      this.bodyUsed = true;
      return new Blob();
    }
    
    async formData(): Promise<FormData> {
      this.bodyUsed = true;
      return new FormData();
    }
    
    async json(): Promise<any> {
      this.bodyUsed = true;
      return {};
    }
    
    async text(): Promise<string> {
      this.bodyUsed = true;
      return '';
    }
  };
}

// Response polyfill (basic implementation)
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: ReadableStream<Uint8Array> | null;
    bodyUsed: boolean = false;
    headers: Headers;
    ok: boolean;
    redirected: boolean;
    status: number;
    statusText: string;
    type: ResponseType;
    url: string;
    
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body as ReadableStream<Uint8Array> || null;
      this.headers = new Headers(init?.headers);
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
      this.type = 'basic';
      this.url = '';
    }
    
    clone(): Response {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers
      });
    }
    
    async arrayBuffer(): Promise<ArrayBuffer> {
      this.bodyUsed = true;
      return new ArrayBuffer(0);
    }
    
    async blob(): Promise<Blob> {
      this.bodyUsed = true;
      return new Blob();
    }
    
    async formData(): Promise<FormData> {
      this.bodyUsed = true;
      return new FormData();
    }
    
    async json(): Promise<any> {
      this.bodyUsed = true;
      return {};
    }
    
    async text(): Promise<string> {
      this.bodyUsed = true;
      return '';
    }
    
    static error(): Response {
      const response = new Response();
      response.ok = false;
      response.status = 0;
      response.type = 'error';
      return response;
    }
    
    static redirect(url: string, status?: number): Response {
      const response = new Response();
      response.status = status || 302;
      response.redirected = true;
      response.headers.set('Location', url);
      return response;
    }
  };
}

// ============================================================================
// ARRAY POLYFILLS
// ============================================================================

// Array.from polyfill
if (!Array.from) {
  Array.from = function<T, U>(
    arrayLike: ArrayLike<T> | Iterable<T>,
    mapFn?: (v: T, k: number) => U,
    thisArg?: any
  ): U[] {
    const O = Object(arrayLike);
    const len = parseInt(O.length) || 0;
    const result = new Array(len);
    
    for (let k = 0; k < len; k++) {
      const kValue = O[k];
      if (mapFn) {
        result[k] = mapFn.call(thisArg, kValue, k);
      } else {
        result[k] = kValue;
      }
    }
    
    return result;
  };
}

// Array.prototype.find polyfill
if (!Array.prototype.find) {
  Array.prototype.find = function<T>(
    predicate: (value: T, index: number, obj: T[]) => boolean,
    thisArg?: any
  ): T | undefined {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    
    const O = Object(this);
    const len = parseInt(O.length) || 0;
    
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    
    for (let k = 0; k < len; k++) {
      const kValue = O[k];
      if (predicate.call(thisArg, kValue, k, O)) {
        return kValue;
      }
    }
    
    return undefined;
  };
}

// Array.prototype.findIndex polyfill
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function<T>(
    predicate: (value: T, index: number, obj: T[]) => boolean,
    thisArg?: any
  ): number {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    
    const O = Object(this);
    const len = parseInt(O.length) || 0;
    
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    
    for (let k = 0; k < len; k++) {
      const kValue = O[k];
      if (predicate.call(thisArg, kValue, k, O)) {
        return k;
      }
    }
    
    return -1;
  };
}

// Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function<T>(searchElement: T, fromIndex?: number): boolean {
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }
    
    const O = Object(this);
    const len = parseInt(O.length) || 0;
    
    if (len === 0) return false;
    
    const n = parseInt(fromIndex as any) || 0;
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    
    while (k < len) {
      if (O[k] === searchElement) {
        return true;
      }
      k++;
    }
    
    return false;
  };
}

// Array.prototype.flat polyfill
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth: number = 1): any[] {
    const flatten = (arr: any[], currentDepth: number): any[] => {
      const result: any[] = [];
      
      for (const item of arr) {
        if (Array.isArray(item) && currentDepth > 0) {
          result.push(...flatten(item, currentDepth - 1));
        } else {
          result.push(item);
        }
      }
      
      return result;
    };
    
    return flatten(this, depth);
  };
}

// Array.prototype.flatMap polyfill
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function<T, U>(
    callback: (value: T, index: number, array: T[]) => U | U[],
    thisArg?: any
  ): U[] {
    return this.map(callback, thisArg).flat(1);
  };
}

// ============================================================================
// OBJECT POLYFILLS
// ============================================================================

// Object.assign polyfill
if (!Object.assign) {
  Object.assign = function(target: any, ...sources: any[]): any {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    
    const to = Object(target);
    
    for (let i = 0; i < sources.length; i++) {
      const nextSource = sources[i];
      
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    
    return to;
  };
}

// Object.entries polyfill
if (!Object.entries) {
  Object.entries = function<T>(obj: { [s: string]: T } | ArrayLike<T>): [string, T][] {
    const ownProps = Object.keys(obj);
    const result: [string, T][] = [];
    
    for (let i = 0; i < ownProps.length; i++) {
      const key = ownProps[i];
      result.push([key, (obj as any)[key]]);
    }
    
    return result;
  };
}

// Object.values polyfill
if (!Object.values) {
  Object.values = function<T>(obj: { [s: string]: T } | ArrayLike<T>): T[] {
    const ownProps = Object.keys(obj);
    const result: T[] = [];
    
    for (let i = 0; i < ownProps.length; i++) {
      result.push((obj as any)[ownProps[i]]);
    }
    
    return result;
  };
}

// Object.fromEntries polyfill
if (!Object.fromEntries) {
  Object.fromEntries = function<T>(iterable: Iterable<readonly [PropertyKey, T]>): { [k: string]: T } {
    const result: { [k: string]: T } = {};
    
    for (const [key, value] of iterable) {
      result[key as string] = value;
    }
    
    return result;
  };
}

// ============================================================================
// STRING POLYFILLS
// ============================================================================

// String.prototype.startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString: string, position?: number): boolean {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

// String.prototype.endsWith polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString: string, length?: number): boolean {
    if (length === undefined || length > this.length) {
      length = this.length;
    }
    return this.substring(length - searchString.length, length) === searchString;
  };
}

// String.prototype.includes polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(searchString: string, position?: number): boolean {
    if (typeof position !== 'number') {
      position = 0;
    }
    
    if (position + searchString.length > this.length) {
      return false;
    } else {
      return this.indexOf(searchString, position) !== -1;
    }
  };
}

// String.prototype.repeat polyfill
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count: number): string {
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    
    const str = '' + this;
    count = +count;
    
    if (count != count) {
      count = 0;
    }
    
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    
    count = Math.floor(count);
    
    if (str.length == 0 || count == 0) {
      return '';
    }
    
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string length');
    }
    
    let result = '';
    while (count > 0) {
      if (count % 2 == 1) {
        result += str;
      }
      count >>>= 1;
      str += str;
    }
    
    return result;
  };
}

// String.prototype.padStart polyfill
if (!String.prototype.padStart) {
  String.prototype.padStart = function(targetLength: number, padString?: string): string {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length);
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

// String.prototype.padEnd polyfill
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function(targetLength: number, padString?: string): string {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length);
      }
      return String(this) + padString.slice(0, targetLength);
    }
  };
}

// ============================================================================
// PROMISE POLYFILLS
// ============================================================================

// Promise.allSettled polyfill
if (!Promise.allSettled) {
  Promise.allSettled = function<T>(promises: Iterable<T | PromiseLike<T>>): Promise<Array<{
    status: 'fulfilled';
    value: T;
  } | {
    status: 'rejected';
    reason: any;
  }>> {
    const promiseArray = Array.from(promises);
    
    return Promise.all(
      promiseArray.map(promise =>
        Promise.resolve(promise)
          .then(value => ({ status: 'fulfilled' as const, value }))
          .catch(reason => ({ status: 'rejected' as const, reason }))
      )
    );
  };
}

// Promise.any polyfill
if (!Promise.any) {
  Promise.any = function<T>(promises: Iterable<T | PromiseLike<T>>): Promise<T> {
    const promiseArray = Array.from(promises);
    
    return new Promise((resolve, reject) => {
      if (promiseArray.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'));
        return;
      }
      
      const errors: any[] = [];
      let rejectedCount = 0;
      
      promiseArray.forEach((promise, index) => {
        Promise.resolve(promise)
          .then(resolve)
          .catch(error => {
            errors[index] = error;
            rejectedCount++;
            
            if (rejectedCount === promiseArray.length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          });
      });
    });
  };
}

// AggregateError polyfill
if (typeof global.AggregateError === 'undefined') {
  global.AggregateError = class AggregateError extends Error {
    errors: any[];
    
    constructor(errors: Iterable<any>, message?: string) {
      super(message);
      this.name = 'AggregateError';
      this.errors = Array.from(errors);
    }
  };
}

// ============================================================================
// NUMBER POLYFILLS
// ============================================================================

// Number.isNaN polyfill
if (!Number.isNaN) {
  Number.isNaN = function(value: any): boolean {
    return typeof value === 'number' && isNaN(value);
  };
}

// Number.isFinite polyfill
if (!Number.isFinite) {
  Number.isFinite = function(value: any): boolean {
    return typeof value === 'number' && isFinite(value);
  };
}

// Number.isInteger polyfill
if (!Number.isInteger) {
  Number.isInteger = function(value: any): boolean {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  };
}

// Number.isSafeInteger polyfill
if (!Number.isSafeInteger) {
  Number.isSafeInteger = function(value: any): boolean {
    return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
  };
}

// ============================================================================
// MATH POLYFILLS
// ============================================================================

// Math.sign polyfill
if (!Math.sign) {
  Math.sign = function(x: number): number {
    x = +x;
    if (x === 0 || isNaN(x)) {
      return x;
    }
    return x > 0 ? 1 : -1;
  };
}

// Math.trunc polyfill
if (!Math.trunc) {
  Math.trunc = function(x: number): number {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  };
}

// ============================================================================
// SYMBOL POLYFILLS
// ============================================================================

// Basic Symbol polyfill
if (typeof Symbol === 'undefined') {
  (global as any).Symbol = function Symbol(description?: string): symbol {
    const symbol = Object.create(null);
    symbol.toString = () => `Symbol(${description || ''})`;
    symbol.valueOf = () => symbol;
    symbol.description = description;
    return symbol as symbol;
  };
  
  (global as any).Symbol.for = function(key: string): symbol {
    return (global as any).Symbol(key);
  };
  
  (global as any).Symbol.keyFor = function(symbol: symbol): string | undefined {
    return undefined;
  };
  
  // Well-known symbols
  (global as any).Symbol.iterator = (global as any).Symbol('Symbol.iterator');
  (global as any).Symbol.asyncIterator = (global as any).Symbol('Symbol.asyncIterator');
  (global as any).Symbol.toStringTag = (global as any).Symbol('Symbol.toStringTag');
  (global as any).Symbol.hasInstance = (global as any).Symbol('Symbol.hasInstance');
  (global as any).Symbol.isConcatSpreadable = (global as any).Symbol('Symbol.isConcatSpreadable');
  (global as any).Symbol.species = (global as any).Symbol('Symbol.species');
  (global as any).Symbol.toPrimitive = (global as any).Symbol('Symbol.toPrimitive');
  (global as any).Symbol.replace = (global as any).Symbol('Symbol.replace');
  (global as any).Symbol.search = (global as any).Symbol('Symbol.search');
  (global as any).Symbol.split = (global as any).Symbol('Symbol.split');
  (global as any).Symbol.match = (global as any).Symbol('Symbol.match');
}

// ============================================================================
// SET AND MAP POLYFILLS
// ============================================================================

// Basic Set polyfill
if (typeof Set === 'undefined') {
  (global as any).Set = class Set<T> {
    private _values: T[] = [];
    
    constructor(iterable?: Iterable<T>) {
      if (iterable) {
        for (const value of iterable) {
          this.add(value);
        }
      }
    }
    
    add(value: T): this {
      if (!this.has(value)) {
        this._values.push(value);
      }
      return this;
    }
    
    clear(): void {
      this._values = [];
    }
    
    delete(value: T): boolean {
      const index = this._values.indexOf(value);
      if (index > -1) {
        this._values.splice(index, 1);
        return true;
      }
      return false;
    }
    
    has(value: T): boolean {
      return this._values.indexOf(value) > -1;
    }
    
    get size(): number {
      return this._values.length;
    }
    
    forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
      this._values.forEach(value => callback.call(thisArg, value, value, this));
    }
    
    values(): IterableIterator<T> {
      return this._values[Symbol.iterator]();
    }
    
    keys(): IterableIterator<T> {
      return this.values();
    }
    
    entries(): IterableIterator<[T, T]> {
      return this._values.map(value => [value, value] as [T, T])[Symbol.iterator]();
    }
    
    [Symbol.iterator](): IterableIterator<T> {
      return this.values();
    }
  };
}

// Basic Map polyfill
if (typeof Map === 'undefined') {
  (global as any).Map = class Map<K, V> {
    private _entries: Array<[K, V]> = [];
    
    constructor(iterable?: Iterable<readonly [K, V]>) {
      if (iterable) {
        for (const [key, value] of iterable) {
          this.set(key, value);
        }
      }
    }
    
    clear(): void {
      this._entries = [];
    }
    
    delete(key: K): boolean {
      const index = this._entries.findIndex(([k]) => k === key);
      if (index > -1) {
        this._entries.splice(index, 1);
        return true;
      }
      return false;
    }
    
    get(key: K): V | undefined {
      const entry = this._entries.find(([k]) => k === key);
      return entry ? entry[1] : undefined;
    }
    
    has(key: K): boolean {
      return this._entries.some(([k]) => k === key);
    }
    
    set(key: K, value: V): this {
      const index = this._entries.findIndex(([k]) => k === key);
      if (index > -1) {
        this._entries[index][1] = value;
      } else {
        this._entries.push([key, value]);
      }
      return this;
    }
    
    get size(): number {
      return this._entries.length;
    }
    
    forEach(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
      this._entries.forEach(([key, value]) => callback.call(thisArg, value, key, this));
    }
    
    keys(): IterableIterator<K> {
      return this._entries.map(([key]) => key)[Symbol.iterator]();
    }
    
    values(): IterableIterator<V> {
      return this._entries.map(([, value]) => value)[Symbol.iterator]();
    }
    
    entries(): IterableIterator<[K, V]> {
      return this._entries[Symbol.iterator]();
    }
    
    [Symbol.iterator](): IterableIterator<[K, V]> {
      return this.entries();
    }
  };
}

// ============================================================================
// WEAKSET AND WEAKMAP POLYFILLS
// ============================================================================

// Basic WeakSet polyfill
if (typeof WeakSet === 'undefined') {
  (global as any).WeakSet = class WeakSet<T extends object> {
    private _values: T[] = [];
    
    constructor(iterable?: Iterable<T>) {
      if (iterable) {
        for (const value of iterable) {
          this.add(value);
        }
      }
    }
    
    add(value: T): this {
      if (!this.has(value)) {
        this._values.push(value);
      }
      return this;
    }
    
    delete(value: T): boolean {
      const index = this._values.indexOf(value);
      if (index > -1) {
        this._values.splice(index, 1);
        return true;
      }
      return false;
    }
    
    has(value: T): boolean {
      return this._values.indexOf(value) > -1;
    }
  };
}

// Basic WeakMap polyfill
if (typeof WeakMap === 'undefined') {
  (global as any).WeakMap = class WeakMap<K extends object, V> {
    private _entries: Array<[K, V]> = [];
    
    constructor(iterable?: Iterable<readonly [K, V]>) {
      if (iterable) {
        for (const [key, value] of iterable) {
          this.set(key, value);
        }
      }
    }
    
    delete(key: K): boolean {
      const index = this._entries.findIndex(([k]) => k === key);
      if (index > -1) {
        this._entries.splice(index, 1);
        return true;
      }
      return false;
    }
    
    get(key: K): V | undefined {
      const entry = this._entries.find(([k]) => k === key);
      return entry ? entry[1] : undefined;
    }
    
    has(key: K): boolean {
      return this._entries.some(([k]) => k === key);
    }
    
    set(key: K, value: V): this {
      const index = this._entries.findIndex(([k]) => k === key);
      if (index > -1) {
        this._entries[index][1] = value;
      } else {
        this._entries.push([key, value]);
      }
      return this;
    }
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if all required polyfills are available
 */
export const checkPolyfills = (): { missing: string[]; available: string[] } => {
  const features = [
    'TextEncoder',
    'TextDecoder',
    'AbortController',
    'DOMException',
    'Headers',
    'Request',
    'Response',
    'Array.from',
    'Array.prototype.find',
    'Array.prototype.includes',
    'Object.assign',
    'Object.entries',
    'Promise.allSettled',
    'Number.isNaN',
    'Math.sign',
    'Symbol',
    'Set',
    'Map'
  ];
  
  const missing: string[] = [];
  const available: string[] = [];
  
  features.forEach(feature => {
    const parts = feature.split('.');
    let obj: any = global;
    
    try {
      for (const part of parts) {
        if (part === 'prototype') continue;
        obj = obj[part];
      }
      
      if (obj !== undefined) {
        available.push(feature);
      } else {
        missing.push(feature);
      }
    } catch {
      missing.push(feature);
    }
  });
  
  return { missing, available };
};

/**
 * Log polyfill status
 */
export const logPolyfillStatus = (): void => {
  const { missing, available } = checkPolyfills();
  
  if (available.length > 0) {
    console.log('✅ Available features:', available.join(', '));
  }
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing features:', missing.join(', '));
  } else {
    console.log('✅ All polyfills loaded successfully');
  }
};

// Auto-check polyfills in development
if (process.env.NODE_ENV === 'test') {
  logPolyfillStatus();
}
