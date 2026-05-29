import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Setup JSON parsing with safe payload handling for 10k+ links
app.use(express.json({ limit: '20mb' }));

const LOCAL_DATA_PATH = path.join(process.cwd(), 'data', 'links.json');

// Memory Cache
let cachedMovies: any[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 6000; // 6 seconds cache window to avoid API rate limits on dense views

interface GitHubConfig {
  token: string | undefined;
  owner: string | undefined;
  repo: string | undefined;
  branch: string;
}

function getGitHubConfig(): GitHubConfig {
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function isGitHubConfigured(config = getGitHubConfig()): boolean {
  return !!(config.token && config.owner && config.repo);
}

// Retrieve from GitHub (or local file filesystem fallback)
async function readMoviesFromDataSource(): Promise<any[]> {
  const config = getGitHubConfig();
  const now = Date.now();

  if (cachedMovies && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedMovies;
  }

  if (isGitHubConfigured(config)) {
    try {
      console.log(`[Database] Retrieving links.json from GitHub (${config.owner}/${config.repo} branch: ${config.branch})`);
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data/links.json?ref=${config.branch}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cinemood-Drive-Server'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');
        cachedMovies = JSON.parse(decodedContent);
        lastFetchTime = now;
        return cachedMovies!;
      } else if (response.status === 404) {
        console.log('[Database] links.json does not exist in target GitHub repo yet. Creating one from local seed data...');
        const seedMovies = getFallbackSeedMovies();
        await writeMoviesToGitHub(seedMovies, config);
        cachedMovies = seedMovies;
        lastFetchTime = now;
        return seedMovies;
      } else {
        const errText = await response.text();
        console.error(`[Database] GitHub Contents API returned state ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.error('[Database] Failed to request GitHub API. Triaging to local filesystem data fallback:', err);
    }
  }

  // Local filesystem fallback
  try {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
      const localData = fs.readFileSync(LOCAL_DATA_PATH, 'utf8');
      cachedMovies = JSON.parse(localData);
      lastFetchTime = now;
      return cachedMovies!;
    }
  } catch (err) {
    console.error('[Database] Local read stream failure:', err);
  }

  const seed = getFallbackSeedMovies();
  cachedMovies = seed;
  lastFetchTime = now;
  return seed;
}

// Persist to local filesystem AND GitHub repository if registered
async function saveMoviesToDataSource(movies: any[]): Promise<boolean> {
  cachedMovies = movies;
  lastFetchTime = Date.now();

  const config = getGitHubConfig();

  // 1. Instantly reserve local cache filesystem write
  try {
    const dir = path.dirname(LOCAL_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(movies, null, 2), 'utf8');
    console.log('[Database] Safely saved to local storage backup.');
  } catch (err) {
    console.error('[Database] Local backup write failure:', err);
  }

  // 2. Commit transaction to GitHub
  if (isGitHubConfigured(config)) {
    try {
      await writeMoviesToGitHub(movies, config);
      return true;
    } catch (err) {
      console.error('[Database] Failed to write database to GitHub:', err);
      return false;
    }
  }
  return true;
}

async function writeMoviesToGitHub(movies: any[], config: GitHubConfig) {
  const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data/links.json?ref=${config.branch}`;
  const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data/links.json`;
  
  let sha: string | undefined;

  try {
    console.log(`[Database] Retrieving links.json SHA from GitHub: ${getUrl}`);
    const response = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cinemood-Drive-Server'
      }
    });
    if (response.ok) {
      const data = await response.json() as any;
      sha = data.sha;
      console.log(`[Database] Successfully retrieved current SHA: ${sha}`);
    } else {
      const errText = await response.text();
      console.log(`[Database] SHA retrieval returned status ${response.status}: ${errText}`);
    }
  } catch (err) {
    console.warn('[Database] Could not load current SHA from GitHub contents:', err);
  }

  const contentBase64 = Buffer.from(JSON.stringify(movies, null, 2), 'utf8').toString('base64');

  console.log(`[Database] Writing updated links.json to GitHub: ${putUrl} (branch: ${config.branch}, sha: ${sha || 'NEW_FILE'})`);

  const putResponse = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Cinemood-Drive-Server'
    },
    body: JSON.stringify({
      message: 'Update Cinemood links database [skip ci]',
      content: contentBase64,
      sha: sha,
      branch: config.branch
    })
  });

  if (!putResponse.ok) {
    const putErrText = await putResponse.text();
    console.error(`[Database] GitHub PUT API call failed! Status: ${putResponse.status}. Response Body:`, putErrText);
    throw new Error(`GitHub contents commit returned status ${putResponse.status}: ${putErrText}`);
  }
  console.log('[Database] Permanent GitHub repository sync push complete!');
}

function getFallbackSeedMovies(): any[] {
  try {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
      const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {}
  return [];
}

// API ROUTE: Database and storage synchronization environment properties
app.get('/api/status', (req, res) => {
  const config = getGitHubConfig();
  const configuredValue = isGitHubConfigured(config);
  res.json({
    configured: true,
    url: configuredValue ? `https://github.com/${config.owner}/${config.repo}` : 'local://data/links.json',
    hasKey: configuredValue,
    provider: configuredValue ? 'GitHub API Persistent Storage' : 'Server-Side JSON Database Storage'
  });
});

// API ROUTE: Diagnostic test endpoint to verify GitHub connection, Repository access, and Write permissions
app.get('/api/test-github', async (req, res) => {
  const config = getGitHubConfig();
  const report: any = {
    timestamp: new Date().toISOString(),
    config: {
      token_configured: !!config.token,
      token_preview: config.token ? `${config.token.substring(0, 4)}... (len: ${config.token.length})` : 'Missing',
      owner: config.owner || 'Missing',
      repo: config.repo || 'Missing',
      branch: config.branch,
      configured: isGitHubConfigured(config)
    },
    checks: {}
  };

  if (!isGitHubConfigured(config)) {
    console.warn('[Diagnostics] GitHub storage is not configured in environment.');
    return res.json({
      success: false,
      message: 'GitHub storage is not configured in the server environment (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO are required)',
      report
    });
  }

  try {
    // Check 1: General connection & repository permissions
    const repoUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    console.log(`[Diagnostics] Testing connection to repo: ${repoUrl}`);
    const repoResp = await fetch(repoUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cinemood-Diagnostics'
      }
    });

    report.checks.repo_api = {
      status_code: repoResp.status,
      ok: repoResp.ok
    };

    if (!repoResp.ok) {
      const repoErr = await repoResp.text();
      console.error(`[Diagnostics] GitHub Repo API returned status ${repoResp.status}:`, repoErr);
      report.checks.repo_api.error = repoErr;
      return res.json({ success: false, message: 'Failed to access the GitHub repository. Check credentials.', report });
    }

    const repoData = await repoResp.json() as any;
    report.checks.repo_api.name = repoData.full_name;
    report.checks.repo_api.permissions = repoData.permissions;

    // Check 2: Try to read links.json
    const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data/links.json?ref=${config.branch}`;
    console.log(`[Diagnostics] Testing GET for data/links.json: ${getUrl}`);
    const getFileResp = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cinemood-Diagnostics'
      }
    });

    report.checks.file_read = {
      status_code: getFileResp.status,
      ok: getFileResp.ok
    };

    if (getFileResp.ok) {
      const fileData = await getFileResp.json() as any;
      report.checks.file_read.sha = fileData.sha;
      report.checks.file_read.size = fileData.size;
    } else {
      const getErr = await getFileResp.text();
      console.warn(`[Diagnostics] GET links.json returned status ${getFileResp.status}:`, getErr);
      report.checks.file_read.error = getErr;
    }

    // Check 3: Check write permissions via a temporary test file
    const testPath = `data/test-write-${Date.now()}.json`;
    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${testPath}`;
    console.log(`[Diagnostics] Testing write access via PUT to: ${putUrl}`);

    const testContent = Buffer.from(JSON.stringify({ test: "ok", time: new Date().toISOString() })).toString('base64');
    const putResp = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Cinemood-Diagnostics'
      },
      body: JSON.stringify({
        message: 'Cinemood storage permissions test [skip ci]',
        content: testContent,
        branch: config.branch
      })
    });

    report.checks.file_write = {
      status_code: putResp.status,
      ok: putResp.ok
    };

    if (putResp.ok) {
      const putData = await putResp.json() as any;
      const testSha = putData.content.sha;
      console.log(`[Diagnostics] Write SUCCESS! SHA: ${testSha}. Attempting immediate deletion cleanup...`);

      // Delete the test file to keep repo clean
      const delResp = await fetch(putUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Cinemood-Diagnostics'
        },
        body: JSON.stringify({
          message: 'Clean up diagnostics file [skip ci]',
          sha: testSha,
          branch: config.branch
        })
      });
      console.log(`[Diagnostics] Cleanup delete response status: ${delResp.status}`);
    } else {
      const putErr = await putResp.text();
      console.error(`[Diagnostics] PUT test-write returned status ${putResp.status}:`, putErr);
      report.checks.file_write.error = putErr;
    }

    const overallSuccess = report.checks.repo_api.ok && report.checks.file_write.ok;
    return res.json({
      success: overallSuccess,
      message: overallSuccess ? 'All GitHub checks passed successfully! Auto-save is fully operational.' : 'Some GitHub checks failed. See detailed report.',
      report
    });

  } catch (err: any) {
    console.error('[Diagnostics] Unexpected error during diagnostics run:', err);
    return res.status(500).json({
      success: false,
      message: 'Unexpected internal diagnostics exception occurred',
      error: err.message,
      report
    });
  }
});

// API ROUTE: Get all links
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await readMoviesFromDataSource();
    res.json(movies);
  } catch (error: any) {
    res.status(500).json({ error: 'Database loading failure', message: error.message });
  }
});

// API ROUTE: Add static movie link
app.post('/api/movies', async (req, res) => {
  try {
    const movieData = req.body;
    const movies = await readMoviesFromDataSource();
    
    const newMovie = {
      ...movieData,
      id: `m-${Math.random().toString(36).substring(2, 11)}`,
      views_count: 0,
      downloads_count: 0,
      created_at: new Date().toISOString()
    };
    
    // Auto prevent duplicates on slug as requested
    const exists = movies.some((m: any) => m.slug.toLowerCase().trim() === newMovie.slug.toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ error: 'Duplicate slug', message: 'A link with this slug already exists.' });
    }

    movies.unshift(newMovie);
    await saveMoviesToDataSource(movies);
    res.status(201).json(newMovie);
  } catch (error: any) {
    res.status(500).json({ error: 'Database transactional write failure', message: error.message });
  }
});

// API ROUTE: Update static movie link properties
app.put('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;
    const movies = await readMoviesFromDataSource();
    const idx = movies.findIndex((m: any) => m.id === id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Not found', message: 'Requested ID not found' });
    }

    movies[idx] = {
      ...movies[idx],
      ...updatedFields
    };

    await saveMoviesToDataSource(movies);
    res.json(movies[idx]);
  } catch (error: any) {
    res.status(500).json({ error: 'Database transactional update failure', message: error.message });
  }
});

// API ROUTE: Delete static movie link
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movies = await readMoviesFromDataSource();
    const filtered = movies.filter((m: any) => m.id !== id);
    
    await saveMoviesToDataSource(filtered);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Database deletion atomic failure', message: error.message });
  }
});

// API ROUTE: View counting stream proxy
app.post('/api/movies/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const movies = await readMoviesFromDataSource();
    const idx = movies.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      movies[idx].views_count = (movies[idx].views_count || 0) + 1;
      await saveMoviesToDataSource(movies);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'View synchronization failure', message: error.message });
  }
});

// API ROUTE: Download counting stream proxy
app.post('/api/movies/:id/downloads', async (req, res) => {
  try {
    const { id } = req.params;
    const movies = await readMoviesFromDataSource();
    const idx = movies.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      movies[idx].downloads_count = (movies[idx].downloads_count || 0) + 1;
      await saveMoviesToDataSource(movies);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Download synchronization failure', message: error.message });
  }
});

// Start dev environment Vite server versus serving production artifact build
async function startAppServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Cinemood active and listening on port ${PORT}`);
  });
}

startAppServer();
