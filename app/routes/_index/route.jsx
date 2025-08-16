import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // Shopifyアプリは常に /app にリダイレクト
  throw redirect(`/app?${url.searchParams.toString()}`);
};

export default function App() {
  // このコンポーネントは表示されない（常にリダイレクトするため）
  return null;
}
