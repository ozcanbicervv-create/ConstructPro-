'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Copy, Check, Download } from 'lucide-react';

interface OpenAPISpec {
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name: string;
      url: string;
      email: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export default function APIDocumentationPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    fetchAPISpec();
  }, []);

  const fetchAPISpec = async () => {
    try {
      const response = await fetch('/api/docs');
      if (!response.ok) {
        throw new Error('Failed to fetch API specification');
      }
      const data = await response.json();
      setSpec(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(null), 2000);
      // Simple alert instead of toast for now
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: select text for manual copy
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
  };

  const downloadSpec = () => {
    if (!spec) return;
    
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constructpro-api-spec.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      get: 'bg-green-100 text-green-800 border-green-200',
      post: 'bg-blue-100 text-blue-800 border-blue-200',
      put: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      patch: 'bg-orange-100 text-orange-800 border-orange-200',
      delete: 'bg-red-100 text-red-800 border-red-200',
      head: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[method.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading API documentation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'Failed to load API documentation'}
            </p>
            <Button onClick={fetchAPISpec} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{spec.info.title}</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Version {spec.info.version}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadSpec} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Spec
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://editor.swagger.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Swagger Editor
              </a>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: spec.info.description.replace(/\n/g, '<br />') 
              }} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {spec.info.contact && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">Support Team</p>
                  <p className="text-muted-foreground">{spec.info.contact.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${spec.info.contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {spec.info.contact.email}
                  </a>
                </div>
                <div>
                  <p className="font-medium">Documentation</p>
                  <a 
                    href={spec.info.contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    GitHub Repository
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Servers */}
      <Card>
        <CardHeader>
          <CardTitle>Servers</CardTitle>
          <CardDescription>
            Available API servers for different environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spec.servers.map((server, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {server.url}
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    {server.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(server.url, server.url)}
                >
                  {copiedEndpoint === server.url ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          {Object.entries(spec.paths).map(([path, methods]) => (
            <Card key={path}>
              <CardHeader>
                <CardTitle className="text-lg font-mono">{path}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(methods).map(([method, operation]: [string, any]) => (
                  <div key={method} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getMethodColor(method)}>
                        {method.toUpperCase()}
                      </Badge>
                      <h4 className="font-semibold">{operation.summary}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${spec.servers[0].url}${path}`, `${method}:${path}`)}
                      >
                        {copiedEndpoint === `${method}:${path}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {operation.description && (
                      <p className="text-muted-foreground mb-3">
                        {operation.description}
                      </p>
                    )}

                    {operation.tags && (
                      <div className="flex gap-2 mb-3">
                        {operation.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Response Codes */}
                    {operation.responses && (
                      <div>
                        <h5 className="font-medium mb-2">Responses</h5>
                        <div className="space-y-2">
                          {Object.entries(operation.responses).map(([code, response]: [string, any]) => (
                            <div key={code} className="flex items-center gap-3 text-sm">
                              <Badge variant={code.startsWith('2') ? 'default' : 'destructive'}>
                                {code}
                              </Badge>
                              <span className="text-muted-foreground">
                                {response.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="schemas" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {Object.entries(spec.components.schemas).map(([name, schema]: [string, any]) => (
              <Card key={name} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg font-mono">{name}</CardTitle>
                  {schema.description && (
                    <CardDescription>{schema.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(schema, null, 2)}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          {spec.tags.map((tag) => (
            <Card key={tag.name}>
              <CardHeader>
                <CardTitle>{tag.name}</CardTitle>
                <CardDescription>{tag.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}