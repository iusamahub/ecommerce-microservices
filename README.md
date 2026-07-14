# ecommerce-microservices

Microservices for an e-commerce system, built with Spring Boot.

## Services

| Service            | Port | Database | Description                  |
|---------------------|------|----------|-------------------------------|
| `product-service`   | 8081 | MongoDB  | Product catalog               |
| `order-service`     | 8082 | MySQL    | Order management              |
| `inventory-service` | 8083 | MySQL    | Inventory tracking            |

## Running locally

Each service has its own `docker-compose.yml` for its database dependency. From inside a service directory:

```bash
docker compose up -d
./mvnw spring-boot:run
```

> Note: `application.properties` in each service currently has local dev DB credentials hardcoded (default docker-compose values). Override via environment variables for anything beyond local development.
