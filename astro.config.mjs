import { defineConfig } from "astro/config";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const isUserPage = repositoryName.endsWith(".github.io");
const githubPagesBase = repositoryName && !isUserPage ? `/${repositoryName}` : "/";

export default defineConfig({
  output: "static",
  site: process.env.ASTRO_SITE,
  base: process.env.ASTRO_BASE ?? (isGithubPagesBuild ? githubPagesBase : "/")
});
