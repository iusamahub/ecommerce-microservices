# frontend

Angular 19 UI for the [ecommerce-microservices](../README.md) backend, following [Part 7 of the Spring Boot Microservices Tutorial](https://programmingtechie.com/articles/spring-boot-microservices-tutorial-part-7) (adapted to this repo's actual API contracts — see notes below).

- **Auth**: OAuth2/OIDC Authorization Code + PKCE flow via [`angular-auth-oidc-client`](https://github.com/damienbod/angular-auth-oidc-client), against the same Keycloak realm (`spring-microservices-realm`) the gateway already validates tokens against.
- **Styling**: Tailwind CSS v3.
- **Pages**: product listing + ordering (`/`), create product (`/add-product`).
- All API calls go through the gateway at `http://localhost:9000`, never directly to a service.

## One-time Keycloak setup (public client for the SPA)

The existing `test-client-id` client documented in the [root README](../README.md#setting-up-keycloak-required-for-the-gateway) is a **confidential** client for client-credentials testing (curl/Postman) — it can't be used from a browser. Create a separate **public** client for Angular:

1. Open `http://localhost:8181`, log in as `admin`/`admin`, select the `spring-microservices-realm` realm.
2. **Clients → Create client**:
   - Client ID: `angular-client`
   - Client authentication: **Off** (public client, required for PKCE from the browser)
   - Authentication flow: **Standard flow** only
3. On the **Login settings** tab of the client:
   - Valid redirect URIs: `http://localhost:4200/*`
   - Valid post logout redirect URIs: `http://localhost:4200/*`
   - Web origins: `http://localhost:4200` (or `*` for local dev)
4. Optional — if you want to sign up test users from the app: **Realm settings → Login** tab → enable **User registration**.

## Running

Start the backend first (MongoDB, MySQL x2, Keycloak, Kafka + Schema Registry, MailHog, and all 5 Spring Boot services — see [root README](../README.md#quick-start)), then:

```bash
npm install
npm start          # ng serve, http://localhost:4200
```

## Notes on deviations from the tutorial article

The tutorial article was written against a slightly different backend than what's in this repo. This implementation matches what's actually here:

| Tutorial article | This repo's actual backend | What changed |
|---|---|---|
| `GET/POST /api/product` | `GET/POST /api/products` (plural) | `ProductService` calls the plural path. |
| `Product` has a `skuCode` field | Originally missing from `product-service`'s `Product`/`ProductRequest`/`ProductResponse` | **Added `skuCode`** to all three (see `product-service/.../model/Product.java`, `dto/ProductRequest.java`, `dto/ProductResponse.java`) so it can be set on creation and used for ordering. Requires a `product-service` restart to pick up. |
| Order response is JSON with `userDetails`; tutorial has the user type it into a form | `POST /api/order` returns a **plain-text** string (`"Order placed successfully"`) — unchanged, still plain text. `OrderRequest.userDetails` **is** sent, but sourced from the Keycloak ID token (`oidcSecurityService.userData$` in `home-page.component.ts`) instead of a typed form field — the user is already logged in, so there's no reason to make them retype their own email/name. Needed the `email` OIDC scope added in `auth.config.ts` (`profile` alone doesn't include it). | `order-service` uses `userDetails.email/firstName/lastName` to build the `OrderPlacedEvent` it publishes to Kafka for `notification-service` — see [root README](../README.md#event-driven-order-confirmations-kafka). |
| Realm: `spring-microservices-security-realm` | Realm: `spring-microservices-realm` | `auth.config.ts` points at the real realm name. |
| Auth interceptor subscribes and unconditionally calls `next(req)` a second time | — | Rewritten with `mergeMap` so the request is only forwarded once, with the token attached if available. |
| — | `product-service`, `order-service`, `inventory-service` each had their own `CorsConfig.java` **in addition to** `api-gateway`'s CORS config, producing duplicate `Access-Control-Allow-Origin` response headers that browsers reject outright | Deleted the per-service `CorsConfig.java` files — CORS is handled once, at the gateway, since clients never call the services directly. |
| — | `inventory-service` only had a read-only `GET /api/inventory` stock-check endpoint; stock was seeded once via a Flyway migration (`V2__add_inventory.sql`, 4 fixed SKUs) with no way to add more through the API | **Added `POST /api/inventory`** (`InventoryController.addStock`) that upserts stock for a SKU. The "Create Product" form now has an **Initial Stock** field; submitting it calls `product-service` then `inventory-service` so any newly created product is immediately orderable — no hardcoded SKUs required. |
| — | `product-service`'s `ProductResponse` has no quantity field (that's `inventory-service`'s data), so the storefront couldn't show stock or hide sold-out items | **Added `GET /api/inventory?skuCodes=a,b,c`** (`InventoryController.getQuantities`, disambiguated from the existing single-SKU check via `@GetMapping(params=...)`) returning quantities for a batch of SKUs in one call. `home-page.component.ts` fetches this right after the product list loads, shows "N in stock", and filters out any product with 0 (or no inventory row at all). |

### Placing an order still requires stock

`order-service` checks stock via `inventory-service` before saving an order. If you order more than is in stock (or a SKU with none), `order-service`'s unhandled `RuntimeException` for "not in stock" surfaces as a raw 500 — this is pre-existing backend behavior, not something the frontend can smooth over without a backend change to return a proper error response instead of throwing.

## Project structure

```
src/app/
├── config/auth.config.ts         # Keycloak/OIDC config
├── interceptor/auth.interceptor.ts
├── model/product.ts, order.ts
├── services/product.service.ts, order.service.ts
├── shared/header/                # nav bar, login/logout
├── pages/home-page/               # product list + ordering
└── pages/add-product/             # create product form
```
