// 修正された変数スコープの確認テスト
const fs = require('fs');

function testVariableDefinitions() {
  console.log('🧪 変数定義の修正確認テスト');
  
  // api.cron.tsの内容を読み込み
  const content = fs.readFileSync('/Users/takeitaisei/Downloads/gold-price-auto/app/routes/api.cron.ts', 'utf8');
  const lines = content.split('\n');
  
  let minPct01DefLine = -1;
  let minPctSavedDefLine = -1;
  let firstMinPct01UseLine = -1;
  let minPctRawUsages = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // minPct01の定義を探す
    if (line.includes('const minPct01 =') && minPct01DefLine === -1) {
      minPct01DefLine = lineNum;
    }
    
    // minPctSavedの定義を探す  
    if (line.includes('const minPctSaved =') && minPctSavedDefLine === -1) {
      minPctSavedDefLine = lineNum;
    }
    
    // minPct01の最初の使用を探す（定義行以外）
    if (line.includes('minPct01') && !line.includes('const minPct01 =') && firstMinPct01UseLine === -1) {
      firstMinPct01UseLine = lineNum;
    }
    
    // minPctRawの使用を探す（もう使われていないはず）
    if (line.includes('minPctRaw') && !line.includes('//')) {
      minPctRawUsages.push({ line: lineNum, content: line.trim() });
    }
  });
  
  console.log('\n📊 変数定義と使用の分析:');
  console.log(`  minPctSaved定義: ${minPctSavedDefLine}行目`);
  console.log(`  minPct01定義: ${minPct01DefLine}行目`);
  console.log(`  minPct01初回使用: ${firstMinPct01UseLine}行目`);
  
  // 修正確認
  const definitionBeforeUsage = minPct01DefLine < firstMinPct01UseLine;
  console.log(`\n✅ 修正確認:`);
  console.log(`  - minPct01定義が使用前にある: ${definitionBeforeUsage ? '✅ OK' : '❌ NG'}`);
  console.log(`  - minPctRaw残存使用: ${minPctRawUsages.length === 0 ? '✅ 削除済み' : '❌ ' + minPctRawUsages.length + '箇所残存'}`);
  
  if (minPctRawUsages.length > 0) {
    console.log('\n⚠️  残存するminPctRaw使用箇所:');
    minPctRawUsages.forEach(usage => {
      console.log(`    ${usage.line}行目: ${usage.content}`);
    });
  }
  
  // minPctSaved使用箇所の確認
  const minPctSavedUsages = lines.filter(line => 
    line.includes('minPctSaved') && !line.includes('const minPctSaved')
  ).length;
  
  console.log(`  - minPctSaved使用箇所数: ${minPctSavedUsages}箇所`);
  
  return definitionBeforeUsage && minPctRawUsages.length === 0;
}

function testLogConsistency() {
  console.log('\n🧪 ログ記録の一貫性テスト');
  
  const content = fs.readFileSync('/Users/takeitaisei/Downloads/gold-price-auto/app/routes/api.cron.ts', 'utf8');
  const lines = content.split('\n');
  
  let logEntries = [];
  
  lines.forEach((line, index) => {
    if (line.includes('minPricePct:')) {
      logEntries.push({
        line: index + 1,
        content: line.trim(),
        usesMinPctSaved: line.includes('minPctSaved'),
        usesCalculation: line.includes('Math.round')
      });
    }
  });
  
  console.log(`\n📊 ログエントリ分析 (${logEntries.length}箇所):`);
  logEntries.forEach(entry => {
    const status = entry.usesMinPctSaved ? '✅' : '❌';
    console.log(`  ${entry.line}行目 ${status}: ${entry.content}`);
  });
  
  const allUseCorrectFormat = logEntries.every(entry => entry.usesMinPctSaved);
  console.log(`\n✅ すべてminPctSaved使用: ${allUseCorrectFormat ? '✅ OK' : '❌ NG'}`);
  
  return allUseCorrectFormat;
}

// テスト実行
const variableTest = testVariableDefinitions();
const logTest = testLogConsistency();

console.log('\n🎉 総合結果:');
console.log(`  変数スコープ修正: ${variableTest ? '✅ 成功' : '❌ 失敗'}`);
console.log(`  ログ一貫性修正: ${logTest ? '✅ 成功' : '❌ 失敗'}`);
console.log(`  500エラー修正: ${variableTest && logTest ? '✅ 完了' : '❌ 要追加修正'}`);

if (variableTest && logTest) {
  console.log('\n🚀 Application Errorの原因となるバグは修正されました！');
} else {
  console.log('\n⚠️  追加修正が必要です。');
}