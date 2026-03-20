---
title: "🧱 NeoBank Maroc — SOLID Principles Applied"
tags:
  - solid
  - clean-code
  - nestjs
  - architecture
  - backend
  - typescript
  - "#project/neobank"
project: Neobank
stack: NestJS · TypeScript
author: Abdelilah Dahou
status: reference
created: 2026-03-20
updated: 2026-03-20
---

# 🧱 NeoBank Maroc — SOLID Principles Applied to NestJS Backend

> [!info] Contexte
> Ce document montre comment chaque principe SOLID est appliqué
> **concrètement** dans le backend NeoBank Maroc (NestJS + TypeScript).
> Chaque principe est illustré avec du **vrai code** tiré de notre architecture.

---

## 🗂️ Navigation

- [[#S — Single Responsibility Principle]]
- [[#O — Open Closed Principle]]
- [[#L — Liskov Substitution Principle]]
- [[#I — Interface Segregation Principle]]
- [[#D — Dependency Inversion Principle]]
- [[#SOLID en pratique — Transaction SAGA]]
- [[#Anti-patterns à éviter]]
- [[#Checklist SOLID par module]]

---

## Vue d'ensemble

```
SOLID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  S → Single Responsibility  Une classe = une raison de changer
  O → Open / Closed          Ouvert à l'extension, fermé à la modification
  L → Liskov Substitution    Les sous-types doivent remplacer leur type parent
  I → Interface Segregation  Plusieurs interfaces spécifiques > une générale
  D → Dependency Inversion   Dépendre des abstractions, jamais des concrets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> [!warning] Règle d'Or NeoBank
> Dans un système **financier**, violer SOLID n'est pas qu'un problème
> de code — c'est un **risque opérationnel et réglementaire**.
> Un `TransactionService` qui gère aussi les notifications ET le ledger
> est une bombe à retardement en production.

---

## S — Single Responsibility Principle

> [!abstract] Définition
> **"Une classe ne doit avoir qu'une seule raison de changer."**
> En fintech : chaque service gère **un seul domaine métier**.

### ❌ Violation — Le God Service (ce qu'il ne faut PAS faire)

```typescript
// ❌ BAD — TransactionService fait TOUT
// Une seule modification (ex: SMS provider) casse tout le reste
@Injectable()
export class TransactionService {
  async transfer(dto: TransferDto) {
    // 1. Vérifie le solde
    const wallet = await this.db.query(`SELECT * FROM wallets...`);

    // 2. Détecte la fraude (ne devrait PAS être ici)
    const fraudScore = await this.openai.analyze(dto);
    if (fraudScore > 0.8) throw new Error('Fraud detected');

    // 3. Écrit dans le ledger (ne devrait PAS être ici)
    await this.db.query(`INSERT INTO ledger_entries...`);

    // 4. Envoie un SMS (ne devrait PAS être ici)
    await this.twilio.messages.create({ body: 'Transfert effectué...' });

    // 5. Écrit le log d'audit (ne devrait PAS être ici)
    await this.db.query(`INSERT INTO audit_logs...`);
  }
}
// ❌ Résultat : 5 raisons de changer → 5 sources de bugs
```

### ✅ Application NeoBank — Séparation des Responsabilités

```typescript
// ✅ GOOD — Chaque service a UNE responsabilité

// 1. TransactionService → orchestre le SAGA uniquement
@Injectable()
export class TransactionService {
  constructor(
    private readonly sagaService: TransferSagaService,
    private readonly idempotencyService: IdempotencyService,
    private readonly limitGuard: TransactionLimitGuard,
  ) {}

  async transfer(dto: TransferDto, userId: string): Promise<Transaction> {
    await this.idempotencyService.check(dto.idempotencyKey);
    await this.limitGuard.validate(userId, dto.amount);
    return this.sagaService.execute(dto, userId);
  }
}

// 2. LedgerService → UNIQUEMENT l'écriture double-entry
@Injectable()
export class LedgerService {
  async writeDoubleEntry(
    transactionId: string,
    debitWalletId: string,
    creditWalletId: string,
    amount: bigint,
  ): Promise<void> {
    // Seule responsabilité : écrire les 2 entrées du ledger
    await this.ledgerRepository.save([
      { transactionId, walletId: debitWalletId,  type: 'DEBIT',  amount },
      { transactionId, walletId: creditWalletId, type: 'CREDIT', amount },
    ]);
  }
}

// 3. FraudService → UNIQUEMENT l'évaluation des règles
@Injectable()
export class FraudRuleEngine {
  async evaluate(context: FraudContext): Promise<FraudDecision> {
    // Seule responsabilité : évaluer les règles de fraude
    const results = await Promise.all(
      this.rules.map(rule => rule.evaluate(context))
    );
    return this.aggregateDecisions(results);
  }
}

// 4. AuditService → UNIQUEMENT l'écriture des logs immuables
@Injectable()
export class AuditService {
  async log(entry: CreateAuditLogDto): Promise<void> {
    // Seule responsabilité : append-only audit log
    await this.auditRepository.insert({
      ...entry,
      createdAt: new Date(),
    });
  }
}

// 5. NotificationService → UNIQUEMENT l'envoi de notifications
@Injectable()
export class NotificationService {
  async send(userId: string, event: NotificationEvent): Promise<void> {
    // Seule responsabilité : dispatcher les notifications
    const prefs = await this.prefsRepository.findByUserId(userId);
    await this.dispatcher.dispatch(event, prefs);
  }
}
```

### Résultat SRP dans notre Architecture

| Service | Responsabilité Unique | Raison de Changer |
|---|---|---|
| `TransactionService` | Orchestration SAGA | Changement du flow métier |
| `LedgerService` | Double-entry écriture | Changement règles comptables |
| `FraudRuleEngine` | Évaluation règles fraude | Nouvelles règles AML |
| `AuditService` | Log immuable | Changement format audit |
| `NotificationService` | Dispatch multi-canal | Nouveau canal (WhatsApp...) |
| `IdempotencyService` | Déduplication requests | Changement stratégie clé |
| `KycProviderService` | Intégration KYC externe | Changement de provider |

---

## O — Open/Closed Principle

> [!abstract] Définition
> **"Ouvert à l'extension, fermé à la modification."**
> Ajouter une fonctionnalité ne doit jamais casser le code existant.

### Cas Concret NeoBank : Notifications Multi-Canal

Demain on veut ajouter WhatsApp, puis Slack, puis Telegram.
Sans OCP : on modifie `NotificationService` à chaque fois → régression.
Avec OCP : on crée un nouveau provider, on l'injecte → zéro modification.

```typescript
// ✅ Interface fermée à la modification
export interface INotificationProvider {
  readonly channel: NotificationChannel;
  send(to: string, message: NotificationMessage): Promise<void>;
}

// ✅ Providers OUVERTS à l'extension (nouveaux sans toucher l'existant)

@Injectable()
export class EmailProvider implements INotificationProvider {
  readonly channel = NotificationChannel.EMAIL;

  async send(to: string, message: NotificationMessage): Promise<void> {
    await this.sendgrid.send({
      to,
      subject: message.title,
      html: message.body,
    });
  }
}

@Injectable()
export class SmsProvider implements INotificationProvider {
  readonly channel = NotificationChannel.SMS;

  async send(to: string, message: NotificationMessage): Promise<void> {
    await this.twilio.messages.create({
      to,
      from: this.config.get('TWILIO_FROM'),
      body: message.body,
    });
  }
}

@Injectable()
export class PushProvider implements INotificationProvider {
  readonly channel = NotificationChannel.PUSH;

  async send(to: string, message: NotificationMessage): Promise<void> {
    await this.firebase.messaging().send({
      token: to,
      notification: { title: message.title, body: message.body },
    });
  }
}

// ✅ Demain : on AJOUTE WhatsApp sans toucher rien d'autre
@Injectable()
export class WhatsAppProvider implements INotificationProvider {
  readonly channel = NotificationChannel.WHATSAPP;

  async send(to: string, message: NotificationMessage): Promise<void> {
    await this.whatsappApi.sendMessage({ to, text: message.body });
  }
}

// ✅ NotificationDispatcher — NE CHANGE JAMAIS quelle que soit
//    le nombre de providers ajoutés
@Injectable()
export class NotificationDispatcher {
  private readonly providers: Map<NotificationChannel, INotificationProvider>;

  constructor(
    @Inject(NOTIFICATION_PROVIDERS)
    providers: INotificationProvider[],
  ) {
    this.providers = new Map(
      providers.map(p => [p.channel, p])
    );
  }

  async dispatch(
    event: NotificationEvent,
    prefs: NotificationPreference,
  ): Promise<void> {
    const enabledChannels = this.getEnabledChannels(prefs);

    await Promise.allSettled(
      enabledChannels.map(channel =>
        this.providers.get(channel)?.send(event.recipient, event.message)
      )
    );
  }
}
```

### Cas Concret NeoBank : Fraud Rules Engine

Chaque nouvelle règle AML est ajoutée sans modifier l'engine existant.

```typescript
// ✅ Interface fermée
export interface IFraudRule {
  readonly ruleName: string;
  readonly severity: FraudSeverity;
  evaluate(context: FraudContext): Promise<RuleResult>;
}

// ✅ Règles existantes — ne changent jamais
@Injectable()
export class AmlThresholdRule implements IFraudRule {
  readonly ruleName = 'AML_THRESHOLD';
  readonly severity = FraudSeverity.HIGH;

  async evaluate(ctx: FraudContext): Promise<RuleResult> {
    // Transaction > 10 000 MAD → alert (Bank Al-Maghrib threshold)
    const triggered = ctx.amount > 1_000_000n; // centimes
    return { triggered, reason: triggered ? 'Exceeds MAD 10,000 threshold' : null };
  }
}

@Injectable()
export class VelocityRule implements IFraudRule {
  readonly ruleName = 'VELOCITY_CHECK';
  readonly severity = FraudSeverity.MEDIUM;

  async evaluate(ctx: FraudContext): Promise<RuleResult> {
    // > 5 transactions en 10 minutes → suspect
    const count = await this.redis.get(`velocity:${ctx.walletId}`);
    const triggered = Number(count) > 5;
    return { triggered, reason: triggered ? 'High transaction velocity' : null };
  }
}

// ✅ Demain : nouvelle règle SANS modifier l'engine
@Injectable()
export class SanctionListRule implements IFraudRule {
  readonly ruleName = 'SANCTION_HIT';
  readonly severity = FraudSeverity.CRITICAL;

  async evaluate(ctx: FraudContext): Promise<RuleResult> {
    const hit = await this.sanctionService.check(ctx.receiverWalletId);
    return { triggered: hit, reason: hit ? 'Sanction list match' : null };
  }
}

// ✅ Engine — NE CHANGE JAMAIS
@Injectable()
export class FraudRuleEngine {
  constructor(
    @Inject(FRAUD_RULES)
    private readonly rules: IFraudRule[],
  ) {}

  async evaluate(context: FraudContext): Promise<FraudDecision> {
    const results = await Promise.all(
      this.rules.map(rule => rule.evaluate(context))
    );

    const triggered = results.filter(r => r.triggered);
    if (triggered.length === 0) return { allow: true };

    const maxSeverity = this.getMaxSeverity(triggered);
    return {
      allow: maxSeverity === FraudSeverity.LOW,
      block: maxSeverity === FraudSeverity.CRITICAL,
      review: maxSeverity === FraudSeverity.MEDIUM,
      reasons: triggered.map(r => r.reason),
    };
  }
}
```

---

## L — Liskov Substitution Principle

> [!abstract] Définition
> **"Un sous-type doit pouvoir remplacer son type parent sans altérer
> le comportement du programme."**
> En NestJS : toute implémentation d'une interface doit être
> interchangeable sans changer le code appelant.

### Cas Concret NeoBank : KYC Provider Abstraction

On peut switcher de iDenfy à Sumsub sans changer `KycService`.

```typescript
// ✅ Contrat parent — abstraction stable
export interface IKycProvider {
  submitCase(payload: KycSubmissionPayload): Promise<KycProviderResponse>;
  getStatus(caseId: string): Promise<KycProviderStatus>;
  verifyWebhookSignature(payload: Buffer, signature: string): boolean;
}

// ✅ iDenfy — respecte TOTALEMENT le contrat
@Injectable()
export class IDenfyProvider implements IKycProvider {
  async submitCase(payload: KycSubmissionPayload): Promise<KycProviderResponse> {
    const response = await this.http.post('/api/v2/token', {
      clientId: payload.userId,
      // iDenfy-specific mapping
      firstName: payload.firstName,
      lastName:  payload.lastName,
    });
    return {
      externalCaseId: response.data.authToken,
      redirectUrl:    response.data.scanRef,
      status:         'PENDING',
    };
  }

  async getStatus(caseId: string): Promise<KycProviderStatus> {
    const res = await this.http.get(`/api/v2/identification/${caseId}`
