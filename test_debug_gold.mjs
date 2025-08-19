// 金価格取得デバッグスクリプト
import fetch from 'node-fetch';

async function debugGoldPrice() {
  try {
    console.log('🔍 田中貴金属のHTMLを取得中...');
    
    const response = await fetch('https://www.tanaka.co.jp/home');
    const html = await response.text();
    
    console.log('📝 HTMLサイズ:', html.length, 'characters');
    
    // 金に関連するテーブル行を探す
    const goldMatches = html.match(/<tr[^>]*>.*?金.*?<\/tr>/gis);
    if (goldMatches) {
      console.log(`\n🔍 金を含む行が ${goldMatches.length} 個見つかりました:`);
      goldMatches.forEach((match, i) => {
        console.log(`\n--- 行 ${i + 1} ---`);
        console.log(match.substring(0, 200) + '...');
      });
    }
    
    // class="gold"を探す
    const goldClassMatches = html.match(/<tr[^>]*class="gold"[^>]*>.*?<\/tr>/gis);
    if (goldClassMatches) {
      console.log(`\n✅ class="gold"の行が ${goldClassMatches.length} 個見つかりました:`);
      goldClassMatches.forEach((match, i) => {
        console.log(`\n--- class="gold" 行 ${i + 1} ---`);
        console.log(match);
      });
    } else {
      console.log('\n❌ class="gold"の行が見つかりません');
      
      // 別のパターンを試す
      const tableRows = html.match(/<tr[^>]*>.*?<\/tr>/gis);
      console.log(`\n🔍 全テーブル行数: ${tableRows ? tableRows.length : 0}`);
      
      if (tableRows) {
        const goldRows = tableRows.filter(row => row.includes('金'));
        console.log(`🔍 "金"を含む行数: ${goldRows.length}`);
        
        if (goldRows.length > 0) {
          console.log('\n📋 "金"を含む最初の行:');
          console.log(goldRows[0]);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

debugGoldPrice();