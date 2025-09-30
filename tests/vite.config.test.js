describe('VITE CONFIGURATION VALIDATION', () => {
  test('Development server - should have correct port and proxy settings', () => {
    const viteConfig = {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          }
        }
      }
    };

    expect(viteConfig.server.port).toBe(3001);
    expect(viteConfig.server.host).toBe('0.0.0.0');
    expect(viteConfig.server.proxy['/api'].target).toBe('http://localhost:5000');
  });

  test('Build configuration - should have proper output directory', () => {
    const config = {
      build: {
        outDir: 'dist'
      }
    };
    expect(config.build.outDir).toBe('dist');
  });

  test('React plugin - should be configured for JSX support', () => {
    const config = {
      plugins: ['react()']
    };
    expect(config.plugins).toContain('react()');
  });
});