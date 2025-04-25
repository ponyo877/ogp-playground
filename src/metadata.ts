const endpoint = 'https://ogp-playground.ponyo877.workers.dev'

export const renderHtml = (mode: string, redirectURL: string) => {
  const body = '<body><h1>Created by <a href="https://x.com/ponyo877">ponyo877</a></h1></body>'
  const redirectElem = `<meta http-equiv="refresh" content="0; url=${redirectURL}" />`

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta property="og:title" content="${mode}" />
      <meta property="og:description" content="${mode}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${endpoint}/${mode}" />
      <meta property="og:image" content="${endpoint}/img/${mode}" />
      <meta property="og:site_name" content="${mode}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${mode}" />
      <meta name="twitter:description" content="${mode}" />
      <meta name="twitter:image" content="${endpoint}/img/${mode}" />
      ${redirectURL ? redirectElem : ''}
    </head>
    ${redirectURL ? '' : body}
  </html>
  `
}
