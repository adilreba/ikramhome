export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/images/'],
        disallow: ['/api/admin', '/api/inquiries', '/api/products', '/api/categories', '/api/settings', '/panel-2f1b55'],
      },
      { userAgent: ['GPTBot', 'CCBot', 'Bytespider', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'], disallow: '/' },
    ],
  };
}
