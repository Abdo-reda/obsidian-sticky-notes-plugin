# Sticky Notes Plugin

This is a simple plugin that essentially builds on the popout functionality of obsidian. **_It adds a new popout window that resembles sticky notes_** that haves a much simpler look and adds a pin functionality. 

You can open this popout window using the ribbon action, command, or context menus.

## Demo

![Demo Video](https://github.com/Abdo-reda/obsidian-sticky-notes-plugin/blob/main/assets/demo.gif?raw=true)

## Possible Issues & Limitations.

- Windows (sticky note windows) don't close themselves when obsidian shutsdown, and unfortunely reopen as normal popups when obsidian restarts. (hopefully can be fixed in a future release.)

- There is no Color Settings yet:
    - **Sticky Note default color:** `Yellow color (250, 240, 208)`

- The plugin relies on `@electorn/remote` to work, as the pin functionality and resizing require access to the node/main process apis. This is not the recommended approach, but the only one that worked with me after some research.

- The plugin relies on customizing certain obsidian elements (like the titlebar) and relies on their classes, there is _**no guarentee that this will continue working in future releases of obsidian**_ (if they ever decided to rename their classes for example).

## Installation

- Go to [latest release](https://github.com/Abdo-reda/obsidian-sticky-notes-plugin/releases/latest).
- Download the `sticky-notes.zip` file and extract it inside of your obsidian vault plugins folder `<vault>\.obsidian\plugins`.
- Reload obsidian and make sure to enable the plugin in the `community plugins` section in vault settings.

> [!WARNING]  
> Make sure to copy and backup your obsidian notes. This is a just a precaution, the plugin hopefully should be totally safe and no issues have been reported so far.

## Version Workflow

**Creating a Release**
- Bump Vesrion `node version-bump.mjs <version>`
- Push Code.
- Create Tag:
    - `git tag -a <version> -m "<version>"`
    - `git push origin <version>`
- Edit and Publish Release Notes on Github.


## ENHANCEMENTS
- Add Support for different settings.
    - memorize sticky ntoes
- Fix the bug where sticky notes don't reopen as sticky notes. (close them before obsidian closes, and memorize them in local storage maybe)
    //add settings for remember sticky notes