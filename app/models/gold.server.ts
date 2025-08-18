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

    // 正確なHTML構造に基づく価格抽出
    // class="gold"のテーブル行から正確に抽出
    let retailPrice: number | null = null;
    let changeYen: number | null = null;

    // 金のテーブル行を取得（class="gold"）
    const goldRowMatch = html.match(/<tr[^>]*class="gold"[^>]*>.*?<\/tr>/is);
    if (goldRowMatch) {
      const goldRow = goldRowMatch[0];
      console.log('金行取得成功');
      
      // 小売価格抽出: class="retail_tax"のセル
      const priceMatch = goldRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
      if (priceMatch) {
        retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
        console.log('価格抽出:', priceMatch[0], '→', retailPrice);
      }
      
      // 前日比抽出: class="retail_ratio"のセル
      const changeMatch = goldRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
      if (changeMatch) {
        changeYen = parseFloat(changeMatch[1]);
        console.log('前日比抽出:', changeMatch[0], '→', changeYen);
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