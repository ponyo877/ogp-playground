// @ts-ignore
import satori, { init } from 'satori/wasm';
// @ts-ignore
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { loadGoogleFont, type FontOptions } from './fonts'; // FontOptions をインポート
import yogaWasm from '../vender/yoga.wasm';
import resvgWasm from '../vender/resvg.wasm';

const genModuleInit = () => {
  let isInit = false;
  return async () => {
    if (isInit) {
      return;
    }
    init(await initYoga(yogaWasm));
    await initWasm(resvgWasm);
    isInit = true;
  };
};
const moduleInit = genModuleInit();

const calculateTextWidth = async (
  text: string,
  fontSize: number,
  fontData: ArrayBuffer,
  fontOptions: FontOptions,
): Promise<number> => {
  const node = (
    <div
      style={{
        fontSize: fontSize,
        fontFamily: fontOptions.family,
        display: 'flex',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
  const svg = await satori(
    node, // JSX要素を渡す
    {
      height: 200,
      fonts: [
        {
          name: fontOptions.family,
          data: fontData,
          weight: (fontOptions.weight ?? 100) as any,
          style: 'normal',
        },
      ],
    },
  );

  const widthMatch = svg.match(/width="([\d.]+)"/);
  return widthMatch ? parseFloat(widthMatch[1]) : -1;
};

const calculateTextHeight = async (
  text: string,
  fontSize: number,
  fontData: ArrayBuffer,
  fontOptions: FontOptions,
): Promise<number> => {
  const node = (
    <div
      style={{
        width: 1200 - 40 * 2,
        display: 'flex',
      }}
    >
      <div
        style={{
          fontSize: fontSize,
          fontWeight: fontOptions.weight,
          lineHeight: 1.2,
          textAlign: 'center',
          fontFamily: fontOptions.family,
          maxWidth: '100%',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        }}
      >
        {text}
      </div>
    </div>
  );

  const svg = await satori(
    node,
    {
      width: 1200,
      fonts: [
        {
          name: fontOptions.family,
          data: fontData,
          weight: (fontOptions.weight ?? 100) as any,
          style: 'normal',
        },
      ],
    },
  );

  const heightMatch = svg.match(/height="([\d.]+)"/);
  return heightMatch ? parseFloat(heightMatch[1]) : -1;
};

async function calculateFontSize(
  text: string,
  fontData: ArrayBuffer,
  fontOptions: FontOptions,
): Promise<number> {
  const minFontSize = 5;
  const maxFontSize = 100;
  const heightLimit = 630 - 40 * 2;

  let low = minFontSize;
  let high = maxFontSize;
  let bestFitFontSize = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const heightAtMidFont = await calculateTextHeight(text, mid, fontData, fontOptions);
    if (heightAtMidFont <= heightLimit) {
      bestFitFontSize = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFitFontSize;
}

const UNKNOWN_EMOJI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="#CCC"><rect width="36" height="36"/></svg>`;

function getIconCode(text: string): string {
  const codePoint = text.codePointAt(0);
  if (codePoint) return codePoint.toString(16);
  return '';
}

async function loadAdditionalAsset(_code: string, text: string): Promise<string> {
  if (_code !== 'emoji') {
    return `data:image/svg+xml;base64,${btoa(UNKNOWN_EMOJI_SVG)}`;
  }
  const code = getIconCode(text);
  if (!code) {
    return `data:image/svg+xml;base64,${btoa(UNKNOWN_EMOJI_SVG)}`;
  }
  const version = '15.1.0';
  const response = await fetch(`https://cdnjs.cloudflare.com/ajax/libs/twemoji/${version}/svg/${code.toLowerCase()}.svg`);
  const emojiSvg = await response.text();
  return `data:image/svg+xml;base64,${btoa(emojiSvg)}`;
}

export const generateWrappingImage = async (msg: string) => {
  await moduleInit();

  const fontOptions: FontOptions = {
    family: 'Noto Sans JP',
    weight: 100,
  };
  const notoSans = await loadGoogleFont(fontOptions);
  const fontSize = await calculateFontSize(msg, notoSans, fontOptions);
  const svg = await satori(
    <WrapDisplay msg={msg} fontSize={fontSize} />,
    {
      width: 1200,
      height: 630,
      loadAdditionalAsset: loadAdditionalAsset,
      fonts: [
        { name: 'Noto Sans JP', data: notoSans, weight: 100, style: 'normal' },
      ],
    }
  );

  // ResvgでPNGに変換
  const resvg = new Resvg(svg, {});
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return pngBuffer;
}

export const generateImage = async (msg: string) => {
  await moduleInit();

  const fontOptions: FontOptions = {
    family: 'Noto Sans JP',
    weight: 100,
  };
  const notoSans = await loadGoogleFont(fontOptions);
  const margin = 100; // 左右マージン
  const targetWidth = 1200 - margin;
  const maxFontSize = 150;
  const minFontSize = 10;
  let fontSize = maxFontSize;

  if (msg && msg.length > 0) {
    let currentWidth = await calculateTextWidth(msg, fontSize, notoSans, fontOptions);

    // 精度が低い場合は二分探索などを検討
    if (currentWidth > 0 && currentWidth !== targetWidth) {
      fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize * (targetWidth / currentWidth)));
    }
  }


  // 最終的なフォントサイズでDisplayコンポーネントを生成
  const node = <Display msg={msg} fontSize={fontSize} />;

  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: fontOptions.family,
        data: notoSans,
        weight: (fontOptions.weight ?? 100) as any,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return pngBuffer;
};

interface DisplayProps {
  msg: string;
  fontSize: number; // フォントサイズをPropsで受け取る
}

// Displayコンポーネントは受け取ったフォントサイズで表示するだけ
export const Display = ({ msg, fontSize }: DisplayProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 20px', // 左右マージン
        boxSizing: 'border-box',
        backgroundColor: 'white', // 背景色を追加（任意）
      }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`, // 計算されたフォントサイズを適用
          fontFamily: 'Noto Sans JP', // フォントファミリー指定
          lineHeight: 1.2, // 行高を少し調整
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
      >
        {msg}
      </span>
    </div>
  );
};


export const WrapDisplay = ({ msg, fontSize }: DisplayProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 20px', // 左右マージン
        boxSizing: 'border-box',
        whiteSpace: 'normal', // 折り返しを有効にする
        wordWrap: 'break-word', // 単語の途中で折り返しを許可
        backgroundColor: 'white', // 背景色を追加（任意）
      }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`, // 計算されたフォントサイズを適用
          fontFamily: 'Noto Sans JP', // フォントファミリー指定
          lineHeight: 1.2, // 行高を少し調整
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
      >
        {msg}
      </span>
    </div>
  );
};
