/*
https://autohotkey.com/board/topic/55766-script-auto-formatter-very-basic-beginner-script/
https://autohotkey.com/board/topic/7169-auto-syntax-tidy-v12/
Copy a piece of code to the Clipboard.  The hotkey will reformat the code and paste it into any editor you have selected (sends Ctrl-v to the editor).

This script basically just determines proper line indentation by counting the number of open and closed braces encountered ("{").  However, it does a few other things, such as properly ignoring comments; there's also a little support for one-line indentation for if and loop statements, without the braces.
*/

; Indent(ol) will allow us to indent a line if the previous line was an if or loop, even without braces.

Indent(ol) {
    ol .= "`n"
    return Regexmatch(ol, "if\(|loop,|(if|loop)\s") = 1
}
; LastChar(str) will return the last non-whitespace character of a string excluding any comment
; The idea is that if that character is a brace, then the following lines should be indented.

LastChar(str) {
str .= "`n"
return Substr(str, RegExMatch(str, "\S\s*(;|`n)") , 1)
}

skip = 0              ; skip is used to skip comments -- 0 means we are not currently in a comment section of code
dp = 0                ; how far to indent, in increments of 5 spaces
out := ""             ; out will ultimately hold the reformatted code
c := Clipboard
nows := ""            ; nows is a line of code with the white space removed
oe := ""              ; oe keeps track of the ending of the previous line, excluding white space and comments
loop, Parse, c, `n
{
    ol := nows
    oe := ne
    pos := RegExMatch(A_LoopField, "\S")
    nows := Substr(A_LoopField, pos)
    ne := LastChar(nows)
    if(InStr(nows, "/*") = 1)
    {
        skip = 1
    }
    if(skip)
        out .= A_LoopField . "`n"
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
        out := out . nows . "`n"                                     ; the line is now formatted
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

Clipboard := out                    ; Clipboard has the reformatted code
;Send ^v                             ; paste reformatted code
return
