# GitHub CDN

A Next.js application that serves GitHub and Gist content as a CDN. This easy-to-use tool allows you to quickly convert GitHub repository files and Gists into CDN URLs for direct access.

## Screenshots

<img width="1920" height="922" alt="Image" src="https://github.com/user-attachments/assets/c7498506-48b5-46b6-898e-da8caca8d6af" />

## Features

- Serve GitHub repository files directly via CDN URL
- Serve Gist content directly via CDN URL
- Memory-efficient caching for faster delivery
- Purge cached content when needed
- Modern, responsive UI with excellent user experience

## URL Format

### GitHub Repository Files

```
https://github.com/{username}/{repo}/{branch}/{path}
```

Example:
```
https://github.com/p32929/p32929.github.io/blob/react/README.md
```

### Gist Files

```
https://gist.github.com/{username}/{gistId}
```

Example:
```
https://gist.github.com/p32929/7a2375cf2eb3d2986a741d7dc293a4c8
```

## When to Use GitHub CDN

Here are 5 practical examples of when GitHub CDN is useful:

1. **Serving JavaScript Libraries in Web Pages**
   ```html
   <script src="https://your-cdn-domain.com/github/username/repo/branch/path/to/script.js"></script>
   ```

2. **Loading CSS Stylesheets**
   ```html
   <link rel="stylesheet" href="https://your-cdn-domain.com/github/username/repo/branch/path/to/styles.css">
   ```

3. **Embedding Code Snippets from Gists**
   ```html
   <script src="https://your-cdn-domain.com/gist/username/gistId"></script>
   ```

4. **Fetching JSON Configuration Files**
   ```javascript
   fetch('https://your-cdn-domain.com/github/username/repo/branch/path/to/config.json')
     .then(response => response.json())
     .then(data => console.log(data));
   ```

5. **Serving Text Content and Documentation**
   ```html
   <iframe src="https://your-cdn-domain.com/github/username/repo/branch/path/to/documentation.md" 
     width="100%" height="500px"></iframe>
   ```

## Limitations

GitHub CDN has some limitations you should be aware of:

1. **Binary Files**: Not optimized for serving large binary files or applications.

2. **Image Files**: While technically possible, the CDN is not optimized for image delivery. Consider using dedicated image hosting services for better performance.

3. **Rate Limiting**: Subject to GitHub API rate limits if you don't provide a GitHub token.

4. **Private Repositories**: Does not support private repositories unless you provide authentication.

5. **Frequent Updates**: If your content changes frequently, you may need to manually purge the cache.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/p32929/ghcdn.git
cd ghcdn
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env` file with the following variables:

```
GITHUB_TOKEN=your_github_token  # Optional, but recommended for higher rate limits
```

## Deployment

Deploy GitHub CDN with one click to your preferred platform:

### Quick Deploy Options

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fp32929%2Fghcdn&env=GITHUB_TOKEN&envDescription=Optional%20GitHub%20token%20for%20higher%20rate%20limits&envLink=https%3A%2F%2Fgithub.com%2Fsettings%2Ftokens&project-name=github-cdn&repository-name=github-cdn) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/p32929/ghcdn) [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fp32929%2Fghcdn)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/p32929/ghcdn) [![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/p32929/ghcdn/tree/main&refcode=47638716ddc0) [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/p32929/ghcdn)

[![Deploy to Amplify](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/p32929/ghcdn) [![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/p32929/ghcdn&branch=main&name=github-cdn)

### Additional Platforms

- **Cloudflare Pages**: Fork the repo and import it in [Cloudflare Pages](https://pages.cloudflare.com/)
- **Fly.io**: Run `fly launch` in the cloned repository
- **Cyclic**: Import from [Cyclic Dashboard](https://app.cyclic.sh/) 
- **Northflank**: Create project from [Northflank](https://app.northflank.com/)
- **Deta Space**: Use `space push` after installing [Space CLI](https://deta.space/docs/en/build/reference/cli)
- **Replit**: Import directly from [Replit](https://replit.com/github/p32929/ghcdn)
- **Glitch**: Remix on [Glitch](https://glitch.com/edit/#!/import/github/p32929/ghcdn)
- **Surge.sh**: Deploy with `surge` after building locally
- **GitHub Pages**: Use GitHub Actions for deployment (static export required)
- **Azure Static Web Apps**: Deploy via [Azure Portal](https://portal.azure.com/#create/Microsoft.StaticApp)

All platforms will auto-detect Next.js and apply appropriate build settings. No additional configuration files needed!

### Docker

Run with Docker:

```bash
docker build -t ghcdn .
docker run -p 3000:3000 -e GITHUB_TOKEN=your_token ghcdn
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | GitHub personal access token for higher API rate limits ([Create token](https://github.com/settings/tokens/new?scopes=repo)) |

Most platforms will prompt you to add environment variables during deployment.

## License
```
MIT License

Copyright (c) 2025 Fayaz Bin Salam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```