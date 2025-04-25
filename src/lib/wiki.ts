export interface Wiki {
    title: string;
    origin: string;
}


export async function randomWiki(): Promise<Wiki> {
    // <meta property="og:title" content="ルナ1960A - Wikipedia">
    // <link rel="canonical" href="https://ja.wikipedia.org/wiki/%E6%BC%A2%E5%8F%A3%E7%A9%BA%E8%A5%B2_(1939%E5%B9%B410%E6%9C%88)">
    // http://ja.wikipedia.org/wiki/Special:Randompage
    const response = await fetch(`http://ja.wikipedia.org/wiki/Special:Randompage`);
    const text = await response.text();
    const title = text.match(/<meta property="og:title" content="(.+?)">/)?.[1] || '';
    const origin = text.match(/<link rel="canonical" href="(.+?)">/)?.[1] || '';

    return { title, origin };
};