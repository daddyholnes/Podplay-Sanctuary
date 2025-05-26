#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Load the same way as app.py
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

print('Environment variables starting with NIXOS:')
for k, v in os.environ.items():
    if 'NIXOS' in k.upper():
        print(f'{k}={v}')

# Test the vm_manager path logic
LOCAL_VM_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nixos_vms')
WORKSPACE_VM_IMAGES_DIR = os.getenv('NIXOS_WORKSPACE_VM_IMAGES_DIR', os.path.join(LOCAL_VM_DIR, 'workspaces'))
print(f'LOCAL_VM_DIR: {LOCAL_VM_DIR}')
print(f'WORKSPACE_VM_IMAGES_DIR: {WORKSPACE_VM_IMAGES_DIR}')
print(f'Current working directory: {os.getcwd()}')
print(f'Script directory: {os.path.dirname(os.path.abspath(__file__))}')

# Check if the directory exists and is writable
try:
    os.makedirs(WORKSPACE_VM_IMAGES_DIR, exist_ok=True)
    print(f'✅ Successfully created/verified: {WORKSPACE_VM_IMAGES_DIR}')
except PermissionError as e:
    print(f'❌ Permission error: {e}')
except Exception as e:
    print(f'❌ Error: {e}')
