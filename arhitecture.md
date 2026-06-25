telemedicina/
│
├── backend/                          ← Rust + Axum
│   └── src/
│       ├── main.rs
│       ├── config.rs
│       ├── errors.rs
│       ├── db.rs
│       │
│       ├── middleware/
│       │   ├── auth.rs               ← JWT + rol (pacient/medic/admin)
│       │   ├── subscription.rs       ← verifică abonament activ
│       │   ├── logging.rs
│       │   └── rate_limit.rs
│       │
│       ├── domain/
│       │   ├── gender.rs
│       │   ├── pagination.rs
│       │   └── roles.rs              ← enum: Pacient, Tutore, Medic, Admin
│       │
│       ├── shared/
│       │   ├── validation.rs
│       │   └── audit.rs
│       │
│       ├── features.rs
│       └── features/
│           │
│           ├── auth/                 ← login, register, refresh token
│           │   ├── dto.rs
│           │   ├── db.rs
│           │   └── handler.rs
│           │
│           ├── pacienti/             ← CRUD pacienți + tutori
│           │   ├── domain.rs         ← Patient, Guardian
│           │   ├── register/
│           │   ├── get/
│           │   ├── update/
│           │   └── list/
│           │
│           ├── abonamente/           ← abonamente + alerte expirare
│           │   ├── domain.rs
│           │   ├── create/
│           │   ├── renew/
│           │   └── status/
│           │
│           ├── evaluare/             ← inima sistemului
│           │   ├── domain.rs         ← Simptom, FisaMedicala, Diagnostic
│           │   ├── initiere/         ← POST 3 simptome → generare fișă
│           │   │   ├── dto.rs
│           │   │   ├── db.rs         ← apelează fn_genereaza_fisa()
│           │   │   └── handler.rs
│           │   ├── completare/       ← POST răspunsuri fișă → diagnostic
│           │   │   ├── dto.rs
│           │   │   ├── db.rs         ← apelează fn_proceseaza_fisa()
│           │   │   └── handler.rs
│           │   └── rezultat/         ← GET diagnostic + decizie
│           │       ├── dto.rs
│           │       ├── db.rs
│           │       └── handler.rs
│           │
│           ├── programari/           ← algoritm auto-programare
│           │   ├── domain.rs         ← Programare, SlotDisponibil
│           │   ├── create/           ← apelează fn_programeaza_consultatie()
│           │   ├── list/
│           │   └── cancel/
│           │
│           ├── consultatii/          ← consultație online în desfășurare
│           │   ├── domain.rs
│           │   ├── start/
│           │   ├── finalizare/       ← medic confirmă diagnostic, emite rețetă
│           │   └── get/
│           │
│           ├── retete/               ← rețete emise
│           │   ├── domain.rs
│           │   ├── create/
│           │   └── list/
│           │
│           ├── medici/               ← profil medic, program zilnic
│           │   ├── domain.rs
│           │   ├── get/
│           │   ├── program/
│           │   └── list/
│           │
│           └── istoric/              ← istoric complet pacient
│               ├── domain.rs
│               ├── fise/
│               ├── consultatii/
│               ├── diagnostice/
│               └── retete/
│
│
└── frontend/                         ← Next.js 14 + TypeScript
    └── app/
        │
        ├── (public)/                 ← pagini publice, SEO
        │   ├── page.tsx              ← landing page
        │   ├── login/
        │   └── register/             ← pacient sau tutore
        │
        ├── (pacient)/                ← portal pacient, necesită abonament activ
        │   ├── dashboard/
        │   ├── evaluare/
        │   │   ├── simptome/         ← pas 1: introducere 3 simptome
        │   │   ├── fisa/             ← pas 2: completare fișă generată
        │   │   └── rezultat/         ← pas 3: diagnostic + decizie
        │   ├── programari/
        │   ├── retete/
        │   ├── abonament/
        │   └── istoric/
        │
        └── (medic)/                  ← dashboard medici
            ├── dashboard/            ← programări ale zilei
            ├── consultatii/
            │   └── [id]/             ← interfață consultație live
            ├── pacienti/
            └── retete/