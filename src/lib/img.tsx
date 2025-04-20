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
          weight: (fontOptions.weight ?? 400) as any,
          style: 'normal',
        },
      ],
    },
  );

  const widthMatch = svg.match(/width="([\d.]+)"/);
  return widthMatch ? parseFloat(widthMatch[1]) : -1;
};

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
    console.log('Initial width:', currentWidth);

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
          weight: (fontOptions.weight ?? 400) as any,
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
