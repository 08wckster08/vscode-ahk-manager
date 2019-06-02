;
; AutoHotkey Version: 1.x
; Language:       English
; Platform:       Win9x/NT
;
; Script Function: Allow for file operations similar to phython.
;


; Options
GENERIC_WRITE = 0x40000000  ; Open the file for writing
GENERIC_READ = 0x80000000  ; Open the file for reading

OPEN_EXISTING = 3  ; This mode indicates that the file to be opened must already exist.
CREATE_ALWAYS = 2  ; Create new file (overwriting any existing file).

FILE_SHARE_READ = 0x1 ; This and the next are whether other processes can open the file while we have it open.
FILE_SHARE_WRITE = 0x2


; Opens a file: Users should check to see if the handle was actually created themselves
fopen(strFileName, strFileOptions = "") ; default option should be "r", but we can't do it
{
  global GENERIC_WRITE, GENERIC_READ, OPEN_EXISTING, CREATE_ALWAYS, FILE_SHARE_READ, FILE_SHARE_WRITE

  if strFileName =
    return

  ; make the default option "r"
  if strFileOptions =
    strFileOptions := "r"

  ; Valid options for strFileOptions are "a", "r", "w" currently.  b and + options might be added later
  if (strFileOptions == "r")
  {
    iReadWrite := GENERIC_READ
    iShare := FILE_SHARE_READ|FILE_SHARE_WRITE
    iOpen := OPEN_EXISTING
  }
  else if (strFileOptions == "w")
  {
    iReadWrite := GENERIC_WRITE
    iShare := FILE_SHARE_READ|FILE_SHARE_WRITE
    iOpen := CREATE_ALWAYS
  }
  else if (strFileOptions == "a")
  {
    iReadWrite := GENERIC_WRITE
    iShare := FILE_SHARE_READ|FILE_SHARE_WRITE
    iOpen := OPEN_EXISTING
  }
  else
  {
    Msgbox, 0, fopen error!, `"%strFileOptions%`" is an invalid fopen option!`nOptions can only be: "a", "r", and "w" ;, "ab", "rb", and "wb"
    Return
  }

  hFileHandle := DllCall("CreateFile", str, strFileName, UInt, iReadWrite, UInt, iShare, UInt, 0, UInt, iOpen, Uint, 0, UInt, 0)
  Return hFileHandle
}

; Writes a line to file
fwrite(hFileHandle, strWrite)
{
  DllCall("WriteFile", UInt, hFileHandle, str, strWrite, UInt, StrLen(strWrite), UIntP, BytesActuallyWritten, UInt, 0)
}

; Reads a line from a file
freadline()
{

}

; Closes a file
fclose(hFileHandle)
{
  DllCall("CloseHandle", UInt, hFileHandle)  ; Close the file.
}