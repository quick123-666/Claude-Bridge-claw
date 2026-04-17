# Claude-Bridge-claw

> 让 OpenClaw 能够安装和使用 Claude Code 插件的兼容层

[![npm version](https://badge.fury.io/js/claude-bridge-claw.svg)](https://badge.fury.io/js/claude-bridge-claw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Claude-Bridge-claw 是一个兼容层工具，可以让 OpenClaw 安装和使用 Claude Code 插件。由于 OpenClaw 和 Claude Code 的架构和 API 不同，Claude Code 插件无法直接在 OpenClaw 中运行。Claude-Bridge-claw 通过扫描、转换和适配，让这一成为可能。

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Claude Code Plugin                          │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │commands │  │ skills  │  │ agents  │  │  hooks  │      │
│  │  *.js   │  │  *.md   │  │ *.json  │  │  *.js   │      │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │
└───────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Claude-Bridge-claw                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Scanner: Parse plugin directory structure          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Converter: Transform commands → tools              │   │
│  │             Transform skills → prompts              │   │
│  │             Transform agents → agents               │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Plugin                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  openclaw.plugin.json                               │   │
│  │  package.json                                       │   │
│  │  index.js (registerTools)                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Clone the repository
git clone https://github.com/traebuddy/claude-bridge-claw.git
cd claude-bridge-claw

# Install dependencies
npm install

# Or install globally
npm install -g claude-bridge-claw
```

## Quick Start

```bash
# Scan Claude Code plugins
claude-bridge-claw scan

# Adapt a specific plugin
claude-bridge-claw adapt my-plugin

# Install adapted plugin to OpenClaw
claude-bridge-claw install claude-my-plugin

# List adapted plugins
claude-bridge-claw list
```

## Usage

### CLI Commands

| Command | Description |
|---------|-------------|
| `claude-bridge-claw scan` | Scan all Claude Code plugins |
| `claude-bridge-claw scan <name>` | Scan a specific plugin |
| `claude-bridge-claw adapt <name>` | Adapt a Claude Code plugin |
| `claude-bridge-claw install <id>` | Prepare plugin for OpenClaw installation |
| `claude-bridge-claw list` | List all adapted plugins |
| `claude-bridge-claw info <id>` | Show detailed plugin info |

### As a Module

```javascript
const { ClawAdapter } = require('claude-bridge-claw');

const adapter = new ClawAdapter();

// Scan all plugins
const plugins = adapter.scanAllPlugins();

// Adapt a plugin
const adapted = adapter.adaptPlugin(plugin);

// Install to OpenClaw
const pluginId = adapter.installAdaptedPlugin(adapted);
```

## Adaptation Levels

| Level | Source | Target | Support |
|-------|--------|--------|---------|
| 1 | `commands/*.js` | OpenClaw tools | ✅ Full |
| 2 | `skills/*.md` | OpenClaw prompts | ✅ Partial |
| 3 | `agents/*.json` | OpenClaw agents | ⚠️ Limited |
| 4 | `hooks/*.js` | OpenClaw hooks | ⚠️ Limited |

## Limitations

The following Claude Code features cannot be adapted:

- ❌ Claude Code runtime APIs
- ❌ Commands requiring Claude Code context
- ❌ Plugins depending on Claude Code internal state
- ❌ Claude Code specific integrations

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_PLUGINS_DIR` | `~/.claude/plugins` | Claude Code plugins directory |
| `ADAPTER_OUTPUT_DIR` | `./adapted` | Output directory for adapted plugins |

### Directories

Claude Code plugins are expected to have this structure:

```
~/.claude/plugins/
└── my-plugin/
    ├── package.json (optional)
    ├── commands/
    │   ├── command1.js
    │   └── command2.js
    ├── skills/
    │   └── skill1.md
    ├── agents/
    │   └── agent1.json
    └── hooks/
        └── hook1.js
```

## Development

```bash
# Run tests
npm test

# Scan with development version
node src/cli.js scan

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
claude-bridge-claw/
├── src/
│   ├── index.js      # Core adapter class
│   └── cli.js        # Command-line interface
├── tests/
│   └── test.js       # Unit tests
├── examples/
│   └── sample-plugin/ # Sample Claude Code plugin
├── docs/
│   └── architecture.md
├── package.json
├── README.md
└── LICENSE
```

## License

MIT © 2026 TraeBuddy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.