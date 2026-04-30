# Welcome to Team Storming!⛈️
## This project is a budgeting capstone application.

<img width="2541" height="1256" alt="1" src="https://github.com/user-attachments/assets/f21fbbe8-8e1f-4c1d-b1b0-12c101b1644e" />

## <br> Features include...<br>

###  Easy visualization for your transactions
<img width="2538" height="1266" alt="2" src="https://github.com/user-attachments/assets/5d30ab0a-8003-4bea-988a-38d63af6ba80" />
<br><br>

### Manual control over transactions, with automatic csv transaction importing & AI categorization
<img width="2539" height="1266" alt="3" src="https://github.com/user-attachments/assets/7d92f547-bbd9-4119-b121-7fe3b8d6e9bb" />
<br><br>

### Populated billings page based off your transactions
<img width="2550" height="1265" alt="4" src="https://github.com/user-attachments/assets/3705263f-3b58-4ed4-8c2d-ec38ced40f58" />

---
Tech Stack:
- Frontend: Next.js + TypeScript + MUI
- Backend: Spring Boot (Java)
- Database: Supabase, PostgreSQL (Docker)
- Infra: Docker Compose
- AI: Gemma 4 E4B (local)
- Server: Azure

# Members and Roles
``` 
Jai Patel (Full Stack Developer)
Aymen Abbood (Project & Architecture Manager)
Rand Brown (Full Stack Developer)
Steven Turner (Front End Developer)
```  
---

# ✅ Prerequisites 
Install the following tools: 
- Git 
- Node.js 18+ (Node 20 recommended) 
- Java 21 (or Java 17) 
- Docker Desktop 
- Maven (optional — Maven Wrapper is included in backend) 

Verify installs: 
```bash 
git --version 
node -v 
npm -v 
java -version 
docker --version 
``` 
--- 
# 📁 Project Structure 

``` 
frontend/ → Next.js web app 
backend/bank-api/ → Spring Boot API 
infra/ → Docker Compose (PostgreSQL) 
``` 

--- 

# 🐘 Start Database (PostgreSQL) 
From the repo root: 
```bash 
docker compose -f infra/docker-compose.yml up -d 
``` 
Verify database is running: 
```bash 
docker ps 
``` 
Expected container: 
``` 
bank_postgres 
``` 
Local database settings: 
``` 
Host: localhost 
Port: 5432 
Database: bankdb 
User: bankuser 
Password: bankpass 
``` 
--- 
# ☕ Run Backend (Spring Boot) 
From repo root: 
```bash
cd backend/bank-api 
``` 
### Windows 
```bash
.\mvnw.cmd spring-boot:run 
``` 
### Mac / Linux 
```bash
./mvnw spring-boot:run 
``` 
Backend runs at: 
```
http://localhost:8080
``` 
Test endpoint: 
```
http://localhost:8080/health 
```
--- 
# ⚛️ Run Frontend (Next.js) 
From repo root:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at:
```
http://localhost:3000
```
--- 
# 🔧 Frontend Environment Variable 
Create this file: 
```
frontend/.env.local
```
Add:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```
Restart the Next.js dev server after creating this file.
---
# 🛑 Stop Database
```bash
docker compose -f infra/docker-compose.yml down
```
--- 
# 🧪 Quick Startup Checklist
Start services in this order:
1. Start Postgres (Docker)
2. Start Spring Boot backend
3. Start Next.js frontend
