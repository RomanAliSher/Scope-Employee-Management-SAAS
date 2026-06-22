# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-24 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application (skipping tests to speed up the process)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 (Render will map this automatically)
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]