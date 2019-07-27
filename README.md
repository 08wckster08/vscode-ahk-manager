# AutoHotkey Manager

**Welcome** to my third [Extension](https://marketplace.visualstudio.com/items?itemName=Denis-net.vscode-ahk-manager) !

> Sometimes, the best thing to do is do nothing at all, or do some steps back until a better solution will came on the road. So I have disabled the shortcuts by default.\
You can add your own combinations. (If you need the old ones scroll down to the Know Issues section, you'll find the old combinations and you could override them as you like.)

![manager](https://raw.githubusercontent.com/Denis-net/vscode-ahk-manager/master/media/vs-ahk-manager.gif)

Inspired by the [Sublime plug-In](https://github.com/ahkscript/SublimeAutoHotkey),
this is the Yin of the [AutoHotkey extension](https://github.com/stef-levesque/vscode-autohotkey) !

## Why

_I like to write AutoHotkey scripts, this language is amazing, but I often found myself go back and forth between writing an app, looking for it in my messy tray, reloading it, testing it, grab the browser and tuning it again. So I decided to improve my tools and add the capabiliy to just reload a script through a command and/or a button._

## Features

This extension manages for every script Meta-data, that will persist among vscode startups :

| Metadata             | Default value  | Command               |
| -------------------- | -------------- | --------------------- |
| Compiled Destination | scriptname.exe | `ahk.compile`         |
| Script Arguments     | n/d            | `ahk.set-script-args` |
| Icon Path            | scriptname.ico | `ahk.set-icon`        |
| Tray Icon Path       | n/d            | `ahk.set-tray-icon`   |

With this extension you can cut off the development time using handy commands:

* **Run** the script without compile it
  * Set command line arguments for scripts, with ("`Ctrl`+`A` `Ctrl`+`G`") (they will be remembered among startups)
![manager](https://raw.githubusercontent.com/Denis-net/vscode-ahk-manager/master/media/vs-ahk-manager-run-args.gif)
* **Compile** in the script's folder by default
  * Change compile destination on the fly with **Compile As** (it will be remembered among startups)
![manager](https://raw.githubusercontent.com/Denis-net/vscode-ahk-manager/master/media/vs-ahk-manager-compile-as.gif)
  * **Run Compiled** scripts
* **Kill** the script and the compiled exe with ease
* Tired of typing ? use buttons instead ! 😉
* Just want to test simple script parts ? select some text and **Run Buffered**
* If you put an icon with the same name of the `script.ahk` (so named `script.ico`) the icon will be used by the compiler.
  * Otherwise with the command `ahk.set-icon` an icon will be picked up instead of the default
* Using "`Ctrl`+`A` `Ctrl`+`D`" you can consult the docs
  * if you have a selection you will be automatically redirect on google.
* You can launch the ahk spy window with "`Ctrl`+`A` `Ctrl`+`S`"
* Chose an icon with "`Ctrl`+`A` `Ctrl+I`"
* Insert a tray icon with "`Ctrl`+`A` `Ctrl+T`"
  * subsequent call will update the TrayIcon value

![manager](https://raw.githubusercontent.com/Denis-net/vscode-ahk-manager/master/media/vs-ahk-manager-change-Icon.gif)
* You can temporary switch executable on the fly with the `ahk.temporary-switch-executable` command
* Initialize an empty ahk script with the default snippet
  * Or define another one.
* [Experimental] an experimental formatter has been added so you could format a little bit the code (it use this [simple ahk script](https://autohotkey.com/board/topic/55766-script-auto-formatter-very-basic-beginner-script/))
* With `Ctrl`+`Shift`+`A` grab the script manager viewer and check ahk scripts' states

![manager](https://raw.githubusercontent.com/Denis-net/vscode-ahk-manager/master/media/vs-ahk-manager-manager.gif)
  * You can also interact with them :
    * Pause/Unpause
    * Suspend/Unsuspend
    * Kill
    * Click on name for reveal it in explorer
    * Click on (holding `Ctrl`) for open the containing folder in a new VSCode instance

## Requirements

* The almighty [VS Code](https://code.visualstudio.com/)
* The powerful [AutoHotkey](https://www.autohotkey.com/)
* A deep understanding of the marvellous things you could do with the ahk language
* [AutoHotkey extension](https://github.com/stef-levesque/vscode-autohotkey)... yeah it's not a requirement: it's a must ! 😉
  * [AutoHotkey Plus](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus) have an intresting formatter
    * You can disable mine through *`ahk.format` = false*

## Extension Settings

![manager](https://raw.githubusercontent.com/Denis-net/vscode-ahk-manager/master/media/vs-ahk-manager-settings.gif)

This extension contributes the following settings:

* `ahk.onSearch.targetBrowser`: choose the right browser for performing your searches.
  * see [open](https://github.com/sindresorhus/open) for the right syntax (this is the **option** object)
* `ahk.onSearch.queryTemplate`: *with better question you'll get better answers*.
* `ahk.onSave.compile` and `ahk.onSave.run` could be helpfull
  * `ahk.onArgs.run` allow script to run as soon as you specify cmd line arguments (`Ctrl`+`A` `Ctrl`+`G`)
* `ahk.onEmpty.overrideHeaderSnippet` to override the snippet used for initializing empty ahk files
* `ahk.scriptFolders.openInNewInstance` specify, when `Ctrl`+`Clic` on a treeItem, the behaviour to open the script/exe's folder in VSCode
* `ahk.format.enabled` for disabling the formatter

> Note: maybe you'll have to set the `executableFullPath` setting in order to make this extension working with AHK.

## Known Issues

* Icons aren't great (you could hide buttons if you don't like them, you'll still be able to invoke commands through the command palette)
* Side effect of the Shortcuts starting with `Ctrl`+`A` : the _select all_ don't get triggered, so I added this workaround : `Ctrl+A Ctrl+A` for selecting all text in .ahk files ... could still be awkward... you could think about better shorcut combinations and adjust them manually for getting the `Ctrl+A` working normally again.
  * [Matt Bicket](https://github.com/poer-dev) was right, an extension must not interfere with the default text editor shortcuts. So I disabled the shortcuts. If you want them again, just open `workbench.action.openGlobalKeybindings`, view the code, copy/paste the list below

``` JSON

{
				"command": "ahk.compile",
				"key": "ctrl+shift+b",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.compile-as",
				"key": "ctrl+a ctrl+c",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.spy",
				"key": "ctrl+a ctrl+s",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.run",
				"key": "ctrl+a ctrl+r",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.run-compiled",
				"key": "ctrl+a ctrl+shift+r",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.run-buffer",
				"key": "ctrl+a ctrl+b",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.kill",
				"key": "ctrl+a ctrl+k",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.docs",
				"key": "ctrl+a ctrl+d",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.set-tray-icon",
				"key": "ctrl+a ctrl+t",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.set-icon",
				"key": "ctrl+a ctrl+i",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "ahk.set-script-arguments",
				"key": "ctrl+a ctrl+g",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "editor.action.selectAll",
				"key": "ctrl+a ctrl+a",
				"when": "resourceLangId == ahk && editorTextFocus"
			},
			{
				"command": "workbench.view.extension.ahk-manager",
				"key": "ctrl+shift+a",
				"when": "resourceLangId == ahk && editorTextFocus"
			}
```


## Further Updates

* [ ] debugger
* [ ] improve icons and images
* [ ] improve code
  * [ ] comments
* [ ] formatter ?
* [ ] remember launched scripts from history so you could also launch them from an ahk.manager secondary treeview (like extension treeviews)
* [X] better offline docs
  * [X] [dedicated browser](https://github.com/Denis-net/AutoHotkeyBrowser)
    * [X] integration with the dedicated browser
  * [X] improve line parsing

> This is just a preview, but I think that is good enough to be considered usable.

May you **Enjoy** with this extension and craft amazing scripts with it !
