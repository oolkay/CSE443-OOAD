# Architecture Overview

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                  http://localhost:3000                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                  SPRING BOOT BACKEND                        │
│                  http://localhost:8080                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            CONTROLLER LAYER                          │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Service     │  │  Appointment │                 │  │
│  │  │  Controller  │  │  Controller  │  ...            │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            SERVICE LAYER                             │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Service     │  │  Appointment │                 │  │
│  │  │  Service     │  │  Service     │  ...            │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          REPOSITORY LAYER                            │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Service     │  │  Appointment │                 │  │
│  │  │  Repository  │  │  Repository  │  ...            │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JPA/Hibernate
                            │
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│              (H2 / PostgreSQL / MySQL)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### Example: Creating a New Service

```
┌──────────┐
│  CLIENT  │
│ (React)  │
└──────────┘
     │
     │ 1. POST /api/services
     │    {name: "Haircut", price: 25.00, ...}
     ▼
┌──────────────────────────────────────┐
│    ServiceController                 │
│  @PostMapping                        │
│  - Receives HTTP request             │
│  - Validates with @Valid             │
└──────────────────────────────────────┘
     │
     │ 2. createService(ServiceRequestDTO)
     ▼
┌──────────────────────────────────────┐
│    ServiceService                    │
│  - Checks business rules             │
│  - Validates uniqueness              │
│  - Converts DTO to Entity            │
└──────────────────────────────────────┘
     │
     │ 3. save(Service)
     ▼
┌──────────────────────────────────────┐
│    ServiceRepository                 │
│  - Generates SQL                     │
│  - Executes INSERT                   │
└──────────────────────────────────────┘
     │
     │ 4. INSERT INTO services...
     ▼
┌──────────────────────────────────────┐
│        DATABASE                      │
│  - Stores data                       │
│  - Returns generated ID              │
└──────────────────────────────────────┘
     │
     │ 5. Returns saved entity
     ▼
┌──────────────────────────────────────┐
│    ServiceService                    │
│  - Converts Entity to ResponseDTO    │
└──────────────────────────────────────┘
     │
     │ 6. Returns ServiceResponseDTO
     ▼
┌──────────────────────────────────────┐
│    ServiceController                 │
│  - Wraps in ResponseEntity           │
│  - Sets HTTP 201 Created             │
└──────────────────────────────────────┘
     │
     │ 7. HTTP 201 Created
     │    {id: 1, name: "Haircut", ...}
     ▼
┌──────────┐
│  CLIENT  │
│ (React)  │
└──────────┘
```

---

## 🏛️ Package Structure

```
com.appointment.api/
│
├── AppointmentApiApplication.java     ← Main entry point
│
├── controller/                        ← HTTP Layer
│   ├── ServiceController.java         (REST endpoints)
│   └── AppointmentController.java     (REST endpoints)
│
├── service/                           ← Business Logic Layer
│   ├── ServiceService.java            (Business operations)
│   └── AppointmentService.java        (Business operations)
│
├── repository/                        ← Data Access Layer
│   ├── ServiceRepository.java         (Database operations)
│   └── AppointmentRepository.java     (Database operations)
│
├── entity/                            ← Domain Models
│   ├── Service.java                   (Database table)
│   ├── Appointment.java               (Database table)
│   └── AppointmentStatus.java         (Enum)
│
├── dto/                               ← Data Transfer Objects
│   ├── ServiceRequestDTO.java         (Input validation)
│   ├── ServiceResponseDTO.java        (Output format)
│   ├── AppointmentRequestDTO.java     (Input validation)
│   └── AppointmentResponseDTO.java    (Output format)
│
├── config/                            ← Configuration
│   ├── SecurityConfig.java            (Security setup)
│   └── CorsConfig.java                (CORS setup)
│
└── exception/                         ← Error Handling
    ├── GlobalExceptionHandler.java    (Catches all errors)
    ├── ResourceNotFoundException.java (404 errors)
    ├── DuplicateResourceException.java(409 errors)
    └── ErrorResponse.java             (Error format)
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Client Request                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CORS Filter                                │
│  - Checks allowed origins                               │
│  - Validates headers                                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Security Filter Chain                          │
│  - JWT Authentication (if enabled)                      │
│  - Authorization checks                                 │
│  - Session management                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Controller                                 │
│  - Endpoint logic                                       │
└─────────────────────────────────────────────────────────┘
```