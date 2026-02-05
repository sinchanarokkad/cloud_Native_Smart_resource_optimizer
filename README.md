# Cloud Native Smart Resource Optimizer

A cloud-native intelligent system that continuously monitors cloud resource usage, analyzes patterns, predicts inefficiencies, and recommends cost-optimized scaling actions.

## Key Features
- **Real-time resource monitoring** via Metrics Collector Service.
- **Event-driven microservices architecture**.
- **Rule-based & ML-based optimization engine**.
- **Cost simulation and savings estimation**.
- **Alerting and recommendation dashboard**.

## Architecture
- **Metrics Collector Service**: Spring Boot, MongoDB.
- **Usage Analysis Service**: Python (Pandas, NumPy), MySQL.
- **Optimization Engine**: Spring Boot, MySQL.
- **Cost Simulation Service**: Spring Boot.
- **Alert Service**: Spring Boot.

## Prerequisites
- Docker & Docker Compose
- Java 17+
- Maven
- Python 3.9+

## How to Run

1.  **Build the Java Services**:
    ```bash
    # Run this for each service (metrics-collector, optimization-engine, cost-simulation, alert-service)
    mvn clean package
    ```
    *Note: You need to run `mvn clean package` in each service directory to generate the JAR files before building Docker images.*

2.  **Start the System**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Services**:
    - Metrics Collector: `http://localhost:8081`
    - Optimization Engine: `http://localhost:8082`
    - Cost Simulation: `http://localhost:8083`
    - Alert Service: `http://localhost:8084`

## API Endpoints (Examples)

### Metrics Collector
- `POST /metrics/collect`: Submit metrics.
- `GET /metrics/{resourceId}`: Get metrics.

### Optimization Engine
- `POST /optimize/analyze`: Analyze usage and get recommendations.
- `GET /optimize/{resourceId}`: Get recommendations.

### Cost Simulation
- `POST /cost/simulate`: Simulate cost savings.

### Alert Service
- `POST /alerts/send`: Send an alert.
## Screenshots

### Dashboard Overview
![Dashboard view](pic_q.png)

### Optimization Recommendations
![metrics](pic_2.png)

### Cost Simulation
![Cost Simulation](pic_4.png)

### Alerts & Notifications
![Alerts](pic_5.png)
