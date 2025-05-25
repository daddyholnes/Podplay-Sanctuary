#!/usr/bin/env python3

import os

def add_api_imports(directory):
    """
    Add API config imports to all TypeScript/React files that need it
    """
    import_statement = "import { API_BASE_URL, buildApiUrl, buildDynamicApiUrl, API_ENDPOINTS } from './config/api';"
    relative_import_statement = "import { API_BASE_URL, buildApiUrl, buildDynamicApiUrl, API_ENDPOINTS } from '../config/api';"
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                
                # Skip the API config file itself
                if file_path.endswith('api.ts'):
                    continue
                
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check if the file uses any API functions
                if 'API_BASE_URL' in content or 'buildApiUrl' in content or 'API_ENDPOINTS' in content:
                    # Check if import is already present
                    if 'import' in content and ('API_BASE_URL' in content or 'buildApiUrl' in content or 'API_ENDPOINTS' in content):
                        print(f"Skipping {file_path} - already has imports")
                        continue
                    
                    lines = content.split('\n')
                    import_section_end = 0
                    
                    # Find end of import section
                    for i, line in enumerate(lines):
                        if line.startswith('import '):
                            import_section_end = i + 1
                    
                    # Determine correct import path based on file location
                    is_nested = '/src/' in file_path and file_path.count('/') > file_path.find('/src/') + 4
                    import_to_add = relative_import_statement if is_nested else import_statement
                    
                    # Insert import at end of import section
                    lines.insert(import_section_end, import_to_add)
                    
                    # Write back updated content
                    with open(file_path, 'w') as f:
                        f.write('\n'.join(lines))
                    print(f"Added imports to {file_path}")

if __name__ == "__main__":
    frontend_dir = "/home/woody/Desktop/podplay-build-beta/frontend/src"
    add_api_imports(frontend_dir)
    print("✅ API imports added to all necessary files")
