# MovieLearn

**MovieLearn** is a modern web application designed to help users learn English through movies using advanced AI technologies.

---

## Project Description

Development of a web application for learning English through movies with the help of large language models (LLMs).

The application integrates with **ChatGPT** to generate educational materials based on movie scripts. It analyzes the film's text, the user's English level, and the thematic content to create personalized vocabulary flashcards and interactive exercises.  
The architecture is based on **Spring Boot** (backend) and **React** (frontend).

---

## Features

- Learn English using real movie dialogues
- AI-powered content generation with ChatGPT
- Vocabulary cards tailored to the user's level
- Interactive grammar and vocabulary exercises
- Personal progress tracking

---

## Tech Stack

| Layer      | Technology                      |
|------------|----------------------------------|
| Backend    | Java, Spring Boot, Liquibase, MySQL |
| Frontend   | React, TypeScript    |
| AI         | OpenAI ChatGPT API               |
| API        | REST, OpenAPI                    |
| DevOps     | Docker, GitHub Actions           |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yuliia-krupka/movieLearn

# Backend setup with Gradle
cd backend
./gradlew bootRun

# Frontend setup
cd frontend
npm install
npm run dev

# Design 
https://www.figma.com/design/phBYERN3OG1hyuoY5GBZNw/MovieLearn?node-id=15-22&p=f&t=e1EyqDFS62PgxImP-0 