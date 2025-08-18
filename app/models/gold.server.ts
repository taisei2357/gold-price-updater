// app/models/gold.server.ts
// 田中貴金属サイトから金価格情報を取得
// 店頭小売価格、前日比、変動率を含む詳細な価格情報を返す

export interface GoldPriceData {
  retailPrice: number | null;     // 店頭小売価格（税込）
  retailPriceFormatted: string;   // フォーマット済み価格
  changeRatio: number | null;     // 前日比（小数）
  changePercent: string;          // 前日比（%表示）
  changeDirection: 'up' | 'down' | 'flat'; // 変動方向
  lastUpdated: Date;              // 取得時刻
}

let _cache: { at: number; data: GoldPriceData | null } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10分キャッシュ

export async function fetchGoldPriceDataTanaka(): Promise<GoldPriceData | null> {
  // キャッシュチェック
  if (_cache && Date.now() - _cache.at < TTL_MS) return _cache.data;

  try {
    // 田中貴金属の相場情報ページ（2025年対応）
    const url = "https://gold.tanaka.co.jp/commodity/souba/";
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();

    console.log('HTML取得成功、長さ:', html.length);

    // 新しいサイト構造に対応した価格抽出
    // テーブル構造を想定: K18やretail_tax クラスなどを使用
    let retailPrice: number | null = null;
    let changeYen: number | null = null;

    // 価格パターン 1: K18の価格を検索
    const k18Patterns = [
      /K18.*?(\d{1,3}(?:,\d{3})*)\s*円/gi,
      /18金.*?(\d{1,3}(?:,\d{3})*)\s*円/gi,
      /<td[^>]*retail_tax[^>]*>([^<]*(\d{1,3}(?:,\d{3})*)[^<]*円)/gi,
      /shop.*?(\d{1,3}(?:,\d{3})*)\s*円/gi,
      /(\d{1,3}(?:,\d{3})*)\s*円(?!.*前日比)/g
    ];

    for (const pattern of k18Patterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        // 最初にマッチした価格を使用（通常最も大きな価格が店頭小売価格）
        const priceStr = matches[0][1] || matches[0][2];
        if (priceStr) {
          const price = parseInt(priceStr.replace(/,/g, ''));
          if (price > 10000 && price < 50000) { // 妥当な価格範囲
            retailPrice = price;
            console.log('価格マッチ:', matches[0][0], '→', price);
            break;
          }
        }
      }
    }

    // 前日比パターン（改良版）
    const changePatterns = [
      /前日比[^円\-+\d]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/gi,
      /変動[^円\-+\d]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/gi,
      /([+\-]\d+(?:\.\d+)?)\s*円.*?前日比/gi,
      /<td[^>]*>([+\-]?\d+(?:\.\d+)?)\s*円<\/td>/gi
    ];

    for (const pattern of changePatterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        const changeStr = matches[0][1];
        const change = parseFloat(changeStr);
        if (!isNaN(change) && Math.abs(change) <= 1000) { // 妥当な変動範囲
          changeYen = change;
          console.log('変動マッチ:', matches[0][0], '→', change);
          break;
        }
      }
    }

    // デバッグ: マッチしなかった場合、関連する部分を出力
    if (!retailPrice) {
      const priceContexts = html.match(/.{0,50}(\d{1,3}(?:,\d{3})*)\s*円.{0,50}/gi);
      console.log('価格コンテキスト（最初の5つ）:', priceContexts?.slice(0, 5));
    }
    
    if (changeYen === null) {
      const changeContexts = html.match(/.{0,50}前日比.{0,50}/gi);
      console.log('前日比コンテキスト:', changeContexts?.slice(0, 3));
    }

    // デバッグログ
    console.log('Gold price extraction result:', {
      retailPrice,
      changeYen,
      url: url
    });
    
    // 変動率を計算（前日比円 / 店頭小売価格）
    const changeRatio = (changeYen !== null && retailPrice !== null) 
      ? changeYen / retailPrice 
      : null;
    
    const changePercent = changeRatio !== null 
      ? `${(changeRatio * 100).toFixed(2)}%` 
      : '0.00%';
    
    // 変動方向を判定
    let changeDirection: 'up' | 'down' | 'flat' = 'flat';
    if (changeRatio !== null) {
      if (changeRatio > 0) changeDirection = 'up';
      else if (changeRatio < 0) changeDirection = 'down';
    }

    const data: GoldPriceData = {
      retailPrice,
      retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : '取得失敗',
      changeRatio,
      changePercent: changeRatio !== null ? (changeRatio >= 0 ? `+${changePercent}` : changePercent) : '0.00%',
      changeDirection,
      lastUpdated: new Date()
    };

    _cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    console.error('田中貴金属価格取得エラー:', error);
    _cache = { at: Date.now(), data: null };
    return null;
  }
}

// 後方互換性のための関数（既存コードで使用）
export async function fetchGoldChangeRatioTanaka(): Promise<number | null> {
  const data = await fetchGoldPriceDataTanaka();
  return data?.changeRatio || null;
}