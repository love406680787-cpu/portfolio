/**
 * GitHub API Proxy - Vercel Serverless Function
 * 
 * Proxies requests to GitHub API so the browser doesn't need direct access.
 * All GitHub API calls from admin.html go through this endpoint.
 * 
 * Usage: POST /api/github-proxy
 * Body: { method, path, body?, headers? }
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { method = 'GET', path, body, headers = {} } = req.body;

    if (!path) {
      return res.status(400).json({ error: 'Missing "path" parameter' });
    }

    // Security: only allow github.com API calls
    if (!path.startsWith('/repos/') && !path.startsWith('/user') && !path.startsWith('/search/')) {
      return res.status(403).json({ error: 'Invalid API path' });
    }

    const url = `https://api.github.com${path}`;
    
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Portfolio-Admin/1.0',
        ...headers,
      },
    };

    if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!fetchOptions.headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, fetchOptions);

    // Forward the status code
    const data = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    
    return res.send(data);

  } catch (error) {
    console.error('GitHub proxy error:', error);
    return res.status(502).json({ 
      error: 'Failed to connect to GitHub API', 
      message: error.message 
    });
  }
}
