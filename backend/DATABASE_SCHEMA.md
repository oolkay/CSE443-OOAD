# Database Schema Documentation

## Entity Relationship Overview

### Entity Hierarchy

```
User (Abstract)
├── SuperAdmin
├── BranchManager
├── Employee
└── Customer
```

## Entities and Relationships

### 1. User (Abstract Base Class)
**Table:** `users`
**Type:** Base entity using JOINED inheritance strategy

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| userId | Long | PK, Auto | Unique identifier |
| name | String(100) | NOT NULL | User's full name |
| email | String(100) | NOT NULL, UNIQUE | Email address |
| phoneNumber | String(20) | - | Phone number |
| password | String(255) | NOT NULL | Hashed password |
| createdAt | LocalDateTime | NOT NULL | Creation timestamp |
| updatedAt | LocalDateTime | NOT NULL | Last update timestamp |
| user_type | String | Discriminator | Type of user (SUPER_ADMIN, BRANCH_MANAGER, EMPLOYEE, CUSTOMER) |

---

### 2. SuperAdmin (extends User)
**Table:** `super_admins`

**Relationships:**
- **Manages Companies** (1:N) - One SuperAdmin can manage multiple Companies
- **Manages BranchManagers** (1:N) - One SuperAdmin can manage multiple BranchManagers

---

### 3. Company
**Table:** `companies`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| companyId | Long | PK, Auto | Unique identifier |
| name | String(100) | NOT NULL | Company name |
| email | String(100) | NOT NULL, UNIQUE | Company email |
| address | String(255) | NOT NULL | Company address |
| phoneNumber | String(20) | - | Phone number |
| createdAt | LocalDateTime | NOT NULL | Creation timestamp |
| updatedAt | LocalDateTime | NOT NULL | Last update timestamp |

**Relationships:**
- **Has BranchManagers** (1:N) - One Company has multiple BranchManagers
- **Has Services** (1:N) - One Company offers multiple Services
- **Has Resources** (1:N) - One Company has multiple Resources
- **Managed by SuperAdmin** (N:1) - Multiple Companies managed by one SuperAdmin

---

### 4. BranchManager (extends User)
**Table:** `branch_managers`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| company_id | Long | FK, NOT NULL | Reference to Company |

**Relationships:**
- **Belongs to Company** (N:1) - Many BranchManagers belong to one Company
- **Manages Employees** (1:N) - One BranchManager manages multiple Employees
- **Managed by SuperAdmin** (N:1) - Multiple BranchManagers managed by one SuperAdmin

**Methods:**
- manageEmployee(employee)
- manageService(service)
- manageResource(resource)
- viewCalendar()

---

### 5. Employee (extends User)
**Table:** `employees`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| manager_id | Long | FK | Reference to BranchManager |
| company_id | Long | FK, NOT NULL | Reference to Company |

**Relationships:**
- **Managed by BranchManager** (N:1) - Many Employees managed by one BranchManager
- **Belongs to Company** (N:1) - Many Employees belong to one Company
- **Performs Appointments** (1:N) - One Employee performs multiple Appointments
- **Has WorkingShifts** (1:N) - One Employee has multiple WorkingShifts
- **Can Perform Services** (N:M) - Many-to-Many with Service through `employee_services` table

**Methods:**
- manageAppointment(request, status)
- viewCalendar()

---

### 6. Customer (extends User)
**Table:** `customers`

**Relationships:**
- **Books Appointments** (1:N) - One Customer creates multiple Appointments

**Methods:**
- bookAppointment(service, time)
- cancelAppointment(appointment)
- rescheduleAppointment(appointment, newTime)

---

### 7. Service
**Table:** `services`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| serviceId | Long | PK, Auto | Unique identifier |
| company_id | Long | FK, NOT NULL | Reference to Company |
| name | String(100) | NOT NULL | Service name |
| description | String(500) | - | Service description |
| timeDuration | Long | NOT NULL | Duration in minutes |
| price | BigDecimal(10,2) | NOT NULL | Service price |
| createdAt | LocalDateTime | NOT NULL | Creation timestamp |
| updatedAt | LocalDateTime | NOT NULL | Last update timestamp |

**Relationships:**
- **Belongs to Company** (N:1) - Many Services belong to one Company
- **Has Appointments** (1:N) - One Service has multiple Appointments
- **Requires Resources** (N:M) - Many-to-Many with Resource through `service_resources` table
- **Can be Performed by Employees** (N:M) - Many-to-Many with Employee through `employee_services` table

---

### 8. Appointment
**Table:** `appointments`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| appointmentId | Long | PK, Auto | Unique identifier |
| customer_id | Long | FK, NOT NULL | Reference to Customer |
| employee_id | Long | FK | Reference to Employee |
| service_id | Long | FK, NOT NULL | Reference to Service |
| startTime | LocalDateTime | NOT NULL | Appointment start time |
| endTime | LocalDateTime | NOT NULL | Appointment end time |
| status | AppointmentStatus | NOT NULL | Status (ENUM) |
| notes | String(1000) | - | Additional notes |
| createdAt | LocalDateTime | NOT NULL | Creation timestamp |
| updatedAt | LocalDateTime | NOT NULL | Last update timestamp |

**Status Enum Values:**
- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED
- RESCHEDULED
- NO_SHOW

**Relationships:**
- **Created by Customer** (N:1) - Many Appointments created by one Customer
- **Performed by Employee** (N:1) - Many Appointments performed by one Employee
- **For Service** (N:1) - Many Appointments for one Service

---

### 9. WorkingShift
**Table:** `working_shifts`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| shiftId | Long | PK, Auto | Unique identifier |
| employee_id | Long | FK, NOT NULL | Reference to Employee |
| shiftName | String(50) | NOT NULL | Shift name |
| startTime | LocalTime | NOT NULL | Shift start time |
| endTime | LocalTime | NOT NULL | Shift end time |
| dayOfWeek | String(20) | - | Day of week (MONDAY, etc.) |
| createdAt | LocalDateTime | NOT NULL | Creation timestamp |
| updatedAt | LocalDateTime | NOT NULL | Last update timestamp |

**Relationships:**
- **Belongs to Employee** (N:1) - Many WorkingShifts belong to one Employee

---

### 10. Resource
**Table:** `resources`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| resourceId | Long | PK, Auto | Unique identifier |
| company_id | Long | FK, NOT NULL | Reference to Company |
| name | String(100) | NOT NULL | Resource name |
| description | String(500) | - | Resource description |
| status | ResourceStatus | NOT NULL | Status (ENUM) |
| createdAt | LocalDateTime | NOT NULL | Creation timestamp |
| updatedAt | LocalDateTime | NOT NULL | Last update timestamp |

**Status Enum Values:**
- AVAILABLE
- IN_USE
- MAINTENANCE
- OUT_OF_SERVICE

**Relationships:**
- **Belongs to Company** (N:1) - Many Resources belong to one Company
- **Required by Services** (N:M) - Many-to-Many with Service through `service_resources` table

---

## Junction Tables (Many-to-Many Relationships)

### employee_services
Links Employees with Services they can perform

| Field | Type | Constraints |
|-------|------|-------------|
| employee_id | Long | FK, PK |
| service_id | Long | FK, PK |

### service_resources
Links Services with Resources they require

| Field | Type | Constraints |
|-------|------|-------------|
| service_id | Long | FK, PK |
| resource_id | Long | FK, PK |

---

## Database Diagram (Text Representation)

```
┌─────────────────────┐
│       User          │
│   (Abstract)        │
├─────────────────────┤
│ userId (PK)         │
│ name                │
│ email (UNIQUE)      │
│ phoneNumber         │
│ password            │
│ user_type           │
└─────────────────────┘
         △
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───┴────┐ ┌──┴───┐ ┌──┴───┐ ┌──┴────┐
│SuperAdm││Branch││Employ││Custom │
│   in   ││Mgr   ││  ee  ││  er   │
└────┬───┘ └───┬──┘ └───┬──┘ └───┬───┘
     │         │        │        │
     │    ┌────┴────┐   │        │
     │    │ Company │   │        │
     │    ├─────────┤   │        │
     │    │companies│   │        │
     │    └────┬────┘   │        │
     │         │        │        │
     │         ├────────┤        │
     │         │Services│        │
     │         ├────────┤        │
     │         │Resource│        │
     │         └────────┘        │
     │                           │
     └──────────┬────────────────┘
                │
         ┌──────┴───────┐
         │ Appointment  │
         ├──────────────┤
         │ appointmentId│
         │ customer_id  │◄───────┐
         │ employee_id  │◄───┐   │
         │ service_id   │◄─┐ │   │
         │ startTime    │  │ │   │
         │ endTime      │  │ │   │
         │ status       │  │ │   │
         └──────────────┘  │ │   │
                           │ │   │
         ┌─────────────────┘ │   │
         │ Service           │   │
         ├───────────────────┤   │
         │ serviceId         │   │
         │ name              │   │
         │ timeDuration      │   │
         │ price             │   │
         └───────────────────┘   │
                                 │
         ┌───────────────────────┘
         │ Employee
         ├─────────────────────
         │ Working Shifts
         └─────────────────────
```

---

## Indexes Recommendations

For optimal query performance, consider adding indexes on:

1. **users table:**
   - email (already UNIQUE, automatically indexed)
   - user_type (for filtering by user type)

2. **appointments table:**
   - customer_id
   - employee_id
   - service_id
   - startTime
   - status
   - Composite: (customer_id, status)
   - Composite: (employee_id, startTime)

3. **services table:**
   - company_id
   - name

4. **resources table:**
   - company_id
   - status

5. **working_shifts table:**
   - employee_id
   - dayOfWeek
   - Composite: (employee_id, dayOfWeek)

---

## Sample SQL for Index Creation

```sql
-- Appointments indexes
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_status ON appointments(customer_id, status);
CREATE INDEX idx_appointments_employee_start ON appointments(employee_id, start_time);

-- Services indexes
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_services_name ON services(name);

-- Resources indexes
CREATE INDEX idx_resources_company ON resources(company_id);
CREATE INDEX idx_resources_status ON resources(status);

-- Working shifts indexes
CREATE INDEX idx_shifts_employee ON working_shifts(employee_id);
CREATE INDEX idx_shifts_day ON working_shifts(day_of_week);
CREATE INDEX idx_shifts_employee_day ON working_shifts(employee_id, day_of_week);
```

---

## Entity Lifecycle Hooks

All entities implement automatic timestamp management:

- **@PrePersist**: Sets `createdAt` and `updatedAt` before entity is first saved
- **@PreUpdate**: Updates `updatedAt` before entity is updated

This ensures accurate audit trails without manual intervention.
