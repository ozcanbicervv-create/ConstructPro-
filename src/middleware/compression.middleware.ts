import { promisify } from 'util';

import compression from 'compression';
import { NextRequest, NextResponse } from 'next/server';

// Compression configuration
const compressionConfig = {
  level: parseInt(process.env.COMPRESSION_LEVEL || '6'), // 1-9, 6 is default
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024'), // Minimum size to compress (bytes)
  memLevel: parseInt(process.env.COMPRESSION_MEM_LEVEL || '8'), // Memory usage level 1-9
  windowBits: parseInt(process.env.COMPRESSION_WINDOW_BITS || '15'), // Window size
  chunkSize: parseInt(process.env.COMPRESSION_CHUNK_SIZE || '16384'), // Chunk size
};

// Content types that should be compressed
const compressibleTypes = [
  'application/json',
  'application/javascript',
  'application/xml',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/xml',
  'text/csv',
  'application/csv',
  'image/svg+xml',
];

// Content types that should NOT be compressed (already compressed or binary)
const nonCompressibleTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/',
  'audio/',
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Check if content should be compressed
export function shouldCompress(
  contentType?: string,
  contentLength?: number,
  acceptEncoding?: string
): boolean {
  // Check if client accepts compression
  if (!acceptEncoding || (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate'))) {
    return false;
  }

  // Check content length threshold
  if (contentLength && contentLength < compressionConfig.threshold) {
    return false;
  }

  // Check content type
  if (contentType) {
    // Don't compress already compressed or binary content
    if (nonCompressibleTypes.some(type => contentType.includes(type))) {
      return false;
    }

    // Compress known compressible types
    if (compressibleTypes.some(type => contentType.includes(type))) {
      return true;
    }

    // Default to not compressing unknown types
    return false;
  }

  // Default to compressing if no content type specified
  return true;
}

// Compression middleware for API responses
export function createCompressionMiddleware() {
  return async function compressionMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const response = await handler(req);
    
    // Get response details
    const contentType = response.headers.get('content-type');
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    const acceptEncoding = req.headers.get('accept-encoding');

    // Check if we should compress
    if (!shouldCompress(contentType || undefined, contentLength, acceptEncoding || undefined)) {
      return response;
    }

    try {
      // Get response body
      const responseBody = await response.text();
      
      if (!responseBody || responseBody.length < compressionConfig.threshold) {
        return response;
      }

      // Determine compression method
      const supportsGzip = acceptEncoding?.includes('gzip');
      const supportsDeflate = acceptEncoding?.includes('deflate');

      let compressedBody: Buffer;
      let encoding: string;

      if (supportsGzip) {
        const zlib = await import('zlib');
        const gzip = promisify(zlib.gzip);
        compressedBody = await gzip(responseBody, {
          level: compressionConfig.level,
          memLevel: compressionConfig.memLevel,
          windowBits: compressionConfig.windowBits,
          chunkSize: compressionConfig.chunkSize,
        });
        encoding = 'gzip';
      } else if (supportsDeflate) {
        const zlib = await import('zlib');
        const deflate = promisify(zlib.deflate);
        compressedBody = await deflate(responseBody, {
          level: compressionConfig.level,
          memLevel: compressionConfig.memLevel,
          windowBits: compressionConfig.windowBits,
          chunkSize: compressionConfig.chunkSize,
        });
        encoding = 'deflate';
      } else {
        return response;
      }

      // Calculate compression ratio
      const originalSize = Buffer.byteLength(responseBody);
      const compressedSize = compressedBody.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      // Create compressed response
      const compressedResponse = new NextResponse(compressedBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'content-encoding': encoding,
          'content-length': compressedSize.toString(),
          'x-compression-ratio': `${compressionRatio}%`,
          'x-original-size': originalSize.toString(),
          'x-compressed-size': compressedSize.toString(),
          'vary': 'Accept-Encoding',
        },
      });

      return compressedResponse;
    } catch (error) {
      console.error('Compression error:', error);
      // Return original response if compression fails
      return response;
    }
  };
}

// Streaming compression for large responses
export class StreamingCompressor {
  private static instance: StreamingCompressor;

  static getInstance(): StreamingCompressor {
    if (!StreamingCompressor.instance) {
      StreamingCompressor.instance = new StreamingCompressor();
    }
    return StreamingCompressor.instance;
  }

  async compressStream(
    readable: ReadableStream,
    encoding: 'gzip' | 'deflate' = 'gzip'
  ): Promise<ReadableStream> {
    const zlib = await import('zlib');
    
    const compressor = encoding === 'gzip' 
      ? zlib.createGzip({
          level: compressionConfig.level,
          memLevel: compressionConfig.memLevel,
          windowBits: compressionConfig.windowBits,
          chunkSize: compressionConfig.chunkSize,
        })
      : zlib.createDeflate({
          level: compressionConfig.level,
          memLevel: compressionConfig.memLevel,
          windowBits: compressionConfig.windowBits,
          chunkSize: compressionConfig.chunkSize,
        });

    return new ReadableStream({
      start(controller) {
        compressor.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        compressor.on('end', () => {
          controller.close();
        });

        compressor.on('error', (error) => {
          controller.error(error);
        });
      },
      
      async pull() {
        const reader = readable.getReader();
        try {
          const { done, value } = await reader.read();
          if (done) {
            compressor.end();
          } else {
            compressor.write(value);
          }
        } catch (error) {
          compressor.destroy(error as Error);
        } finally {
          reader.releaseLock();
        }
      },
    });
  }
}

// Compression statistics
export class CompressionStats {
  private static stats = {
    totalRequests: 0,
    compressedRequests: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    averageCompressionRatio: 0,
  };

  static recordCompression(originalSize: number, compressedSize: number): void {
    this.stats.totalRequests++;
    this.stats.compressedRequests++;
    this.stats.totalOriginalSize += originalSize;
    this.stats.totalCompressedSize += compressedSize;
    
    const totalSaved = this.stats.totalOriginalSize - this.stats.totalCompressedSize;
    this.stats.averageCompressionRatio = this.stats.totalOriginalSize > 0 
      ? (totalSaved / this.stats.totalOriginalSize) * 100 
      : 0;
  }

  static recordUncompressed(): void {
    this.stats.totalRequests++;
  }

  static getStats(): {
    totalRequests: number;
    compressedRequests: number;
    compressionRate: number;
    totalBytesSaved: number;
    averageCompressionRatio: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
  } {
    const compressionRate = this.stats.totalRequests > 0 
      ? (this.stats.compressedRequests / this.stats.totalRequests) * 100 
      : 0;
    
    const totalBytesSaved = this.stats.totalOriginalSize - this.stats.totalCompressedSize;

    return {
      ...this.stats,
      compressionRate,
      totalBytesSaved,
    };
  }

  static reset(): void {
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
    };
  }
}

// Export default compression middleware
export const compressionMiddleware = createCompressionMiddleware();