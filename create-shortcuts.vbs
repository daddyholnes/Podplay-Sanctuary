Set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

' Create shortcut object
Set oShortcut = WshShell.CreateShortcut(strDesktop & "\Podplay Sanctuary.lnk")
oShortcut.TargetPath = "C:\Users\woodyholne\Desktop\Podplay-Sanctuary\Launch-Podplay-Sanctuary.bat"
oShortcut.WorkingDirectory = "C:\Users\woodyholne\Desktop\Podplay-Sanctuary"
oShortcut.IconLocation = "C:\Users\woodyholne\Desktop\Podplay-Sanctuary\electron\assets\icon.ico"
oShortcut.Description = "Launch Podplay Sanctuary desktop application"
oShortcut.Save

' Create debug mode shortcut
Set oDebugShortcut = WshShell.CreateShortcut(strDesktop & "\Podplay Sanctuary (Debug Mode).lnk")
oDebugShortcut.TargetPath = "C:\Users\woodyholne\Desktop\Podplay-Sanctuary\Launch-Podplay-Sanctuary.bat"
oDebugShortcut.Arguments = "--debug"
oDebugShortcut.WorkingDirectory = "C:\Users\woodyholne\Desktop\Podplay-Sanctuary"
oDebugShortcut.IconLocation = "C:\Users\woodyholne\Desktop\Podplay-Sanctuary\electron\assets\icon.ico"
oDebugShortcut.Description = "Launch Podplay Sanctuary in debug mode"
oDebugShortcut.Save

WScript.Echo "Desktop shortcuts created successfully!"
