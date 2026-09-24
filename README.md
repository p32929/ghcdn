# GitHub CDN

Paste a GitHub file or Gist URL, get a CDN URL you can drop straight into a `<script>`, `<link>` or `fetch()`. Self-hostable Next.js app — a jsDelivr-style alternative you run yourself.

**Live:** https://ghcdn.vercel.app

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

MIT License — Copyright (c) 2025 Fayaz Bin Salam. See [LICENSE](LICENSE) for the full text.

## Contributing

Contributions are warmly welcomed and greatly appreciated! Whether it's a bug fix, new feature, or improvement, your input helps make this project better for everyone.

Before submitting a pull request, please:

1. Create an issue describing the feature or bug fix you'd like to work on
2. Wait for discussion and approval to ensure alignment with project goals
3. Fork the repository and create your feature branch
4. Submit your pull request with a clear description of changes

This approach helps avoid duplicate efforts and ensures smooth collaboration. Thank you for considering contributing!

## Share

Sharing this repository with your friends is just one click away from here

[![facebook](https://user-images.githubusercontent.com/6418354/179013321-ac1d1452-0689-493f-9066-940cf2302b6e.png)](https://www.facebook.com/sharer/sharer.php?u=https://github.com/p32929/ghcdn/)
[![twitter](https://user-images.githubusercontent.com/6418354/179013351-7d8d6d1c-4ce2-46ab-bef8-4c4765a1b888.png)](https://twitter.com/intent/tweet?url=https://github.com/p32929/ghcdn/)
[![tumblr](https://user-images.githubusercontent.com/6418354/179013343-3111f55a-3b90-40c7-8487-9777348672b0.png)](https://www.tumblr.com/share?v=3&u=https://github.com/p32929/ghcdn/)
[![pocket](https://user-images.githubusercontent.com/6418354/179013334-b095c45f-becf-49f4-9ee1-5a731a9b1f85.png)](https://getpocket.com/save?url=https://github.com/p32929/ghcdn/)
[![pinterest](https://user-images.githubusercontent.com/6418354/179013331-44cd9206-11b1-4b65-becb-5863b61c828f.png)](https://pinterest.com/pin/create/button/?url=https://github.com/p32929/ghcdn/)
[![reddit](https://user-images.githubusercontent.com/6418354/179013338-7416ae3f-73ba-4522-86e1-1374d7082d22.png)](https://www.reddit.com/submit?url=https://github.com/p32929/ghcdn/)
[![linkedin](https://user-images.githubusercontent.com/6418354/179013327-ca7b7102-1da8-4b1c-858f-1a6e5f21bd70.png)](https://www.linkedin.com/shareArticle?mini=true&url=https://github.com/p32929/ghcdn/)
[![whatsapp](https://user-images.githubusercontent.com/6418354/179013353-f477fa0b-3e6f-4138-a357-c9991b23ff88.png)](https://api.whatsapp.com/send?text=https://github.com/p32929/ghcdn/)

<!-- hire-block -->

---

## 💼 Using this at a company?

I do fixed-price delivery work on my own projects. One invoice, one date, no hourly billing:

| | |
|---|---|
| **White-label build** — this project rebranded, extended and deployed as yours | **$6,500** · 3 weeks |
| **Custom app from scratch** on my own stack, signed and auto-updating | **$12,500** · 6 weeks |
| **Production-hardening sprint** — 72 hours on this project, for your load and your security review | **$999** |
| **Ongoing capacity** — one project-week of my time reserved every month | **$9,000 / month** |

Full details → **[p32929.github.io/hire](https://p32929.github.io/hire/)** · Email **[fayazbinsalam@uberip.com](mailto:fayazbinsalam@uberip.com)** — scoping and quotes are free and I answer within one business day.
