
import React from 'react';
import PanelBase from './PanelBase';
import { CodeBracketIcon } from '../../constants';

const CodeEditorPanel: React.FC = () => {
  return (
    <PanelBase title="Code Editor" icon={<CodeBracketIcon className="w-5 h-5" />} className="min-h-[300px]">
      <div className="w-full h-full bg-slate-900/70 rounded-md p-4 text-gray-400 flex items-center justify-center">
        <p className="italic">Monaco Editor placeholder...</p>
        <pre className="mt-4 text-xs bg-black/30 p-2 rounded overflow-x-auto">
          <code>
{`// Example code
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}`}
          </code>
        </pre>
      </div>
    </PanelBase>
  );
};

export default CodeEditorPanel;
