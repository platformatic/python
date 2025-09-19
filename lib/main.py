import platform
import sys
import os

async def app(scope, receive, send):
    """
    A simple ASGI application that displays Python environment information
    """
    if scope["type"] == "http":
        body = f"""<!DOCTYPE html>
<html>
<head>
    <title>Python Information</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 2em; }}
        .section {{ margin-bottom: 2em; }}
        .header {{ background: #f0f0f0; padding: 1em; border-left: 4px solid #007acc; }}
        .info {{ padding: 1em; background: #fafafa; border: 1px solid #ddd; }}
    </style>
</head>
<body>
    <div class="section">
        <div class="header">
            <h1>🐍 Python ASGI Application</h1>
        </div>
        <div class="info">
            <h2>Python Version</h2>
            <p><strong>Version:</strong> {sys.version}</p>
            <p><strong>Platform:</strong> {platform.platform()}</p>
            <p><strong>Architecture:</strong> {platform.machine()}</p>
        </div>
    </div>

    <div class="section">
        <div class="header">
            <h2>Environment</h2>
        </div>
        <div class="info">
            <p><strong>Python Executable:</strong> {sys.executable}</p>
            <p><strong>Current Working Directory:</strong> {os.getcwd()}</p>
            <p><strong>Python Path:</strong></p>
            <ul>
                {''.join(f'<li>{path}</li>' for path in sys.path[:5])}
                {'<li>... and more</li>' if len(sys.path) > 5 else ''}
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="header">
            <h2>Request Information</h2>
        </div>
        <div class="info">
            <p><strong>Method:</strong> {scope.get('method', 'N/A')}</p>
            <p><strong>Path:</strong> {scope.get('path', 'N/A')}</p>
            <p><strong>Query String:</strong> {scope.get('query_string', b'').decode('utf-8') or 'None'}</p>
        </div>
    </div>
</body>
</html>"""

        await send({
            'type': 'http.response.start',
            'status': 200,
            'headers': [
                [b'content-type', b'text/html; charset=utf-8'],
            ],
        })

        await send({
            'type': 'http.response.body',
            'body': body.encode('utf-8'),
        })
    else:
        # Handle non-HTTP requests (WebSocket, etc.)
        await send({
            'type': 'http.response.start',
            'status': 404,
            'headers': [
                [b'content-type', b'text/plain'],
            ],
        })
        await send({
            'type': 'http.response.body',
            'body': b'Not Found',
        })
