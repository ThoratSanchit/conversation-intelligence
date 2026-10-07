# Conversation Intelligence Server

A backend application built with **Node.js, TypeScript, Fastify, PostgreSQL, and Sequelize ORM** designed for the 5-hour technical challenge.

---

## 📁 Architecture & Folder Tree

```text
server/
├── .env                              # Environment variables
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── README.md                         # Documentation
└── src/
    ├── app.ts                        # Fastify server bootstrap & route registration
    ├── config/                       # Configuration
    │   ├── database.ts               # Sequelize instance & PostgreSQL connection
    │   └── env.ts                    # Typed environment variables
    ├── controllers/                  # HTTP request/response handlers
    │   ├── intelligence.controller.ts# Intelligence analysis endpoints
    │   └── lead.controller.ts        # CSV import and lead listing endpoints
    ├── models/                       # Sequelize ORM models
    │   ├── index.ts                  # Model associations & synchronization
    │   ├── intelligence.model.ts     # LeadIntelligence model
    │   └── lead.model.ts             # Lead model
    ├── routes/                       # Fastify route definitions
    │   ├── index.ts                  # Root API router (/api)
    │   ├── intelligence.routes.ts    # /api/intelligence endpoints
    │   └── lead.routes.ts            # /api/leads endpoints
    ├── services/                     # Business logic layer
    │   ├── ai-generator.service.ts   # "Why Contact Now?", angle & opening generation
    │   ├── csv-parser.service.ts     # CSV stream parsing & lead normalization
    │   ├── lead.service.ts           # Direct Sequelize queries for leads
    │   └── signal-detector.service.ts# Deterministic signal detection engine
    └── types/                        # TypeScript types & DTO interfaces
        ├── intelligence.types.ts     # Signal and intelligence contracts
        └── lead.types.ts             # Lead and filter contracts
```

---

## 🛠️ Scripts

- `npm run dev`: Start development server with live reload via `tsx`
- `npm run build`: Compile TypeScript into `dist/`
- `npm run start`: Run production build from `dist/`
