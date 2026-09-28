```
    ____           ZH,                          ,HZ
   / __ )___  ____/ /_______  ________  __     /  /
  / __  / _ \/ __  / ___/ _ \/ ___/ / / /    /  /
 / /_/ /  __/ /_/ / /  /  __/ /__/ /_/ /    /  /
/_____/\___/\__,_/_/   \___/\___/\__,_/    /__/
   ______
  / ____/____ _____  ____ ________  __       ____  ______ _____ ______  __
 / /   / __ `/ __ \/ __ `/ ___/ / / /      / __ \/ __ `/ ___// __ \/ / / /
/ /___/ /_/ / / / / /_/ / /  / /_/ /      / /_/ / /_/ / /   / /_/ / /_/ /
\____/\__,_/_/ /_/\__,_/_/   \__, /      / .___/\__,_/_/   / .___/\__, /
                             /____/      /_/              /_/    /____/
                                 [ BETA ]
```

# Bedrock Canary (`.bdc`) 🚀

**Bedrock Canary** is a modern, ultra-intuitive programming language designed from the ground up to make building **Web Apps** and **Mobile Apps** simple, declarative, and fast.

Files written in Bedrock Canary use the **`.bdc`** file extension.

---

## 🌟 Features & Highlights

- **Unified Web & Mobile Target**: Write your UI and state once in `.bdc` and compile seamlessly for web browsers or mobile devices.
- **Intuitive Language Syntax**: Natural syntax for defining application components (`Screen`, `Stack`, `Row`, `Card`, `Button`, `Text`).
- **Reactive State Management**: Simple `State` variables and `Action` handlers with built-in reactive updates.
- **Built-in Interactive Playground**: Launch the interactive Welcome portal to edit and preview `.bdc` code live in real-time.
- **Single Executable Toolchain**: Simple `bdc` CLI tool for running, building, and serving projects.

---

## 📦 Installation & Quickstart

### Prerequisites
- Node.js (v18+)

### Running Bedrock Canary CLI

You can execute `.bdc` files using the `bdc` command line tool:

```bash
# Launch the interactive Welcome & Thanks for Installing website
node bin/bdc.js welcome

# Compile a .bdc file to production web/mobile target
node bin/bdc.js build examples/hello.bdc

# Run a .bdc app on a local live dev server
node bin/bdc.js run examples/counter.bdc
```

---

## 📄 File Format: `.bdc`

All Bedrock Canary source files use the **`.bdc`** extension (e.g. `app.bdc`, `counter.bdc`, `todo.bdc`).

### Basic `.bdc` Example Syntax

```bdc
# ==========================================
# Bedrock Canary Sample App
# File extension: .bdc
# ==========================================

App MyFirstApp {
  theme: "dark"
}

State count = 0

Action increment {
  set count = count + 1
}

Screen MainScreen("Interactive Counter") {
  Card {
    Text("Current Count: {count}")
    Stack {
      Button("+ Increment Count") on click => increment
    }
  }
}
```

---

## 🛠️ Language Reference

### 1. Application Definition
```bdc
App AppName {
  theme: "dark"
}
```

### 2. State & Reactive Data
Declare reactive state variables using `State`:
```bdc
State score = 100
State user = "Alex"
```

### 3. Actions & Event Handlers
Define state mutations and screen transitions with `Action`:
```bdc
Action resetScore {
  set score = 0
}

Action goToDashboard {
  navigate Dashboard
}
```

### 4. Screens & Layout UI Components
- **`Screen Name("Title")`**: Defines a view screen.
- **`Stack`**: Vertical layout container.
- **`Row`**: Horizontal layout container.
- **`Card`**: Styled container card.
- **`Text("Content")`**: Displays text with state interpolation (`{variable}`).
- **`Button("Label") on click => actionName`**: Interactive button.

---

## 🎨 Interactive Welcome & Playground Website

Bedrock Canary includes a full **Welcome / Thanks for Installing** web experience!

To launch it locally:
```bash
node bin/bdc.js welcome
```
This opens the onboard portal featuring:
- Live interactive `.bdc` code editor & compiler.
- Real-time mobile phone frame viewport and web layout preview.
- Syntax cheatsheet and downloadable sample `.bdc` projects.

---

## 📄 License
MIT License. Created for Bedrock Canary developers worldwide.
