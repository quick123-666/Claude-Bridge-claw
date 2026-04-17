<h1 align="center">Claude-Bridge-claw</h1>

<p align="center">
  <em>「Claude Code 的插件，何必只能跑在 Claude Code 里」</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://claude.ai/code"><img src="https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet" alt="Claude Code" /></a>
  <a href="https://www.npmjs.com/package/claude-bridge-claw"><img src="https://img.shields.io/badge/OpenClaw-Adapter-green" alt="OpenClaw adapter" /></a>
</p>

<p align="center">&nbsp;</p>

<p align="center"><strong>一条命令链路：扫描 Claude Code 插件 → 转成 OpenClaw 形态 → 装进 OpenClaw。</strong></p>

<p align="center">&nbsp;</p>

<p align="center">
  <a href="https://claude.ai/code">Claude Code</a> 里已经有一整套插件形态（commands / skills / agents / hooks）。<br />
  OpenClaw 侧则需要另一套声明与入口（例如本工具生成的 <code>openclaw.plugin.json</code>）。<br />
  Claude-Bridge-claw 负责把两边<strong>对齐</strong>：自动扫描、按层转换、产出可安装的 OpenClaw 插件包。
</p>

<p align="center">&nbsp;</p>

<p align="center">
  <a href="#效果演示">看效果</a>
  &nbsp;·&nbsp;
  <a href="#安装">安装</a>
  &nbsp;·&nbsp;
  <a href="#转换层级">它适配了什么</a>
  &nbsp;·&nbsp;
  <a href="#工作原理">工作原理</a>
</p>

<p align="center">&nbsp;</p>

<p align="center">
  <a href="https://star-history.com/#quick123-666/Claude-Bridge-claw&amp;Date">
    <img src="https://api.star-history.com/svg?repos=quick123-666/Claude-Bridge-claw&amp;type=Date" alt="Star History Chart" />
  </a>
</p>

<p align="center">&nbsp;</p>

---

## 效果演示

```bash
claude-bridge-claw scan
claude-bridge-claw adapt my-plugin
claude-bridge-claw install claude-my-plugin
claude-bridge-claw list
```

---

## 安装

```bash
git clone https://github.com/quick123-666/Claude-Bridge-claw.git
cd claude-bridge-claw
npm install
```

全局安装：

```bash
npm install -g claude-bridge-claw
```

---

## 工作原理

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

**Scanner** 识别 Claude Code 插件目录（commands / skills / agents / hooks）。  
**Converter** 把命令、Skill、Agent、Hook 映射到 OpenClaw 能加载的声明与入口。  
产出物包含 `openclaw.plugin.json`、`package.json` 以及注册工具的 `index.js`。

---

## CLI 命令

| Command | Description |
|---------|-------------|
| `claude-bridge-claw scan` | 扫描全部 Claude Code 插件 |
| `claude-bridge-claw scan <name>` | 扫描指定插件 |
| `claude-bridge-claw adapt <name>` | 适配指定插件 |
| `claude-bridge-claw install <id>` | 生成可供 OpenClaw 安装的产物 |
| `claude-bridge-claw list` | 列出已适配插件 |
| `claude-bridge-claw info <id>` | 查看插件详情 |

---

## 作为模块使用

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

---

## 转换层级

| Level | Source | Target | Support |
|-------|--------|--------|---------|
| 1 | `commands/*.js` | OpenClaw tools | ✅ Full |
| 2 | `skills/*.md` | OpenClaw prompts | ✅ Partial |
| 3 | `agents/*.json` | OpenClaw agents | ⚠️ Limited |
| 4 | `hooks/*.js` | OpenClaw hooks | ⚠️ Limited |

---

## 局限

以下能力**无法**通过桥接层自动补齐（与 Claude Code 运行时强绑定）：

- ❌ Claude Code 专有运行时 API  
- ❌ 依赖 Claude Code 上下文的命令  
- ❌ 依赖 Claude Code 内部状态的插件  
- ❌ 仅面向 Claude Code 的集成  

**一个不说明边界的适配器，不值得信任。** 若插件核心逻辑绑在 Claude Code 内，请预期需要手写迁移或放弃部分功能。

---

## 配置

### 环境变量

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_PLUGINS_DIR` | `~/.claude/plugins` | Claude Code 插件根目录 |
| `ADAPTER_OUTPUT_DIR` | `./adapted` | 适配结果输出目录 |

### Claude Code 插件目录约定

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

---

## 开发

```bash
npm test
node src/cli.js scan
npm run lint
npm run format
```

---

## 仓库结构

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

---

## English

> _"Claude Code plugins don't have to live only inside Claude Code."_

**Claude-Bridge-claw** is a compatibility layer: **scan** Claude Code plugin folders, **convert** commands / skills / agents / hooks into OpenClaw-shaped artifacts, then **install** them for OpenClaw. It does not emulate the full Claude Code runtime—see [Limitations](#局限).

**Quick start:** `scan` → `adapt` → `install` → `list` (see [效果演示](#效果演示)).

**License:** MIT © 2026 TraeBuddy

---

## Contributing

Contributions are welcome. Pull requests are appreciated.
