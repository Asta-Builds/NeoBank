---
title: "🏗️ NeoBank Maroc — Microservices Architecture"
tags:
  - microservices
  - kubernetes
  - docker
  - api-gateway
  - devops
  - fintech
  - neobank
  - "#project/neobank"
project: Neobank
stack: NestJS · Docker · Kubernetes · Kafka · PostgreSQL · Redis
author: Abdelilah Dahou
status: architecture
created: 2026-03-20
updated: 2026-03-20
---

# 🏗️ NeoBank Maroc — Microservices Architecture
## Docker · Kubernetes · API Gateway

> [!info] Stack Overview
> **Runtime:** Node.js 20 LTS · NestJS 10
> **Containers:** Docker 25 · Docker Compose (dev)
> **Orchestration:** Kubernetes 1.29 · Helm 3
> **API Gateway:** Kong Gateway (self-hosted) or NGINX Ingress
> **Message Broker:** Apache Kafka 3.6
> **Service Mesh:** Istio (Phase 2)
> **Cloud:** Google Cloud Platform (GKE)
> **Registry:** GCR (Google Container Registry)
> **CI/CD:** GitHub Actions → ArgoCD

---

## 🗂️ Navigation

- [[#1. Architecture Overview]]
- [[#2. Microservices Decomposition]]
- [[#3. Docker — Containerization]]
- [[#4. Docker Compose — Local Dev]]
- [[#5. API Gateway — Kong]]
- [[#6. Kubernetes — Cluster Design]]
- [[#7. Kubernetes Manifests]]
- [[#8. Helm Charts Structure]]
- [[#9. Kafka Event Bus]]
- [[#10. Service-to-Service Communication]]
- [[#11. Observability Stack]]
- [[#12. CI/CD Pipeline]]
- [[#13. Security — Zero Trust]]
- [[#14. Disaster Recovery]]
- [[#15. Environment Variables per Service]]

---

## 1. Architecture Overview

### Global Architecture Diagram

```
                        ┌─────────────────────────────────────┐
                        │           EXTERNAL CLIENTS           │
                        │  Flutter App · Next.js · Admin Panel │
                        └──────────────┬──────────────────────┘
                                       │ HTTPS / TLS 1.3
                                       ▼
                        ┌─────────────────────────────────────┐
                        │         CLOUDFLARE (WAF + DDoS)     │
                        └──────────────┬──────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER (GKE)                       │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              INGRESS LAYER (NGINX Ingress Controller)        │ │
│  │         api.neobank.ma → Kong Gateway Service               │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                             │                                      │
│  ┌─────────────────────────▼───────────────────────────────────┐ │
│  │                   API GATEWAY (Kong)                         │ │
│  │  Auth · Rate Limiting · JWT Verify · Routing · Logging      │ │
│  └──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────┘ │
│     │      │      │      │      │      │      │      │            │
│     ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼            │
│  ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐     │
│  │auth ││user ││ kyc ││wall ││trans││notif││card ││admin│     │
│  │ svc ││ svc ││ svc ││ et  ││ act ││ svc ││ svc ││ svc │     │
│  │:3001││:3002││:3003││ svc ││ svc ││:3006││:3007││:3008│     │
│  │     ││     ││     ││:3004││:3005││     ││     ││     │     │
│  └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘     │
│     │      │      │      │      │      │      │      │            │
│     └──────┴──────┴──────┴──┬───┴──────┴──────┴──────┘            │
│                              │                                      │
│  ┌───────────────────────────▼──────────────────────────────────┐ │
│  │              KAFKA EVENT BUS  (3 brokers)                    │ │
│  │  topics: tx.initiated · tx.succeeded · kyc.approved ···     │ │
│  └───────┬───────────────┬──────────────┬────────────────────── ┘ │
│          │               │              │                          │
│     ┌────▼────┐    ┌─────▼────┐  ┌─────▼─────┐                  │
│     │ ledger  │    │  fraud   │  │  webhook  │                  │
│     │  svc   │    │   svc    │  │   svc     │                  │
│     │ :3009  │    │  :3010   │  │  :3011    │                  │
│     └────┬───┘    └──────────┘  └───────────┘                  │
│          │                                                         │
│  ┌───────▼──────────────────────────────────────────────────────┐ │
│  │                    DATA LAYER                                 │ │
│  │                                                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │ │
│  │  │PostgreSQL│  │PostgreSQL│  │  Redis   │  │ PostgreSQL │  │ │
│  │  │ (auth +  │  │(wallets +│  │(sessions │  │  (audit +  │  │ │
│  │  │  users)  │  │  ledger) │  │ OTP·RL)  │  │   fraud)   │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │ │
│  └───────────────────────────────────────────────────────────── ┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Services Summary

| Service | Port | Responsibility | DB | Communicates With |
|---|---|---|---|---|
| `auth-service` | 3001 | JWT, MFA, sessions | PG-auth | users-svc, Redis |
| `user-service` | 3002 | User CRUD, RBAC | PG-auth | auth-svc |
| `kyc-service` | 3003 | eKYC lifecycle | PG-kyc | KYC Provider API, Kafka |
| `wallet-service` | 3004 | Balances, top-up | PG-wallet | ledger-svc, Kafka |
| `transaction-service` | 3005 | SAGA, P2P, idempotency | PG-wallet | ledger-svc, fraud-svc, Kafka |
| `notification-service` | 3006 | Email, SMS, Push | PG-notif | Kafka (consumer) |
| `card-service` | 3007 | Virtual card lifecycle | PG-card | BaaS Provider API |
| `admin-service` | 3008 | Admin panel backend | All DBs (read) | All services |
| `ledger-service` | 3009 | Double-entry ledger | PG-ledger | Kafka (consumer) |
| `fraud-service` | 3010 | Rule engine, AML | PG-fraud | Kafka (consumer+producer) |
| `webhook-service` | 3011 | Inbound webhooks | PG-webhook | Kafka (producer) |
| `audit-service` | 3012 | Append-only audit log | PG-audit | Kafka (consumer) |

---

## 2. Microservices Decomposition

### Bounded Contexts

```
┌──────────────────────────────────────────────────────────────┐
│                    BOUNDED CONTEXTS                           │
│                                                               │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   IDENTITY &    │    │   FINANCIAL     │                 │
│  │   ACCESS        │    │   CORE          │                 │
│  │                 │    │                 │                 │
│  │  auth-service   │    │ wallet-service  │                 │
│  │  user-service   │    │ ledger-service  │                 │
│  └────────┬────────┘    │ transaction-svc │                 │
│           │             └────────┬────────┘                 │
│           │                      │                           │
│  ┌────────▼────────┐    ┌────────▼────────┐                 │
│  │   COMPLIANCE &  │    │   ENGAGEMENT    │                 │
│  │   RISK          │    │   & OPS         │                 │
│  │                 │    │                 │                 │
│  │  kyc-service    │    │ notification-sv │                 │
│  │  fraud-service  │    │ card-service    │                 │
│  │  audit-service  │    │ webhook-service │                 │
│  └─────────────────┘    │ admin-service   │                 │
│                          └─────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### Inter-Service Communication Rules

| Pattern | When to Use | Implementation |
|---|---|---|
| **Synchronous REST** | Real-time user-facing requests | Via API Gateway → service |
| **Async Kafka Events** | State changes, side effects | Producer/Consumer pattern |
| **Internal gRPC** | High-throughput service-to-service (Phase 2) | Protobuf schemas |
| **Never direct DB** | Service A must never read Service B's DB | Each service owns its data |

---

## 3. Docker — Containerization

### Base Dockerfile (all NestJS services)

```dockerfile
# ─────────────────────────────────────────────
#  Stage 1: Dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# ─────────────────────────────────────────────
#  Stage 2: Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────
#  Stage 3: Production Image
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S neobank && \
    adduser  -u 1001 -S neobank -G neobank

# Copy only production artifacts
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/package.json ./package.json

# Drop all capabilities
RUN apk add --no-cache dumb-init && \
    chown -R neobank:neobank /app

USER neobank

EXPOSE 3000

# Use dumb-init to handle PID 1 signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Service-Specific Dockerfile Override (auth-service example)

```dockerfile
# apps/auth-service/Dockerfile
FROM neobank/base:latest AS runner

ENV SERVICE_NAME=auth-service
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1
```

### .dockerignore

```
node_modules
dist
.git
.gitignore
*.md
.env
.env.*
coverage
.nyc_output
Dockerfile*
docker-compose*
.eslintrc*
.prettierrc*
jest.config*
test/
```

### Docker Image Tagging Strategy

```bash
# Format: registry/project/service:version-env
gcr.io/neobank-ma/auth-service:1.2.0-production
gcr.io/neobank-ma/auth-service:1.2.0-staging
gcr.io/neobank-ma/auth-service:latest        # ← never in production!

# Immutable tags in production (SHA-based)
gcr.io/neobank-ma/auth-service:sha-a1b2c3d4
```

---

## 4. Docker Compose — Local Dev

```yaml
# docker-compose.yml
version: "3.9"

networks:
  neobank-net:
    driver: bridge

volumes:
  pg-auth-data:
  pg-wallet-data:
  pg-kyc-data:
  pg-audit-data:
  redis-data:
  kafka-data:
  zookeeper-data:

services:

  # ─────────────────────────────────────────
  #  INFRASTRUCTURE
  # ─────────────────────────────────────────

  postgres-auth:
    image: postgres:15-alpine
    container_name: neobank-pg-auth
    environment:
      POSTGRES_DB: neobank_auth
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: ${PG_AUTH_PASSWORD}
    volumes:
      - pg-auth-data:/var/lib/postgresql/data
      - ./infra/db/init/auth-init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - neobank-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U auth_user -d neobank_auth"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-wallet:
    image: postgres:15-alpine
    container_name: neobank-pg-wallet
    environment:
      POSTGRES_DB: neobank_wallet
      POSTGRES_USER: wallet_user
      POSTGRES_PASSWORD: ${PG_WALLET_PASSWORD}
