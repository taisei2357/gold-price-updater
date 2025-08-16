// Shopifyバリアント価格更新ユーティリティ

/**
 * 商品バリアントの価格を一括更新
 * @param {any} admin - Shopify Admin API client
 * @param {Object} params - 更新パラメータ
 * @param {string} params.productId - 商品ID (gid://shopify/Product/xxx)
 * @param {Array} params.variants - バリアント配列 [{id, price}, ...]
 * @returns {Promise<Object>} 更新結果
 */
export async function updateVariantPriceBulk(admin, params) {
  const MUTATION = `
    mutation UpdateViaBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        product { id }
        productVariants { id price }
        userErrors { field message }
      }
    }
  `;
  
  const variables = {
    productId: params.productId,
    variants: params.variants.map(variant => ({
      id: variant.id,
      price: variant.price.toString()
    }))
  };
  
  const res = await admin.graphql(MUTATION, { variables });
  const body = await res.json();
  const errors = body?.data?.productVariantsBulkUpdate?.userErrors ?? [];
  
  if (errors.length) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(errors)}`);
  }
  
  return {
    product: body?.data?.productVariantsBulkUpdate?.product,
    productVariants: body?.data?.productVariantsBulkUpdate?.productVariants,
    success: true
  };
}

/**
 * 複数商品のバリアント価格を更新（商品ごとにグループ化して処理）
 * @param {any} admin - Shopify Admin API client
 * @param {Array} products - 商品配列 [{id, variants: [{id, price}]}]
 * @returns {Promise<Array>} 全更新結果
 */
export async function updateMultipleProductVariants(admin, products) {
  const results = [];
  
  for (const product of products) {
    try {
      // 少し待機してAPIレート制限を回避
      if (results.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const result = await updateVariantPriceBulk(admin, {
        productId: product.id,
        variants: product.variants
      });
      
      results.push({
        productId: product.id,
        success: true,
        ...result
      });
    } catch (error) {
      results.push({
        productId: product.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}