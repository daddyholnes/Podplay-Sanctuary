# Cleanup Script for Podplay Sanctuary (Windows PowerShell)
# Removes build artifacts, node_modules, __pycache__, and temp files

Write-Host "Cleaning up build artifacts and temp files..."

# Remove Python __pycache__
Get-ChildItem -Path . -Recurse -Include __pycache__ | Remove-Item -Recurse -Force

# Remove node_modules
Get-ChildItem -Path . -Recurse -Include node_modules | Remove-Item -Recurse -Force

# Remove dist/build folders
Get-ChildItem -Path . -Recurse -Include dist,build | Remove-Item -Recurse -Force

Write-Host "Cleanup complete."
