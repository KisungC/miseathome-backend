# miseathome-backend

This is the backend repository for **[miseathome](https://github.com/KisungC/miseathome-frontend)** — a full-stack recipe sharing application built with scalability, modularity, and mobile-first users in mind.

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Frontend](#frontend)  
- [AWS Infrastructure](#aws-infrastructure)  
- [Backend Architecture](#backend-architecture)  
- [Testing Strategy](#testing-strategy)  
- [Authentication Flow (User Registration)](#authentication-flow-user-registration)  
- [Tech Stack](#tech-stack)  
- [Setup & Deployment](#setup--deployment)  
- [Planned Enhancements](#planned-enhancements)

---

## Project Overview

`miseathome` is a portfolio project demonstrating my ability to design and implement a secure, modular, and cloud-optimized full-stack application. The project includes:

- Secure infrastructure using AWS
- Scalable backend using layered architecture
- Integration testing with Jest and Supertest
- Email verification with token-based flow

The goal is to grow this project over time into a production-ready system with DevOps best practices, CI/CD pipelines, and full monitoring support.

---

## Frontend

Repository: [miseathome-frontend](https://github.com/KisungC/miseathome-frontend)  
Built using **Expo (React Native)** to support a mobile-first experience for recipe sharing and discovery.

---

## AWS Infrastructure

To securely connect to an Amazon RDS instance while minimizing costs, I chose the **bastion host** architecture:

### Design

- **Private Subnet**: RDS resides here and is not exposed to the public internet.
- **Public Subnet**: EC2 instance (Bastion Host) resides here, with access restricted to my IP.
- **Security Groups**:  
  - EC2 SG allows inbound SSH only from my IP  
  - RDS SG allows inbound connections from EC2 SG

This setup follows the principle of **least privilege**, protecting RDS while allowing secure access for development.

### Connectivity

- Connected to RDS via SSH tunneling using **PuTTY** and Bastion Host

### Cost Optimization

To reduce costs in my development environment:

- **AWS Lambda** + **IAM Role** + **EventBridge Scheduler**
- Automatically **starts/stops** EC2 and RDS on a schedule (Mon, Wed, Fri)

---

## Backend Architecture

This project follows a clean layered architecture for **separation of concerns** and **scalability**:

Routes → DTO (Validation) → Middleware (Transformation) → Controller (HTTP layer) → Service (Business Logic) → Model (DB layer)

### Key Layers

- **Routes**: Define endpoint structure and call into controller logic.
- **DTOs**: Validate user inputs (e.g., regex checks for password/email formats).
- **Middlewares**: Transform request data — e.g., hashing passwords before storing them.
- **Controllers**: Manage request/response flow and delegate logic to services.
- **Services**: Core business logic lives here.
- **Models**: Database interaction using ORM or raw queries.

This modular design ensures **testability**, **maintainability**, and **future extensibility**.

---

## Testing Strategy

- **Unit Testing**: Every function is tested using **Jest** before being merged to `main`.
- **Integration Testing**: **Supertest** is used to test full route behavior with mocked inputs and actual responses.
- Tests are organized in a separate `/tests` folder.

---

## Authentication Flow (User Registration)

The registration feature includes email verification with JWT and SendGrid.

### Flow:

1. User submits registration form
2. Backend validates:
   - Email and username are unique
   - Input matches DTO rules (regex, length, etc.)
3. If valid:
   - Create user record in DB
   - Generate a `jwtid` and save it
4. Generate a JWT containing:
   - `userid`, `email`, `jwtid`
5. Create a verification URL with the token as a query param
6. Send verification link using **SendGrid**

This approach ensures secure email verification and token replay protection.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Auth**: JWT, bcrypt, SendGrid
- **Database**: PostgreSQL (hosted on AWS RDS)
- **Testing**: Jest, Supertest
- **Deployment & Infra**: AWS EC2, RDS, Lambda, EventBridge

---

## Setup & Deployment

> _To be expanded in future updates as production infrastructure evolves._

---

## Planned Enhancements

As this is a growing portfolio project, I plan to:

### AWS & DevOps
- Add **CloudWatch** for monitoring and alarms
- Set up **CI/CD pipelines** with GitHub Actions
- Use **Terraform or AWS CDK** for Infrastructure-as-Code
- Explore **S3 + CloudFront** for hosting media uploads

### Features
- Add full authentication with password reset flow
- Implement role-based access control (RBAC)
- Enable image upload for recipes
- Add bookmarking, commenting, and rating system

### Testing & Quality
- Add integration tests for critical flows (e.g., email verification, login)
- Add API documentation using Swagger or Postman

---

## Final Thoughts

This project reflects my understanding of cloud infrastructure, backend architecture, secure authentication flows, and test-driven development. It is an evolving portfolio that I will continue to build upon with new features and best practices.

---
