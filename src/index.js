const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\Administrator', '.claude', 'plugins');

class ClawAdapter {
    constructor(pluginsDir = PLUGINS_DIR) {
        this.pluginsDir = pluginsDir;
        this.adaptedDir = path.join(__dirname, '..', 'adapted');
    }

    scanPlugin(pluginPath) {
        if (!fs.existsSync(pluginPath)) return null;

        const plugin = {
            name: path.basename(pluginPath),
            path: pluginPath,
            packageJson: null,
            commands: [],
            skills: [],
            agents: [],
            hooks: [],
            references: []
        };

        const packageJsonPath = path.join(pluginPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                plugin.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            } catch (e) {
                // Ignore invalid JSON
            }
        }

        const commandsDir = path.join(pluginPath, 'commands');
        if (fs.existsSync(commandsDir)) {
            plugin.commands = fs.readdirSync(commandsDir)
                .filter(f => f.endsWith('.js'))
                .map(f => path.join(commandsDir, f));
        }

        const skillsDir = path.join(pluginPath, 'skills');
        if (fs.existsSync(skillsDir)) {
            plugin.skills = fs.readdirSync(skillsDir)
                .filter(f => f.endsWith('.md'))
                .map(f => path.join(skillsDir, f));
        }

        const agentsDir = path.join(pluginPath, 'agents');
        if (fs.existsSync(agentsDir)) {
            plugin.agents = fs.readdirSync(agentsDir)
                .filter(f => f.endsWith('.json'))
                .map(f => path.join(agentsDir, f));
        }

        const hooksDir = path.join(pluginPath, 'hooks');
        if (fs.existsSync(hooksDir)) {
            plugin.hooks = fs.readdirSync(hooksDir)
                .filter(f => f.endsWith('.js'))
                .map(f => path.join(hooksDir, f));
        }

        const referencesDir = path.join(pluginPath, 'references');
        if (fs.existsSync(referencesDir)) {
            plugin.references = fs.readdirSync(referencesDir)
                .map(f => path.join(referencesDir, f));
        }

        return plugin;
    }

    scanAllPlugins() {
        if (!fs.existsSync(this.pluginsDir)) {
            return [];
        }

        const plugins = [];
        const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const pluginPath = path.join(this.pluginsDir, entry.name);
                const plugin = this.scanPlugin(pluginPath);
                if (plugin && (plugin.commands.length || plugin.skills.length || plugin.agents.length)) {
                    plugins.push(plugin);
                }
            }
        }

        return plugins;
    }

    parseCommand(commandPath) {
        try {
            const content = fs.readFileSync(commandPath, 'utf-8');
            const name = path.basename(commandPath, '.js');

            let description = name.replace(/-/g, ' ').replace(/_/g, ' ');

            const descMatch = content.match(/['"]description['"]\s*:\s*['"]([^'"]+)['"]/);
            if (descMatch) {
                description = descMatch[1];
            }

            const paramPattern = /"(\w+)"\s*:\s*\{[^}]*"type"\s*:\s*"(\w+)"/g;
            const properties = {};
            let match;

            while ((match = paramPattern.exec(content)) !== null) {
                properties[match[1]] = { type: match[2] };
            }

            const inputSchema = {
                type: 'object',
                properties: Object.keys(properties).length ? properties : undefined
            };

            return {
                name: name,
                description: description,
                inputSchema: inputSchema,
                file_path: commandPath
            };
        } catch (e) {
            return null;
        }
    }

    adaptPlugin(plugin) {
        const adapted = {
            plugin_name: plugin.name,
            original_path: plugin.path,
            package_json: plugin.packageJson,
            tools: [],
            skills: plugin.skills.map(s => ({
                name: path.basename(s, '.md'),
                file: path.basename(s)
            })),
            agents: plugin.agents.map(a => ({
                file: path.basename(a)
            })),
            hooks: plugin.hooks.map(h => ({
                file: path.basename(h)
            }))
        };

        for (const cmdPath of plugin.commands) {
            const cmdInfo = this.parseCommand(cmdPath);
            if (cmdInfo) {
                adapted.tools.push({
                    name: `claude_cmd_${cmdInfo.name}`,
                    description: cmdInfo.description,
                    inputSchema: cmdInfo.inputSchema,
                    original_file: cmdInfo.name
                });
            }
        }

        return adapted;
    }

    installAdaptedPlugin(adapted) {
        const pluginId = `claude-${adapted.plugin_name}`;
        const outputDir = path.join(this.adaptedDir, pluginId);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const openclawPlugin = {
            id: pluginId,
            name: `Claude: ${adapted.plugin_name}`,
            version: '1.0.0-adapter',
            description: `Adapted from Claude Code plugin: ${adapted.plugin_name}`,
            author: 'Claw Adapter',
            tools: adapted.tools.map(t => t.name)
        };

        fs.writeFileSync(
            path.join(outputDir, 'openclaw.plugin.json'),
            JSON.stringify(openclawPlugin, null, 2)
        );

        const packageJson = {
            name: pluginId,
            version: '1.0.0-adapter',
            description: `Claude Code plugin adapter for OpenClaw`,
            main: 'index.js',
            openclaw: {
                extensions: ['./index.js']
            },
            peerDependencies: {
                openclaw: '>=1.0.0'
            }
        };

        fs.writeFileSync(
            path.join(outputDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        const indexContent = `const { registerTool } = require('openclaw/plugin-sdk');

module.exports = { registerTools };

async function registerTools(registerTool) {
    console.log("Claw Adapter: Claude plugin '${adapted.plugin_name}' loaded");

    // Register adapted tools
    ${adapted.tools.map(t => `
    registerTool('${t.name}', {
        description: "${t.description}",
        inputSchema: ${JSON.stringify(t.inputSchema || {}, null, 8).replace(/\n/g, '\n        ')}
    }, async (args) => {
        return {
            success: true,
            message: "Command executed via Claw Adapter",
            original_command: "${t.original_file}",
            args: args
        };
    });`).join('\n    ')}
}
`;

        fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent);

        return pluginId;
    }

    listAdaptedPlugins() {
        if (!fs.existsSync(this.adaptedDir)) {
            return [];
        }
        return fs.readdirSync(this.adaptedDir, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .map(e => e.name);
    }

    getAdaptedPluginInfo(pluginId) {
        const pluginDir = path.join(this.adaptedDir, pluginId);
        if (!fs.existsSync(pluginDir)) {
            return null;
        }

        const openclawPluginPath = path.join(pluginDir, 'openclaw.plugin.json');
        if (fs.existsSync(openclawPluginPath)) {
            return JSON.parse(fs.readFileSync(openclawPluginPath, 'utf-8'));
        }
        return null;
    }
}

module.exports = { ClawAdapter, PLUGINS_DIR };