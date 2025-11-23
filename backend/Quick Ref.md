# Spring Boot API - Quick Reference Guide

## 🎯 Implementation Concepts & Key Points

### 1. Layered Architecture Pattern

**Why it matters:**
- **Separation of Concerns**: Each layer has ONE responsibility
- **Easy Testing**: Test each layer independently
- **Maintainability**: Change one layer without affecting others
- **Scalability**: Add features without rewriting existing code

**Layer Responsibilities:**
```
Controller  → Handles HTTP (requests/responses)
Service     → Business logic & validation
Repository  → Database operations
Entity      → Database table mapping
DTO         → Data transfer between layers
```

---

### 2. Dependency Injection (DI)

**What is it?**
Spring automatically creates and wires objects together.

**Instead of:**
```java
public class ServiceController {
    private ServiceService service = new ServiceService(); // ❌ Manual creation
}
```

**Use:**
```java
@RestController
@RequiredArgsConstructor  // Lombok generates constructor
public class ServiceController {
    private final ServiceService service; // ✅ Spring injects automatically
}
```

**Benefits:**
- Loose coupling
- Easy testing (can inject mocks)
- Automatic lifecycle management

---

### 3. Spring Data JPA Magic

**You write:**
```java
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByActiveTrue();
}
```

**Spring generates:**
```sql
SELECT * FROM services WHERE active = true
```

**Query Method Keywords:**
- `findBy...` → SELECT
- `deleteBy...` → DELETE
- `countBy...` → COUNT
- `existsBy...` → EXISTS

**Examples:**
```java
findByName(String name)                           → WHERE name = ?
findByNameAndActive(String name, Boolean active) → WHERE name = ? AND active = ?
findByPriceGreaterThan(BigDecimal price)         → WHERE price > ?
findByNameContainingIgnoreCase(String name)      → WHERE LOWER(name) LIKE LOWER(?%)
```

---

### 4. Transaction Management

**What is @Transactional?**
Ensures database operations are atomic (all-or-nothing).

**Example:**
```java
@Transactional
public void transferMoney(Long from, Long to, BigDecimal amount) {
    withdraw(from, amount);    // Step 1
    deposit(to, amount);       // Step 2
    // If Step 2 fails, Step 1 is automatically rolled back
}
```

**Best Practices:**
- Put `@Transactional` on **Service layer** methods
- Use `@Transactional(readOnly = true)` for read-only operations (performance boost)
- Keep transactions short

---

### 5. DTO Pattern

**Why not expose Entity directly?**

**❌ Bad:**
```java
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userRepository.findById(id));
    // Exposes: password, internal IDs, timestamps, everything!
}
```

**✅ Good:**
```java
@GetMapping("/{id}")
public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserById(id));
    // Returns only: id, name, email (what client needs)
}
```

**Benefits:**
- **Security**: Don't leak sensitive data
- **Flexibility**: Different views for different endpoints
- **Versioning**: Change entity without breaking API
- **Validation**: Validate input before reaching database

---

### 6. Validation

**Automatic Input Validation:**

```java
@Data
public class ServiceRequestDTO {
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100)
    private String name;
    
    @NotNull
    @Min(15)
    @Max(480)
    private Integer durationMinutes;
    
    @Email
    private String email;
}
```

**In Controller:**
```java
@PostMapping
public ResponseEntity<ServiceResponseDTO> create(
        @Valid @RequestBody ServiceRequestDTO dto) {  // @Valid triggers validation
    // If validation fails, GlobalExceptionHandler catches it
    return service.create(dto);
}
```

**Common Annotations:**
- `@NotNull` → Field cannot be null
- `@NotBlank` → String cannot be empty/whitespace
- `@Size(min, max)` → String/Collection size
- `@Min/@Max` → Number range
- `@Email` → Valid email format
- `@Pattern(regexp)` → Regex match
- `@Future/@Past` → Date validation

---

### 7. Exception Handling

**Global Handler catches ALL exceptions:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle404(ResourceNotFoundException ex) {
        return new ResponseEntity<>(
            new ErrorResponse(/* ... */),
            HttpStatus.NOT_FOUND
        );
    }
}
```

**Custom Exceptions:**
```java
// In Service
if (!exists) {
    throw new ResourceNotFoundException("Service not found with ID: " + id);
}

// Automatically becomes HTTP 404 with nice JSON response
```

---

### 8. REST API Best Practices

**HTTP Methods:**
```
POST   /api/services       → Create new resource
GET    /api/services       → Get all resources
GET    /api/services/1     → Get specific resource
PUT    /api/services/1     → Update entire resource
DELETE /api/services/1     → Delete resource
```

**Status Codes:**
```
200 OK                 → Success (GET, PUT)
201 Created            → Resource created (POST)
204 No Content         → Success with no body (DELETE)
400 Bad Request        → Validation error
404 Not Found          → Resource doesn't exist
409 Conflict           → Duplicate resource
500 Internal Error     → Server error
```

**URL Naming:**
- Use **plural nouns**: `/services` not `/service`
- Use **kebab-case**: `/appointment-types` not `/appointmentTypes`
- Use **hierarchy**: `/customers/1/appointments`
- Don't use verbs: `/api/services` not `/api/getServices`

---

### 9. Database Relationships

**One-to-Many:**
```java
@Entity
public class Customer {
    @OneToMany(mappedBy = "customer")
    private List<Appointment> appointments;
}

@Entity
public class Appointment {
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
```

**Many-to-Many:**
```java
@Entity
public class Employee {
    @ManyToMany
    @JoinTable(
        name = "employee_services",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<Service> services;
}
```

---

### 10. Application Properties

**Environment-based Configuration:**

```properties
# application.properties (default)
spring.datasource.url=jdbc:h2:mem:testdb
server.port=8080

# application-dev.properties
spring.datasource.url=jdbc:h2:mem:devdb
logging.level.root=DEBUG

# application-prod.properties
spring.datasource.url=jdbc:postgresql://prod-server/db
logging.level.root=WARN
```

**Run with profile:**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 🔧 Common Patterns

### Pattern 1: Soft Delete
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    Service service = repository.findById(id).orElseThrow();
    service.setActive(false);  // Soft delete
    repository.save(service);
    return ResponseEntity.noContent().build();
}
```

### Pattern 2: Search/Filter
```java
@GetMapping("/search")
public ResponseEntity<List<ServiceDTO>> search(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) Boolean active) {
    return ResponseEntity.ok(service.search(name, active));
}
```

### Pattern 3: Pagination
```java
@GetMapping
public ResponseEntity<Page<ServiceDTO>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(service.findAll(pageable));
}
```

### Pattern 4: Sorting
```java
@GetMapping
public ResponseEntity<List<ServiceDTO>> getAll(
        @RequestParam(defaultValue = "name") String sortBy) {
    return ResponseEntity.ok(service.findAll(Sort.by(sortBy)));
}
```

---

## 📋 Step-by-Step Checklist

When creating a new endpoint:

- [ ] Create Entity class with `@Entity`
- [ ] Create RequestDTO with validation annotations
- [ ] Create ResponseDTO (what client receives)
- [ ] Create Repository interface extending `JpaRepository`
- [ ] Create Service class with `@Service` and business logic
- [ ] Create Controller class with `@RestController`
- [ ] Add method in Controller with `@GetMapping/@PostMapping/etc`
- [ ] Add `@Valid` for validation
- [ ] Handle exceptions
- [ ] Test with Postman/cURL
- [ ] Check H2 console for data

---

## 🎨 Code Templates

### Quick Entity Template
```java
@Entity
@Table(name = "table_name")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String field;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### Quick Controller Template
```java
@RestController
@RequestMapping("/api/resource")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {
    private final ResourceService service;
    
    @PostMapping
    public ResponseEntity<ResponseDTO> create(@Valid @RequestBody RequestDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<ResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
}
```

---

## 🚨 Common Mistakes to Avoid

1. **Don't expose Entity in Controller** → Use DTOs
2. **Don't skip validation** → Always use `@Valid`
3. **Don't handle transactions in Controller** → Use Service layer
4. **Don't write SQL manually** → Use Spring Data JPA methods
5. **Don't ignore exception handling** → Use `@RestControllerAdvice`
6. **Don't use `findAll()` without pagination** → Use `Page<T>`
7. **Don't store passwords in plain text** → Use `PasswordEncoder`
8. **Don't commit sensitive data** → Use environment variables
9. **Don't skip logging** → Use `@Slf4j` and log important operations
10. **Don't mix business logic in Controller** → Keep it in Service

---

## 🔍 Debugging Tips

**Check logs:**
```properties
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

**H2 Console:**
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:appointmentdb`
- Username: `sa`
- Password: (empty)

**Common Issues:**
- Port in use → Change `server.port` in properties
- Bean not found → Check `@Component/@Service/@Repository` annotations
- Validation not working → Missing `@Valid` in controller
- Data not persisting → Missing `@Transactional`
- CORS errors → Check `CorsConfig` or `@CrossOrigin`

---

## 📚 Learning Path

1. **Beginner**: Understand layered architecture
2. **Intermediate**: Master JPA relationships and queries
3. **Advanced**: Add security (JWT), caching, async processing
4. **Expert**: Microservices, API Gateway, Event-driven architecture

---

**Remember**: Spring Boot does the heavy lifting. Focus on business logic! 🚀

