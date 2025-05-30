
import { AttachmentFile } from '../types';

export const processFiles = async (files: File[]): Promise<AttachmentFile[]> => {
  return Promise.all(
    files.map(file => {
      return new Promise<AttachmentFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result as string, // base64 data URL
            size: file.size,
          });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    })
  );
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎞️';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  if (fileType === 'text/plain' || fileType === 'text/markdown') return '📝';
  if (fileType.includes('javascript') || fileType.includes('typescript')) return '📜'; // Simple icon for code
  return '📁'; // Default icon
};
