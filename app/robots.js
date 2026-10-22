export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api'] },
      { userAgent: ['GPTBot', 'CCBot', 'Bytespider', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'], disallow: '/' },
    ],
  };
}
