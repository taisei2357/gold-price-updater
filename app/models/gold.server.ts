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
    // 田中貴金属の「本日の地金価格」ページ
    const url = "https://gold.tanaka.co.jp/commodity/souba/index.php";
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();

    // 店頭小売価格（税込）を抽出
    // パターン例: "店頭小売価格（税込）：12,345円/g"
    const priceMatch = html.match(/店頭小売価格[^：]*：[^0-9]*([0-9,]+)[^0-9]*円/i) ||
                      html.match(/小売価格[^：]*：[^0-9]*([0-9,]+)[^0-9]*円/i) ||
                      html.match(/金価格[^：]*：[^0-9]*([0-9,]+)[^0-9]*円/i);
    
    const retailPriceStr = priceMatch ? priceMatch[1].replace(/,/g, '') : null;
    const retailPrice = retailPriceStr ? parseInt(retailPriceStr) : null;

    // 前日比を抽出
    // パターン例: "前日比 +2.50%" / "前日比：-0.85%"
    const changeMatch = html.match(/前日比[^%\-+]*([+\-]?\d+(?:\.\d+)?)\s*%/i) ||
                       html.match(/変動率[^%\-+]*([+\-]?\d+(?:\.\d+)?)\s*%/i);
    
    const changeRatio = changeMatch ? Number(changeMatch[1]) / 100 : null;
    const changePercent = changeMatch ? `${changeMatch[1]}%` : '0.00%';
    
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