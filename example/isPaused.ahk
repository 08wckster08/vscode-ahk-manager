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
    DetectHiddenWindows, On  ; This line can be important!
    hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
    SendMessage, 0x211  ; WM_ENTERMENULOOP
    SendMessage, 0x212  ; WM_EXITMENULOOP
    DetectHiddenWindows, %dhw%
    hMenu := DllCall("GetMenu", "uint", hWnd)
    hMenu := DllCall("GetSubMenu", "uint", hMenu, "int", 0)
    return (DllCall("GetMenuState", "uint", hMenu, "uint", 4, "uint", 0x400) & 0x8) [color=#D05000]!= 0[/color]
}

;======================================================================================
;https://stackoverflow.com/questions/14492650/check-if-script-is-suspended-in-autohotkey
; Check If Suspended
/*
You can do the same for Pause by replacing ID_FILE_SUSPEND (65404) with
 ID_FILE_PAUSE (65403). However, you need to send t
 he WM_ENTERMENULOOP (0x211) and WM_EXITMENULOOP (0x212) messages
 to the script for the Pause Script checkmark to be updated.
*/
SetTitleMatchMode 2  ; Allow filename instead of full path.
ScriptSuspend("script1.ahk", true)   ; Suspend.
ScriptSuspend("script1.ahk", false)  ; Unsuspend.
ScriptSuspend(ScriptName, SuspendOn)
{
    ; Get the HWND of the script's main window (which is usually hidden).
    dhw := A_DetectHiddenWindows
    DetectHiddenWindows On
    if scriptHWND := WinExist(ScriptName " ahk_class AutoHotkey")
    {
        ; This constant is defined in the AutoHotkey source code (resource.h):
        static ID_FILE_SUSPEND := 65404

        ; Get the menu bar.
        mainMenu := DllCall("GetMenu", "ptr", scriptHWND)
        ; Get the File menu.
        fileMenu := DllCall("GetSubMenu", "ptr", mainMenu, "int", 0)
        ; Get the state of the menu item.
        state := DllCall("GetMenuState", "ptr", fileMenu, "uint", ID_FILE_SUSPEND, "uint", 0)
        ; Get the checkmark flag.
        isSuspended := state >> 3 & 1
        ; Clean up.
        DllCall("CloseHandle", "ptr", fileMenu)
        DllCall("CloseHandle", "ptr", mainMenu)

        if (!SuspendOn != !isSuspended)
            SendMessage 0x111, ID_FILE_SUSPEND,,, ahk_id %scriptHWND%
        ; Otherwise, it's already in the right state.
    }
    DetectHiddenWindows %dhw%
}