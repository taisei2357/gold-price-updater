import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const { variantIds, expectedPrices } = await request.json();
  
  if (!variantIds || variantIds.length === 0) {
    return json({ verified: false, error: "No variant IDs provided" });
  }
  
  try {
    // Admin nodes APIを使った検証
    const response = await admin.graphql(`
      query VerifyVariants($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            price
            updatedAt
          }
        }
      }
    `, { variables: { ids: variantIds } });
    
    const data = await response.json();
    
    if (data.errors) {
      console.error("GraphQL verification errors:", data.errors);
      return json({ verified: false, error: data.errors[0]?.message });
    }
    
    // 価格検証
    const variants = data.data?.nodes || [];
    const verified = variants.every(variant => {
      if (!variant) return false;
      const currentPrice = Number(variant.price ?? 0);
      const expectedPrice = expectedPrices[variant.id];
      const matches = currentPrice === expectedPrice;
      
      console.log(`🔍 Verification for ${variant.id}:`, {
        current: currentPrice,
        expected: expectedPrice,
        matches
      });
      
      return matches;
    });
    
    return json({ 
      verified,
      variants: variants.map(v => ({
        id: v.id,
        currentPrice: Number(v.price ?? 0),
        expectedPrice: expectedPrices[v.id],
        updatedAt: v.updatedAt
      }))
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
    
  } catch (error) {
    console.error("Variant verification error:", error);
    return json({ 
      verified: false, 
      error: error.message 
    }, { 
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  }
}