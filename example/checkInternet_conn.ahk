;Should be compatible with Win XP or higher, 32/64 bit, Unicode or ANSI, latest version.
IsInternetConnected()
{
  static sz := A_IsUnicode ? 408 : 204, addrToStr := "Ws2_32\WSAAddressToString" (A_IsUnicode ? "W" : "A")
  VarSetCapacity(wsaData, 408)
  if DllCall("Ws2_32\WSAStartup", "UShort", 0x0202, "Ptr", &wsaData)
    return false
  if DllCall("Ws2_32\GetAddrInfoW", "wstr", "dns.msftncsi.com", "wstr", "http", "ptr", 0, "ptr*", results)
  {
    DllCall("Ws2_32\WSACleanup")
    return false
  }
  ai_family := NumGet(results+4, 0, "int")    ;address family (ipv4 or ipv6)
  ai_addr := Numget(results+16, 2*A_PtrSize, "ptr")   ;binary ip address
  ai_addrlen := Numget(results+16, 0, "ptr")   ;length of ip
  DllCall(addrToStr, "ptr", ai_addr, "uint", ai_addrlen, "ptr", 0, "str", wsaData, "uint*", 204)
  DllCall("Ws2_32\FreeAddrInfoW", "ptr", results)
  DllCall("Ws2_32\WSACleanup")
  http := ComObjCreate("WinHttp.WinHttpRequest.5.1")

  if (ai_family = 2 && wsaData = "131.107.255.255:80")
  {
    http.Open("GET", "http://www.msftncsi.com/ncsi.txt")
  }
  else if (ai_family = 23 && wsaData = "[fd3e:4f5a:5b81::1]:80")
  {
    http.Open("GET", "http://ipv6.msftncsi.com/ncsi.txt")
  }
  else
  {
    return false
  }
  http.Send()
  return (http.ResponseText = "Microsoft NCSI") ;ncsi.txt will contain exactly this text
}