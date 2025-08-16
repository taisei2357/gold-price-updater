// Simple test endpoint
import { json } from "@remix-run/node";

export async function action() {
  return json({ 
    status: "success", 
    message: "API endpoint is working",
    timestamp: new Date().toISOString()
  });
}

export async function loader() {
  return json({ 
    status: "ready", 
    message: "Test endpoint is ready",
    timestamp: new Date().toISOString()
  });
}