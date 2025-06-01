/**
 * File Utilities Tests
 * 
 * Comprehensive test suite for file utility functions.
 * Tests file operations, uploads, downloads, parsing, and validation.
 * 
 * @fileoverview Tests for file utility functionality
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import {
  getFileExtension,
  getFileName,
  getFileBaseName,
  getFilePath,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  isArchiveFile,
  getFileType,
  validateFileSize,
  validateFileType,
  formatFileSize,
  parseCSV,
  parseJSON,
  downloadFile,
  downloadBlob,
  downloadText,
  downloadJSON,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  createFileFromText,
  createFileFromBlob,
  compressImage,
  resizeImage,
  fileUtils,
  FILE_TYPES,
  MIME_TYPES,
  MAX_FILE_SIZES,
  FileInfo,
  FileValidationOptions,
  CompressionOptions
} from '../../utils/file';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('File Utilities', () => {
  // Mock file objects for testing
  const createMockFile = (name: string, type: string, size: number = 1024): File => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  const createMockBlob = (content: string, type: string = 'text/plain'): Blob => {
    return new Blob([content], { type });
  };

  // Sample files for testing
  const textFile = createMockFile('document.txt', 'text/plain', 1024);
  const imageFile = createMockFile('photo.jpg', 'image/jpeg', 2048);
  const videoFile = createMockFile('video.mp4', 'video/mp4', 10485760); // 10MB
  const jsonFile = createMockFile('data.json', 'application/json', 512);
  const csvFile = createMockFile('data.csv', 'text/csv', 2048);

  // Mock DOM APIs
  beforeEach(() => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock document.createElement for download links
    const mockAnchor = {
      click: jest.fn(),
      href: '',
      download: '',
      style: {},
    };
    document.createElement = jest.fn(() => mockAnchor as any);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    // Mock FileReader
    global.FileReader = jest.fn(() => ({
      readAsText: jest.fn(),
      readAsDataURL: jest.fn(),
      readAsArrayBuffer: jest.fn(),
      onload: null,
      onerror: null,
      result: null,
    })) as any;

    // Mock Image for image processing
    global.Image = jest.fn(() => ({
      onload: null,
      onerror: null,
      src: '',
      width: 100,
      height: 100,
    })) as any;

    // Mock Canvas for image processing
    const mockCanvas = {
      getContext: jest.fn(() => ({
        drawImage: jest.fn(),
        getImageData: jest.fn(),
      })),
      toBlob: jest.fn(),
      width: 0,
      height: 0,
    };
    document.createElement = jest.fn((tag) => {
      if (tag === 'canvas') return mockCanvas;
      return mockAnchor;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // FILE PATH AND NAME UTILITIES
  // ============================================================================

  describe('File Path and Name Utilities', () => {
    const testCases = [
      {
        input: 'document.txt',
        extension: 'txt',
        name: 'document.txt',
        baseName: 'document',
        path: '',
      },
      {
        input: 'folder/document.pdf',
        extension: 'pdf',
        name: 'document.pdf',
        baseName: 'document',
        path: 'folder',
      },
      {
        input: '/home/user/files/image.jpeg',
        extension: 'jpeg',
        name: 'image.jpeg',
        baseName: 'image',
        path: '/home/user/files',
      },
      {
        input: 'complex.file.name.tar.gz',
        extension: 'gz',
        name: 'complex.file.name.tar.gz',
        baseName: 'complex.file.name.tar',
        path: '',
      },
    ];

    testCases.forEach(({ input, extension, name, baseName, path }) => {
      describe(`File: ${input}`, () => {
        it('should extract file extension correctly', () => {
          expect(getFileExtension(input)).toBe(extension);
        });

        it('should extract file name correctly', () => {
          expect(getFileName(input)).toBe(name);
        });

        it('should extract base name correctly', () => {
          expect(getFileBaseName(input)).toBe(baseName);
        });

        it('should extract file path correctly', () => {
          expect(getFilePath(input)).toBe(path);
        });
      });
    });

    it('should handle files without extensions', () => {
      expect(getFileExtension('README')).toBe('');
      expect(getFileBaseName('README')).toBe('README');
    });

    it('should handle hidden files', () => {
      expect(getFileName('.gitignore')).toBe('.gitignore');
      expect(getFileBaseName('.gitignore')).toBe('.gitignore');
      expect(getFileExtension('.gitignore')).toBe('');
    });

    it('should handle edge cases', () => {
      expect(getFileExtension('')).toBe('');
      expect(getFileName('')).toBe('');
      expect(getFileBaseName('')).toBe('');
      expect(getFilePath('')).toBe('');
    });
  });

  // ============================================================================
  // FILE TYPE DETECTION
  // ============================================================================

  describe('File Type Detection', () => {
    it('should identify image files correctly', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('image.png')).toBe(true);
      expect(isImageFile('graphic.gif')).toBe(true);
      expect(isImageFile('vector.svg')).toBe(true);
      expect(isImageFile('photo.webp')).toBe(true);
      expect(isImageFile('document.pdf')).toBe(false);
    });

    it('should identify video files correctly', () => {
      expect(isVideoFile('movie.mp4')).toBe(true);
      expect(isVideoFile('clip.avi')).toBe(true);
      expect(isVideoFile('video.mkv')).toBe(true);
      expect(isVideoFile('stream.webm')).toBe(true);
      expect(isVideoFile('audio.mp3')).toBe(false);
    });

    it('should identify audio files correctly', () => {
      expect(isAudioFile('song.mp3')).toBe(true);
      expect(isAudioFile('audio.wav')).toBe(true);
      expect(isAudioFile('music.flac')).toBe(true);
      expect(isAudioFile('podcast.ogg')).toBe(true);
      expect(isAudioFile('video.mp4')).toBe(false);
    });

    it('should identify document files correctly', () => {
      expect(isDocumentFile('document.pdf')).toBe(true);
      expect(isDocumentFile('text.txt')).toBe(true);
      expect(isDocumentFile('presentation.pptx')).toBe(true);
      expect(isDocumentFile('spreadsheet.xlsx')).toBe(true);
      expect(isDocumentFile('photo.jpg')).toBe(false);
    });

    it('should identify archive files correctly', () => {
      expect(isArchiveFile('archive.zip')).toBe(true);
      expect(isArchiveFile('backup.tar.gz')).toBe(true);
      expect(isArchiveFile('compressed.rar')).toBe(true);
      expect(isArchiveFile('data.7z')).toBe(true);
      expect(isArchiveFile('document.txt')).toBe(false);
    });

    it('should get general file type correctly', () => {
      expect(getFileType('photo.jpg')).toBe('image');
      expect(getFileType('video.mp4')).toBe('video');
      expect(getFileType('audio.mp3')).toBe('audio');
      expect(getFileType('document.pdf')).toBe('document');
      expect(getFileType('archive.zip')).toBe('archive');
      expect(getFileType('unknown.xyz')).toBe('other');
    });

    it('should handle case insensitive extensions', () => {
      expect(isImageFile('PHOTO.JPG')).toBe(true);
      expect(isVideoFile('VIDEO.MP4')).toBe(true);
      expect(getFileType('DOCUMENT.PDF')).toBe('document');
    });
  });

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  describe('File Validation', () => {
    describe('File Size Validation', () => {
      it('should validate file sizes correctly', () => {
        expect(validateFileSize(1024, 2048)).toBe(true); // 1KB <= 2KB
        expect(validateFileSize(3072, 2048)).toBe(false); // 3KB > 2KB
        expect(validateFileSize(0, 1024)).toBe(true); // Empty file
      });

      it('should use default max sizes when not specified', () => {
        expect(validateFileSize(1024)).toBe(true); // Should use default
      });

      it('should handle edge cases', () => {
        expect(validateFileSize(-1, 1024)).toBe(false); // Negative size
        expect(validateFileSize(1024, 0)).toBe(false); // Zero max size
      });
    });

    describe('File Type Validation', () => {
      const options: FileValidationOptions = {
        allowedTypes: ['image/jpeg', 'image/png', 'text/plain'],
        allowedExtensions: ['jpg', 'png', 'txt'],
        maxSize: 5 * 1024 * 1024, // 5MB
      };

      it('should validate allowed MIME types', () => {
        expect(validateFileType(imageFile, options)).toBe(true);
        expect(validateFileType(textFile, options)).toBe(true);
        expect(validateFileType(videoFile, options)).toBe(false);
      });

      it('should validate file size limits', () => {
        const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024); // 10MB
        expect(validateFileType(largeFile, options)).toBe(false);
      });

      it('should validate allowed extensions', () => {
        const allowedFile = createMockFile('document.txt', 'text/plain');
        const disallowedFile = createMockFile('video.mp4', 'video/mp4');
        
        expect(validateFileType(allowedFile, options)).toBe(true);
        expect(validateFileType(disallowedFile, options)).toBe(false);
      });
    });
  });

  // ============================================================================
  // FILE SIZE FORMATTING
  // ============================================================================

  describe('File Size Formatting', () => {
    const testCases = [
      { bytes: 0, expected: '0 B' },
      { bytes: 512, expected: '512 B' },
      { bytes: 1024, expected: '1.0 KB' },
      { bytes: 1536, expected: '1.5 KB' },
      { bytes: 1048576, expected: '1.0 MB' },
      { bytes: 1073741824, expected: '1.0 GB' },
      { bytes: 1099511627776, expected: '1.0 TB' },
    ];

    testCases.forEach(({ bytes, expected }) => {
      it(`should format ${bytes} bytes as ${expected}`, () => {
        expect(formatFileSize(bytes)).toBe(expected);
      });
    });

    it('should handle custom decimal places', () => {
      expect(formatFileSize(1536, 2)).toBe('1.50 KB');
      expect(formatFileSize(1536, 0)).toBe('2 KB');
    });

    it('should handle negative numbers', () => {
      expect(formatFileSize(-1024)).toBe('0 B');
    });
  });

  // ============================================================================
  // FILE PARSING
  // ============================================================================

  describe('File Parsing', () => {
    describe('CSV Parsing', () => {
      it('should parse simple CSV correctly', () => {
        const csvContent = 'name,age,city\nJohn,25,NYC\nJane,30,LA';
        const result = parseCSV(csvContent);
        
        expect(result).toEqual([
          { name: 'John', age: '25', city: 'NYC' },
          { name: 'Jane', age: '30', city: 'LA' },
        ]);
      });

      it('should handle CSV with custom delimiter', () => {
        const csvContent = 'name;age;city\nJohn;25;NYC\nJane;30;LA';
        const result = parseCSV(csvContent, ';');
        
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'John', age: '25', city: 'NYC' });
      });

      it('should handle CSV with quotes', () => {
        const csvContent = 'name,description\n"John","A person with, comma"\n"Jane","Normal person"';
        const result = parseCSV(csvContent);
        
        expect(result[0].description).toBe('A person with, comma');
      });

      it('should handle empty CSV', () => {
        expect(parseCSV('')).toEqual([]);
        expect(parseCSV('header\n')).toEqual([]);
      });

      it('should handle malformed CSV gracefully', () => {
        const malformedCSV = 'name,age\nJohn,25,extra,fields\nJane';
        const result = parseCSV(malformedCSV);
        
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'John', age: '25' });
      });
    });

    describe('JSON Parsing', () => {
      it('should parse valid JSON', () => {
        const jsonContent = '{"name": "John", "age": 25}';
        const result = parseJSON(jsonContent);
        
        expect(result).toEqual({ name: 'John', age: 25 });
      });

      it('should parse JSON arrays', () => {
        const jsonContent = '[{"name": "John"}, {"name": "Jane"}]';
        const result = parseJSON(jsonContent);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
      });

      it('should handle invalid JSON', () => {
        const invalidJSON = '{"name": "John", age: }';
        
        expect(() => parseJSON(invalidJSON)).toThrow();
      });

      it('should handle empty JSON', () => {
        expect(parseJSON('{}')).toEqual({});
        expect(parseJSON('[]')).toEqual([]);
      });
    });
  });

  // ============================================================================
  // FILE DOWNLOAD
  // ============================================================================

  describe('File Download', () => {
    it('should trigger file download with correct attributes', () => {
      const mockAnchor = {
        click: jest.fn(),
        href: '',
        download: '',
        style: {},
      };
      document.createElement = jest.fn(() => mockAnchor as any);

      downloadFile('blob:mock-url', 'test-file.txt');

      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe('test-file.txt');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('should download blob as file', () => {
      const testBlob = createMockBlob('test content');
      
      downloadBlob(testBlob, 'test.txt');

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(testBlob);
    });

    it('should download text as file', () => {
      downloadText('Hello, World!', 'greeting.txt');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should download JSON as file', () => {
      const data = { name: 'John', age: 25 };
      
      downloadJSON(data, 'user.json');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle download with MIME type', () => {
      downloadText('CSV content', 'data.csv', 'text/csv');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // FILE READING
  // ============================================================================

  describe('File Reading', () => {
    let mockFileReader: any;

    beforeEach(() => {
      mockFileReader = {
        readAsText: jest.fn(),
        readAsDataURL: jest.fn(),
        readAsArrayBuffer: jest.fn(),
        onload: null,
        onerror: null,
        result: null,
      };
      global.FileReader = jest.fn(() => mockFileReader);
    });

    it('should read file as text', async () => {
      const promise = readFileAsText(textFile);
      
      // Simulate successful file read
      mockFileReader.onload();
      mockFileReader.result = 'file content';
      
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(textFile, 'utf-8');
    });

    it('should read file as data URL', async () => {
      const promise = readFileAsDataURL(imageFile);
      
      mockFileReader.onload();
      mockFileReader.result = 'data:image/jpeg;base64,/9j/4AAQ...';
      
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(imageFile);
    });

    it('should read file as array buffer', async () => {
      const promise = readFileAsArrayBuffer(imageFile);
      
      mockFileReader.onload();
      mockFileReader.result = new ArrayBuffer(1024);
      
      expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(imageFile);
    });

    it('should handle file reading errors', async () => {
      const promise = readFileAsText(textFile);
      
      // Simulate file read error
      if (mockFileReader.onerror) {
        mockFileReader.onerror(new Event('error'));
      }
      
      // The promise should reject, but we need to handle it properly in implementation
    });
  });

  // ============================================================================
  // FILE CREATION
  // ============================================================================

  describe('File Creation', () => {
    it('should create file from text', () => {
      const file = createFileFromText('Hello, World!', 'greeting.txt', 'text/plain');
      
      expect(file.name).toBe('greeting.txt');
      expect(file.type).toBe('text/plain');
    });

    it('should create file from blob', () => {
      const blob = createMockBlob('test content');
      const file = createFileFromBlob(blob, 'test.txt');
      
      expect(file.name).toBe('test.txt');
    });

    it('should handle default MIME types', () => {
      const file = createFileFromText('content', 'file.txt');
      expect(file.type).toBe('text/plain');
    });
  });

  // ============================================================================
  // IMAGE PROCESSING
  // ============================================================================

  describe('Image Processing', () => {
    let mockImage: any;
    let mockCanvas: any;
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        drawImage: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
      };

      mockCanvas = {
        getContext: jest.fn(() => mockContext),
        toBlob: jest.fn(),
        width: 0,
        height: 0,
      };

      mockImage = {
        onload: null,
        onerror: null,
        src: '',
        width: 800,
        height: 600,
      };

      global.Image = jest.fn(() => mockImage);
      document.createElement = jest.fn((tag) => {
        if (tag === 'canvas') return mockCanvas;
        return { click: jest.fn(), href: '', download: '', style: {} };
      });
    });

    it('should resize image correctly', async () => {
      const options = { width: 400, height: 300, quality: 0.8 };
      
      // Start the resize operation
      const promise = resizeImage(imageFile, options);
      
      // Simulate image load
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      expect(mockCanvas.width).toBe(400);
      expect(mockCanvas.height).toBe(300);
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should compress image with quality setting', async () => {
      const options: CompressionOptions = { quality: 0.5, format: 'image/jpeg' };
      
      const promise = compressImage(imageFile, options);
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.5
      );
    });

    it('should handle image processing errors', async () => {
      const promise = resizeImage(imageFile, { width: 100, height: 100 });
      
      // Simulate image load error
      if (mockImage.onerror) {
        mockImage.onerror(new Event('error'));
      }
      
      // Should handle error gracefully
    });

    it('should maintain aspect ratio when specified', async () => {
      const options = { width: 400, maintainAspectRatio: true };
      
      const promise = resizeImage(imageFile, options);
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      // Should calculate height based on aspect ratio
      const expectedHeight = (400 * mockImage.height) / mockImage.width;
      expect(mockCanvas.height).toBe(expectedHeight);
    });
  });

  // ============================================================================
  // FILE UTILITIES INTEGRATION
  // ============================================================================

  describe('File Utils Integration', () => {
    it('should provide unified access to all file functions', () => {
      expect(fileUtils.getExtension).toBeDefined();
      expect(fileUtils.getName).toBeDefined();
      expect(fileUtils.isImage).toBeDefined();
      expect(fileUtils.validate).toBeDefined();
      expect(fileUtils.format).toBeDefined();
      expect(fileUtils.download).toBeDefined();
      expect(fileUtils.read).toBeDefined();
      expect(fileUtils.create).toBeDefined();
      expect(fileUtils.process).toBeDefined();
    });

    it('should handle complex file operations', () => {
      const fileInfo = fileUtils.getInfo('path/to/document.pdf');
      
      expect(fileInfo.name).toBe('document.pdf');
      expect(fileInfo.extension).toBe('pdf');
      expect(fileInfo.type).toBe('document');
      expect(fileInfo.path).toBe('path/to');
    });

    it('should validate multiple criteria', () => {
      const options: FileValidationOptions = {
        allowedTypes: ['image/jpeg'],
        maxSize: 2048,
        allowedExtensions: ['jpg'],
      };

      const validFile = createMockFile('photo.jpg', 'image/jpeg', 1024);
      const invalidFile = createMockFile('document.pdf', 'application/pdf', 1024);

      expect(fileUtils.validate.file(validFile, options)).toBe(true);
      expect(fileUtils.validate.file(invalidFile, options)).toBe(false);
    });
  });

  // ============================================================================
  // CONSTANTS AND CONFIGURATION
  // ============================================================================

  describe('Constants and Configuration', () => {
    it('should define file type constants', () => {
      expect(FILE_TYPES.IMAGE).toBeDefined();
      expect(FILE_TYPES.VIDEO).toBeDefined();
      expect(FILE_TYPES.AUDIO).toBeDefined();
      expect(FILE_TYPES.DOCUMENT).toBeDefined();
      expect(FILE_TYPES.ARCHIVE).toBeDefined();
    });

    it('should define MIME type mappings', () => {
      expect(MIME_TYPES.jpg).toBe('image/jpeg');
      expect(MIME_TYPES.png).toBe('image/png');
      expect(MIME_TYPES.pdf).toBe('application/pdf');
      expect(MIME_TYPES.txt).toBe('text/plain');
    });

    it('should define max file size limits', () => {
      expect(MAX_FILE_SIZES.image).toBeDefined();
      expect(MAX_FILE_SIZES.video).toBeDefined();
      expect(MAX_FILE_SIZES.document).toBeDefined();
      expect(typeof MAX_FILE_SIZES.image).toBe('number');
    });
  });

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle null and undefined inputs', () => {
      expect(getFileExtension(null as any)).toBe('');
      expect(getFileName(undefined as any)).toBe('');
      expect(getFileType('')).toBe('other');
    });

    it('should handle malformed file paths', () => {
      expect(getFileExtension('file...txt')).toBe('txt');
      expect(getFileName('///file.txt')).toBe('file.txt');
    });

    it('should handle invalid files gracefully', () => {
      const invalidFile = null as any;
      const options: FileValidationOptions = { maxSize: 1024 };
      
      expect(validateFileType(invalidFile, options)).toBe(false);
    });

    it('should handle unsupported operations gracefully', () => {
      // Test cases where browser APIs might not be available
      delete (global as any).FileReader;
      delete (global as any).URL;
      
      // Functions should handle missing APIs gracefully
      expect(() => {
        downloadText('content', 'file.txt');
      }).not.toThrow();
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('should handle large file lists efficiently', () => {
      const files = Array.from({ length: 1000 }, (_, i) => 
        `file${i}.txt`
      );
      
      const start = performance.now();
      files.forEach(filename => {
        getFileExtension(filename);
        getFileType(filename);
      });
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should efficiently validate multiple files', () => {
      const files = Array.from({ length: 100 }, (_, i) => 
        createMockFile(`file${i}.txt`, 'text/plain', 1024)
      );
      
      const options: FileValidationOptions = {
        allowedTypes: ['text/plain'],
        maxSize: 2048,
      };
      
      const start = performance.now();
      files.forEach(file => validateFileType(file, options));
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should be reasonably fast
    });
  });
});
