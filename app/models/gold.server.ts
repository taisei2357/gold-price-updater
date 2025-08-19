// app/models/gold.server.ts
// 田中貴金属サイトから金・プラチナ価格情報を取得
// 店頭小売価格、前日比、変動率を含む詳細な価格情報を返す

export type MetalType = 'gold' | 'platinum';

export interface MetalPriceData {
  metalType: MetalType;           // 金属種別
  retailPrice: number | null;     // 店頭小売価格（税込）
  retailPriceFormatted: string;   // フォーマット済み価格
  buyPrice: number | null;        // 店頭買取価格（税込）
  buyPriceFormatted: string;      // フォーマット済み買取価格
  changeRatio: number | null;     // 前日比（小数）
  changePercent: string;          // 前日比（%表示）
  buyChangeRatio: number | null;  // 買取価格前日比（小数）
  buyChangePercent: string;       // 買取価格前日比（%表示）
  changeDirection: 'up' | 'down' | 'flat'; // 変動方向
  lastUpdated: Date;              // 取得時刻
}

// 後方互換性のための型エイリアス
export type GoldPriceData = MetalPriceData;

// 金属種別ごとのキャッシュ
let _goldCache: { at: number; data: MetalPriceData | null } | null = null;
let _platinumCache: { at: number; data: MetalPriceData | null } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10分キャッシュ

// 金属種別に応じたURL取得
function getMetalUrl(metalType: MetalType): string {
  switch (metalType) {
    case 'gold':
      return 'https://gold.tanaka.co.jp/commodity/souba/';
    case 'platinum':
      return 'https://gold.tanaka.co.jp/commodity/souba/d-platinum.php';
    default:
      throw new Error(`Unsupported metal type: ${metalType}`);
  }
}

// 金属種別に応じたクラス名取得
function getMetalRowClass(metalType: MetalType): string {
  switch (metalType) {
    case 'gold':
      return 'gold';
    case 'platinum':
      return 'pt'; // プラチナのclass名
    default:
      throw new Error(`Unsupported metal type: ${metalType}`);
  }
}

// 統一的な金属価格取得関数
export async function fetchMetalPriceData(metalType: MetalType): Promise<MetalPriceData | null> {
  // 適切なキャッシュを選択
  const cache = metalType === 'gold' ? _goldCache : _platinumCache;
  
  // キャッシュチェック
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  try {
    // 金属種別に応じたURL取得
    const url = getMetalUrl(metalType);
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();

    console.log(`${metalType} HTML取得成功、長さ:`, html.length);

    // 正確なHTML構造に基づく価格抽出
    let retailPrice: number | null = null;
    let changeYen: number | null = null;
    let buyPrice: number | null = null;
    let buyChangeYen: number | null = null;

    // 金属のテーブル行を取得（metalTypeに応じたclass）
    const metalRowClass = getMetalRowClass(metalType);
    const metalRowMatch = html.match(new RegExp(`<tr[^>]*class="${metalRowClass}"[^>]*>.*?</tr>`, 'is'));
    if (metalRowMatch) {
      const metalRow = metalRowMatch[0];
      console.log(`${metalType}行取得成功`);
      
      // 小売価格抽出: class="retail_tax"のセル
      const priceMatch = metalRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
      if (priceMatch) {
        retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
        console.log('小売価格抽出:', priceMatch[0], '→', retailPrice);
      }
      
      // 買取価格抽出: class="purchase_tax"のセル
      const buyPriceMatch = metalRow.match(/<td[^>]*class="purchase_tax"[^>]*>([\d,]+)\s*円/);
      if (buyPriceMatch) {
        buyPrice = parseInt(buyPriceMatch[1].replace(/,/g, ''));
        console.log('買取価格抽出:', buyPriceMatch[0], '→', buyPrice);
      }
      
      // 小売価格前日比抽出: class="retail_ratio"のセル
      const changeMatch = metalRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
      if (changeMatch) {
        changeYen = parseFloat(changeMatch[1]);
        console.log('小売価格前日比抽出:', changeMatch[0], '→', changeYen);
      }
      
      // 買取価格前日比抽出: class="purchase_ratio"のセル
      const buyChangeMatch = metalRow.match(/<td[^>]*class="purchase_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
      if (buyChangeMatch) {
        buyChangeYen = parseFloat(buyChangeMatch[1]);
        console.log('買取価格前日比抽出:', buyChangeMatch[0], '→', buyChangeYen);
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
    console.log(`${metalType} price extraction result:`, {
      retailPrice,
      changeYen,
      url: url
    });
    
    // 小売価格変動率を計算（前日比円 / 店頭小売価格）
    const changeRatio = (changeYen !== null && retailPrice !== null) 
      ? changeYen / retailPrice 
      : null;
    
    const changePercent = changeRatio !== null 
      ? `${(changeRatio * 100).toFixed(2)}%` 
      : '0.00%';
    
    // 買取価格変動率を計算（前日比円 / 買取価格）
    const buyChangeRatio = (buyChangeYen !== null && buyPrice !== null) 
      ? buyChangeYen / buyPrice 
      : null;
    
    const buyChangePercent = buyChangeRatio !== null 
      ? `${(buyChangeRatio * 100).toFixed(2)}%` 
      : '0.00%';
    
    // 変動方向を判定
    let changeDirection: 'up' | 'down' | 'flat' = 'flat';
    if (changeRatio !== null) {
      if (changeRatio > 0) changeDirection = 'up';
      else if (changeRatio < 0) changeDirection = 'down';
    }

    const data: MetalPriceData = {
      metalType,
      retailPrice,
      retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : '取得失敗',
      buyPrice,
      buyPriceFormatted: buyPrice ? `¥${buyPrice.toLocaleString()}/g` : '取得失敗',
      changeRatio,
      changePercent: changeRatio !== null ? (changeRatio >= 0 ? `+${changePercent}` : changePercent) : '0.00%',
      buyChangeRatio,
      buyChangePercent: buyChangeRatio !== null ? (buyChangeRatio >= 0 ? `+${buyChangePercent}` : buyChangePercent) : '0.00%',
      changeDirection,
      lastUpdated: new Date()
    };

    // 適切なキャッシュに保存
    const cacheData = { at: Date.now(), data };
    if (metalType === 'gold') {
      _goldCache = cacheData;
    } else {
      _platinumCache = cacheData;
    }
    
    return data;
  } catch (error) {
    console.error(`田中貴金属${metalType}価格取得エラー:`, error);
    const cacheData = { at: Date.now(), data: null };
    if (metalType === 'gold') {
      _goldCache = cacheData;
    } else {
      _platinumCache = cacheData;
    }
    return null;
  }
}

// 金専用の関数（後方互換性）
export async function fetchGoldPriceDataTanaka(): Promise<GoldPriceData | null> {
  return await fetchMetalPriceData('gold');
}

// プラチナ専用の関数
export async function fetchPlatinumPriceDataTanaka(): Promise<MetalPriceData | null> {
  return await fetchMetalPriceData('platinum');
}

// 後方互換性のための関数（既存コードで使用）
export async function fetchGoldChangeRatioTanaka(): Promise<number | null> {
  const data = await fetchGoldPriceDataTanaka();
  return data?.changeRatio || null;
}

// プラチナ価格変動率取得関数
export async function fetchPlatinumChangeRatioTanaka(): Promise<number | null> {
  const data = await fetchPlatinumPriceDataTanaka();
  return data?.changeRatio || null;
}