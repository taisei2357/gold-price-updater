// app/routes/api.test-gold-price.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

// 金価格変動率を取得
async function fetchGoldChangeRatioTanaka() {
  try {
    const response = await fetch('https://gold.tanaka.co.jp/commodity/souba/');
    const html = await response.text();
    
    console.log('HTML取得成功、長さ:', html.length);
    
    // デバッグ用：K18周辺のテキストを抽出
    const k18Context = html.match(/K18.{0,200}/gi);
    console.log('K18周辺のテキスト:', k18Context);
    
    // 前日比周辺のテキストを抽出
    const changeContext = html.match(/.{0,100}前日比.{0,100}/gi);
    console.log('前日比周辺のテキスト:', changeContext);
    
    // K18の価格情報を抽出
    const priceMatch = html.match(/K18.*?(\d{1,3}(?:,\d{3})*)/);
    const changeMatch = html.match(/前日比[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i) ||
                       html.match(/変動[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i);
    
    console.log('価格マッチ:', priceMatch);
    console.log('変動マッチ:', changeMatch);
    
    if (!priceMatch || !changeMatch) {
      return {
        success: false,
        error: '金価格データの抽出に失敗',
        html: html.substring(0, 1000),
        priceMatch,
        changeMatch
      };
    }
    
    const retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    const changeYen = parseFloat(changeMatch[1]);
    const changeRatio = changeYen / retailPrice;
    
    return {
      success: true,
      retailPrice,
      changeYen,
      changeRatio,
      changePercent: (changeRatio * 100).toFixed(2) + '%',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('金価格取得エラー:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export const loader: LoaderFunction = async () => {
  const result = await fetchGoldChangeRatioTanaka();
  return json(result);
};