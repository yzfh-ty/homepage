# Single Page Nav

一个由 YAML 配置驱动的单页导航页，适合部署个人常用网站入口。

## 修改配置

- 编辑 `config/settings.yml`：站点标题、首页文案、主题、字体。`fonts.source: css` 时会从 `fonts.cssUrl` 加载字体样式。
- 编辑 `config/navigation.yml`：分类和网站列表。
- `config/*.example.yml` 是带说明的公共示例配置。

缺少 `config/settings.yml` 或 `config/navigation.yml` 时，会自动复制一份默认配置。修改配置后重新构建，或重启 Docker 容器即可生效。

## Docker

镜像不包含 nginx，默认使用 `ghcr.io/yzfh-ty/homepage:latest`。容器启动时会读取 `config/settings.yml` 和 `config/navigation.yml`，重新构建页面后提供静态访问。

```bash
docker compose up -d
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
NAV_PORT=3000 docker compose up -d
```

## GitHub Pages

推送 `main` 分支时会自动构建静态站点并发布到 GitHub Pages。第一次使用前需要在仓库设置中启用：

1. 打开 `Settings -> Pages`。
2. 将 `Source` 设置为 `GitHub Actions`。
3. 重新运行部署流程，或再次推送 `main`。
