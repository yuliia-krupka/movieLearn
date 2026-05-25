# MovieLearn 🎬

> **MovieLearn** is an AI-powered language learning platform that transforms movies into personalized English learning experiences. By analyzing movie scripts and user preferences, it creates tailored vocabulary sets and interactive flashcard exercises.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-brightgreen?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5.1-412991?style=flat-square&logo=openai)

---

## How It Works

1. **Add a Movie Card** — Create a movie entry, fill in the main details, and upload the script file.
2. **AI Analysis** — The app uses **OpenAI GPT-5.1** (`gpt-5.1-2025-11-13`) to analyze the movie's dialogue based on your:
   - **English Level** (A1 → C2)
   - **Interests** (Business, Slang, Science, etc.)
3. **Generate Learning Set** — Receive a personalized deck of flashcards with transcriptions, translations, and example sentences drawn directly from the film.
4. **Study & Track** — Practice with interactive flashcards and monitor your progress through the personal dashboard.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** + **Spring Boot 3** | Core application framework |
| **Spring Security** (OIDC / Google OAuth2) | Authentication & authorization |
| **MySQL** + **Liquibase** | Data persistence & schema migrations |
| **OpenAI API** (`gpt-5.1-2025-11-13`) | Intelligent vocabulary generation |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + **TypeScript** | UI framework |
| **Vite** | Fast builds & Hot Module Replacement |
| **Ant Design (AntD)** | Premium UI component library |
| **Axios** | HTTP client for API communication |
| **Web Speech API** | In-browser word pronunciation |

### Infrastructure
| Technology | Purpose |
|---|---|
| **AWS CDK** (TypeScript) | Cloud infrastructure as code |
| **Docker** + **docker-compose** | Local development environment |

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL instance
- OpenAI API key

### 1. Backend Setup
```bash
cd backend

# Configure environment variables or application.yml:
# Required: spring.datasource.url, spring.ai.openai.api-key

./gradlew bootRun
```

### 2. Frontend Setup
```bash
cd frontend

npm install
npm run dev
```

### 3. Local Stack (Docker)
```bash
# Start all services with Docker Compose
docker-compose up -d
```