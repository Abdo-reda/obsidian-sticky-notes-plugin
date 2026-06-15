# Sticky Notes Plugin

A simple plugin that builds on top of the existing popout functionality of obsidian. **_By adding a new popout window that resembles sticky notes_**. They have a much cleaner look, a pin functionality and color options. 

You can open a sticky note window using the ribbon action, command, or context menus.


## Demo

![Demo Video](https://github.com/Abdo-reda/obsidian-sticky-notes-plugin/blob/main/assets/demo.gif?raw=true)


## Installation

- Go to [latest release](https://github.com/Abdo-reda/obsidian-sticky-notes-plugin/releases/latest).
- Download the `sticky-notes.zip` file and extract it inside of your obsidian vault plugins folder `<vault>\.obsidian\plugins`.
- Reload obsidian and make sure to enable the plugin in the `community plugins` section in vault settings.

> [!WARNING]  
> Make sure to copy and backup your obsidian notes. This is a just a precaution, the plugin hopefully should be totally safe and no issues have been reported so far.


## Possible Issues & Limitations.

- Windows (sticky note windows) don't close themselves when obsidian shutsdown, and unfortunely reopen as normal popups when obsidian restarts. (hopefully can be fixed in a future release.)

- The plugin relies on `@electorn/remote` to work, as the pin functionality and resizing require access to the node/main process apis. This is not the recommended approach, but the only one that worked with me after some research.

- The plugin relies on customizing certain obsidian elements (like the titlebar) and relies on their classes, there is _**no guarentee that this will continue working in future releases of obsidian**_ (if they ever decided to rename their classes for example).


## Development

**Creating a Release**
- Bump Vesrion `node version-bump.mjs <version>`
- Push Code.
- Create Tag:
    - `git tag -a <version> -m "<version>"`
    - `git push origin <version>`
- Edit and Publish Release Notes on Github.


