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

Result := "["
Loop %AHK% {
  WinGetTitle, Title, % "ahk_id " AHK%A_Index%
  WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
  If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
       Continue

  paused := IsPaused( PID ) == 0?"false":"true"
  line = {"title":"%Title%", "Paused": %paused%, "pid":"%PID%"}
  Result .= line . ","
}
Result := SubStr(Result,1,StrLen(Result)-1)
Result .= "]"
MsgBox, % Result

CallNamedPipe(Name,InBuffer,InBufferSize,OutBuffer,OutBufferSize,ByRef BytesRead,TimeOut=1000){
  return DllCall("CallNamedPipe","str",Name,"Ptr",InBuffer
      ,"uint",InBufferSize,"Ptr",OutBuffer,"uint",OutBufferSize,"Ptr",BytesRead,"uint",TimeOut)
}

char_size := (A_IsUnicode ? 2:1)
OutBuffer := []
VarSetCapacity(OutBuffer, 4096, 0)
OutBufferSize = 4096
Recv = 0

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

  ;RLen :=StrLen(Result)
  ;DllCall("WriteFile", UInt, pipe, str, Result, UInt, RLen, UIntP, ;BytesActuallyWritten, UInt, 0)
  ; if(BytesActuallyWritten != RLen)
  ;  MsgBox WriteFile failed: %ErrorLevel%/%A_LastError% ;%BytesActuallyWritten% %RLen%
  ;DllCall("CloseHandle", "Ptr", pipe)

  if (f := FileOpen(pipe, "h", UTF-8))
  {
    f.Write(Result)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }
`;

// export const OldList_All_ScriptStates = (pipe: string) => `DetectHiddenWindows, On

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
// MyPid := DllCall("GetCurrentProcessId")
// Result := "["
// Loop %AHK% {
//   WinGetTitle, Title, % "ahk_id " AHK%A_Index%
//   WinGet, PID, PID,   % "ahk_id " AHK%A_Index%
//   If ( PID = MyPid ) ; skip pause test for self
//        Continue

//   paused := IsPaused( PID ) == 0?"false":"true"
//   line = {"title":"%Title%", "Paused": %paused%, "pid":"%PID%"}
//   Result .= line . ","
// }
// Result := SubStr(Result,1,StrLen(Result)-1)
// Result .= "]"
// MsgBox, % Result

// try{

//   URL := "${pipe}/"
//   HttpObj := ComObjCreate("WinHttp.WinHttpRequest.5.1")

//   HttpObj.Open("POST", URL, 0)
//   HttpObj.SetRequestHeader("Content-Type", "application/json")
//   HttpObj.SetTimeouts("1000", "1000", "1000", "1000")

//   ;// Body = {"version":0.1,"action": "toggle"}
//   HttpObj.Send(Result)
//   }
//   Catch, e{
//       MsgBox, e
//   }
//   Return
// `;

