# PolyLang - Multilingual Natural Language to Code Compiler

A production-ready application that transforms natural language instructions in any language into executable code across multiple programming languages.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

PolyLang is a multilingual code generation platform that bridges the gap between natural language and programming languages. It leverages advanced AI models to understand instructions in any human language and generate executable code in various programming languages.

## Features

### Core Capabilities

- **Multilingual Input Support**: Accept natural language instructions in English, Hindi, Spanish, French, German, Chinese, Japanese, Korean, Arabic, and 100+ other languages
- **Automatic Language Detection**: Intelligent detection of input language with automatic translation to English
- **AI-Powered Code Generation**: Utilizes Groq's Llama 3.3 70B model for high-quality code generation
- **Real-time Code Execution**: Execute generated code instantly through integrated sandbox environment
- **Execution History**: Persistent storage and retrieval of code generation history
- **Modern Web Interface**: Responsive UI built with Next.js 16 and React 19
- **Code Editor Integration**: Monaco Editor for syntax highlighting and code editing

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
    end
    
    subgraph "Frontend - Vercel"
        B[Next.js Application]
        C[React Components]
        D[Monaco Editor]
    end
    
    subgraph "Backend - Render"
        E[Spring Boot API]
        F[Translation Service]
        G[Code Generation Service]
        H[Code Execution Service]
        I[History Service]
    end
    
    subgraph "External Services"
        J[Groq AI API]
        K[Wandbox API]
        L[MyMemory Translation API]
    end
    
    subgraph "Data Layer"
        M[(PostgreSQL Database)]
    end
    
    A --> B
    B --> C
    B --> D
    C --> E
    E --> F
    E --> G
    E --> H
    E --> I
    F --> L
    G --> J
    H --> K
    I --> M
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style E fill:#e8f5e9
    style M fill:#f3e5f5
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Translation
    participant AI
    participant Executor
    participant Database
    
    User->>Frontend: Enter instruction in any language
    Frontend->>Backend: POST /api/generate
    Backend->>Translation: Detect & translate language
    Translation-->>Backend: English translation
    Backend->>AI: Generate code (Groq API)
    AI-->>Backend: Generated code
    Backend->>Database: Save to history
    Backend-->>Frontend: Return code
    Frontend-->>User: Display generated code
    
    User->>Frontend: Execute code
    Frontend->>Backend: POST /api/execute
    Backend->>Executor: Run code (Wandbox)
    Executor-->>Backend: Execution result
    Backend-->>Frontend: Return output
    Frontend-->>User: Display output
```

### Deployment Architecture

```mermaid
graph LR
    subgraph "Production Environment"
        subgraph "Supabase/Neon"
            DB[(PostgreSQL<br/>Managed Database)]
        end
        
        subgraph "Render"
            API[Spring Boot<br/>Backend API<br/>Java 21]
        end
        
        subgraph "Vercel"
            WEB[Next.js<br/>Frontend<br/>Edge Network]
        end
    end
    
    subgraph "External APIs"
        GROQ[Groq AI]
        WANDBOX[Wandbox]
        TRANSLATE[MyMemory]
    end
    
    WEB -->|HTTPS| API
    API -->|JDBC/SSL| DB
    API -->|REST| GROQ
    API -->|REST| WANDBOX
    API -->|REST| TRANSLATE
    
    style DB fill:#4CAF50
    style API fill:#2196F3
    style WEB fill:#FF9800
```

---

## Technology Stack

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Spring Boot | 3.2.5 |
| Language | Java | 21 |
| Database | PostgreSQL | Latest |
| ORM | Hibernate/JPA | 6.x |
| Build Tool | Maven | 3.x |
| AI Model | Groq Llama | 3.3 70B |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Code Editor | Monaco Editor | 4.7.0 |
| Animations | Framer Motion | 12.x |

### Infrastructure

| Service | Purpose | Provider |
|---------|---------|----------|
| Database | PostgreSQL hosting | Supabase/Neon |
| Backend Hosting | Spring Boot deployment | Render |
| Frontend Hosting | Next.js deployment | Vercel |
| AI Inference | Code generation | Groq |
| Code Execution | Sandbox execution | Wandbox |
| Translation | Language detection | MyMemory |

---

## Getting Started

### Prerequisites

- Java Development Kit (JDK) 21 or higher
- Node.js 20 or higher
- PostgreSQL database
- Maven (included via wrapper)
- Git

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/polylang.git
cd polylang
```

#### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE polylang;
```

#### 3. Backend Configuration

Set up local secrets (see [SECURITY.md](./SECURITY.md) for details):

```bash
cd backend/src/main/resources
cp application-local.properties.example application-local.properties
```

Edit `application-local.properties` with your credentials:

```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/polylang
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
GROQ_API_KEY=your_groq_api_key
```

Obtain a Groq API key from [console.groq.com](https://console.groq.com)

#### 4. Start Backend Server

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

The backend API will be available at `http://localhost:8080`

#### 5. Frontend Configuration

```bash
cd frontend/polylang-app
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### 6. Start Frontend Server

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`

### Verification

Test the backend health endpoint:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "PolyLang"
}
```

---

## Deployment

### Quick Deployment Guide

For rapid deployment to production, follow the [QUICK-START.md](./QUICK-START.md) guide (approximately 20 minutes).

### Detailed Deployment Documentation

For comprehensive deployment instructions including troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Deployment Architecture

The application is designed for deployment across three platforms:

1. **Database**: Supabase or Neon (managed PostgreSQL)
2. **Backend**: Render (Spring Boot application)
3. **Frontend**: Vercel (Next.js application)

### Environment Variables

#### Backend (Render)

```env
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secure_password
GROQ_API_KEY=gsk_your_api_key
JAVA_VERSION=21
DB_POOL_SIZE=5
```

#### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## API Documentation

### Base URL

- **Local Development**: `http://localhost:8080`
- **Production**: `https://your-backend.onrender.com`

### Endpoints

#### Generate Code

Generate code from natural language instruction.

**Endpoint**: `POST /api/generate`

**Request Body**:

```json
{
  "instruction": "print hello world",
  "targetLanguage": "python"
}
```

**Response**:

```json
{
  "generatedCode": "print('hello world')",
  "detectedLanguage": "en",
  "translatedText": "print hello world",
  "targetLanguage": "python"
}
```

**Status Codes**:
- `200 OK`: Code generated successfully
- `500 Internal Server Error`: Generation failed

---

#### Execute Code

Execute code and return output.

**Endpoint**: `POST /api/execute`

**Request Body**:

```json
{
  "code": "print('hello world')",
  "language": "python"
}
```

**Response**:

```json
{
  "output": "hello world\n",
  "error": null,
  "exitCode": 0
}
```

**Status Codes**:
- `200 OK`: Code executed successfully
- `500 Internal Server Error`: Execution failed

---

#### Get History

Retrieve recent execution history.

**Endpoint**: `GET /api/history`

**Response**:

```json
[
  {
    "id": 1,
    "inputText": "print hello world",
    "detectedLanguage": "en",
    "translatedText": "print hello world",
    "targetLanguage": "python",
    "generatedCode": "print('hello world')",
    "status": "GENERATED",
    "createdAt": "2026-05-14T10:30:00Z"
  }
]
```

**Status Codes**:
- `200 OK`: History retrieved successfully

---

#### Clear History

Delete all history records.

**Endpoint**: `DELETE /api/history`

**Response**:

```json
{
  "message": "History cleared successfully"
}
```

**Status Codes**:
- `200 OK`: History cleared successfully

---

#### Health Check

Check service health status.

**Endpoint**: `GET /api/health`

**Response**:

```json
{
  "status": "UP",
  "service": "PolyLang"
}
```

**Status Codes**:
- `200 OK`: Service is healthy

---

## Project Structure

```
polylang/
├── backend/                                    # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/polylang/
│   │       │   ├── controller/                # REST API Controllers
│   │       │   │   └── CodeController.java
│   │       │   ├── service/                   # Business Logic
│   │       │   │   ├── CodeGenerationService.java
│   │       │   │   ├── CodeExecutionService.java
│   │       │   │   ├── TranslationService.java
│   │       │   │   └── HistoryService.java
│   │       │   ├── model/                     # JPA Entities
│   │       │   │   └── ExecutionHistory.java
│   │       │   ├── dto/                       # Data Transfer Objects
│   │       │   │   ├── CodeRequest.java
│   │       │   │   ├── CodeResponse.java
│   │       │   │   ├── ExecutionRequest.java
│   │       │   │   └── ExecutionResponse.java
│   │       │   ├── repository/                # Data Access Layer
│   │       │   │   └── HistoryRepository.java
│   │       │   ├── config/                    # Configuration
│   │       │   │   └── WebConfig.java
│   │       │   └── PolyLangApplication.java   # Main Application
│   │       └── resources/
│   │           ├── application.properties     # Base Configuration
│   │           └── application-local.properties.example
│   ├── pom.xml                                # Maven Dependencies
│   └── RUNNING.md                             # Backend Setup Guide
│
├── frontend/polylang-app/                     # Next.js Frontend
│   ├── app/                                   # App Router
│   ├── components/                            # React Components
│   ├── public/                                # Static Assets
│   ├── package.json                           # NPM Dependencies
│   └── .env.example                           # Environment Template
│
├── render.yaml                                # Render Configuration
├── vercel.json                                # Vercel Configuration
├── .gitignore                                 # Git Ignore Rules
├── README.md                                  # Project Documentation
├── SECURITY.md                                # Security Guidelines
├── DEPLOYMENT.md                              # Deployment Guide
├── QUICK-START.md                             # Quick Deploy Guide
└── DEPLOYMENT-CHECKLIST.md                    # Deployment Checklist
```

---

## Supported Languages

### Natural Language Input

The application supports language detection and translation for 100+ languages including:

- English, Spanish, French, German, Italian, Portuguese
- Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati
- Chinese (Simplified & Traditional), Japanese, Korean
- Arabic, Hebrew, Persian, Turkish
- Russian, Polish, Czech, Romanian
- And many more...

### Programming Language Output

Code can be generated in the following programming languages:

- Python
- JavaScript
- Java
- C++
- C
- Ruby
- Go
- Rust
- PHP
- Swift

Additional languages supported via Wandbox execution engine.

---

## 🔐 Security

**IMPORTANT:** This project uses secure configuration management. Secrets are never committed to Git.

- See [SECURITY.md](./SECURITY.md) for complete security guidelines
- All secrets are in environment variables or gitignored files
- `application.properties` contains NO secrets (safe to commit)
- `application-local.properties` contains secrets (gitignored)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🆘 Support

- **Issues**: Open an issue on GitHub
- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start**: See [QUICK-START.md](./QUICK-START.md)

---

## 🎉 Acknowledgments

- **Groq** for fast AI inference
- **Wandbox** for code execution
- **MyMemory** for translation services
- **Supabase/Neon** for managed PostgreSQL
- **Render** for backend hosting
- **Vercel** for frontend hosting

---

**Made with ❤️ for developers who speak any language**
