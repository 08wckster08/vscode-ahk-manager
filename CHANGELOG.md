# Change Log

All notable changes to the "vscode-ahk-manager" extension will be documented in this file.

## 0.0.6

* Now the html doc works.

## 0.0.5

* BugFix: with `ahk.OnSave.Run` and `ahk.OnSave.Compile` and a click of a button scripts get executed twice.
* Renamed `ahk.onSearch.useAlwaysOfflineDocs` to `ahk.docsStyle`
  * `ahk.docsStyle` could be set:
    * online : for browser searches
    * chm: a chm will be opened and an automatic search will be performed
    * html: a dedicated browser window, which allow a custom theme to be defined (use `ahk.paste-default-docs-style`)
* Preview : the offline docs can be filtered when `ahk.onSearch.docsStyle` is set to `chm` and editor has selection.
  * the docs will be aligned to the rigth side

## 0.0.4

* BugFix: `ahk.kill` command may kill itself before killing other scripts...
* Added `ahk.onSearch.useAlwaysOfflineDocs` (currently works only with no selected text)
* Improved the `ahk.run-buffer` command UI experience
* `ahk.run`,`ahk.compile` and `ahk.run-buffer` will save dirty script before operations
* Found an intresting way of showing the offline docs

## 0.0.3

Improved the `ahk.kill` command: now it affects run-piped scripts too.
(Thanks to [bugrobot](https://github.com/bugrobot) for having pointed this out to me).

## 0.0.2

Initial release of this extension.
