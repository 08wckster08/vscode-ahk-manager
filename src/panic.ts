export const PANIC_RAW_SCRIPT = `
    AHKPanic(Kill=0, Pause=0, Suspend=0, SelfToo=0) {
    DetectHiddenWindows, On
    WinGet, IDList ,List, ahk_class AutoHotkey
    Loop %IDList%
      {
      ID:=IDList%A_Index%
      WinGet, PID, PID,   % "ahk_id " ID
      If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
        Continue
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
      WinGet, PID, PID,   % "ahk_id " ID
      If ( PID = DllCall("GetCurrentProcessId") ) ; skip pause test for self
        Continue
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


export const SetScriptPausedState = (pid: string, turnOn: boolean) => SetScriptState(pid, turnOn, "65403");
export const SetScriptSuspendedState = (pid: string, turnOn: boolean) => SetScriptState(pid, turnOn, "65404");

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

export const FormatText = (pipe: string) => `/*
https://autohotkey.com/board/topic/55766-script-auto-formatter-very-basic-beginner-script/
https://autohotkey.com/board/topic/7169-auto-syntax-tidy-v12/
Copy a piece of code to the Clipboard.  The hotkey will reformat the code and paste it into any editor you have selected (sends Ctrl-v to the editor).

This script basically just determines proper line indentation by counting the number of open and closed braces encountered ("{").  However, it does a few other things, such as properly ignoring comments; there's also a little support for one-line indentation for if and loop statements, without the braces.
*/

; Indent(ol) will allow us to indent a line if the previous line was an if or loop, even without braces.

Indent(ol) {
    ol .= "\`n"
    return Regexmatch(ol, "if\\(|loop,|(if|loop)\\s") = 1
}
; LastChar(str) will return the last non-whitespace character of a string excluding any comment
; The idea is that if that character is a brace, then the following lines should be indented.

LastChar(str) {
str .= "\`n"
return Substr(str, RegExMatch(str, "\\S\\s*(;|\`n)") , 1)
}

skip = 0              ; skip is used to skip comments -- 0 means we are not currently in a comment section of code
dp = 0                ; how far to indent, in increments of 5 spaces
out := ""             ; out will ultimately hold the reformatted code
c := Clipboard
nows := ""            ; nows is a line of code with the white space removed
oe := ""              ; oe keeps track of the ending of the previous line, excluding white space and comments
loop, Parse, c, \`n
{
    ol := nows
    oe := ne
    pos := RegExMatch(A_LoopField, "\\S")
    nows := Substr(A_LoopField, pos)
    ne := LastChar(nows)
    if(InStr(nows, "/*") = 1)
    {
        skip = 1
    }
    if(skip)
        out .= A_LoopField . "\`n"
    if(!skip)
    {
        if(Substr(nows, 1, 1) = "}")                                ; reduce indentation after } encountered
        {
            dp--
        }
        if(Indent(ol) and Substr(nows, 1, 1) != "{" and oe != "{")  ; primitive one-line indentation for loop and if statements
            out := out . "     "
        loop %dp%                                                    ; silly loop to indent
        {
            out := out . "     "
        }
        out := out . nows . "\`n"                                     ; the line is now formatted
        if(Substr(nows, 1 , 1) = "{" or ne = "{")                    ; increase indentation of folowing lines due to { encountered
        {
            dp++
        }
    }
    if(InStr(nows, "*/") = 1)                                        ; comment block over -- now script will begin processing again
    {
        skip = 0
    }
}

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
    f.Write(out)
    f.Close(), DllCall("CloseHandle", "Ptr", pipe)
  }

;Clipboard := out                    ; Clipboard has the reformatted code
;Send ^v                             ; paste reformatted code
return
`;

// export const PerformOfflineDocsSearch = (docPath: string, command:string) => `
// DetectHiddenWindows, On
// WinGet, IDList ,List, AutoHotkey Help

// id=-1
// Loop %IDList%
// {
//     IDk:=IDList%A_Index%
//     if(id == -1)
//         id := IDk
//     else{
//           WinClose, ahk_id %ID%
//           WinWaitClose, ahk_id %IDk% ;kill
//         }
// }

// pid = -1
// if(id != -1){
//   WinGet, PID, pid,   % "ahk_id " id
// }
// if(pid == -1){
//   Run ${docPath},,,pid
//   WinWait ahk_pid %pid%
// }
// else{
//   WinRestore, ahk_pid %pid%
//   WinActivate, ahk_pid %pid%
//   WinWaitActive, ahk_pid %pid%
// }
// ;Sleep, 1000
// ;MsgBox, hey
// C_Cmd = ${command}
// StringReplace, C_Cmd, C_Cmd, #, {#}
// Send, !n{home}+{end}%C_Cmd%{enter}
// Sleep, 1000
// Send, #{right}
// Sleep, 800
// Send, {Enter}
// `;

export const PerformOfflineDocsSearch = (docPath: string, command: string) => `
DetectHiddenWindows, On
WinGet, IDList ,List, AutoHotkey Help

Loop %IDList%
{
    IDk:=IDList%A_Index%
    WinClose, ahk_id %IDk% ;kill
    WinWaitClose, ahk_id %IDk% ;kill
}

Run ${docPath},,,pid
WinWait ahk_pid %pid%

;Sleep, 1000
;MsgBox, hey
C_Cmd = ${command}
StringReplace, C_Cmd, C_Cmd, #, {#}
Send, !n{home}+{end}%C_Cmd%{enter}
Sleep, 1000
Send, #{right}
Sleep, 800
Send, {Enter}`;