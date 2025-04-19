// @ts-ignore
import satori, { init } from 'satori/wasm';
// @ts-ignore
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import type { ReactNode } from 'react';
import { loadGoogleFont } from './fonts';
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

export const generateImage = async (node: ReactNode) => {
  await moduleInit();
  const notoSans = await loadGoogleFont({
    family: 'Noto Sans JP',
    weight: 100,
  });

  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'NotoSansJP',
        data: notoSans,
        weight: 100,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return pngBuffer;
};

interface Props {
  msg: string;
}

export const Display = ({
  msg,
}: Props) => {
  // コンテナ幅と文字数に基づいてフォントサイズを動的に計算
  const containerWidth = 1200 - 40; // satori幅 - 左右padding
  const maxFontSize = 150; // 最大フォントサイズ
  const minFontSize = 80;  // 最小フォントサイズ
  // 1文字あたりの幅とフォントサイズの比率を調整する係数（フォントや文字種により調整が必要）
  const adjustmentFactor = 1.5; // 係数を大きくして全体的なサイズを上げる

  let calculatedFontSize;
  if (msg.length === 0) {
    calculatedFontSize = maxFontSize; // 文字がない場合は最大サイズ
  } else {
    // 1文字あたりの許容幅に基づいてフォントサイズを計算
    calculatedFontSize = (containerWidth / msg.length) * adjustmentFactor;
  }

  // 最大・最小フォントサイズで制限
  const fontSize = Math.max(minFontSize, Math.min(maxFontSize, calculatedFontSize));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center', // テキストを中央揃え
        padding: '0 20px', // 左右に少しパディングを追加
        boxSizing: 'border-box', // パディングを幅に含める
      }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`, // 計算されたフォントサイズを適用
          lineHeight: 1, // 行高を調整してはみ出しを防ぐ
          wordBreak: 'keep-all', // 単語の途中で改行しない（日本語向け）
          overflowWrap: 'break-word', // 必要に応じて単語内で改行（長い英単語など）
        }}
      >
        {msg}
      </span>
    </div>
  );
};
