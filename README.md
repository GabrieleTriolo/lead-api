## Description

**LeadApi** is a RESTful API built with the **NestJS** framework and a **MySQL** database.  
It provides endpoints to create, update, and manage lead records.  
The system also synchronizes leads with an external **CRM platform** through the **AMQP protocol**, ensuring asynchronous and reliable communication between services.

## Project setup

```bash
  docker compose up -d
```

### Endpoints

Once the environment is running, you can access the following services:

#### 🔹 API Swagger UI
- **URL:** [http://localhost:3000/docs](http://localhost:3000/docs)
- Use this page to explore and test all available API endpoints directly from the browser.

#### 🔹 phpMyAdmin (Database GUI)
- **URL:** [http://localhost:8080](http://localhost:8080)
- **Server:** `db` → this is the internal Docker hostname for the MySQL service.  
  Docker Compose automatically makes services discoverable by their names, so `db` points to the MySQL container inside the Docker network.
- **Username:** `app`
- **Password:** `app_pwd`
- **Database:** `lead_api`

## Run tests

```bash
# unit tests
$ npm run test
```