# Single Page Nav

一个由 YAML 配置驱动的单页导航站。

## 本地开发

```bash
npm install
npm run dev
```

## 修改配置

- 编辑 `config/settings.yml`：站点标题、首页文案、主题、字体。`fonts.source: css` 时会从 `fonts.cssUrl` 加载字体样式。
- 编辑 `config/navigation.yml`：分类和网站列表。

修改后重新构建或重启 Docker 容器即可。

默认使用 `config/navigation.yml` 中每个站点的 `icon` 字段显示图标，不请求第三方 favicon 服务。未配置站点图标时使用 `config/settings.yml` 中的 `icons.defaultIcon`。需要自动 favicon 时，可以把 `icons.mode` 改为 `favicon`，favicon 加载失败后也会回退到站点图标或默认图标。

## Docker

镜像是纯 Node/Astro 镜像，不包含 nginx。容器启动时会读取 `config/settings.yml`
和 `config/navigation.yml` 并重新执行 `npm run build`，随后由内置 Node 静态服务器提供 `dist`。

```bash
NAV_IMAGE=ghcr.io/<owner>/<repo>:<tag> docker compose up -d
```

后续只改 `config/` 下的 YAML 配置时，不需要重新构建镜像：

```bash
docker compose restart
```

默认访问端口：

```text
http://localhost:8080/
```

可以通过 `NAV_PORT` 修改宿主机端口：

```bash
NAV_IMAGE=ghcr.io/<owner>/<repo>:<tag> NAV_PORT=3000 docker compose up -d
```

## GitHub Actions 发布镜像

仓库包含 `.github/workflows/docker-image.yml`。只有推送 Git tag 时才会构建镜像，并且只推送到 GitHub Container Registry（GHCR），不推送 Docker Hub：

```bash
git tag v0.1.0
git push origin v0.1.0
```

镜像地址格式：

```text
ghcr.io/<owner>/<repo>:<tag>
```

## GitHub Pages

仓库包含 `.github/workflows/pages.yml`。推送 `main` 分支时会自动构建静态站点并发布到 GitHub Pages。

第一次使用前，需要在 GitHub 仓库设置里手动启用一次：

1. 打开 `Settings -> Pages`。
2. 将 `Source` 设置为 `GitHub Actions`。
3. 重新运行 `Deploy GitHub Pages` workflow，或再次推送 `main`。

这个步骤不需要额外密钥。未启用 Pages 时，GitHub 的部署接口会返回 `Not Found`，workflow 会在 `actions/deploy-pages` 步骤失败。
