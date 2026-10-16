export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
      { userAgent: ['GPTBot', 'CCBot', 'Bytespider', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'], disallow: '/' },
    ],
  };
}
