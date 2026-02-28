# MovieLearn 

**MovieLearn** is an AI-powered language learning platform that transforms movies into personalized English learning experiences. By analyzing movie scripts and user preferences, it creates tailored vocabulary sets and interactive exercises.

---

## How It Works

1.  **Select a Movie**: Choose from a curated list of films.
2.  **AI Analysis**: The app uses **OpenAI GPT** to analyze the movie's dialogue based on your:
    -   **English Level** (A1 to C2)
    -   **Interests** (Business, Slang, Science, etc.)
3.  **Generate Learning Set**: Get a personalized set of flashcards with transcriptions, translations, and example sentences.
4.  **Study & Track**: Practice with interactve flashcards and track your progress through the dashboard.

---

## Tech Stack

### Backend
-   **Java 21** & **Spring Boot 3**
-   **Spring Security** (OIDC / Google OAuth2)
-   **MySQL** for data persistence
-   **Liquibase** for database migrations
-   **OpenAI API** for intelligent content generation

### Frontend
-   **React 18** with **TypeScript**
-   **Vite** for fast builds and HMR
-   **Ant Design (AntD)** for premium UI components
-   **Axios** for API communication
-   **Web Speech API** for word pronunciation

---

## Getting Started

### Prerequisites
-   Java 21+
-   Node.js 18+
-   MySQL Instance
-   OpenAI API Key

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Configure environment (application.properties or env vars)
# Required: spring.datasource.url, spring.ai.openai.api-key

# Run the application
./gradlew bootRun
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```