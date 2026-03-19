---
title: "🏦 Neobank — Product Backlog & API Design"
tags:
  - fintech
  - neobank
  - nestjs
  - backend
  - product
  - "#project/neobank"
project: Neobank
stack: NestJS · TypeScript · PostgreSQL
region: Morocco
author: Abdelilah Dahou
status: in-progress
phase: MVP
created: 2026-03-19
updated: 2026-03-19
---

# 🏦 Neobank — Product Backlog & API Design

> [!info] Project Context
> **Stack:** NestJS · TypeScript · PostgreSQL · JWT + MFA
> **Region:** Morocco (Bank Al-Maghrib regulated)
> **Architecture:** Modular Monolith → Microservices
> **Author:** [[Abdelilah Dahou]]
> **Phase:** [[MVP]]

---

## 🗂️ Navigation

- [[#A. Product Assumptions]]
- [[#B. MVP Scope]]
- [[#C. Epics & Backlog]]
- [[#D. NestJS Module Architecture]]
- [[#E. Entity Model]]
- [[#F. API Catalog by Module]]
- [[#G. Critical Sequence Flows]]
- [[#H. Security & Compliance Controls]]
- [[#I. Delivery Roadmap — 3 Phases]]
- [[#J. Risks & Missing Decisions]]
- [[#1. Recommended NestJS Folder Structure]]
- [[#2. Environment Variables]]
- [[#3. Third-Party Services to Evaluate]]
- [[#4. Swagger/OpenAPI Checklist]]
- [[#5. Next 10 Implementation Tasks]]

---

## A. Product Assumptions

> [!abstract]- Assumptions (click to expand)
> | # | Assumption |
> |---|---|
> | A1 | MVP targets individual B2C customers in Morocco, onboarded fully digitally via eKYC |
> | A2 | Platform operates as an **Établissement de Monnaie Électronique (EME)** under Bank Al-Maghrib, or via a BaaS partner during MVP |
> | A3 | All monetary values stored in **minor units** (centimes for MAD) as integers — no floating-point arithmetic |
> | A4 | Transactions use **double-entry ledger** — every debit has a matching credit |
> | A5 | SAGA orchestration pattern handles distributed transactions |
> | A6 | NestJS **modular monolith** in Phase 1 → Kafka-driven microservices in Phase 2 |
> | A7 | KYC is mandatory before any financial operation |
> | A8 | All API communication over HTTPS/TLS 1.3; internal calls use mTLS in Phase 2 |
> | A9 | Bank Al-Maghrib requires DGSSI cybersecurity certification and LBC-FT compliance officer |
> | A10 | Virtual card issuance via BaaS card provider (e.g., Marqeta or Unlimint) |

---

## B. MVP Scope

> [!success] Must Have — Phase 1
> - User registration + eKYC verification
> - Wallet creation and balance management
> - Wallet top-up via bank transfer / card
> - Peer-to-peer (P2P) internal transfers
> - Transaction history with filters
> - JWT auth + refresh tokens + MFA (TOTP)
> - Notification service (email + push)
> - Admin: user review, account freeze, KYC review
> - Compliance: audit logs, AML threshold alerts
> - Double-entry ledger with idempotency

> [!todo] Should Have — Phase 2
> - Virtual debit card issuance and management
> - Beneficiary management (save contacts)
> - Spending limits and velocity controls
> - Basic fraud rule engine
> - Webhook engine for external integrations
> - Support ticket system

> [!tip] Nice to Have — Phase 3
> - Savings pots / goals
> - Expense categorization with ML
> - Merchant payments / QR code pay
> - Statement PDF export
> - Open banking API

> [!warning] Later / Out of MVP
> - Lending / credit scoring
> - Crypto wallet
> - International remittance (SWIFT/SEPA)
> - Investment module

---

## C. Epics & Backlog

### Epic 1 — Identity & Authentication

| Story | User Story | Priority | Complexity | Dependencies | API Impact | Entities |
|---|---|---|---|---|---|---|
| E1-S1: Register | As a customer, I want to register with email+phone | Critical | S | None | `POST /auth/register` | User |
| E1-S2: Verify Email | As a customer, I want to verify my email via OTP | Critical | XS | E1-S1 | `POST /auth/verify-email` | User |
| E1-S3: Login | As a customer, I want to log in with email+password | Critical | S | E1-S2 | `POST /auth/login` | User, Session |
| E1-S4: MFA Setup | As a customer, I want to enable TOTP MFA | Critical | M | E1-S3 | `POST /auth/mfa/setup` | User |
| E1-S5: Refresh Token | As a customer, I want to refresh my JWT | Critical | XS | E1-S3 | `POST /auth/refresh` | Session |
| E1-S6: Logout | As a customer, I want to log out | High | XS | E1-S3 | `POST /auth/logout` | Session |
| E1-S7: Password Reset | As a customer, I want to reset my password via email | High | S | E1-S2 | `POST /auth/password-reset` | User |

> [!note]- Security Notes — Auth Epic
> - OTP TTL: 10 min; max 3 attempts; stored in Redis
> - Bcrypt hash cost factor: 12
> - Account lockout after 5 failed logins (15 min)
> - Refresh tokens in httpOnly cookie; single-use rotation
> - MFA secret AES-256 encrypted at rest

### Epic 2 — KYC & Onboarding

| Story | User Story | Priority | Complexity | Dependencies | API Impact | Entities |
|---|---|---|---|---|---|---|
| E2-S1: Submit KYC | As a customer, I want to upload CIN/passport + selfie | Critical | L | E1-S3 | `POST /kyc/submit` | KycCase, User |
| E2-S2: KYC Webhook | As a system, I want to receive KYC status updates | Critical | M | E2-S1 | `POST /webhooks/kyc` | KycCase, Wallet |
| E2-S3: KYC Review | As a compliance officer, I want to review flagged cases | Critical | M | E2-S1 | `PATCH /admin/kyc/:id/review` | KycCase, AuditLog |
| E2-S4: KYC Status | As a customer, I want to check my KYC status | High | XS | E2-S1 | `GET /kyc/status` | KycCase |

### Epic 3 — Wallet & Accounts

| Story | User Story | Priority | Complexity | Dependencies | API Impact | Entities |
|---|---|---|---|---|---|---|
| E3-S1: Create Wallet | Auto-create MAD wallet on KYC approval | Critical | M | E2-S2 | Internal event | Wallet |
| E3-S2: Get Balance | As a customer, I want to see my wallet balance | Critical | XS | E3-S1 | `GET /wallets/me/balance` | Wallet |
| E3-S3: Top-Up Wallet | As a customer, I want to fund my wallet | Critical | L | E3-S1 | `POST /wallets/me/topup` | Wallet, Transaction, LedgerEntry |
| E3-S4: Wallet Details | As a customer, I want to see wallet info | High | XS | E3-S1 | `GET /wallets/me` | Wallet |

### Epic 4 — Transactions & Transfers

| Story | User Story | Priority | Complexity | Dependencies | API Impact | Entities |
|---|---|---|---|---|---|---|
| E4-S1: P2P Transfer | As a customer, I want to send money to another wallet | Critical | XL | E3-S1 | `POST /transactions/transfer` | Transaction, LedgerEntry, Wallet |
| E4-S2: Tx History | As a customer, I want to view transaction history | Critical | M | E4-S1 | `GET /transactions` | Transaction |
| E4-S3: Tx Detail | As a customer, I want full transaction details | High | XS | E4-S2 | `GET /transactions/:id` | Transaction, LedgerEntry |
| E4-S4: Cancel Tx | As a customer, I want to cancel a pending transaction | High | M | E4-S1 | `POST /transactions/:id/cancel` | Transaction, LedgerEntry |

### Epic 5 — Notifications

| Story | User Story | Priority | Complexity | Dependencies | API Impact | Entities |
|---|---|---|---|---|---|---|
| E5-S1: Tx Notification | Be notified after every transaction | Critical | M | E4-S1 | Internal event | Notification |
| E5-S2: Preferences | Configure notification channels | Medium | S | E5-S1 | `PATCH /notifications/preferences` | Notification |

### Epic 6 — Admin & Compliance

| Story | User Story | Priority | Complexity | Dependencies | API Impact | Entities |
|---|---|---|---|---|---|---|
| E6-S1: Freeze Wallet | As an admin, I want to freeze a user's wallet | Critical | S | E3-S1 | `PATCH /admin/wallets/:id/freeze` | Wallet, AuditLog |
| E6-S2: AML Review | As a compliance officer, I want to review AML alerts | Critical | M | E4-S1 | `GET/PATCH /admin/fraud-alerts/:id` | FraudAlert, AuditLog |
| E6-S3: Audit Access | As compliance officer, I want to view the audit log | Critical | M | All | `GET /admin/audit-logs` | AuditLog |

---

## D. NestJS Module Architecture

### Module Map

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── profiles/
│   ├── kyc/
│   ├── wallets/
│   ├── accounts/
│   ├── transactions/
│   ├── ledger/
│   ├── payments/
│   ├── beneficiaries/
│   ├── cards/
│   ├── limits/
│   ├── fraud/
│   ├── notifications/
│   ├── webhooks/
│   ├── support/
│   ├── admin/
│   ├── audit/
│   └── reports/
```

### Module Specs

> [!example]- `auth` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Registration, login, JWT issuance, refresh tokens, MFA (TOTP), password reset |
> | **Services** | `AuthService`, `TokenService`, `MfaService`, `OtpService` |
> | **Controller** | `AuthController` → `/auth/*` |
> | **DTOs** | `RegisterDto`, `LoginDto`, `RefreshTokenDto`, `SetupMfaDto`, `VerifyMfaDto`, `ResetPasswordDto` |
> | **Entities** | `User`, `RefreshToken`, `OtpCode` |
> | **Events emitted** | `user.registered`, `user.login.success`, `user.login.failed`, `password.reset` |
> | **Guards** | `JwtAuthGuard`, `MfaGuard`, `RolesGuard` |
> | **Interceptors** | `AuditInterceptor` |

> [!example]- `kyc` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | KYC case lifecycle, document upload, provider integration, manual review |
> | **Services** | `KycService`, `KycProviderService` |
> | **Controller** | `KycController` → `/kyc/*` |
> | **DTOs** | `SubmitKycDto`, `KycStatusResponseDto`, `AdminReviewKycDto` |
> | **Entities** | `KycCase`, `KycDocument` |
> | **Events emitted** | `kyc.submitted`, `kyc.approved`, `kyc.rejected` |

> [!example]- `wallets` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Wallet creation, balance queries, status management, top-up initiation |
> | **Services** | `WalletsService`, `BalanceService` |
> | **Events consumed** | `kyc.approved` → auto-create wallet |
> | **Events emitted** | `wallet.created`, `wallet.frozen`, `wallet.topup.initiated` |
> | **Guards** | `JwtAuthGuard`, `KycVerifiedGuard` |

> [!example]- `transactions` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Transaction lifecycle (SAGA), P2P transfers, idempotency |
> | **Services** | `TransactionsService`, `TransferSagaService`, `IdempotencyService` |
> | **Events emitted** | `transaction.initiated`, `transaction.succeeded`, `transaction.failed`, `transaction.reversed` |
> | **Guards** | `JwtAuthGuard`, `KycVerifiedGuard`, `TransactionLimitGuard` |
> | **Filters** | `IdempotencyFilter` |

> [!example]- `ledger` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Double-entry bookkeeping, balance reconciliation |
> | **Controller** | None — internal only |
> | **Events consumed** | `transaction.succeeded` → write debit/credit pair |
> | **Notes** | ⚠️ Source of truth for all balances. Append-only. Never updated. |

> [!example]- `fraud` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Real-time rule evaluation, AML threshold checks, alert generation |
> | **Services** | `FraudRuleEngine`, `AmlMonitorService` |
> | **Events consumed** | `transaction.initiated` → evaluate before processing |
> | **Events emitted** | `fraud.alert.created`, `fraud.alert.resolved` |

> [!example]- `audit` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Append-only audit log for all critical actions |
> | **Notes** | ⚠️ No UPDATE or DELETE ever. Separate Postgres role with INSERT only. |

> [!example]- `notifications` Module
> | Aspect | Detail |
> |---|---|
> | **Channels** | Email (SendGrid), Push (Firebase FCM), SMS (Twilio) |
> | **Events consumed** | `transaction.succeeded`, `kyc.approved`, `kyc.rejected`, `fraud.alert.created` |

> [!example]- `webhooks` Module
> | Aspect | Detail |
> |---|---|
> | **Responsibilities** | Receive inbound webhooks, HMAC verification, dispatch to handlers |
> | **Notes** | Every webhook stored raw before processing; supports manual replay from admin |

---

## E. Entity Model

### Relationships

```
User ──1:1──► KycCase
User ──1:1──► Wallet
Wallet ──1:1──► LimitProfile
Wallet ──1:N──► LedgerEntry
Transaction ──1:N──► LedgerEntry  (always 2 entries per tx)
Transaction ──1:0..1──► FraudAlert
User ──1:N──► Notification
User ──1:N──► AuditLog (as actor)
```

### Entity Definitions

> [!info]- `User` — Source of truth for identity
> ```typescript
> id: uuid (PK)
> email: string (unique, AES-256 encrypted)
> phone: string (unique, AES-256 encrypted)
> passwordHash: string
> role: enum(CUSTOMER, SUPPORT, ADMIN, COMPLIANCE_OFFICER)
> status: enum(PENDING_VERIFICATION, ACTIVE, SUSPENDED, BLOCKED)
> emailVerified: boolean
> phoneVerified: boolean
> mfaEnabled: boolean
> mfaSecret: string (AES-256 encrypted)
> createdAt: timestamp
> updatedAt: timestamp
> ```

> [!info]- `Wallet` — Balance is derived, not stored
> ```typescript
> id: uuid (PK)
> userId: uuid (FK → User)
> currency: string (default: 'MAD')
> reference: string (unique, e.g. MA-XXXX-XXXX)
> status: enum(PENDING, ACTIVE, FROZEN, SUSPENDED, CLOSED)
> dailySpendLimit: bigint
> monthlySpendLimit: bigint
> createdAt: timestamp
> ```
> > ⚠️ Balance = `SUM(LedgerEntry.amount WHERE walletId = this.id)`

> [!info]- `Transaction` — Source of truth for money movements
> ```typescript
> id: uuid (PK)
> idempotencyKey: string (unique)
> type: enum(TOP_UP, P2P_TRANSFER, CARD_PAYMENT, REVERSAL, FEE)
> status: enum(INITIATED, PENDING, PROCESSING, SUCCEEDED, FAILED, REVERSED, CANCELLED)
> senderWalletId: uuid (FK → Wallet, nullable)
> receiverWalletId: uuid (FK → Wallet, nullable)
> amount: bigint (centimes)
> currency: string
> fee: bigint (default: 0)
> description: string
> metadata: jsonb
> failureReason: string
> createdAt: timestamp
> updatedAt: timestamp
> ```

> [!info]- `LedgerEntry` — Source of truth for balances
> ```typescript
> id: uuid (PK)
> transactionId: uuid (FK → Transaction)
> walletId: uuid (FK → Wallet)
> type: enum(DEBIT, CREDIT)
> amount: bigint (always positive)
> balanceAfter: bigint (running snapshot)
> createdAt: timestamp
> ```
> > ⚠️ Append-only. Never updated or deleted.

> [!info]- `KycCase`
> ```typescript
> id: uuid (PK)
> userId: uuid (FK → User)
> providerCaseId: string
> status: enum(NOT_STARTED, PENDING, APPROVED, REJECTED, REQUIRES_ACTION, EXPIRED)
> documentType: enum(CIN, PASSPORT, RESIDENCY_PERMIT)
> documentNumber: string (encrypted)
> reviewedBy: uuid (FK → User)
> reviewNote: string
> submittedAt: timestamp
> resolvedAt: timestamp
> ```

> [!info]- `FraudAlert`
> ```typescript
> id: uuid (PK)
> transactionId: uuid (nullable)
> walletId: uuid
> alertType: enum(AML_THRESHOLD, VELOCITY, UNUSUAL_PATTERN, SANCTION_HIT)
> severity: enum(LOW, MEDIUM, HIGH, CRITICAL)
> status: enum(OPEN, UNDER_REVIEW, RESOLVED, ESCALATED)
> ruleTriggered: string
> reviewedBy: uuid
> notes: string
> createdAt: timestamp
> ```

> [!info]- `AuditLog` — Append-only, no DELETE ever
> ```typescript
> id: uuid (PK)
> actorId: uuid (FK → User)
> actorRole: string
> action: string
> targetEntity: string
> targetId: uuid
> ipAddress: string
> userAgent: string
> payload: jsonb (sanitized — no PII)
> createdAt: timestamp
> ```

---

## F. API Catalog by Module

### Auth — `/auth`

| Method | Path | Purpose | Access | Idempotency | Audit |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | Register new user | Public | No | ✅ |
| `POST` | `/auth/verify-email` | Verify email with OTP | Public | No | ✅ |
| `POST` | `/auth/login` | Login, get tokens | Public | No | ✅ |
| `POST` | `/auth/refresh` | Refresh access token | Cookie | No | ❌ |
| `POST` | `/auth/logout` | Revoke session | Auth | No | ✅ |
| `POST` | `/auth/mfa/setup` | Generate TOTP QR | Auth | No | ✅ |
| `POST` | `/auth/mfa/verify` | Verify TOTP | Public | No | ✅ |
| `POST` | `/auth/password-reset/request` | Send reset email | Public | No | ✅ |
| `POST` | `/auth/password-reset/confirm` | Set new password | Public | No | ✅ |

> [!danger]- Error Cases — `/auth/login`
> ```json
> 401 → { "code": "INVALID_CREDENTIALS" }
> 401 → { "code": "MFA_REQUIRED", "tempToken": "..." }
> 423 → { "code": "ACCOUNT_LOCKED", "message": "Try again in 15 min" }
> 403 → { "code": "ACCOUNT_SUSPENDED" }
> ```

### KYC — `/kyc`

| Method | Path | Purpose | Access | Idempotency | Audit |
|---|---|---|---|---|---|
| `POST` | `/kyc/submit` | Submit KYC documents | Auth | ✅ | ✅ |
| `GET` | `/kyc/status` | Get own KYC status | Auth | ❌ | ❌ |
| `GET` | `/kyc/requirements` | Get required documents | Public | ❌ | ❌ |

### Wallets — `/wallets`

| Method | Path | Purpose | Access | Idempotency | Audit |
|---|---|---|---|---|---|
| `GET` | `/wallets/me` | Get my wallet | Auth | ❌ | ❌ |
| `GET` | `/wallets/me/balance` | Real-time balance | Auth | ❌ | ❌ |
| `POST` | `/wallets/me/topup` | Initiate top-up | Auth + KYC | ✅ | ✅ |
| `GET` | `/wallets/me/limits` | Get spending limits | Auth | ❌ | ❌ |

### Transactions — `/transactions`

| Method | Path | Purpose | Access | Idempotency | Audit |
|---|---|---|---|---|---|
| `POST` | `/transactions/transfer` | P2P transfer | Auth + KYC | ✅ **REQUIRED** | ✅ |
| `GET` | `/transactions` | List transactions | Auth | ❌ | ❌ |
| `GET` | `/transactions/:id` | Transaction detail | Auth | ❌ | ❌ |
| `POST` | `/transactions/:id/cancel` | Cancel pending tx | Auth | ❌ | ✅ |

> [!danger]- Error Cases — `/transactions/transfer`
> ```json
> 402 → { "code": "INSUFFICIENT_BALANCE" }
> 403 → { "code": "KYC_NOT_VERIFIED" }
> 403 → { "code": "WALLET_FROZEN" }
> 422 → { "code": "LIMIT_EXCEEDED" }
> 409 → { "code": "DUPLICATE_REQUEST" }
> 400 → { "code": "SELF_TRANSFER" }
> ```

> [!tip]- Transfer DTO
> ```typescript
> class TransferDto {
>   @IsString() receiverWalletRef: string;
>   @IsInt() @Min(100) amount: number;   // centimes, min 1 MAD
>   @IsString() @MaxLength(140) description: string;
>   @IsUUID() idempotencyKey: string;    // client-generated UUID
> }
> ```

### Beneficiaries — `/beneficiaries`

| Method | Path | Purpose | Access | Audit |
|---|---|---|---|---|
| `POST` | `/beneficiaries` | Add beneficiary | Auth | ✅ |
| `GET` | `/beneficiaries` | List beneficiaries | Auth | ❌ |
| `DELETE` | `/beneficiaries/:id` | Remove beneficiary | Auth | ✅ |

### Notifications — `/notifications`

| Method | Path | Purpose | Access |
|---|---|---|---|
| `GET` | `/notifications` | List notifications | Auth |
| `PATCH` | `/notifications/:id/read` | Mark as read | Auth |
| `GET` | `/notifications/preferences` | Get preferences | Auth |
| `PATCH` | `/notifications/preferences` | Update preferences | Auth |

### Webhooks — `/webhooks` *(HMAC-verified)*

| Method | Path | Purpose | Signature |
|---|---|---|---|
| `POST` | `/webhooks/kyc` | KYC status update | ✅ Required |
| `POST` | `/webhooks/payment` | Payment callback | ✅ Required |
| `POST` | `/webhooks/card` | Card events | ✅ Required |

### Admin — `/admin` *(Role-protected)*

| Method | Path | Purpose | Role | Audit |
|---|---|---|---|---|
| `GET` | `/admin/users` | List all users | ADMIN, SUPPORT | ❌ |
| `GET` | `/admin/users/:id` | Full user profile | ADMIN, SUPPORT | ✅ |
| `PATCH` | `/admin/users/:id/suspend` | Suspend user | ADMIN | ✅ |
| `PATCH` | `/admin/wallets/:id/freeze` | Freeze wallet | ADMIN, COMPLIANCE | ✅ |
| `PATCH` | `/admin/wallets/:id/unfreeze` | Unfreeze wallet | ADMIN | ✅ |
| `PATCH` | `/admin/wallets/:id/limits` | Adjust limits | ADMIN | ✅ |
| `GET` | `/admin/kyc` | List KYC cases | COMPLIANCE, ADMIN | ❌ |
| `PATCH` | `/admin/kyc/:id/review` | Review KYC | COMPLIANCE | ✅ |
| `GET` | `/admin/transactions` | All transactions | ADMIN, COMPLIANCE | ❌ |
| `GET` | `/admin/fraud-alerts` | List alerts | COMPLIANCE, ADMIN | ❌ |
| `PATCH` | `/admin/fraud-alerts/:id` | Review alert | COMPLIANCE | ✅ |
| `GET` | `/admin/audit-logs` | Query audit logs | ADMIN, COMPLIANCE | ❌ |
| `POST` | `/admin/webhooks/:id/replay` | Replay webhook | ADMIN | ✅ |

---

## G. Critical Sequence Flows

### Flow 1 — P2P Transfer (SAGA)

```
Customer → POST /transactions/transfer
    │
    ├─ 1. IdempotencyService.check(key) → reject if duplicate
    ├─ 2. TransactionLimitGuard.check(walletId, amount)
    ├─ 3. FraudRuleEngine.evaluate(tx) → ALLOW / REVIEW / BLOCK
    ├─ 4. LedgerService.lockBalance(senderWallet, amount)
    ├─ 5. Transaction created → status: PROCESSING
    ├─ 6. LedgerService.debit(senderWallet)
    ├─ 7. LedgerService.credit(receiverWallet)
    ├─ 8. Transaction → status: SUCCEEDED
    ├─ 9. AuditService.log(...)
    └─ 10. NotificationService.send(sender + receiver)

On failure at step 6 or 7:
    └─ SAGA compensate: reverse debit → status: FAILED → audit log
```

### Flow 2 — KYC → Wallet Activation

```
Customer → POST /kyc/submit
    ├─ Documents encrypted + uploaded
    ├─ KycCase: status = PENDING
    └─ KycProviderService.send() → external call

KYC Provider → POST /webhooks/kyc
    ├─ HMAC signature verified
    ├─ WebhookEvent stored raw
    ├─ KycCase.status updated
    │
    ├─ IF APPROVED:
    │     ├─ User.status → ACTIVE
    │     ├─ WalletsService.createWallet(userId)
    │     └─ Notify('KYC_APPROVED')
    └─ IF REJECTED:
          └─ Notify('KYC_REJECTED')
```

---

## H. Security & Compliance Controls

### Token Security

| Control | Implementation |
|---|---|
| Password hashing | `bcrypt` cost 12 |
| JWT access token | 15 min TTL, RS256 |
| Refresh token | 30-day TTL, httpOnly cookie, single-use |
| MFA | TOTP RFC 6238 via `speakeasy`; AES-256 encrypted |
| Session revocation | Redis blacklist |
| Lockout | 5 failures → 15 min block (Redis counter) |

### Request Security

| Control | Implementation |
|---|---|
| Validation pipe | `class-validator` with `whitelist: true, forbidNonWhitelisted: true` |
| Rate limiting | `@nestjs/throttler` — 60/min public, 200/min auth |
| Helmet | Global — all security headers |
| CORS | Strict origin whitelist |
| Body size | 10KB JSON; 5MB for KYC uploads only |

### RBAC

```typescript
enum Role {
  CUSTOMER,
  SUPPORT,             // read-only
  COMPLIANCE_OFFICER,  // KYC, AML, audit
  ADMIN                // everything + freeze + limits
}
```

### Sensitive Endpoints

> [!danger] High-Risk Endpoint Controls
> | Endpoint | Extra Controls |
> |---|---|
> | `POST /transactions/transfer` | Idempotency + fraud check + balance lock + MFA re-prompt >5,000 MAD |
> | `POST /auth/login` | 10/min rate limit per IP; lockout; anomaly detection |
> | `POST /kyc/submit` | Magic byte file validation; virus scan |
> | `PATCH /admin/wallets/:id/freeze` | 2-admin approval for accounts >100K MAD |
> | `GET /admin/audit-logs` | IP allowlist for compliance team |
> | `POST /webhooks/*` | HMAC-SHA256 mandatory; raw body preserved |

### Morocco Compliance

> [!warning] Bank Al-Maghrib Requirements
> - **LBC-FT (AML/CFT):** Dedicated compliance officer + ANRF sanction list screening
> - **KYC thresholds:** Transactions >**MAD 10,000** trigger Enhanced Due Diligence
> - **SAR filing:** Suspicious Activity Reports to ANRF within defined timelines
> - **DGSSI certification:** Required for production — your SAST/DAST/Trivy pipeline directly supports this
> - **Data residency:** Financial data must stay in Morocco or approved jurisdiction

---

## I. Delivery Roadmap — 3 Phases

### Phase 1 — MVP (Weeks 1–10)

| Week | Deliverable |
|---|---|
| 1–2 | Project scaffold, DB schema, `auth` module (register, login, JWT, MFA) |
| 3–4 | `kyc` module + provider adapter + webhook handler |
| 5–6 | `wallets` + `ledger` modules + balance engine |
| 7–8 | `transactions` module (SAGA + idempotency) |
| 9 | `notifications` + admin basic panel |
| 10 | Fraud rule engine + audit module + security hardening |

### Phase 2 — Scale & Enrich (Weeks 11–20)

- Virtual card issuance via BaaS
- Beneficiaries management
- Kafka event bus (replaces in-process events)
- ML fraud detection (Python microservice)
- Spending limits UI + merchant payments
- Full Swagger/OpenAPI docs

### Phase 3 — Growth (Weeks 21–30)

- Savings goals / pots
- Statement PDF export
- Open Banking API
- Microservices split (transactions, fraud, notifications → separate apps)
- Bank Al-Maghrib EME license application

---

## J. Risks & Missing Decisions

> [!bug]- Risk Register
> | Risk | Impact | Mitigation |
> |---|---|---|
> | BaaS partner not available in Morocco | High | Evaluate Treezor, Unlimint, local bank partnership early |
> | EME license takes 6–18 months | High | Launch under BaaS license; apply in parallel |
> | Double-spend race condition | Critical | Optimistic locking + `SELECT FOR UPDATE` in ledger |
> | KYC provider downtime | Medium | Retry + manual fallback review flow |
> | DGSSI certification timeline | Medium | Engage DGSSI early |
> | FX / multi-currency | Low (MVP) | MAD-only for MVP; defer FX |
> | Undefined fee model | Medium | Decide before Phase 1: free / subscription / interchange |

---

## 1. Recommended NestJS Folder Structure

```
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── kyc-verified.guard.ts
│   ├── interceptors/
│   │   ├── audit.interceptor.ts
│   │   ├── idempotency.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── pipes/
│   │   └── parse-bigint.pipe.ts
│   └── utils/
│       ├── currency.util.ts   ← bigint arithmetic only
│       └── crypto.util.ts     ← AES-256 encrypt/decrypt
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── mfa.service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   ├── users/
│   ├── kyc/
│   ├── wallets/
│   ├── ledger/
│   ├── transactions/
│   ├── fraud/
│   ├── notifications/
│   ├── webhooks/
│   ├── audit/
│   └── admin/
├── database/
│   ├── entities/
│   ├── migrations/
│   └── seeds/
└── test/
    ├── unit/
    └── e2e/
```

---

## 2. Environment Variables

```bash
# App
NODE_ENV=production
PORT=3000
APP_URL=https://api.neobank.ma

# Database
DB_HOST=
DB_PORT=5432
DB_NAME=neobank_prod
DB_USER=
DB_PASSWORD=
DB_SSL=true

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=

# Encryption
ENCRYPTION_KEY=
ENCRYPTION_IV_LENGTH=16

# KYC Provider
KYC_PROVIDER_API_URL=
KYC_PROVIDER_API_KEY=
KYC_WEBHOOK_SECRET=

# Payment Gateway
PAYMENT_GATEWAY_URL=
PAYMENT_GATEWAY_API_KEY=
PAYMENT_WEBHOOK_SECRET=

# Card Provider
CARD_PROVIDER_URL=
CARD_PROVIDER_API_KEY=
CARD_WEBHOOK_SECRET=

# Notifications
SENDGRID_API_KEY=
FIREBASE_FCM_SERVER_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Secrets
VAULT_URL=
VAULT_TOKEN=

# Kafka (Phase 2)
KAFKA_BROKERS=
KAFKA_CLIENT_ID=neobank-api

# Monitoring
SENTRY_DSN=
PROMETHEUS_PORT=9090
```

---

## 3. Third-Party Services to Evaluate

| Category | Options | Notes |
|---|---|---|
| **KYC/eKYC** | iDenfy, Jumio, Onfido, Sumsub | iDenfy supports CIN; good MENA pricing |
| **BaaS** | Treezor (EU), Railsbank, Swan.io | Check MENA coverage |
| **Payment Gateway** | CMI Morocco, Payzone MA, Stripe | CMI is the dominant local player |
| **Card Issuance** | Marqeta, Unlimint, Paymentology | Marqeta is developer-friendly |
| **Notifications** | SendGrid, Firebase FCM, Twilio | Generous free tiers |
| **Fraud / AML** | Sardine, Seon, Unit21 | Sardine strong in MENA |
| **Sanction Lists** | ANRF, OFAC, UN lists | Complyadvantage for automated screening |
| **Observability** | Sentry + Prometheus + Grafana + ELK | Standard stack |
| **Secrets** | HashiCorp Vault / GCP Secret Manager | Already in your toolbelt |
| **CI/CD** | GitHub Actions + ArgoCD + Trivy | Aligns with DevSecOps pipeline |

---

## 4. Swagger/OpenAPI Checklist

- [ ] `@ApiTags()` on every controller
- [ ] `@ApiOperation({ summary })` on every endpoint
- [ ] `@ApiResponse()` for all success + error responses
- [ ] `@ApiBearerAuth()` on all authenticated routes
- [ ] `@ApiProperty()` on every DTO field with examples
- [ ] `@ApiQuery()` for all pagination/filter params
- [ ] `@ApiParam()` for all path params
- [ ] Global `SecurityScheme` in `main.ts` for JWT Bearer
- [ ] Versioning prefix `/v1/` via `app.setGlobalPrefix('v1')`
- [ ] Separate Swagger docs for public API vs admin API
- [ ] `@ApiExcludeEndpoint()` on all internal routes
- [ ] Export OpenAPI JSON + commit to repo for frontend team

---

## 5. Next 10 Implementation Tasks

- [ ] #task Scaffold NestJS project with TypeORM + PostgreSQL + global config — `Complexity: S`
- [ ] #task `auth` module: register, OTP, login, JWT, refresh rotation — `Complexity: M`
- [ ] #task `users` module + RBAC guards + `@CurrentUser()` decorator — `Complexity: S`
- [ ] #task DB migrations: User, Wallet, Transaction, LedgerEntry, KycCase, AuditLog — `Complexity: M`
- [ ] #task `kyc` module + iDenfy adapter + HMAC webhook handler — `Complexity: L`
- [ ] #task `wallets` module: auto-create on KYC approval, balance from ledger — `Complexity: M`
- [ ] #task `ledger` module: double-entry write, append-only enforcement — `Complexity: L`
- [ ] #task `transactions` module: P2P SAGA + idempotency + compensating tx — `Complexity: XL`
- [ ] #task `fraud` module: threshold rule engine on `transaction.initiated` — `Complexity: M`
- [ ] #task CI/CD: GitHub Actions → SonarQube → OWASP ZAP → Trivy → ArgoCD → K8s — `Complexity: L`
