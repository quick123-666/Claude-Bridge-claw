#!/usr/bin/env node

const { ClawAdapter } = require('./index.js');

function printBanner() {
    console.log(`\n╔═══════════════════════════════════════════════════════════╗\n║         Claude-Bridge-claw - Claude Code Plugin         ║\n║                   Adapter for OpenClaw                   ║\n╚═══════════════════════════════════════════════════════════╝\n    `);
}

function printUsage() {
    console.log(`
Usage: claude-bridge-claw <command> [options]

Commands:
  scan [plugin-name]    Scan Claude Code plugins directory
                        or scan a specific plugin
  adapt <plugin-name>   Adapt a Claude Code plugin to OpenClaw
  install <plugin-id>   Install adapted plugin to OpenClaw
  list                  List all adapted plugins
  info <plugin-id>      Show detailed info about an adapted plugin

Options:
  --plugins-dir <path>  Specify Claude Code plugins directory
  --output-dir <path>   Specify output directory for adapted plugins
  --help, -h            Show this help message
  --version, -v         Show version number

Examples:
  # Scan all Claude Code plugins
  claude-bridge-claw scan

  # Adapt a specific plugin
  claude-bridge-claw adapt my-plugin

  # Install adapted plugin to OpenClaw
  claude-bridge-claw install claude-my-plugin

  # List all adapted plugins
  claude-bridge-claw list

Environment Variables:
  CLAUDE_PLUGINS_DIR    Override default Claude Code plugins directory
  ADAPTER_OUTPUT_DIR    Override default output directory
`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printBanner();
        printUsage();
        return;
    }

    if (args.includes('--version') || args.includes('-v')) {
        console.log('claude-bridge-claw v1.0.0');
        return;
    }

    const command = args[0];
    const adapter = new ClawAdapter();

    printBanner();

    switch (command) {
        case 'scan': {
            const pluginName = args[1];
            if (pluginName) {
                const pluginPath = path.join(adapter.pluginsDir, pluginName);
                const plugin = adapter.scanPlugin(pluginPath);
                if (!plugin) {
                    console.log(`❌ Plugin not found: ${pluginName}`);
                    console.log(`   Searched in: ${pluginPath}`);
                    process.exit(1);
                }
                console.log(`📦 Plugin: ${plugin.name}`);
                console.log(`   Commands: ${plugin.commands.length}`);
                console.log(`   Skills: ${plugin.skills.length}`);
                console.log(`   Agents: ${plugin.agents.length}`);
                console.log(`   Hooks: ${plugin.hooks.length}`);
            } else {
                console.log('🔍 Scanning Claude Code plugins directory...\n');
                const plugins = adapter.scanAllPlugins();
                if (plugins.length === 0) {
                    console.log('⚠️  No Claude Code plugins found');
                    console.log(`   Searched in: ${adapter.pluginsDir}`);
                    console.log('\n   To add plugins, create directories in ~/.claude/plugins/');
                    process.exit(0);
                }
                console.log(`✅ Found ${plugins.length} plugin(s):\n`);
                for (const p of plugins) {
                    console.log(`  📦 ${p.name}`);
                    console.log(`     Commands: ${p.commands.length}`);
                    console.log(`     Skills: ${p.skills.length}`);
                    console.log(`     Agents: ${p.agents.length}`);
                }
            }
            break;
        }

        case 'adapt': {
            if (!args[1]) {
                console.log('❌ Please specify a plugin name');
                console.log('   Usage: claw-adapter adapt <plugin-name>');
                process.exit(1);
            }
            const pluginName = args[1];
            const pluginPath = path.join(adapter.pluginsDir, pluginName);
            const plugin = adapter.scanPlugin(pluginPath);

            if (!plugin) {
                console.log(`❌ Plugin not found: ${pluginName}`);
                process.exit(1);
            }

            console.log(`📦 Adapting plugin: ${pluginName}\n`);
            console.log(`   Commands: ${plugin.commands.length}`);
            console.log(`   Skills: ${plugin.skills.length}`);
            console.log(`   Agents: ${plugin.agents.length}`);

            const adapted = adapter.adaptPlugin(plugin);

            console.log('\n📋 Adaptation result:');
            console.log(`   Tools: ${adapted.tools.length}`);
            for (const t of adapted.tools) {
                console.log(`     - ${t.name}: ${t.description}`);
            }
            console.log(`   Skills: ${adapted.skills.length}`);
            console.log(`   Agents: ${adapted.agents.length}`);

            const installedId = adapter.installAdaptedPlugin(adapted);
            console.log(`\n✅ Successfully installed as: ${installedId}`);
            console.log(`   Location: ${path.join(adapter.adaptedDir, installedId)}`);
            break;
        }

        case 'install': {
            if (!args[1]) {
                console.log('❌ Please specify a plugin ID');
                console.log('   Usage: claw-adapter install <plugin-id>');
                process.exit(1);
            }
            const pluginId = args[1];
            const pluginDir = path.join(adapter.adaptedDir, pluginId);

            if (!fs.existsSync(pluginDir)) {
                console.log(`❌ Adapted plugin not found: ${pluginId}`);
                console.log(`   Searched in: ${pluginDir}`);
                console.log('\n   Use "claw-adapter adapt <plugin-name>" first');
                process.exit(1);
            }

            console.log(`📦 Installing plugin to OpenClaw: ${pluginId}`);
            console.log('\n   To complete installation, run:');
            console.log(`   openclaw plugins install "${pluginDir}"`);
            break;
        }

        case 'list': {
            const plugins = adapter.listAdaptedPlugins();
            if (plugins.length === 0) {
                console.log('⚠️  No adapted plugins found');
                console.log('\n   Use "claw-adapter adapt <plugin-name>" to create one');
                process.exit(0);
            }
            console.log(`✅ Found ${plugins.length} adapted plugin(s):\n`);
            for (const pluginId of plugins) {
                const info = adapter.getAdaptedPluginInfo(pluginId);
                if (info) {
                    console.log(`  📦 ${info.name}`);
                    console.log(`     ID: ${info.id}`);
                    console.log(`     Tools: ${info.tools.length}`);
                } else {
                    console.log(`  📦 ${pluginId}`);
                }
            }
            break;
        }

        case 'info': {
            if (!args[1]) {
                console.log('❌ Please specify a plugin ID');
                console.log('   Usage: claw-adapter info <plugin-id>');
                process.exit(1);
            }
            const pluginId = args[1];
            const info = adapter.getAdaptedPluginInfo(pluginId);

            if (!info) {
                console.log(`❌ Adapted plugin not found: ${pluginId}`);
                process.exit(1);
            }

            console.log(`📦 Plugin: ${info.name}\n`);
            console.log(`   ID: ${info.id}`);
            console.log(`   Version: ${info.version}`);
            console.log(`   Description: ${info.description}`);
            console.log(`   Author: ${info.author}`);
            console.log(`   Tools: ${info.tools.length}`);
            for (const tool of info.tools) {
                console.log(`     - ${tool}`);
            }
            break;
        }

        default:
            console.log(`❌ Unknown command: ${command}`);
            console.log('   Use --help for usage information');
            process.exit(1);
    }
}

const path = require('path');
const fs = require('fs');

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});