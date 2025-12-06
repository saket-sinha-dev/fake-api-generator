# SOLID Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT / UI                               │
│                    (React Components)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES LAYER                            │
│  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Projects  │  │ Resources  │  │   APIs   │  │  Auth    │    │
│  │  Routes   │  │   Routes   │  │  Routes  │  │  Routes  │    │
│  └─────┬─────┘  └──────┬─────┘  └────┬─────┘  └────┬─────┘    │
│        │ HTTP Only     │              │             │            │
└────────┼───────────────┼──────────────┼─────────────┼───────────┘
         │               │              │             │
         │               │              │             │
         ▼               ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│               DEPENDENCY INJECTION CONTAINER                     │
│                    (Singleton Pattern)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Manages all service and repository instances            │  │
│  │  - Provides services to routes                           │  │
│  │  - Injects repositories into services                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬───────────────┬──────────────┬─────────────┬───────────┘
         │               │              │             │
         ▼               ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │  Project   │  │  Resource   │  │  DataGenerator       │    │
│  │  Service   │  │  Service    │  │  Service             │    │
│  └─────┬──────┘  └──────┬──────┘  └───────┬──────────────┘    │
│        │ Business Logic  │                 │                    │
│        │ Validation      │                 │                    │
│        │ Orchestration   │                 │                    │
└────────┼─────────────────┼─────────────────┼────────────────────┘
         │                 │                 │
         │                 │                 ▼
         │                 │         ┌───────────────────────┐
         │                 │         │ FieldGeneratorFactory │
         │                 │         │  (Factory Pattern)     │
         │                 │         └───────────┬───────────┘
         │                 │                     │
         │                 │                     ▼
         │                 │         ┌───────────────────────────┐
         │                 │         │  Field Generators         │
         │                 │         │  (Strategy Pattern)       │
         │                 │         │ ┌───────────────────────┐ │
         │                 │         │ │ String │ Number │ ... │ │
         │                 │         │ └───────────────────────┘ │
         │                 │         └───────────────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Project   │  │  Resource   │  │  Database│  │   User   │  │
│  │ Repository │  │ Repository  │  │Repository│  │Repository│  │
│  └─────┬──────┘  └──────┬──────┘  └────┬─────┘  └────┬─────┘  │
│        │ Data Access    │               │             │          │
│        │ MongoDB Ops    │               │             │          │
└────────┼────────────────┼───────────────┼─────────────┼─────────┘
         │                │               │             │
         ▼                ▼               ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (MongoDB)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Projects │  │ Resources│  │ Database │  │  Users   │       │
│  │Collection│  │Collection│  │Collection│  │Collection│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Create Project

```
┌─────────┐
│ Client  │
└────┬────┘
     │ POST /api/projects
     │ { name, description }
     ▼
┌─────────────────────┐
│ POST /api/projects  │
│   Route Handler     │
└────┬────────────────┘
     │ 1. Validate session
     │ 2. Get ProjectService from Container
     │ 3. Call service.createProject()
     ▼
┌─────────────────────────┐
│   ProjectService        │
│   .createProject()      │
└────┬────────────────────┘
     │ 1. Validate input
     │ 2. Sanitize data
     │ 3. Check duplicates via repository
     │ 4. Create project via repository
     ▼
┌──────────────────────────┐
│  ProjectRepository       │
│  .create()               │
│  .nameExistsForUser()    │
└────┬─────────────────────┘
     │ 1. Connect to DB
     │ 2. Execute Mongoose query
     │ 3. Return result
     ▼
┌─────────────────────┐
│   MongoDB           │
│   Projects Collection│
└─────────────────────┘
```

## Field Generator Architecture (Strategy Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                  IFieldGenerator Interface                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  + generate(field, allData): any                      │  │
│  │  + getType(): string                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ implements
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                       │
      ▼                      ▼                       ▼
┌─────────────┐    ┌──────────────┐      ┌──────────────┐
│   String    │    │   Number     │      │   Boolean    │
│  Generator  │    │  Generator   │      │  Generator   │
└─────────────┘    └──────────────┘      └──────────────┘
      │                      │                       │
      │                      │                       │
      └──────────────────────┼───────────────────────┘
                             │
                             │ managed by
                             ▼
                   ┌──────────────────────┐
                   │ FieldGeneratorFactory│
                   │  (Factory Pattern)   │
                   │                      │
                   │ Map<type, generator> │
                   │ + register()         │
                   │ + get(type)          │
                   └──────────────────────┘
                             │
                             │ used by
                             ▼
                   ┌──────────────────────┐
                   │ DataGeneratorService │
                   │ + generateFieldValue()│
                   │ + generateRecords()  │
                   └──────────────────────┘
```

## Repository Pattern Structure

```
┌─────────────────────────────────────────────────────────────┐
│              IRepository<T> Interface                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  + findById(id): Promise<T | null>                    │  │
│  │  + find(filter): Promise<T[]>                         │  │
│  │  + create(data): Promise<T>                           │  │
│  │  + update(id, data): Promise<T | null>                │  │
│  │  + delete(id): Promise<boolean>                       │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ implements
                             ▼
                   ┌──────────────────────┐
                   │  BaseRepository<T>   │
                   │ (Abstract Base)      │
                   │                      │
                   │ + Common CRUD ops    │
                   │ + Connection mgmt    │
                   │ + Error handling     │
                   └──────────┬───────────┘
                              │ extends
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ ProjectRepository│  │   Resource   │  │  Database    │
│                  │  │  Repository  │  │  Repository  │
│ + findByUser()   │  │              │  │              │
│ + addCollaborator│  │ + findByProj │  │ + getData()  │
└──────────────────┘  └──────────────┘  └──────────────┘
```

## Dependency Injection Container

```
┌─────────────────────────────────────────────────────────────┐
│                   Container (Singleton)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             REPOSITORIES                              │  │
│  │  - projectRepository: ProjectRepository              │  │
│  │  - resourceRepository: ResourceRepository            │  │
│  │  - apiRepository: ApiRepository                      │  │
│  │  - userRepository: UserRepository                    │  │
│  │  - databaseRepository: DatabaseRepository            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SERVICES                                 │  │
│  │  - projectService: ProjectService                    │  │
│  │  - resourceService: ResourceService                  │  │
│  │  - dataGeneratorService: DataGeneratorService        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           PUBLIC METHODS                              │  │
│  │  + getProjectService(): ProjectService               │  │
│  │  + getResourceService(): ResourceService             │  │
│  │  + getProjectRepository(): ProjectRepository         │  │
│  │  + ...                                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ accessed via
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│  API Routes      │                    │  Services        │
│                  │                    │                  │
│  getProjectSvc() │                    │  Use Repos       │
│  getResourceSvc()│                    │  via constructor │
└──────────────────┘                    └──────────────────┘
```

## SOLID Principles Visualization

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  SINGLE RESPONSIBILITY PRINCIPLE (SRP)                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    Each class has ONE reason to change

    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   Route     │   │   Service   │   │  Repository │
    │   Handler   │   │   Layer     │   │    Layer    │
    │             │   │             │   │             │
    │  HTTP Only  │   │Business Only│   │  Data Only  │
    └─────────────┘   └─────────────┘   └─────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  OPEN/CLOSED PRINCIPLE (OCP)                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    Open for extension, closed for modification

         ┌─────────────────┐
         │ IFieldGenerator │  ← Interface (Stable)
         └────────┬────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
    String     Number      CustomNew  ← Add new without
    Generator  Generator   Generator     changing existing

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  LISKOV SUBSTITUTION PRINCIPLE (LSP)                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    Subtypes must be substitutable for their base types

    IFieldGenerator generator = new StringFieldGenerator();
    generator = new NumberFieldGenerator();  ← Works!
    generator = new BooleanFieldGenerator(); ← Works!
    
    All behave correctly as IFieldGenerator

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  INTERFACE SEGREGATION PRINCIPLE (ISP)                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    Many specific interfaces > One general interface

    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │IFieldGenerator│  │ IRepository  │  │  IService    │
    │              │  │              │  │              │
    │ 2 methods    │  │ 8 methods    │  │ 1 method     │
    └──────────────┘  └──────────────┘  └──────────────┘
    
    Each interface is focused and minimal

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  DEPENDENCY INVERSION PRINCIPLE (DIP)                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    Depend on abstractions, not concretions

    ┌─────────────────┐
    │ ProjectService  │ ← High-level
    └────────┬────────┘
             │ depends on
             ▼
    ┌─────────────────┐
    │  IRepository<T> │ ← Abstraction
    └────────┬────────┘
             │ implemented by
             ▼
    ┌─────────────────┐
    │ProjectRepository│ ← Low-level
    └─────────────────┘
```

## Before vs After Comparison

```
BEFORE (Monolithic):
┌─────────────────────────────────────┐
│      API Route Handler              │
│  ┌───────────────────────────────┐  │
│  │ • HTTP handling               │  │
│  │ • Validation                  │  │
│  │ • Business logic              │  │
│  │ • Database queries            │  │
│  │ • Error handling              │  │
│  │ • Response formatting         │  │
│  └───────────────────────────────┘  │
│         150+ lines                   │
│         Hard to test                 │
│         Tight coupling               │
└─────────────────────────────────────┘

AFTER (Layered):
┌─────────────────────────────────────┐
│      API Route Handler              │
│  • HTTP only                        │
│  • Delegate to service              │
│  • 30 lines                         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │
│  • Business logic                   │
│  • Validation                       │
│  • Orchestration                    │
│  • 100 lines                        │
│  • Easy to test                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Repository Layer               │
│  • Data access                      │
│  • Database queries                 │
│  • 50 lines                         │
│  • Mockable                         │
└─────────────────────────────────────┘
```

## Extension Example: Adding New Field Type

```
BEFORE (Switch Statement):
┌────────────────────────────────────────┐
│  dataGenerator.ts                      │
│  function generateFieldValue(field) {  │
│    switch(field.type) {                │
│      case 'string': ...                │
│      case 'number': ...                │
│      case 'newType': ...  ← Modify!    │
│    }                                   │
│  }                                     │
└────────────────────────────────────────┘
      ⚠️ Must modify existing code

AFTER (Strategy Pattern):
┌────────────────────────────────────────┐
│  Create NewTypeFieldGenerator.ts       │
│                                        │
│  class NewTypeFieldGenerator           │
│    implements IFieldGenerator {        │
│                                        │
│    generate(field) { ... }             │
│    getType() { return 'newType'; }     │
│  }                                     │
└────────────────────────────────────────┘
      ✅ Add new file, no modifications

┌────────────────────────────────────────┐
│  Register in Factory                   │
│                                        │
│  factory.register(                     │
│    new NewTypeFieldGenerator()         │
│  );                                    │
└────────────────────────────────────────┘
      ✅ One line registration
```
