
import React from 'react';
import PanelBase from './PanelBase';
import { FolderIcon, ChevronDownIcon } from '../../constants';

interface FileItemProps {
  name: string;
  type: 'file' | 'folder';
  level?: number;
}

const FileItem: React.FC<FileItemProps> = ({ name, type, level = 0 }) => {
  return (
    <div className={`flex items-center space-x-2 py-1 px-2 rounded hover:bg-slate-700/50 cursor-pointer ml-${level * 4}`}>
      {type === 'folder' ? <ChevronDownIcon className="w-4 h-4 text-gray-500 transform " /> : <div className="w-4"></div>}
      {type === 'folder' ? 
        <FolderIcon className="w-5 h-5 text-purple-400" /> :
        <div className="w-5 h-5 text-gray-400 text-xs flex items-center justify-center border border-gray-600 rounded-sm">MD</div> /* Placeholder for file type */
      }
      <span className="text-sm text-gray-300">{name}</span>
    </div>
  );
}

const FileExplorerPanel: React.FC = () => {
  return (
    <PanelBase title="File Explorer" icon={<FolderIcon className="w-5 h-5" />} className="min-h-[300px]">
      <div className="text-gray-400 space-y-1">
        <FileItem name="project_alpha" type="folder" />
        <FileItem name="README.md" type="file" level={1} />
        <FileItem name="src" type="folder" level={1} />
        <FileItem name="index.html" type="file" level={2} />
        <FileItem name="app.js" type="file" level={2} />
        <FileItem name="assets" type="folder" level={2} />
        <FileItem name="logo.svg" type="file" level={3} />
        <FileItem name="config" type="folder" level={1} />
        <FileItem name="settings.json" type="file" level={2} />
        <p className="italic text-xs p-2">File explorer placeholder...</p>
      </div>
    </PanelBase>
  );
};

export default FileExplorerPanel;
