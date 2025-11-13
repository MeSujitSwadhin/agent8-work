# Vidyutva CMS Admin

Vidyutva CMS Admin is a **Remix web application** designed for managing EV charging stations. This README provides setup instructions, including Docker configuration for easy deployment.

## 🚀 Features
- Built with **Remix.js** for server-side rendering
- **Dockerized** for seamless deployment
- Supports environment variables using `.env`
- Exposes API and UI on port `8080` (or configured port)

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Vidyutva-Technology/cms-frontend.git
cd cms-frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```
or
```bash
yarn install
```

### 🛠 Environment Variables
Create a **`.env`** file in the project root copy the **`.env.example`** and apply the credentials. 

### 3️⃣ Run Locally (Without Docker Make Sure Platform Api Should Running)
```bash
npm run dev
```
or
```bash
yarn dev
```
This starts the Remix app on **http://localhost:8080**.

---

## 🐳 Docker Setup

### 1️⃣ Build the Docker Image
```bash
docker build -t image-name:version .
```

### 2️⃣ Run the Docker Container
```bash
docker run -p 8080:8080 --env-file .env --name container-name image-name:version
```

### 3️⃣ Check Running Containers
```bash
docker ps
```

### 4️⃣ Stop the Container
```bash
docker stop container-name
```

### 5️⃣ Remove the Container
```bash
docker rm container-name
```