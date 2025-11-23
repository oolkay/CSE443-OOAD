# Spring Boot Appointment API

A RESTful API built with Spring Boot for an appointment management system.

## 📋 Table of Contents

- [Key Concepts](#key-concepts)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Implementation Guide](#implementation-guide)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## 🎯 Key Concepts

### 1. **Layered Architecture**

The application follows a **3-tier layered architecture**:

```
┌─────────────────────────────────────┐
│        Controller Layer             │  ← Handles HTTP requests
│    (REST API Endpoints)             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│        Service Layer                │  ← Business Logic
│    (Business Operations)            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│        Repository Layer             │  ← Data Access
│    (Database Operations)            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│        Database                     │
└─────────────────────────────────────┘
```

**Why layered architecture?**
- **Separation of Concerns**: Each layer has a specific responsibility
- **Maintainability**: Easy to update one layer without affecting others
- **Testability**: Each layer can be tested independently
- **Reusability**: Business logic can be reused by multiple controllers

### 2. **Key Components**

#### **Entity** (`entity/`)
- Represents database tables
- Maps Java objects to database rows using JPA annotations
- Contains `@Entity`, `@Table`, `@Id`, `@Column` annotations

#### **DTO (Data Transfer Object)** (`dto/`)
- Used to transfer data between layers
- **RequestDTO**: Data coming FROM client TO server
- **ResponseDTO**: Data going FROM server TO client
- Contains validation annotations (`@NotNull`, `@Size`, etc.)

**Why DTOs?**
- Security: Don't expose internal entity structure
- Flexibility: Send only necessary data to client
- Validation: Validate input before reaching business logic

#### **Repository** (`repository/`)
- Interface for database operations
- Extends `JpaRepository` - Spring generates implementation automatically
- Custom query methods using method naming convention

#### **Service** (`service/`)
- Contains business logic
- Acts as intermediary between Controller and Repository
- Handles transactions with `@Transactional`

#### **Controller** (`controller/`)
- Handles HTTP requests and responses
- Maps URLs to methods using `@RequestMapping`, `@GetMapping`, etc.
- Returns HTTP status codes and response bodies

### 3. **Important Annotations**

| Annotation | Purpose | Usage |
|------------|---------|-------|
| `@RestController` | Marks class as REST controller | Controller classes |
| `@Service` | Marks class as service | Service classes |
| `@Repository` | Marks class as repository | Repository interfaces |
| `@Entity` | Marks class as JPA entity | Entity classes |
| `@RequestMapping` | Maps URL to controller | Controller classes |
| `@GetMapping` | Maps GET request | Controller methods |
| `@PostMapping` | Maps POST request | Controller methods |
| `@PutMapping` | Maps PUT request | Controller methods |
| `@DeleteMapping` | Maps DELETE request | Controller methods |
| `@Transactional` | Manages database transaction | Service methods |
| `@Valid` | Triggers validation | Controller parameters |

### 4. **Spring Boot Features Used**

- **Spring Data JPA**: Simplifies database operations
- **Spring Validation**: Validates input data
- **Spring Security**: Handles authentication (basic setup)
- **Exception Handling**: Global error handling
- **Dependency Injection**: Automatic object creation and wiring
- **Auto Configuration**: Minimal configuration needed

---

## 🏗️ Architecture

### Request Flow (End-to-End)

```
1. Client Request
   ↓
2. Controller (receives HTTP request)
   ↓
3. Validates input (@Valid)
   ↓
4. Calls Service method
   ↓
5. Service executes business logic
   ↓
6. Calls Repository for data
   ↓
7. Repository queries database
   ↓
8. Returns data to Service
   ↓
9. Service processes and returns to Controller
   ↓
10. Controller returns HTTP response to client
```

### Example: Create Service Request

**Client → Server**
```javascript
POST http://localhost:8080/api/services
Content-Type: application/json

{
  "name": "Haircut",
  "description": "Professional haircut service",
  "durationMinutes": 30,
  "price": 25.00,
  "active": true
}
```

**Server → Client**
```javascript
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "Haircut",
  "description": "Professional haircut service",
  "durationMinutes": 30,
  "price": 25.00,
  "active": true,
  "createdAt": "2025-11-22T10:30:00",
  "updatedAt": "2025-11-22T10:30:00"
}
```

---

## 📁 Project Structure

```
backend/
├── pom.xml                                 # Maven dependencies
├── src/
│   ├── main/
│   │   ├── java/com/appointment/api/
│   │   │   ├── AppointmentApiApplication.java    # Main application
│   │   │   ├── controller/                       # REST endpoints
│   │   │   │   └── ServiceController.java
│   │   │   ├── service/                          # Business logic
│   │   │   │   └── ServiceService.java
│   │   │   ├── repository/                       # Data access
│   │   │   │   └── ServiceRepository.java
│   │   │   ├── entity/                           # Database entities
│   │   │   │   └── Service.java
│   │   │   ├── dto/                              # Data transfer objects
│   │   │   │   ├── ServiceRequestDTO.java
│   │   │   │   └── ServiceResponseDTO.java
│   │   │   ├── config/                           # Configuration
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   └── exception/                        # Exception handling
│   │   │       ├── ResourceNotFoundException.java
│   │   │       ├── DuplicateResourceException.java
│   │   │       ├── ErrorResponse.java
│   │   │       └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       ├── application.properties            # Development config
│   │       └── application-prod.properties       # Production config
│   └── test/
│       └── java/com/appointment/api/             # Unit tests
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the API**
   - API: http://localhost:8080/api
   - H2 Console: http://localhost:8080/h2-console
     - JDBC URL: `jdbc:h2:mem:appointmentdb`
     - Username: `sa`
     - Password: (leave empty)

### Configuration

- **Development**: Uses `application.properties` (H2 in-memory database)
- **Production**: Uses `application-prod.properties` (PostgreSQL)

To run in production mode:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 📚 Implementation Guide

### Step-by-Step: Creating a New Resource

Let's create a new **Appointment** resource as an example.

#### **Step 1: Create Entity**

```java
// entity/Appointment.java
package com.appointment.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long customerId;
    
    @Column(nullable = false)
    private Long serviceId;
    
    @Column(nullable = false)
    private LocalDateTime appointmentDateTime;
    
    @Column(length = 500)
    private String notes;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### **Step 2: Create DTOs**

```java
// dto/AppointmentRequestDTO.java
package com.appointment.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequestDTO {
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment must be in the future")
    private LocalDateTime appointmentDateTime;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}

// dto/AppointmentResponseDTO.java
package com.appointment.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentResponseDTO {
    private Long id;
    private Long customerId;
    private Long serviceId;
    private LocalDateTime appointmentDateTime;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### **Step 3: Create Repository**

```java
// repository/AppointmentRepository.java
package com.appointment.api.repository;

import com.appointment.api.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments by customer
    List<Appointment> findByCustomerId(Long customerId);
    
    // Find appointments by date range
    List<Appointment> findByAppointmentDateTimeBetween(
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // Find upcoming appointments
    List<Appointment> findByAppointmentDateTimeAfterOrderByAppointmentDateTime(
        LocalDateTime now
    );
}
```

#### **Step 4: Create Service**

```java
// service/AppointmentService.java
package com.appointment.api.service;

import com.appointment.api.dto.*;
import com.appointment.api.entity.Appointment;
import com.appointment.api.exception.ResourceNotFoundException;
import com.appointment.api.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    
    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO dto) {
        log.info("Creating appointment for customer: {}", dto.getCustomerId());
        
        // Business logic: Validate availability, check conflicts, etc.
        
        Appointment appointment = new Appointment();
        appointment.setCustomerId(dto.getCustomerId());
        appointment.setServiceId(dto.getServiceId());
        appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        appointment.setNotes(dto.getNotes());
        appointment.setStatus(AppointmentStatus.PENDING);
        
        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Appointment not found with ID: " + id));
        return convertToDTO(appointment);
    }
    
    public AppointmentResponseDTO updateAppointment(Long id, AppointmentRequestDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Appointment not found with ID: " + id));
        
        appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        appointment.setNotes(dto.getNotes());
        
        Appointment updated = appointmentRepository.save(appointment);
        return convertToDTO(updated);
    }
    
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Appointment not found with ID: " + id));
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }
    
    private AppointmentResponseDTO convertToDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setCustomerId(appointment.getCustomerId());
        dto.setServiceId(appointment.getServiceId());
        dto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        dto.setNotes(appointment.getNotes());
        dto.setStatus(appointment.getStatus().toString());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());
        return dto;
    }
}
```

#### **Step 5: Create Controller**

```java
// controller/AppointmentController.java
package com.appointment.api.controller;

import com.appointment.api.dto.*;
import com.appointment.api.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> createAppointment(
            @Valid @RequestBody AppointmentRequestDTO dto) {
        AppointmentResponseDTO response = appointmentService.createAppointment(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getAppointment(@PathVariable Long id) {
        AppointmentResponseDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getCustomerAppointments(
            @PathVariable Long customerId) {
        List<AppointmentResponseDTO> appointments = 
            appointmentService.getAppointmentsByCustomer(customerId);
        return ResponseEntity.ok(appointments);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequestDTO dto) {
        AppointmentResponseDTO response = appointmentService.updateAppointment(id, dto);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### **Step 6: Create Enum (if needed)**

```java
// entity/AppointmentStatus.java
package com.appointment.api.entity;

public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    NO_SHOW
}
```

---

## 🔌 API Documentation

### Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/services` | Create new service |
| GET | `/api/services` | Get all services |
| GET | `/api/services/active` | Get active services |
| GET | `/api/services/{id}` | Get service by ID |
| PUT | `/api/services/{id}` | Update service |
| DELETE | `/api/services/{id}` | Delete service |
| GET | `/api/services/search?name={name}` | Search by name |

### Example Requests

**Create Service**
```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Haircut",
    "description": "Professional haircut",
    "durationMinutes": 30,
    "price": 25.00,
    "active": true
  }'
```

**Get All Services**
```bash
curl http://localhost:8080/api/services
```

**Get Service by ID**
```bash
curl http://localhost:8080/api/services/1
```

**Update Service**
```bash
curl -X PUT http://localhost:8080/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Haircut",
    "description": "Premium haircut service",
    "durationMinutes": 45,
    "price": 35.00,
    "active": true
  }'
```

**Delete Service**
```bash
curl -X DELETE http://localhost:8080/api/services/1
```

---

## 🧪 Testing

### Using Postman or Insomnia

1. Import the API endpoints
2. Set base URL: `http://localhost:8080`
3. Test each endpoint with sample data

### Using cURL (see examples above)

### Using H2 Console

1. Go to http://localhost:8080/h2-console
2. Login with credentials from `application.properties`
3. Run SQL queries to verify data

---

## 🎓 Best Practices

1. **Always use DTOs** - Never expose entities directly
2. **Add validation** - Use `@Valid` and validation annotations
3. **Handle exceptions** - Use global exception handler
4. **Use transactions** - Add `@Transactional` on service methods
5. **Log important operations** - Use `@Slf4j` for logging
6. **Follow naming conventions** - Clear and consistent names
7. **Write clean code** - Single responsibility principle
8. **Document APIs** - Add JavaDoc comments
9. **Test your code** - Write unit and integration tests
10. **Use version control** - Commit regularly with clear messages

---

## 📝 Common Tasks

### Adding a New Dependency

Edit `pom.xml`:
```xml
<dependency>
    <groupId>group.id</groupId>
    <artifactId>artifact-id</artifactId>
    <version>1.0.0</version>
</dependency>
```
Run: `mvn clean install`

### Changing Database

1. Update `application.properties`
2. Add database driver to `pom.xml`
3. Update dialect in JPA configuration

### Adding JWT Authentication

See commented JWT dependencies in `pom.xml` and update `SecurityConfig.java`

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Database Connection Error
- Check database is running
- Verify credentials in application.properties
- Check database URL is correct

### Compilation Errors
```bash
mvn clean install -U
```

### Lombok Not Working
- Install Lombok plugin in your IDE
- Enable annotation processing

---

## 📚 Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Lombok](https://projectlombok.org/)
- [Maven](https://maven.apache.org/)

---

## 🤝 Contributing

When adding new features:
1. Follow the existing project structure
2. Create Entity → DTO → Repository → Service → Controller
3. Add proper validation and error handling
4. Test all endpoints
5. Update this README if needed

---

**Happy Coding! 🚀**

