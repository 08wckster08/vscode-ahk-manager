;https://autohotkey.com/board/topic/30277-query-status-of-running-scripts/
;https://autohotkey.com/board/topic/20642-consolidating-tray-icons/
; checks Paused status for all AHK running scripts
DetectHiddenWindows, On
WinGet, AHK, List, ahk_class AutoHotkey

Loop %AHK% {
  WinGetTitle, Title, % "ahk_id " AHK%A_Index%
  WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
  If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
       Continue
  MsgBox, 0, %Title%, % IsPaused( PID ) ? "Paused" : "Running"
}

; IsPaused( PID ) { ; Lexikos: http://www.autohotkey.com/forum/viewtopic.php?p=142697#142697
;     dhw := A_DetectHiddenWindows
;     hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
;     hMenu := DllCall("GetMenu", "uint", hWnd)
;     hMenu := DllCall("GetSubMenu", "uint", hMenu, "int", 0)
;     return (DllCall("GetMenuState", "uint", hMenu, "uint", 4, "uint", 0x400) & 0x8)
; }
IsPaused( PID ) {
    dhw := A_DetectHiddenWindows
    [color=#D05000]DetectHiddenWindows, On[/color]  ; This line can be important!
    hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
    [color=darkred]SendMessage, 0x211[/color]  ; WM_ENTERMENULOOP
    [color=darkred]SendMessage, 0x212[/color]  ; WM_EXITMENULOOP
    [color=#D05000]DetectHiddenWindows, %dhw%[/color]
    hMenu := DllCall("GetMenu", "uint", hWnd)
    hMenu := DllCall("GetSubMenu", "uint", hMenu, "int", 0)
    return (DllCall("GetMenuState", "uint", hMenu, "uint", 4, "uint", 0x400) & 0x8) [color=#D05000]!= 0[/color]
}