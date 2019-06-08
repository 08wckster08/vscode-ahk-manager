# vscode-ahk-manager README

Welcome to my third Extension !

Inspired by the [Sublime plug-In](https://github.com/ahkscript/SublimeAutoHotkey),
its the Yin of the [AutoHotkey extension](https://github.com/stef-levesque/vscode-autohotkey).

I like to write AutoHotkey scripts, this language is amazing, but I often found myself go back and forth between writing an app, looking for it in my messy tray, reloading it, testing it, grab the browser and tuning it again. So I decided to improve my tools and add the capabiliy to just reload a script through a command and/or a button.

## Features

With this extension you can cut off the development time using handy commands.

* If you put an icon with the same name of the `script.ahk` (so `script.ico`) the icon will be used by the compiler.
* Using `Ctrl`+`A` `Ctrl`+`D` you can consult the docs
  * if you have a selection you could search about it on google.
* [Sperimental] an experimental formatter has been added so you could format a little bit the code (use a simple ahk script)
* Set Script's command line arguments per script

> WARNING : This app could cause serious addictions !!! 😜

## Requirements

* The almighty vs-code
* The powerful [AutoHotkey](https://www.autohotkey.com/)
* A deep understanding of the marvellous things you could do with the ahk language
* [AutoHotkey extension](https://github.com/stef-levesque/vscode-autohotkey)... yeah it's not a requirement: it's a must ! 😉

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `ahk.onSearch.targetBrowser`: choose the right browser for performing your searches.
  * see [open](https://github.com/sindresorhus/open) for the right syntax (this is the **option** object)
* `ahk.onSearch.queryTemplate`: *with better question you'll get better answers*.

> Note: maybe you'll have to set the `executableFullPath` in order to make this extension working with AHK.

## Known Issues

* Calling out known issues can help limit users opening duplicate issues against your extension.
* Icons aren't great (you could hide buttons if you don't like them, you'll still able to invoke commands through the command palette)
* I will forget the compiled destinations among vscode instances
* Side effect of the Shortcut : the select all don't get triggered, so I added a workaround : `Ctrl+A Ctrl+A` for selecting all text in .ahk files ... could still be awkward... you could think about better shorcut combinations and adjust them manually for getting the `Ctrl+A` working normally again.

## Further Updates

[X] running scripts treelist
    [] improve icons
[] debugger
[X] if editorHasSelection search on internet for it when `Ctrl+A Ctrl+D`
[] saved compiled destinations for scripts (maybe in settings.)
[] improve icons
[] improve code

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of this extension

**Enjoy!**
