import json
import urllib.parse

async def app(scope, receive, send):
    """
    ASGI application with routing for different test endpoints
    """
    if scope["type"] == "http":
        path = scope["path"]

        if path == "/" or path == "/index":
            await hello_world(scope, receive, send)
        elif path == "/post":
            await handle_post(scope, receive, send)
        elif path == "/headers":
            await handle_headers(scope, receive, send)
        else:
            # 404 for unknown paths
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
    else:
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


async def hello_world(scope, receive, send):
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            [b'content-type', b'text/plain'],
        ],
    })

    await send({
        'type': 'http.response.body',
        'body': b'Hello World!',
    })


async def handle_post(scope, receive, send):
    if scope["method"] != "POST":
        await send({
            'type': 'http.response.start',
            'status': 405,
            'headers': [
                [b'content-type', b'text/plain'],
            ],
        })
        await send({
            'type': 'http.response.body',
            'body': b'Method Not Allowed',
        })
        return

    # Read the body
    body = b''
    while True:
        message = await receive()
        if message['type'] == 'http.request':
            body += message.get('body', b'')
            if not message.get('more_body', False):
                break

    # Parse form data
    data = {}
    if body:
        body_str = body.decode('utf-8')
        parsed = urllib.parse.parse_qs(body_str)
        for key, value_list in parsed.items():
            data[key] = value_list[0] if len(value_list) == 1 else value_list

    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            [b'content-type', b'application/json'],
        ],
    })

    await send({
        'type': 'http.response.body',
        'body': json.dumps(data).encode('utf-8'),
    })


async def handle_headers(scope, receive, send):
    headers = scope.get("headers", [])
    header_dict = {}

    for name, value in headers:
        name_str = name.decode('utf-8') if isinstance(name, bytes) else name
        value_str = value.decode('utf-8') if isinstance(value, bytes) else value
        header_name = f"HTTP_{name_str.upper().replace('-', '_')}"
        header_dict[header_name] = value_str

    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            [b'content-type', b'application/json'],
        ],
    })

    await send({
        'type': 'http.response.body',
        'body': json.dumps(header_dict, indent=2).encode('utf-8'),
    })
