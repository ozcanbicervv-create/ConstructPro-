import { NextRequest, NextResponse } from 'next/server';

import swaggerSpec from '@/lib/swagger';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');

    // Return JSON format for API consumption
    if (format === 'json') {
      return NextResponse.json(swaggerSpec);
    }

    // Return HTML documentation page
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ConstructPro API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background-color: #2563eb;
        }
        .swagger-ui .topbar .download-url-wrapper .select-label {
            color: white;
        }
        .swagger-ui .topbar .download-url-wrapper input[type=text] {
            border: 2px solid #1d4ed8;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/docs?format=json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // Add correlation ID to all requests
                    request.headers['X-Correlation-ID'] = 'swagger-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    return request;
                },
                responseInterceptor: function(response) {
                    // Log response for debugging
                    console.log('API Response:', response);
                    return response;
                }
            });
            
            // Add custom styling
            setTimeout(() => {
                const logo = document.querySelector('.topbar-wrapper .link');
                if (logo) {
                    logo.innerHTML = '<span style="color: white; font-weight: bold; font-size: 1.5em;">ConstructPro API</span>';
                }
            }, 1000);
        };
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving API documentation:', error);
    return NextResponse.json(
      {
        error: 'DOCUMENTATION_ERROR',
        message: 'Failed to serve API documentation',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}