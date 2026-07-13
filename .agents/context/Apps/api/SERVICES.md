# API Services

## Service Map
```
AuthService
├── depends: UserService, TokenService
└── methods: register, login, refresh, logout

UserService
├── depends: PrismaService
└── methods: findAll, findById, findByEmail, update, deactivate

ProductService
├── depends: PrismaService
└── methods: findAll, findBySlug, create, update, deactivate

OrderService
├── depends: PrismaService, ProductService, PaymentService
└── methods: findAll, findById, create, updateStatus

PaymentService
├── depends: Stripe SDK
└── methods: createPaymentIntent, confirmPayment, refund

EmailService
├── depends: SendGrid SDK, BullMQ queue
└── methods: sendWelcome, sendOrderConfirmation, sendPasswordReset
```

## Patterns
- Services injected via NestJS DI
- Business logic ONLY in services, not controllers
- Controllers: validation, auth, call service, format response
- Services throw custom exceptions (NotFoundException, ConflictException)

## External Integrations
| Service | SDK | Env Var |
|---------|-----|--------|
| Stripe | stripe | STRIPE_SECRET_KEY |
| SendGrid | @sendgrid/mail | SENDGRID_API_KEY |
| AWS S3 | @aws-sdk/client-s3 | AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY |
