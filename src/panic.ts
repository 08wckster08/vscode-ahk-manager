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

// export const OLDList_All_ScriptStates = (pipe: string) => `DetectHiddenWindows, On

// IsPaused( PID ) {
//   dhw := A_DetectHiddenWindows
//   DetectHiddenWindows, On  ; This line can be important!
//   hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
//   SendMessage, 0x211  ; WM_ENTERMENULOOP
//   SendMessage, 0x212  ; WM_EXITMENULOOP
//   DetectHiddenWindows, %dhw%
//   hMenu := DllCall("GetMenu", "uint", hWnd)
//   hMenu := DllCall("GetSubMenu", "uint", hMenu, "int", 0)
//   return (DllCall("GetMenuState", "uint", hMenu, "uint", 4, "uint", 0x400) & 0x8) != 0
// }

// WinGet, AHK, List, ahk_class AutoHotkey

// Result := "["
// Loop %AHK% {
//   WinGetTitle, Title, % "ahk_id " AHK%A_Index%
//   WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
//   If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
//        Continue

//   paused := IsPaused( PID ) == 0?"false":"true"
//   line = {"title":"%Title%", "Paused": %paused%, "pid":"%PID%"}
//   Result .= line . ","
// }
// Result := SubStr(Result,1,StrLen(Result)-1)
// Result .= "]"
// MsgBox, % Result

// CreateNamedPipe(Name, OpenMode=3, PipeMode=0, MaxInstances=255) {
//   global ptr
//   return DllCall("CreateNamedPipe","str",Name,"uint",OpenMode
//       ,"uint",PipeMode,"uint",MaxInstances,"uint",0,"uint",0,"uint",0,ptr,0,ptr)
// }

// pipe = CreateNamedPipe("${pipe}",2)
// if (pipe=-1) {
//   MsgBox CreateNamedPipe failed.
//   ExitApp
// }
// DllCall("ConnectNamedPipe", ptr, pipe, ptr, 0)
// if !DllCall("WriteFile", ptr, pipe, "str", Result, "uint", (StrLen(Result)+1)*char_size, "uint*", 0, ptr, 0)
//     MsgBox WriteFile failed: %ErrorLevel%/%A_LastError%

// DllCall("CloseHandle", ptr, pipe)
// `;

export const List_All_ScriptStates = (pipe: string) => `DetectHiddenWindows, On

IsPaused( PID ) {
  dhw := A_DetectHiddenWindows
  DetectHiddenWindows, On  ; This line can be important!
  hWnd := WinExist("ahk_class AutoHotkey ahk_pid " PID )
  SendMessage, 0x211  ; WM_ENTERMENULOOP
  SendMessage, 0x212  ; WM_EXITMENULOOP
  DetectHiddenWindows, %dhw%
  hMenu := DllCall("GetMenu", "uint", hWnd)
  hMenu := DllCall("GetSubMenu", "uint", hMenu, "int", 0)
  return (DllCall("GetMenuState", "uint", hMenu, "uint", 4, "uint", 0x400) & 0x8) != 0
}

WinGet, AHK, List, ahk_class AutoHotkey
MyPid := DllCall("GetCurrentProcessId")
Result := "["
Loop %AHK% {
  WinGetTitle, Title, % "ahk_id " AHK%A_Index%
  WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
  If ( PID = MyPid ) ; skip pause test for self
       Continue

  paused := IsPaused( PID ) == 0?"false":"true"
  line = {"title":"%Title%", "Paused": %paused%, "pid":"%PID%"}
  Result .= line . ","
}
Result := SubStr(Result,1,StrLen(Result)-1)
Result .= "]"
MsgBox, % Result

try{

  URL := "${pipe}/"
  HttpObj := ComObjCreate("WinHttp.WinHttpRequest.5.1")

  HttpObj.Open("POST", URL, 0)
  HttpObj.SetRequestHeader("Content-Type", "application/json")
  HttpObj.SetTimeouts("1000", "1000", "1000", "1000")

  ;// Body = {"version":0.1,"action": "toggle"}
  HttpObj.Send(Result)
  }
  Catch, e{
      MsgBox, e
  }
  Return
`;

