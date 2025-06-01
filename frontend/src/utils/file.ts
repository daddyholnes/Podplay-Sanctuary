/**
 * File System Utilities
 * Comprehensive file handling, validation, and manipulation utilities
 */

// File type detection and validation
export const FILE_TYPES = {
  // Images
  IMAGE: {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    GIF: 'image/gif',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml',
    BMP: 'image/bmp',
    ICO: 'image/x-icon',
    TIFF: 'image/tiff',
  },
  
  // Documents
  DOCUMENT: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    RTF: 'application/rtf',
    ODT: 'application/vnd.oasis.opendocument.text',
    ODS: 'application/vnd.oasis.opendocument.spreadsheet',
  },
  
  // Text
  TEXT: {
    PLAIN: 'text/plain',
    HTML: 'text/html',
    CSS: 'text/css',
    JAVASCRIPT: 'text/javascript',
    JSON: 'application/json',
    XML: 'text/xml',
    CSV: 'text/csv',
    MARKDOWN: 'text/markdown',
    YAML: 'text/yaml',
    SQL: 'text/sql',
  },
  
  // Archives
  ARCHIVE: {
    ZIP: 'application/zip',
    RAR: 'application/x-rar-compressed',
    SEVEN_ZIP: 'application/x-7z-compressed',
    TAR: 'application/x-tar',
    GZIP: 'application/gzip',
  },
  
  // Audio
  AUDIO: {
    MP3: 'audio/mpeg',
    WAV: 'audio/wav',
    OGG: 'audio/ogg',
    AAC: 'audio/aac',
    FLAC: 'audio/flac',
    M4A: 'audio/m4a',
  },
  
  // Video
  VIDEO: {
    MP4: 'video/mp4',
    AVI: 'video/x-msvideo',
    MOV: 'video/quicktime',
    WMV: 'video/x-ms-wmv',
    FLV: 'video/x-flv',
    WEBM: 'video/webm',
    MKV: 'video/x-matroska',
  },
  
  // Code
  CODE: {
    TYPESCRIPT: 'text/typescript',
    PYTHON: 'text/x-python',
    JAVA: 'text/x-java-source',
    CPP: 'text/x-c++src',
    C: 'text/x-csrc',
    CSHARP: 'text/x-csharp',
    PHP: 'text/x-php',
    RUBY: 'text/x-ruby',
    GO: 'text/x-go',
    RUST: 'text/x-rust',
    SWIFT: 'text/x-swift',
    KOTLIN: 'text/x-kotlin',
    SCALA: 'text/x-scala',
    R: 'text/x-r',
    SHELL: 'text/x-shellscript',
  },
} as const;

// File extension mappings
export const FILE_EXTENSIONS = {
  // Images
  jpg: FILE_TYPES.IMAGE.JPEG,
  jpeg: FILE_TYPES.IMAGE.JPEG,
  png: FILE_TYPES.IMAGE.PNG,
  gif: FILE_TYPES.IMAGE.GIF,
  webp: FILE_TYPES.IMAGE.WEBP,
  svg: FILE_TYPES.IMAGE.SVG,
  bmp: FILE_TYPES.IMAGE.BMP,
  ico: FILE_TYPES.IMAGE.ICO,
  tiff: FILE_TYPES.IMAGE.TIFF,
  tif: FILE_TYPES.IMAGE.TIFF,
  
  // Documents
  pdf: FILE_TYPES.DOCUMENT.PDF,
  doc: FILE_TYPES.DOCUMENT.DOC,
  docx: FILE_TYPES.DOCUMENT.DOCX,
  xls: FILE_TYPES.DOCUMENT.XLS,
  xlsx: FILE_TYPES.DOCUMENT.XLSX,
  ppt: FILE_TYPES.DOCUMENT.PPT,
  pptx: FILE_TYPES.DOCUMENT.PPTX,
  rtf: FILE_TYPES.DOCUMENT.RTF,
  odt: FILE_TYPES.DOCUMENT.ODT,
  ods: FILE_TYPES.DOCUMENT.ODS,
  
  // Text
  txt: FILE_TYPES.TEXT.PLAIN,
  html: FILE_TYPES.TEXT.HTML,
  htm: FILE_TYPES.TEXT.HTML,
  css: FILE_TYPES.TEXT.CSS,
  js: FILE_TYPES.TEXT.JAVASCRIPT,
  json: FILE_TYPES.TEXT.JSON,
  xml: FILE_TYPES.TEXT.XML,
  csv: FILE_TYPES.TEXT.CSV,
  md: FILE_TYPES.TEXT.MARKDOWN,
  markdown: FILE_TYPES.TEXT.MARKDOWN,
  yml: FILE_TYPES.TEXT.YAML,
  yaml: FILE_TYPES.TEXT.YAML,
  sql: FILE_TYPES.TEXT.SQL,
  
  // Archives
  zip: FILE_TYPES.ARCHIVE.ZIP,
  rar: FILE_TYPES.ARCHIVE.RAR,
  '7z': FILE_TYPES.ARCHIVE.SEVEN_ZIP,
  tar: FILE_TYPES.ARCHIVE.TAR,
  gz: FILE_TYPES.ARCHIVE.GZIP,
  
  // Audio
  mp3: FILE_TYPES.AUDIO.MP3,
  wav: FILE_TYPES.AUDIO.WAV,
  ogg: FILE_TYPES.AUDIO.OGG,
  aac: FILE_TYPES.AUDIO.AAC,
  flac: FILE_TYPES.AUDIO.FLAC,
  m4a: FILE_TYPES.AUDIO.M4A,
  
  // Video
  mp4: FILE_TYPES.VIDEO.MP4,
  avi: FILE_TYPES.VIDEO.AVI,
  mov: FILE_TYPES.VIDEO.MOV,
  wmv: FILE_TYPES.VIDEO.WMV,
  flv: FILE_TYPES.VIDEO.FLV,
  webm: FILE_TYPES.VIDEO.WEBM,
  mkv: FILE_TYPES.VIDEO.MKV,
  
  // Code
  ts: FILE_TYPES.CODE.TYPESCRIPT,
  tsx: FILE_TYPES.CODE.TYPESCRIPT,
  py: FILE_TYPES.CODE.PYTHON,
  java: FILE_TYPES.CODE.JAVA,
  cpp: FILE_TYPES.CODE.CPP,
  cxx: FILE_TYPES.CODE.CPP,
  cc: FILE_TYPES.CODE.CPP,
  c: FILE_TYPES.CODE.C,
  cs: FILE_TYPES.CODE.CSHARP,
  php: FILE_TYPES.CODE.PHP,
  rb: FILE_TYPES.CODE.RUBY,
  go: FILE_TYPES.CODE.GO,
  rs: FILE_TYPES.CODE.RUST,
  swift: FILE_TYPES.CODE.SWIFT,
  kt: FILE_TYPES.CODE.KOTLIN,
  scala: FILE_TYPES.CODE.SCALA,
  r: FILE_TYPES.CODE.R,
  sh: FILE_TYPES.CODE.SHELL,
  bash: FILE_TYPES.CODE.SHELL,
  zsh: FILE_TYPES.CODE.SHELL,
} as const;

// File size utilities
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Parse file size from string (e.g., "1.5 MB" -> 1572864)
export const parseFileSize = (sizeString: string): number => {
  const units: Record<string, number> = {
    bytes: 1,
    byte: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  };
  
  const match = sizeString.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
  if (!match) return 0;
  
  const [, size, unit] = match;
  const multiplier = units[unit] || 1;
  
  return parseFloat(size) * multiplier;
};

// Get file extension from filename
export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) return '';
  return filename.slice(lastDotIndex + 1).toLowerCase();
};

// Get filename without extension
export const getFilenameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) return filename;
  return filename.slice(0, lastDotIndex);
};

// Get MIME type from file extension
export const getMimeTypeFromExtension = (extension: string): string => {
  const normalizedExt = extension.toLowerCase().replace(/^\./, '');
  return FILE_EXTENSIONS[normalizedExt as keyof typeof FILE_EXTENSIONS] || 'application/octet-stream';
};

// Get MIME type from filename
export const getMimeTypeFromFilename = (filename: string): string => {
  const extension = getFileExtension(filename);
  return getMimeTypeFromExtension(extension);
};

// Check if file is of specific type category
export const isFileType = {
  image: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return mimeType.startsWith('image/');
  },
  
  document: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return Object.values(FILE_TYPES.DOCUMENT).includes(mimeType as any);
  },
  
  text: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return mimeType.startsWith('text/') || Object.values(FILE_TYPES.TEXT).includes(mimeType as any);
  },
  
  audio: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return mimeType.startsWith('audio/');
  },
  
  video: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return mimeType.startsWith('video/');
  },
  
  archive: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return Object.values(FILE_TYPES.ARCHIVE).includes(mimeType as any);
  },
  
  code: (file: File | string): boolean => {
    const mimeType = typeof file === 'string' ? getMimeTypeFromFilename(file) : file.type;
    return Object.values(FILE_TYPES.CODE).includes(mimeType as any);
  },
};

// File reading utilities
export const readFile = {
  // Read file as text
  asText: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },
  
  // Read file as ArrayBuffer
  asArrayBuffer: (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  },
  
  // Read file as data URL
  asDataURL: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },
  
  // Read image file and get dimensions
  asImageData: (file: File): Promise<{ 
    dataURL: string; 
    width: number; 
    height: number; 
    size: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!isFileType.image(file)) {
        reject(new Error('File is not an image'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          resolve({
            dataURL: reader.result as string,
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: file.size,
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },
};

// File validation utilities
export interface FileValidationRule {
  name: string;
  validator: (file: File) => boolean | Promise<boolean>;
  message: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateFile = async (
  file: File,
  rules: FileValidationRule[]
): Promise<FileValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const rule of rules) {
    try {
      const isValid = await rule.validator(file);
      if (!isValid) {
        errors.push(rule.message);
      }
    } catch (error) {
      errors.push(`Validation error in rule "${rule.name}": ${error}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// Common validation rules
export const validationRules = {
  // File size validation
  maxSize: (maxBytes: number): FileValidationRule => ({
    name: 'maxSize',
    validator: (file) => file.size <= maxBytes,
    message: `File size must be less than ${formatFileSize(maxBytes)}`,
  }),
  
  minSize: (minBytes: number): FileValidationRule => ({
    name: 'minSize',
    validator: (file) => file.size >= minBytes,
    message: `File size must be at least ${formatFileSize(minBytes)}`,
  }),
  
  // File type validation
  allowedTypes: (types: string[]): FileValidationRule => ({
    name: 'allowedTypes',
    validator: (file) => types.includes(file.type),
    message: `File type must be one of: ${types.join(', ')}`,
  }),
  
  allowedExtensions: (extensions: string[]): FileValidationRule => ({
    name: 'allowedExtensions',
    validator: (file) => {
      const ext = getFileExtension(file.name);
      return extensions.includes(ext);
    },
    message: `File extension must be one of: ${extensions.join(', ')}`,
  }),
  
  // Image dimension validation
  minImageDimensions: (minWidth: number, minHeight: number): FileValidationRule => ({
    name: 'minImageDimensions',
    validator: async (file) => {
      if (!isFileType.image(file)) return true;
      try {
        const imageData = await readFile.asImageData(file);
        return imageData.width >= minWidth && imageData.height >= minHeight;
      } catch {
        return false;
      }
    },
    message: `Image must be at least ${minWidth}x${minHeight} pixels`,
  }),
  
  maxImageDimensions: (maxWidth: number, maxHeight: number): FileValidationRule => ({
    name: 'maxImageDimensions',
    validator: async (file) => {
      if (!isFileType.image(file)) return true;
      try {
        const imageData = await readFile.asImageData(file);
        return imageData.width <= maxWidth && imageData.height <= maxHeight;
      } catch {
        return false;
      }
    },
    message: `Image must be no larger than ${maxWidth}x${maxHeight} pixels`,
  }),
  
  // Filename validation
  validFilename: (): FileValidationRule => ({
    name: 'validFilename',
    validator: (file) => {
      const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
      return !invalidChars.test(file.name) && file.name.length > 0 && file.name.length <= 255;
    },
    message: 'Filename contains invalid characters or is too long',
  }),
  
  // Required extension
  hasExtension: (): FileValidationRule => ({
    name: 'hasExtension',
    validator: (file) => getFileExtension(file.name).length > 0,
    message: 'File must have an extension',
  }),
};

// File download utilities
export const downloadFile = (
  content: string | Blob,
  filename: string,
  mimeType?: string
): void => {
  let blob: Blob;
  
  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { 
      type: mimeType || getMimeTypeFromFilename(filename) 
    });
  }
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// File upload utilities
export const createFileFromContent = (
  content: string,
  filename: string,
  mimeType?: string
): File => {
  const blob = new Blob([content], { 
    type: mimeType || getMimeTypeFromFilename(filename) 
  });
  
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

// Convert data URL to File
export const dataURLToFile = (dataURL: string, filename: string): File => {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

// File compression utilities (basic)
export const compressImage = (
  file: File,
  quality: number = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!isFileType.image(file)) {
      reject(new Error('File is not an image'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Calculate new dimensions
        let { width, height } = img;
        
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

// Path utilities
export const pathUtils = {
  // Join path segments
  join: (...segments: string[]): string => {
    return segments
      .map((segment, index) => {
        if (index === 0) return segment.replace(/\/+$/, '');
        return segment.replace(/^\/+/, '').replace(/\/+$/, '');
      })
      .filter(Boolean)
      .join('/');
  },
  
  // Get directory name
  dirname: (path: string): string => {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash === -1 ? '.' : path.slice(0, lastSlash) || '/';
  },
  
  // Get basename
  basename: (path: string, ext?: string): string => {
    const base = path.split('/').pop() || '';
    if (ext && base.endsWith(ext)) {
      return base.slice(0, -ext.length);
    }
    return base;
  },
  
  // Normalize path
  normalize: (path: string): string => {
    const parts = path.split('/').filter(Boolean);
    const normalized: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        normalized.pop();
      } else if (part !== '.') {
        normalized.push(part);
      }
    }
    
    return '/' + normalized.join('/');
  },
  
  // Check if path is absolute
  isAbsolute: (path: string): boolean => {
    return path.startsWith('/') || /^[a-zA-Z]:/.test(path);
  },
  
  // Get relative path
  relative: (from: string, to: string): string => {
    const fromParts = from.split('/').filter(Boolean);
    const toParts = to.split('/').filter(Boolean);
    
    // Find common prefix
    let commonLength = 0;
    while (
      commonLength < fromParts.length &&
      commonLength < toParts.length &&
      fromParts[commonLength] === toParts[commonLength]
    ) {
      commonLength++;
    }
    
    // Add '..' for each remaining part in from
    const upLevels = fromParts.length - commonLength;
    const result = Array(upLevels).fill('..').concat(toParts.slice(commonLength));
    
    return result.join('/') || '.';
  },
};

// Export all file utilities
export const FileUtils = {
  types: FILE_TYPES,
  extensions: FILE_EXTENSIONS,
  formatSize: formatFileSize,
  parseSize: parseFileSize,
  getExtension: getFileExtension,
  getFilenameWithoutExtension,
  getMimeType: {
    fromExtension: getMimeTypeFromExtension,
    fromFilename: getMimeTypeFromFilename,
  },
  is: isFileType,
  read: readFile,
  validate: validateFile,
  rules: validationRules,
  download: downloadFile,
  create: createFileFromContent,
  dataURLToFile,
  compress: compressImage,
  path: pathUtils,
} as const;
