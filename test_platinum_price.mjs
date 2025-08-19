// test_platinum_price.mjs - プラチナ価格取得のテスト

console.log('🧪 プラチナ価格取得機能をテスト中...\n');

// プラチナ価格を取得する関数（gold.server.tsから移植）
async function fetchPlatinumPriceDataTanaka() {
  try {
    const url = "https://gold.tanaka.co.jp/commodity/souba/d-platinum.php";
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();

    console.log('HTML取得成功、長さ:', html.length);

    let retailPrice = null;
    let changeYen = null;

    // プラチナのテーブル行を取得（class="pt"）
    const platinumRowMatch = html.match(/<tr[^>]*class="pt"[^>]*>.*?<\/tr>/is);
    if (platinumRowMatch) {
      const platinumRow = platinumRowMatch[0];
      console.log('プラチナ行取得成功');
      console.log('プラチナ行内容:', platinumRow);
      
      // 小売価格抽出: class="retail_tax"のセル
      const priceMatch = platinumRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
      if (priceMatch) {
        retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
        console.log('価格抽出:', priceMatch[0], '→', retailPrice);
      }
      
      // 前日比抽出: class="retail_ratio"のセル
      const changeMatch = platinumRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
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
    console.log('Platinum price extraction result:', {
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
    let changeDirection = 'flat';
    if (changeRatio !== null) {
      if (changeRatio > 0) changeDirection = 'up';
      else if (changeRatio < 0) changeDirection = 'down';
    }

    const data = {
      metalType: 'platinum',
      retailPrice,
      retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : '取得失敗',
      changeRatio,
      changePercent: changeRatio !== null ? (changeRatio >= 0 ? `+${changePercent}` : changePercent) : '0.00%',
      changeDirection,
      lastUpdated: new Date()
    };

    return data;
  } catch (error) {
    console.error('田中貴金属プラチナ価格取得エラー:', error);
    return null;
  }
}

try {
  const platinumData = await fetchPlatinumPriceDataTanaka();
  
  if (!platinumData) {
    console.error('❌ プラチナ価格データの取得に失敗しました');
    process.exit(1);
  }
  
  console.log('\n✅ プラチナ価格データを正常に取得:');
  console.log(`🥈 店頭小売価格: ${platinumData.retailPriceFormatted}`);
  console.log(`📊 前日比: ${platinumData.changePercent}`);
  console.log(`🎯 変動方向: ${platinumData.changeDirection}`);
  console.log(`🔢 変動率（小数）: ${platinumData.changeRatio}`);
  console.log(`⏰ 取得時刻: ${platinumData.lastUpdated.toLocaleString('ja-JP')}`);
  
  if (platinumData.changeRatio === null) {
    console.warn('\n⚠️  変動率がnullです - 価格更新処理はスキップされます');
    console.log('🔍 考えられる原因:');
    console.log('  - 田中貴金属サイトの構造変更');
    console.log('  - プラチナ価格データが取得できていない');
    console.log('  - HTML パースロジックの不具合');
  } else {
    console.log(`\n✅ 変動率OK: ${(platinumData.changeRatio * 100).toFixed(4)}%`);
    console.log('🚀 プラチナ価格更新処理が実行可能です');
  }
  
} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}