# ============================================================
# 通用多阶段 Dockerfile — 适用于所有微前端应用
# ============================================================
# 用法：
#   docker build -t mf-shell -f deploy/Dockerfile --build-arg APP_NAME=shell .
#   docker build -t mf-system-admin -f deploy/Dockerfile --build-arg APP_NAME=system-admin .
#   docker build -t mf-business -f deploy/Dockerfile --build-arg APP_NAME=business .
#
# 环境参数：
#   --build-arg BUILD_MODE=prod  (dev/test/uat/prod)

# ---- Stage 1: 构建 ----
FROM node:20-alpine AS builder

ARG APP_NAME
ARG BUILD_MODE=prod

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 先复制 workspace 配置（利用 Docker 层缓存）
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY mock-server/package.json mock-server/

# 复制目标应用的 package.json
COPY apps/${APP_NAME}/package.json apps/${APP_NAME}/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY packages/shared/ packages/shared/
COPY apps/${APP_NAME}/ apps/${APP_NAME}/
COPY tsconfig.base.json ./

# 构建
RUN pnpm --filter ${APP_NAME} build:${BUILD_MODE}

# ---- Stage 2: 运行时 ----
FROM nginx:alpine

ARG APP_NAME

# 复制 Nginx 配置
COPY deploy/nginx/${APP_NAME}.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
