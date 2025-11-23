all: start

# Check prerequisites
check:
	@echo "🔍 Checking prerequisites..."
	@echo ""
	@java -version || (echo "❌ Java is not installed. Please install Java 17 or higher." && exit 1)
	@echo ""
	@mvn -version || (echo "❌ Maven is not installed. Please install Maven 3.6 or higher." && exit 1)
	@echo ""
	@echo "✅ All prerequisites are met!"

install: check
	@echo ""
	@echo "📦 Installing dependencies..."
	@mvn clean install -DskipTests
	@echo ""
	@echo "✅ Dependencies installed successfully!"

start: install
	@echo ""
	@echo "🎯 Starting the application..."
	@echo "   API will be available at: http://localhost:8080/api"
	@echo "   PostgreSQL database: appointmentdb"
	@echo ""
	@echo "Press Ctrl+C to stop the server"
	@echo ""
	@mvn spring-boot:run

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@mvn clean
	@echo "✅ Clean completed!"

.PHONY: help check install build run start clean test setup-db stop
