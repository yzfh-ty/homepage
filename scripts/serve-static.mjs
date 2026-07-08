import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4321);
const distDir = resolve(process.env.DIST_DIR || "dist");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

function getRequestPath(url) {
  try {
    return decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  } catch {
    return "/";
  }
}

function resolveAssetPath(requestPath) {
  const cleanPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const candidate = resolve(join(distDir, cleanPath));

  if (candidate !== distDir && !candidate.startsWith(`${distDir}${sep}`)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const indexPath = resolve(join(candidate, "index.html"));
  if (existsSync(indexPath) && statSync(indexPath).isFile()) {
    return indexPath;
  }

  const fallbackPath = resolve(join(distDir, "index.html"));
  return existsSync(fallbackPath) ? fallbackPath : null;
}

function sendFile(response, filePath) {
  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(extension) || "application/octet-stream";
  const cacheControl =
    extension === ".html" ? "no-cache" : "public, max-age=604800, immutable";

  response.writeHead(200, {
    "content-type": contentType,
    "cache-control": cacheControl
  });

  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  const assetPath = resolveAssetPath(getRequestPath(request.url || "/"));
  if (!assetPath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  if (request.method === "HEAD") {
    response.writeHead(200);
    response.end();
    return;
  }

  sendFile(response, assetPath);
});

server.listen(port, host, () => {
  console.log(`[nav] listening at http://${host}:${port}`);
  console.log(`[nav] serving ${distDir}`);
});
