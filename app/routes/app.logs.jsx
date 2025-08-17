import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Text,
  BlockStack,
  InlineStack,
  Icon,
  Box,
  TextField,
  Select,
  Button,
} from "@shopify/polaris";
import {
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const [logs, stats] = await Promise.all([
    prisma.priceUpdateLog.findMany({
      where: { shopDomain: shop },
      orderBy: { executedAt: "desc" },
      take: 100,
    }),
    prisma.priceUpdateLog.aggregate({
      where: { shopDomain: shop },
      _count: { id: true },
      _sum: { 
        totalProducts: true,
        updatedCount: true,
        failedCount: true 
      }
    })
  ]);

  return json({ 
    logs,
    stats: {
      totalExecutions: stats._count.id,
      totalProducts: stats._sum.totalProducts || 0,
      totalSuccess: stats._sum.updatedCount || 0,
      totalFailed: stats._sum.failedCount || 0
    }
  });
}

export default function Logs() {
  const { logs, stats } = useLoaderData();
  
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // フィルタリングロジック
  const filteredLogs = logs.filter(log => {
    const matchesQuery = filterQuery === '' || 
      log.errorMessage?.toLowerCase().includes(filterQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && log.success) ||
      (statusFilter === 'failed' && !log.success);
    
    const matchesType = typeFilter === 'all' || log.executionType === typeFilter;
    
    return matchesQuery && matchesStatus && matchesType;
  });

  // DataTable用のデータ変換
  const tableRows = filteredLogs.map(log => [
    <div key={`time-${log.id}`}>
      <Text variant="bodyMd" as="p">
        {new Date(log.executedAt).toLocaleDateString('ja-JP')}
      </Text>
      <Text variant="bodySm" tone="subdued">
        {new Date(log.executedAt).toLocaleTimeString('ja-JP')}
      </Text>
    </div>,
    
    <Badge key={`type-${log.id}`} tone={log.executionType === 'auto' ? 'info' : 'warning'}>
      {log.executionType === 'auto' ? '自動実行' : '手動実行'}
    </Badge>,
    
    <InlineStack key={`status-${log.id}`} gap="200" blockAlign="center">
      <Icon 
        source={log.success ? CheckCircleIcon : AlertCircleIcon} 
        tone={log.success ? 'success' : 'critical'} 
      />
      <Badge tone={log.success ? 'success' : 'critical'}>
        {log.success ? '成功' : '失敗'}
      </Badge>
    </InlineStack>,
    
    <div key={`ratio-${log.id}`}>
      {log.goldRatio !== null && log.goldRatio !== undefined ? (
        <InlineStack gap="100" blockAlign="center">
          <span style={{ 
            fontSize: '16px',
            color: log.goldRatio >= 0 ? '#dc2626' : '#059669' 
          }}>
            {log.goldRatio >= 0 ? '📈' : '📉'}
          </span>
          <Text>{(log.goldRatio * 100).toFixed(2)}%</Text>
        </InlineStack>
      ) : (
        <Text tone="subdued">-</Text>
      )}
    </div>,
    
    <Text key={`min-${log.id}`}>{log.minPricePct || '-'}%</Text>,
    
    <Text key={`products-${log.id}`}>{log.totalProducts || 0}件</Text>,
    
    <InlineStack key={`counts-${log.id}`} gap="200">
      <Text tone="success">{log.updatedCount || 0}</Text>
      <Text tone="subdued">/</Text>
      <Text tone="critical">{log.failedCount || 0}</Text>
    </InlineStack>,
    
    <div key={`error-${log.id}`}>
      {log.errorMessage ? (
        <Box padding="200" background="bg-critical-subdued" borderRadius="100">
          <Text variant="bodySm" tone="critical">
            {log.errorMessage.length > 50 
              ? log.errorMessage.substring(0, 50) + "..." 
              : log.errorMessage}
          </Text>
        </Box>
      ) : (
        <Text tone="subdued">-</Text>
      )}
    </div>
  ]);

  return (
    <Page
      title="実行ログ"
      subtitle={`${logs.length}件の実行履歴を表示`}
    >
      <BlockStack gap="500">
        {/* 統計サマリー */}
        <Layout>
          <Layout.Section>
            <InlineStack gap="400">
              <Card>
                <Box padding="400" style={{ textAlign: 'center' }}>
                  <BlockStack gap="300" align="center">
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#e0f2fe',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon source={ClockIcon} tone="info" />
                    </Box>
                    <Text variant="heading2xl" as="p">{stats.totalExecutions}</Text>
                    <Text variant="bodyMd" tone="subdued">総実行回数</Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400" style={{ textAlign: 'center' }}>
                  <BlockStack gap="300" align="center">
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#dcfce7',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon source={CheckCircleIcon} tone="success" />
                    </Box>
                    <Text variant="heading2xl" as="p">{stats.totalSuccess}</Text>
                    <Text variant="bodyMd" tone="subdued">成功更新数</Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400" style={{ textAlign: 'center' }}>
                  <BlockStack gap="300" align="center">
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        background: stats.totalFailed > 0 ? '#fecaca' : '#f3f4f6',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon source={AlertCircleIcon} tone={stats.totalFailed > 0 ? 'critical' : 'subdued'} />
                    </Box>
                    <Text variant="heading2xl" as="p">{stats.totalFailed}</Text>
                    <Text variant="bodyMd" tone="subdued">失敗更新数</Text>
                  </BlockStack>
                </Box>
              </Card>
            </InlineStack>
          </Layout.Section>
        </Layout>

        {/* フィルター */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h3">フィルター</Text>
            
            <InlineStack gap="400">
              <div style={{ minWidth: '200px' }}>
                <TextField
                  label="エラーメッセージ検索"
                  value={filterQuery}
                  onChange={setFilterQuery}
                  placeholder="エラー内容で検索..."
                  clearButton
                  onClearButtonClick={() => setFilterQuery('')}
                />
              </div>
              
              <div style={{ minWidth: '150px' }}>
                <Select
                  label="実行結果"
                  options={[
                    { label: 'すべて', value: 'all' },
                    { label: '成功のみ', value: 'success' },
                    { label: '失敗のみ', value: 'failed' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
              
              <div style={{ minWidth: '150px' }}>
                <Select
                  label="実行タイプ"
                  options={[
                    { label: 'すべて', value: 'all' },
                    { label: '自動実行', value: 'auto' },
                    { label: '手動実行', value: 'manual' }
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
            </InlineStack>
            
            <Text variant="bodySm" tone="subdued">
              {filteredLogs.length}件 / {logs.length}件を表示
            </Text>
          </BlockStack>
        </Card>

        {/* ログテーブル */}
        <Card>
          {filteredLogs.length === 0 ? (
            <Box padding="800" style={{ textAlign: 'center' }}>
              <BlockStack gap="400" align="center">
                <Icon source={ClockIcon} tone="subdued" />
                <Text variant="headingMd" tone="subdued">
                  {logs.length === 0 ? 'まだ実行ログがありません' : 'フィルター条件に一致するログがありません'}
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  {logs.length === 0 
                    ? '商品価格調整を実行すると、ここに履歴が表示されます。'
                    : 'フィルター条件を変更してください。'
                  }
                </Text>
              </BlockStack>
            </Box>
          ) : (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text']}
              headings={[
                '実行日時',
                '種類',
                '結果',
                '金価格変動率',
                '価格下限',
                '対象商品',
                '成功/失敗',
                'エラー詳細'
              ]}
              rows={tableRows}
              pagination={{
                hasNext: false,
                hasPrevious: false
              }}
            />
          )}
        </Card>

        {/* ヘルプ情報 */}
        <Card>
          <Box
            padding="400"
            style={{
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              borderRadius: '12px'
            }}
          >
            <BlockStack gap="300">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={ClockIcon} tone="base" />
                <Text variant="headingMd" as="h3">ログの見方</Text>
              </InlineStack>
              
              <InlineStack gap="600">
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="semibold">実行タイプ</Text>
                  <Text variant="bodySm" tone="subdued">• 自動実行: スケジュールによる定期実行</Text>
                  <Text variant="bodySm" tone="subdued">• 手動実行: UIからの手動実行</Text>
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="semibold">金価格変動率</Text>
                  <Text variant="bodySm" tone="subdued">• 田中貴金属から取得した前日比</Text>
                  <Text variant="bodySm" tone="subdued">• この変動率で商品価格を調整</Text>
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="semibold">価格下限</Text>
                  <Text variant="bodySm" tone="subdued">• 価格下落時の最低価格率</Text>
                  <Text variant="bodySm" tone="subdued">• 例: 93% = 7%以上は下がらない</Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}