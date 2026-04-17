const { ClawAdapter, PLUGINS_DIR } = require('../src/index.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 Claw Adapter Test Suite\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${err.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

console.log('📁 Testing Plugin Scanner...\n');

test('ClawAdapter can be instantiated', () => {
    const adapter = new ClawAdapter();
    assert(adapter !== null);
    assert(adapter.pluginsDir !== null);
});

test('Scan non-existent plugin returns null', () => {
    const adapter = new ClawAdapter();
    const result = adapter.scanPlugin('/non/existent/path');
    assert(result === null);
});

test('scanAllPlugins returns array', () => {
    const adapter = new ClawAdapter();
    const result = adapter.scanAllPlugins();
    assert(Array.isArray(result));
});

console.log('\n📦 Testing Plugin Parser...\n');

test('parseCommand returns null for invalid path', () => {
    const adapter = new ClawAdapter();
    const result = adapter.parseCommand('/non/existent/command.js');
    assert(result === null);
});

console.log('\n🔧 Testing Adapter...\n');

test('adaptPlugin handles empty plugin', () => {
    const adapter = new ClawAdapter();
    const mockPlugin = {
        name: 'test-plugin',
        path: '/test/path',
        packageJson: null,
        commands: [],
        skills: [],
        agents: [],
        hooks: [],
        references: []
    };
    const adapted = adapter.adaptPlugin(mockPlugin);
    assert(adapted.plugin_name === 'test-plugin');
    assert(Array.isArray(adapted.tools));
    assert(Array.isArray(adapted.skills));
    assert(Array.isArray(adapted.agents));
});

console.log('\n💾 Testing Plugin Installation...\n');

test('listAdaptedPlugins returns array', () => {
    const adapter = new ClawAdapter();
    const result = adapter.listAdaptedPlugins();
    assert(Array.isArray(result));
});

test('getAdaptedPluginInfo returns null for non-existent plugin', () => {
    const adapter = new ClawAdapter();
    const result = adapter.getAdaptedPluginInfo('non-existent-plugin');
    assert(result === null);
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
    process.exit(1);
} else {
    console.log('🎉 All tests passed!\n');
}