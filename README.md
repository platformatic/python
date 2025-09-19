# @platformatic/python

A Python stackable for [Platformatic](https://platformatic.dev/) that enables running Python ASGI applications within the Platformatic ecosystem. This package integrates Python execution with Fastify servers, allowing you to serve Python applications alongside Node.js applications.

## Features

- 🚀 Run Python ASGI applications within Platformatic services
- 🔄 Automatic request/response handling between Node.js and Python
- 📁 Static file serving for non-Python assets
- ⚡ Hot reloading during development
- 🛠️ Code generation for new Python projects
- 🔧 Environment-based configuration

## Requirements

- Node.js >= 22.18.0
- Python >= 3.8
- The Python runtime is built thanks to [`@platformatic/python-node`](https://github.com/platformatic/python-node).

## Installation

```bash
npm install @platformatic/python
```

## Quick Start

### Create a New Python Project

```bash
npx --package=@platformatic/python create-platformatic-python --dir my-python-app --port 3042
cd my-python-app
npm install
npm start
```

### CLI Options

- `--dir` - Target directory (default: `plt-python`)
- `--port` - Server port (default: `3042`)
- `--hostname` - Server hostname (default: `0.0.0.0`)
- `--main` - Main Python file (default: `main.py`)

## Configuration

The stackable uses a `platformatic.json` configuration file:

```json
{
  "$schema": "https://schemas.platformatic.dev/@platformatic/python/0.7.0.json",
  "module": "@platformatic/python",
  "python": {
    "docroot": "public",
    "appTarget": "main:app"
  },
  "server": {
    "hostname": "{PLT_SERVER_HOSTNAME}",
    "port": "{PORT}",
    "logger": { "level": "{PLT_SERVER_LOGGER_LEVEL}" }
  },
  "watch": true
}
```

### Configuration Options

#### python
- `docroot` (string, required) - Path to the root directory containing Python files
- `appTarget` (string, optional) - The Python module and function to load in the format `module:function` (default: `main:app`)

#### server
Standard Platformatic server configuration options are supported.

## Project Structure

A generated Python project includes:

```
my-python-app/
├── public/
│   └── main.py            # Main Python ASGI application
├── .env                   # Environment variables
├── .env.sample           # Environment template
├── .gitignore
├── package.json
└── platformatic.json     # Platformatic configuration
```

## Development

### Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build schema and types

### Environment Variables

- `PLT_SERVER_HOSTNAME` - Server hostname (default: `0.0.0.0`)
- `PORT` - Server port (default: `3042`)
- `PLT_SERVER_LOGGER_LEVEL` - Log level (default: `info`)

## How It Works

1. **Request Routing**: All HTTP requests are captured by wildcard routes
2. **Python Execution**: Requests are forwarded to Python ASGI applications via `@platformatic/python-node`
3. **Static Files**: Non-Python files in the docroot are served statically
4. **Response Handling**: Python ASGI responses are processed and returned through Fastify

## API

### Stackable Export

```javascript
import { stackable } from '@platformatic/python'
// or
import python from '@platformatic/python'
```

### Generator

```javascript
import { Generator } from '@platformatic/python'

const generator = new Generator()
generator.setConfig({
  targetDirectory: './my-app',
  port: 3042,
  hostname: '0.0.0.0'
})
await generator.run()
```

## Examples

### Basic Python ASGI Application

```python
# public/main.py
import json
from datetime import datetime

async def app(scope, receive, send):
    """
    Basic ASGI application
    """
    if scope["type"] == "http":
        await send({
            'type': 'http.response.start',
            'status': 200,
            'headers': [
                [b'content-type', b'application/json'],
            ],
        })

        response_data = {
            "message": "Hello from Python!",
            "timestamp": datetime.now().isoformat()
        }

        await send({
            'type': 'http.response.body',
            'body': json.dumps(response_data).encode('utf-8'),
        })
```

### Handling POST Requests

```python
# public/api.py
import json

async def app(scope, receive, send):
    """
    ASGI application that handles POST requests
    """
    if scope["type"] == "http":
        method = scope["method"]

        if method == "POST":
            # Read the request body
            body = b''
            while True:
                message = await receive()
                if message['type'] == 'http.request':
                    body += message.get('body', b'')
                    if not message.get('more_body', False):
                        break

            # Parse JSON body
            try:
                input_data = json.loads(body.decode('utf-8'))
            except:
                input_data = {}

            await send({
                'type': 'http.response.start',
                'status': 200,
                'headers': [
                    [b'content-type', b'application/json'],
                ],
            })

            response_data = {
                "received": input_data,
                "method": method
            }

            await send({
                'type': 'http.response.body',
                'body': json.dumps(response_data).encode('utf-8'),
            })
```

## Contributing

This project is part of the [Platformatic](https://github.com/platformatic) ecosystem. Please refer to the main repository for contribution guidelines.

## License

Apache-2.0

## Support

- [GitHub Issues](https://github.com/platformatic/python/issues)
- [Platformatic Documentation](https://docs.platformatic.dev/)
- [Community Discord](https://discord.gg/platformatic)
