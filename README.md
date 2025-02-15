# Secret Santa Project

## Project Description

This project is a Secret Santa web application that helps users organize and manage Secret Santa gift exchanges. It includes a frontend built with React and a backend built with Node.js and Express.js.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [repository URL]
    cd secretSanta
    ```
2.  **Backend setup:**
    ```bash
    cd backend
    npm install
    ```
    *   Make sure you have MongoDB installed and running. Update the connection string in `backend/server.js` if necessary.
3.  **Frontend setup:**
    ```bash
    cd ../frontend
    npm install
    ```

## Usage

1.  **Start the backend server:**
    ```bash
    cd backend
    npm run dev
    ```
    The backend server will start at `http://localhost:5000`.
2.  **Start the frontend development server:**
    ```bash
    cd frontend
    npm start
    ```
    The frontend application will be accessible at `http://localhost:3000`.

## Documentation

The project is structured as follows:

-   `frontend/`: Contains the React frontend application.
    -   `src/`: Includes React components, styles, and application logic.
    -   `public/`: Contains public assets such as `index.html`.
    -   `package.json`: Lists frontend dependencies and scripts.
-   `backend/`: Contains the Node.js/Express.js backend server.
    -   `server.js`: Main server file.
    -   `package.json`: Lists backend dependencies and scripts.

## Version Control

-   **Git:**  The project is under Git version control.
    -   **Repository URL:** [Insert repository URL here] (You should replace `[repository URL]` in the Installation section with the actual repository URL when you create the Git repository.)

## Versions

-   **Node.js:** v18.20.2
-   **React:** v19.0.0
-   **React DOM:** v19.0.0
-   **Ant Design (antd):** v5.24.0
-   **Express:** v4.18.2
-   **MongoDB:** v6.4.0
-   **Mongoose:** v8.2.0
