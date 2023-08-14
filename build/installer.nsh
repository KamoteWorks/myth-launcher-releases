!macro customInstall
  SetRegView 64
  WriteRegExpandStr HKCU SOFTWARE\MythGames\Launcher "InstallationPath" "$INSTDIR"
  WriteRegExpandStr HKCU SOFTWARE\MythGames\SF1 "InstallPath" "$INSTDIR\common\Special Force Legends"
!macroend