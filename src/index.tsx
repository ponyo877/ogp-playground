import { Hono } from 'hono'
import { renderer } from './renderer'
import {v4 as uuidv4} from 'uuid';
import { ulid } from 'ulid';
import { generateImage } from './lib/img' // Display を削除
// moment-timezone をインポート
import moment from 'moment-timezone';
import { renderHtml } from './metadata'


const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Created by <a href="https://x.com/ponyo877">ponyo877</a></h1>)
})

// Commenting out the /:mode route as renderHtml is not defined
// and its purpose is unclear in the context of OGP image generation.
/*
// - 現在日付・時刻がOGP画像として出る
// - 運勢(大吉~凶)がOGP画像として出る
// - ULIDがOGP画像として出る
// - 今日の「謎の四字熟語」
// - 最新のWikipediaランダム記事のタイトル
// - 1秒ごとに増える「このリンクが作られてから経過した秒数」
// - 最新のGitHubトレンド1位のリポジトリ名
*/
app.get('/:mode', (c) => {
  const key = c.req.param('mode')
  switch (key) {
    case 'wiki':
      // return c.text(renderHtml(key, 'https://ja.wikipedia.org/wiki/Special:Random'), 200, {
      //   'Content-Type': 'text/html; charset=utf-8',
      // })
      return c.text('Wiki mode is currently disabled.', 501)
    case 'github':
      // return c.text(renderHtml(key, ''), 200, {
      //   'Content-Type': 'text/html; charset=utf-8',
      // })
      return c.text('GitHub mode is currently disabled.', 501)
    default:
      return c.text(renderHtml(key, ''), 200, {
        'Content-Type': 'text/html; charset=utf-8',
      })
    }
})


app.get('/img/:mode', async (c) => {
  const key = c.req.param('mode')
  switch (key) {
    case 'timestamp': {
      // moment-timezone を使用して JST でフォーマット
      const msg = moment().tz('Asia/Tokyo').format();
      const img = await generateImage(msg); // 文字列を直接渡す
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'fortune': {
      const fortunes = ['daikichi', 'kichi', 'shoukichi', 'suekichi', 'kyou', 'daikyou'];
      const msg = fortunes[Math.floor(Math.random() * fortunes.length)];
      return c.redirect(`https://ogp-playground.folks-chat.com/fortune/${msg}.png`)
    }
    case 'uuid': {
      const msg = uuidv4();
      const img = await generateImage(msg); // 文字列を直接渡す
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    } 
    case 'ulid': {
      const msg = ulid();
      const img = await generateImage(msg); // 文字列を直接渡す
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'yojijukugo': {
      // TODO: Implement actual Yojijukugo logic
      const msg = '四字熟語'; // Placeholder
      const img = await generateImage(msg); // 文字列を直接渡す
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    case 'wiki': {
      // TODO: Implement actual Wikipedia fetching logic
      const msg = 'Wikipedia記事'; // Placeholder
      const img = await generateImage(msg); // 文字列を直接渡す
      return c.body(img, 200, {
        'Content-Type': 'image/png',
      })
    }
    default:
      return c.text('Not Found', 404)
  }
})

export default app
