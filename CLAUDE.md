# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@platformatic/python` - a Python stackable for Watt that integrates Python applications with the Platformatic framework. It enables serving Python ASGI applications through a Fastify server with proper request/response handling.

## Development Commands

- `npm test` - Run tests using Node.js built-in test runner
- `npm run build` - Generate schema.json and config.d.ts from schema definitions
- `npm run ci` - Run linting and tests (assumes lint script exists)

## Architecture

The project follows Platformatic's stackable pattern:

### Core Components

- **lib/index.js** - Main stackable export with configuration and plugin registration
- **lib/plugin.js** - Fastify plugin that handles Python request routing and execution
- **lib/generator.js** - Code generator for creating new Python stackable projects
- **lib/schema.js** - JSON schema definitions for configuration validation

### Key Architecture Patterns

1. **Stackable Integration**: Extends `@platformatic/service` with Python-specific functionality
2. **Request Handling**: All HTTP methods are captured by wildcard routes and forwarded to Python via `@platformatic/python-node`
3. **Static File Serving**: Non-Python files in docroot are served statically with `@fastify/static`
4. **Header Processing**: HTTP headers are capitalized for Python compatibility
5. **Configuration Schema**: Uses JSON schema with automatic TypeScript generation

### Generated Project Structure

When using the generator, projects include:
- `public/` directory as Python docroot with `main.py` containing a basic ASGI app
- `platformatic.json` configuration file
- `.env` and `.env.sample` for environment variables
- Node.js v22.18.0+ and Python 3.8+ requirements

### Testing Approach

- Uses Node.js built-in test runner (`node --test`)
- Tests cover generator functionality, configuration validation, and file generation
- Test fixtures in `test/fixtures/` for integration testing
