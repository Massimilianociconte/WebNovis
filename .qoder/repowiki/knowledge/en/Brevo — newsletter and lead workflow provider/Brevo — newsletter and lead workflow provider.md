---
kind: external_dependency
name: Brevo — newsletter and lead workflow provider
slug: brevo
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

Email marketing / newsletter platform configured via environment variables (`BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_SENDER_EMAIL`). Used for newsletter distribution and lead pipeline notifications. Free tier supports up to 100k contacts and 9k emails/month. The admin secret endpoint for manual dispatch is protected by `NEWSLETTER_ADMIN_SECRET`.