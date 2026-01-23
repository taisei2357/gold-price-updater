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
      // 純金（K24）の詳細ページを優先
      return 'https://gold.tanaka.co.jp/commodity/souba/d-gold.php';
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

    // HTMLテキスト抽出ユーティリティ（タグ除去 + 空白正規化）
    const textify = (s: string | undefined) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  // 正確なHTML構造に基づく価格抽出
  let retailPrice: number | null = null;
  let changeYen: number | null = null;
  let buyPrice: number | null = null;
  let buyChangeYen: number | null = null;
  
    // まず d-gold.php / d-platinum.php の 行ベース抽出（<td class="metal_name">金/プラチナ</td> の行）
    try {
      const metalRowLabel = metalType === 'gold' ? '金' : 'プラチナ';
      const rowMatch = html.match(new RegExp(`<tr[^>]*>\s*<td[^>]*class="metal_name"[^>]*>\s*${metalRowLabel}\s*<\\/td>[\\s\\S]*?<\\/tr>`, 'i'));
      if (rowMatch) {
        const rowHtml = rowMatch[0];
        const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => textify(m[1]));
        if (tds.length >= 5) { // 5つのtd: metal_name, retail_tax, retail_ratio, purchase_tax, purchase_ratio
          const numFrom = (s: string): number | null => {
            const m = s.match(/([\d,]+)\s*円/);
            return m ? parseInt(m[1].replace(/,/g, '')) : null;
          };
          const yenChangeFrom = (s: string): number | null => {
            const m = s.match(/([+\-]?\d+(?:\.\d+)?)\s*円/);
            return m ? parseFloat(m[1]) : null;
          };
          retailPrice = numFrom(tds[1]); // retail_tax
          changeYen = yenChangeFrom(tds[2]); // retail_ratio  
          buyPrice = numFrom(tds[3]); // purchase_tax
          buyChangeYen = yenChangeFrom(tds[4]); // purchase_ratio
        }
      }
    } catch {}

    // 次に <th>ラベル構造から抽出を試みる（ヘッダ直下型、タグを跨いでも許容）
    const extractTextByLabel = (h: string, label: RegExp): string | null => {
      const re = new RegExp(`<th[^>]*>[\\s\\S]*?${label.source}[\\s\\S]*?<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, 'is');
      const m = h.match(re);
      return m ? textify(m[1]) : null;
    };
    const extractNumberByLabel = (h: string, label: RegExp): number | null => {
      const t = extractTextByLabel(h, label);
      if (!t) return null;
      const m = t.match(/([\\d,]+)\\s*円/);
      return m ? parseInt(m[1].replace(/,/g, '')) : null;
    };
    const extractChangeByLabel = (h: string, label: RegExp): number | null => {
      const t = extractTextByLabel(h, label);
      if (!t) return null;
      const m = t.match(/([+\\-]?\\d+(?:\\.\\d+)?)\\s*円/);
      return m ? parseFloat(m[1]) : null;
    };

    // ラベルベース抽出（見出しに「店頭小売価格」「店頭買取価格」が含まれる想定）
    if (retailPrice === null) retailPrice = extractNumberByLabel(html, /店頭小売価格/);
    if (buyPrice === null) buyPrice = extractNumberByLabel(html, /店頭買取価格/);
    if (changeYen === null) changeYen = extractChangeByLabel(html, /小売価格|店頭小売価格/);
    if (buyChangeYen === null) buyChangeYen = extractChangeByLabel(html, /買取価格|店頭買取価格/);

    // 新しいHTML構造（テキストベース）に対応したパターン抽出
    if (changeYen === null) {
      // パターン: "27,929 円\n(+1,045 円)" 形式
      const textChangeMatch = html.match(/([0-9,]+)\s*円[\s\n]*\(\s*([+\-]?\d+(?:\.\d+)?)\s*円\s*\)/);
      if (textChangeMatch) {
        changeYen = parseFloat(textChangeMatch[2]);
        console.log(`${metalType} テキストベース前日比抽出成功: ${changeYen}円`);
      }
    }

    // より広いパターンでの前日比抽出（括弧内の値）
    if (changeYen === null) {
      // カンマ区切り数値にも対応した括弧内パターン
      const bracketChangeMatch = html.match(/\(\s*([+\-]?[\d,]+(?:\.\d+)?)\s*円\s*\)/);
      if (bracketChangeMatch) {
        changeYen = parseFloat(bracketChangeMatch[1].replace(/,/g, ''));
        console.log(`${metalType} 括弧内前日比抽出成功: ${changeYen}円`);
      }
    }

    // 買取価格の前日比も同様の新しいパターンで抽出
    if (buyChangeYen === null) {
      // カンマ区切り数値にも対応した複数の括弧パターンを抽出
      const allBracketMatches = [...html.matchAll(/\(\s*([+\-]?[\d,]+(?:\.\d+)?)\s*円\s*\)/g)];
      if (allBracketMatches.length >= 2) {
        buyChangeYen = parseFloat(allBracketMatches[1][1].replace(/,/g, ''));
        console.log(`${metalType} 買取価格前日比抽出成功: ${buyChangeYen}円`);
      } else if (allBracketMatches.length === 1 && changeYen !== null) {
        // 小売価格の前日比が既に取得できている場合、同じ値を買取価格にも使用
        buyChangeYen = changeYen;
        console.log(`${metalType} 買取価格前日比（小売価格と同じ値）: ${buyChangeYen}円`);
      }
    }

    // ラベル抽出で不足がある場合は、旧 souba/ のクラス構造にフォールバック
    if (retailPrice === null || buyPrice === null || changeYen === null || buyChangeYen === null) {
      const metalRowClass = getMetalRowClass(metalType);
      const metalRowMatch = html.match(new RegExp(`<tr[^>]*class=\"${metalRowClass}\"[^>]*>.*?<\/tr>`, 'is'));
      if (metalRowMatch) {
        const metalRow = metalRowMatch[0];
        console.log(`${metalType} 行（フォールバック）取得成功`);
        if (retailPrice === null) {
          const priceMatch = metalRow.match(/<td[^>]*class=\"retail_tax\"[^>]*>([\d,]+)\s*円/);
          if (priceMatch) retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
        }
        if (buyPrice === null) {
          const buyPriceMatch = metalRow.match(/<td[^>]*class=\"purchase_tax\"[^>]*>([\d,]+)\s*円/);
          if (buyPriceMatch) buyPrice = parseInt(buyPriceMatch[1].replace(/,/g, ''));
        }
        if (changeYen === null) {
          const changeMatch = metalRow.match(/<td[^>]*class=\"retail_ratio\"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
          if (changeMatch) changeYen = parseFloat(changeMatch[1]);
        }
        if (buyChangeYen === null) {
          const buyChangeMatch = metalRow.match(/<td[^>]*class=\"purchase_ratio\"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
          if (buyChangeMatch) buyChangeYen = parseFloat(buyChangeMatch[1]);
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
      
      // 括弧内の数値パターンをすべて抽出してデバッグ
      const bracketPatterns = html.match(/\([^)]*[0-9,]+[^)]*円[^)]*\)/gi);
      console.log('括弧内パターン:', bracketPatterns?.slice(0, 5));
      
      // より具体的な前日比周辺のコンテキスト
      const priceChangeContexts = html.match(/.{0,100}[0-9,]+\s*円[\s\S]{0,50}[+\-][0-9,]+[\s\S]{0,50}円.{0,100}/gi);
      console.log('価格変動コンテキスト:', priceChangeContexts?.slice(0, 3));
    }

    // デバッグログ
    console.log(`${metalType} price extraction result:`, {
      retailPrice,
      changeYen,
      url: url
    });
    
    // 小売価格変動率を計算（前日比円 / 店頭小売価格）
    let changeRatio = (changeYen !== null && retailPrice !== null)
      ? changeYen / retailPrice
      : null;
    if (typeof changeRatio === 'number' && !Number.isFinite(changeRatio)) {
      changeRatio = null;
    }
    
    const changePercent = changeRatio !== null 
      ? `${(changeRatio * 100).toFixed(2)}%` 
      : '0.00%';
    
    // 買取価格変動率を計算（前日比円 / 買取価格）
    let buyChangeRatio = (buyChangeYen !== null && buyPrice !== null)
      ? buyChangeYen / buyPrice
      : null;
    if (typeof buyChangeRatio === 'number' && !Number.isFinite(buyChangeRatio)) {
      buyChangeRatio = null;
    }
    
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
