#!/usr/bin/env node

module.exports = {
  name: 'hello-world',
  description: 'A simple hello world command',

  parameters: {
    name: {
      type: 'string',
      description: 'Name to greet',
      default: 'World'
    }
  },

  async execute(args, context) {
    const name = args.name || 'World';
    return {
      success: true,
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString()
    };
  }
};