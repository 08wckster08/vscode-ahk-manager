export const PANIC_RAW_SCRIPT = `
    AHKPanic(Kill=0, Pause=0, Suspend=0, SelfToo=0) {
    DetectHiddenWindows, On
    WinGet, IDList ,List, ahk_class AutoHotkey
    Loop %IDList%
      {
      ID:=IDList%A_Index%
      WinGetTitle, ATitle, ahk_id %ID%
      IfNotInString, ATitle, %A_ScriptFullPath%
        {
        If Suspend
          PostMessage, 0x111, 65305,,, ahk_id %ID%  ; Suspend.
        If Pause
          PostMessage, 0x111, 65306,,, ahk_id %ID%  ; Pause.
        If Kill
          WinClose, ahk_id %ID% ;kill
        }
      }
    If SelfToo
      {
      If Suspend
        Suspend, Toggle  ; Suspend.
      If Pause
        Pause, Toggle, 1  ; Pause.
      If Kill
        ExitApp
      }
    }
    AHKPanic(1)
`;

export const Kill_Target_Raw_Script = (target: string) =>
  `AHKPanic_Kill(Target) {
    DetectHiddenWindows, On
    WinGet, IDList ,List, ahk_class AutoHotkey
    Loop %IDList%
      {
      ID:=IDList%A_Index%
      WinGetTitle, ATitle, ahk_id %ID%
      IfInString, ATitle, %Target%
        {
          WinClose, ahk_id %ID% ;kill
          ExitApp
        }
      }
    }
    AHKPanic_Kill("${target}")`;

export const List_All_ScriptStates = (pipe: string) => `DetectHiddenWindows, On

IsInState( PID, State ) {
  dhw := A_DetectHiddenWindows
  DetectHiddenWindows, On  ; This line can be important!
  hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
  SendMessage, 0x211  ; WM_ENTERMENULOOP
  SendMessage, 0x212  ; WM_EXITMENULOOP
  DetectHiddenWindows, %dhw%
  mainMenu := DllCall("GetMenu", "uint", hWnd)
  fileMenu := DllCall("GetSubMenu", "uint", mainMenu, "int", 0)
  state := DllCall("GetMenuState", "ptr", fileMenu, "uint", State, "uint", 0)
  isInState := state >> 3 & 1
  DllCall("CloseHandle", "ptr", fileMenu)
  DllCall("CloseHandle", "ptr", mainMenu)
  return isInState
}

WinGet, AHK, List, ahk_class AutoHotkey

Result := "["
Loop %AHK% {
  WinGetTitle, Title, % "ahk_id " AHK%A_Index%
  Title := StrReplace(Title,"\\","\\\\")
  UncompiledSignature =  - AutoHotkey v%A_AhkVersion%
  Title := StrReplace(Title,UncompiledSignature,"")
  WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
  If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
    Continue

  paused := IsInState( PID, 65403 ) == 0?"false":"true"
  suspended := IsInState( PID, 65404 ) == 0?"false":"true"
  line = {"title":"%Title%", "paused": %paused%, "suspended": %suspended%, "pid":"%PID%"}
  Result .= line . ","
}
Result := SubStr(Result,1,StrLen(Result)-1)
Result .= "]"
;MsgBox, % Result

pipe:= DllCall(
  (Join, Q C
    "CreateFile"                 ; http://goo.gl/3aJQg7
    "Str",  "${pipe}"            ; lpName
    "UInt", 0x40000000           ; iWrite
    "UInt", 0x1|0x2                    ; iShare
    "UInt",  0                    ;
    "UInt", 3                    ; iOpen
    "UInt", 0                    ; nInBufferSize
    "UInt",  0                    ; nDefaultTimeOut
  ))
  if(pipe = -1)
    MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(Result)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }
`;

export const GetKeyState = (pipe: string, key: string) => `

Result := GetKeyState("${key}")

pipe:= DllCall(
  (Join, Q C
    "CreateFile"                 ; http://goo.gl/3aJQg7
    "Str",  "${pipe}"            ; lpName
    "UInt", 0x40000000           ; iWrite
    "UInt", 0x1|0x2                    ; iShare
    "UInt",  0                    ;
    "UInt", 3                    ; iOpen
    "UInt", 0                    ; nInBufferSize
    "UInt",  0                    ; nDefaultTimeOut
  ))
  if(pipe = -1)
    MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(Result)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }
`;


export const SetScriptPausedState=(pid: string, turnOn: boolean)=> SetScriptState(pid,turnOn,"65403");
export const SetScriptSuspendedState=(pid: string, turnOn: boolean)=> SetScriptState(pid,turnOn,"65404");

const SetScriptState = (pid: string, turnOn: boolean, consideredState: string) => `DetectHiddenWindows, On

IsInState( PID, State ) {
  dhw := A_DetectHiddenWindows
  DetectHiddenWindows, On  ; This line can be important!
  hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
  SendMessage, 0x211  ; WM_ENTERMENULOOP
  SendMessage, 0x212  ; WM_EXITMENULOOP
  DetectHiddenWindows, %dhw%
  mainMenu := DllCall("GetMenu", "uint", hWnd)
  fileMenu := DllCall("GetSubMenu", "uint", mainMenu, "int", 0)
  state := DllCall("GetMenuState", "ptr", fileMenu, "uint", State, "uint", 0)
  isInState := state >> 3 & 1
  DllCall("CloseHandle", "ptr", fileMenu)
  DllCall("CloseHandle", "ptr", mainMenu)
  return isInState
}

  PID = ${pid}
  state := IsInState( PID, ${consideredState} ) == ${turnOn}

  if(!state)
    SendMessage 0x111, ${consideredState},,, ahk_pid %PID%
`;