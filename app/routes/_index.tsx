import { redirect } from "@remix-run/node";

export const loader = async () => redirect("/app");

// 見せる要素は不要だが、型の都合で空を返しておく
export default function Index() { 
  return null; 
}