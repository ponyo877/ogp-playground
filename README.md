# OGP Playground

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/ogp-playground) <!-- Replace with your repo URL -->

A fun project demonstrating dynamic OGP (Open Graph Protocol) image generation using Cloudflare Workers, Hono, and Satori.

## Overview

This project generates various types of OGP images on the fly based on the request URL. Instead of serving static images, it creates them dynamically, allowing for real-time information to be embedded within the image shared on social media or messaging platforms.

## Features

Currently, the following dynamic OGP image generators are implemented:

*   **/img/timestamp**: Displays the current date and time in JST (Asia/Tokyo).
*   **/img/uuid**: Displays a newly generated UUID (v4).
*   **/img/ulid**: Displays a newly generated ULID.
*   **/img/yojijukugo?n={number}**: Displays a random Japanese four-character idiom (Yojijukugo), its reading, and meaning. The idiom is selected based on the `n` query parameter.
*   **/img/wiki?t={title}**: Displays a random Wikipedia article title fetched from the Japanese Wikipedia API. The title is passed via the `t` query parameter.
*   **/fortune**: (Redirects) Provides a link to a page displaying a random fortune (redirects to an external static image URL based on the fortune).

Each feature also has a corresponding HTML endpoint (e.g., `/timestamp`, `/uuid`, `/yojijukugo`, `/wiki`) that serves an HTML page with the appropriate meta tags pointing to the dynamic OGP image URL.

## Technology Stack

*   **Runtime**: Cloudflare Workers
*   **Framework**: Hono
*   **SVG Generation**: Satori (JSX to SVG)
*   **PNG Conversion**: @resvg/resvg-wasm (SVG to PNG using WASM)
*   **Layout Engine**: yoga-wasm-web (Flexbox layout for Satori, WASM)
*   **Language**: TypeScript
*   **Package Manager**: npm (or pnpm/yarn)

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/ogp-playground.git # Replace with your repo URL
    cd ogp-playground
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # pnpm install
    # or
    # yarn install
    ```

## Development

To run the development server locally (using `wrangler`):

```bash
npm run dev
```

This will typically start a server at `http://localhost:8787`.

## Usage (Endpoints)

*   **HTML Pages (for sharing):**
    *   `https://<your-worker-url>/timestamp`
    *   `https://<your-worker-url>/uuid`
    *   `https://<your-worker-url>/ulid`
    *   `https://<your-worker-url>/fortune`
    *   `https://<your-worker-url>/yojijukugo`
    *   `https://<your-worker-url>/wiki`

*   **Direct Image Generation:**
    *   `https://<your-worker-url>/img/timestamp`
    *   `https://<your-worker-url>/img/uuid`
    *   `https://<your-worker-url>/img/ulid`
    *   `https://<your-worker-url>/img/yojijukugo?n=<number>` (e.g., `n=10`)
    *   `https://<your-worker-url>/img/wiki?t=<title>` (e.g., `t=Example%20Title`)

Replace `<your-worker-url>` with the actual URL of your deployed Cloudflare Worker. The base endpoint `https://ogp-playground.ponyo877.workers.dev` is used within the code for generating image URLs in the HTML pages. You might need to update this in `src/index.tsx` if you deploy to a different domain.

## Deployment

Deploy the application to Cloudflare Workers using Wrangler:

```bash
npm run deploy
```

Make sure you have `wrangler` installed and configured with your Cloudflare account.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE). <!-- You might want to add a LICENSE file -->
