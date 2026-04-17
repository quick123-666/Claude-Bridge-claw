{
  "id": "hello-world",
  "name": "Hello World",
  "description": "A simple hello world command",
  "author": "Example",
  "version": "1.0.0"
}

## Usage

```
/hello-world
/hello-world --name Alice
```

## Code

```javascript
module.exports = {
  name: 'hello-world',
  description: 'A simple hello world command',

  async execute(args, context) {
    const name = args.name || 'World';
    return { message: `Hello, ${name}!` };
  }
};
```