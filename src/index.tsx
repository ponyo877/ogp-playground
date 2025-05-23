import { Hono } from 'hono'
import { renderer } from './renderer'
import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulid';
import { generateImage, generateWrappingImage, generateYojijukugoImage, generateWikiImage } from './lib/img' // Display を削除
import moment from 'moment-timezone';
import { renderHtml } from './metadata'
import { yojijukugos } from './lib/yojijukugos'
import { randomWiki } from './lib/wiki'

const endpoint = 'https://ogp-playground.ponyo877.workers.dev'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Created by <a href="https://x.com/ponyo877">ponyo877</a></h1>)
})

// Commenting out the /:mode route as renderHtml is not defined
// and its purpose is unclear in the context of OGP image generation.
// - 現在日付・時刻がOGP画像として出る
// - 運勢(大吉~凶)がOGP画像として出る
// - UUID,ULIDがOGP画像として出る
// - 今日の四字熟語
// - 最新のWikipediaランダム記事のタイトル
app.get('/:mode', async (c) => {
  const key = c.req.param('mode')
  let imageURL = ''
  switch (key) {
    case 'fortune':
      const fortunes = ['daikichi', 'kichi', 'shoukichi', 'suekichi', 'kyou', 'daikyou'];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      imageURL = `${endpoint}/img/fortune?f=${encodeURIComponent(fortune)}`;
      return c.text(renderHtml(key, imageURL, ''), 200, {
        'Content-Type': 'text/html; charset=utf-8',
      })
    case 'wiki':
      const wiki = await randomWiki()
      imageURL = `${endpoint}/img/wiki?t=${encodeURIComponent(wiki.title)}`;
      return c.text(renderHtml(key, imageURL, ''), 200, {
        'Content-Type': 'text/html; charset=utf-8',
      })
    case 'yojijukugo':
      const number = Math.floor(Math.random() * yojijukugos.length);
      imageURL = `${endpoint}/img/yojijukugo?n=${number}`;
      return c.text(renderHtml(key, imageURL, ''), 200, {
        'Content-Type': 'text/html; charset=utf-8',
      })
    // case 'free':
    //   const msg = c.req.query('m') || '<BLANK>';
    //   imageURL = `${endpoint}/img/free?m=${encodeURIComponent(msg)}`;
    //   return c.text(renderHtml(key, imageURL, ''), 200, {
    //     'Content-Type': 'text/html; charset=utf-8',
    //   })
    default:
      return c.text(renderHtml(key, '', ''), 200, {
        'Content-Type': 'text/html; charset=utf-8',
      })
  }
})


app.get('/img/:mode', async (c) => {
  const key = c.req.param('mode')
  switch (key) {
    case 'timestamp': {
      const msg = moment().tz('Asia/Tokyo').format();
      const img = await generateImage(msg);
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'uuid': {
      const msg = uuidv4();
      const img = await generateImage(msg);
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'ulid': {
      const msg = ulid();
      const img = await generateImage(msg);
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'fortune': {
      const fortune = c.req.query('f') || '<BLANK>';
      return c.redirect(`https://ogp-playground.folks-chat.com/fortune/${fortune}.png`)
    }
    case 'yojijukugo': {
      const numberStr = c.req.query('n');
      const number = numberStr ? parseInt(numberStr, 10) : 0;
      const img = await generateYojijukugoImage(number);
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'wiki': {
      const title = c.req.query('t') || '<BLANK>';
      const img = await generateWikiImage(title);
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    // case 'free': {
    //   const msg = c.req.query('m') || '<BLANK>';
    //   const img = await generateWrappingImage(msg);
    //   return c.body(img, 200, {
    //     'Content-Type': 'image/png',
    //   })
    // }
    default:
      return c.text('Not Found', 404)
  }
})

export default app
