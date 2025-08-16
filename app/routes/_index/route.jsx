import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  // /?shop=xxx&embedded=1 などのクエリを /app に引き継ぐ（無限ループ回避）
  return redirect("/app" + url.search);
};

export default function App() {
  // このコンポーネントは表示されない（常にリダイレクトするため）
  return null;
}
