# Visitor Management System

A full-stack visitor registration and escort management application. The system provides a digital way to collect visitor information, review visits, coordinate employee escorts, manage employee accounts, and view visitor activity through administrative pages.

<p>
  <strong>Live application:</strong> <a href="https://visitor-management-system-96x.pages.dev">https://visitor-management-system-96x.pages.dev</a><br>
  <strong>Backend API:</strong> <a href="https://visitor-management-system-p1g3.onrender.com">https://visitor-management-system-p1g3.onrender.com</a><br>
  <strong>GitHub repository:</strong> <a href="https://github.com/OmerMasih/visitor-management-system">OmerMasih/visitor-management-system</a>
</p>

---

## Contents

- [Project overview](#project-overview)
- [Main features](#main-features)
- [User roles](#user-roles)
- [Application workflow](#application-workflow)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Using the live application](#using-the-live-application)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [Security recommendations](#security-recommendations)
- [Troubleshooting](#troubleshooting)
- [Build for production](#build-for-production)
- [Project status and license](#project-status-and-license)

## Project overview

The Visitor Management System is designed to replace a paper visitor log with a centralized web application. Visitors can submit their information through a registration form. Authorized staff can review visitor records, coordinate escort requests, and manage the visitor workflow.

The application has two main parts:

1. **Frontend:** the React web interface used in a browser.
2. **Backend:** a Node.js/Express REST API that handles application requests and stores information in MongoDB.

The production frontend is hosted on Cloudflare Pages. The backend is hosted on Render and connects to MongoDB Atlas.

## Main features

### Visitor registration

- Collect visitor details through the registration form.
- Submit registration information to the backend.
- Save visitor records in the database.
- Support the visitor check-in process.

### Admin dashboard

- View submitted visitor records.
- Review visitor and visit information.
- Review escort requests.
- Assign an employee/escort to a visitor using the available controls.
- Update visitor workflow information.

### Visitor history

- Review previous visitor records.
- Restore archived records when the restore action is available.
- Delete records through the available administrative controls. Check the record carefully before deleting it because deletion may be permanent.

### Employee management

- View employee accounts.
- Activate or deactivate employee accounts.
- Reset an employee's password through the administrative controls.

### Reports and analytics

- Review visitor activity and summary information.
- View charts and visual summaries.
- Use the report export options provided by the application, including PDF and spreadsheet exports where available.

### Authentication and protected actions

- Sign in to access protected administrative features.
- Send a bearer token with protected API requests.
- Require authentication for employee-management operations and other protected routes.

The controls available to an account depend on its role and the permissions implemented by the application.

## User roles

- **Administrator:** manages visitor records and administrative functions, including employee account management.
- **Employee:** represents a staff member who may be selected or assigned to escort a visitor.

Employee accounts are managed by an authorized administrator. Do not assume that visitors or employees can create administrator accounts through a public sign-up page.

## Application workflow

A typical visit follows this general workflow:

1. **Visitor registration:** the visitor or staff member enters the requested visitor information in the registration form.
2. **Record creation:** the frontend sends the information to the backend, which stores the visitor record in MongoDB.
3. **Administrative review:** an authorized administrator opens the dashboard and reviews the new visitor record.
4. **Escort coordination:** if an escort is needed, the administrator reviews the request and assigns an available employee using the dashboard controls.
5. **Visit management:** staff use the available visitor workflow controls to update the visit as it progresses.
6. **History and reporting:** administrators can review past records in Visitor History and use Reports or Analytics to examine visitor activity.

The exact statuses and order of actions depend on the controls currently enabled in the application.

## Technology stack

### Frontend

| Technology                   | Purpose                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| React 19                     | Builds the component-based user interface.                          |
| Vite 6                       | Runs the frontend development server and creates production builds. |
| React Router 7               | Handles navigation between application pages.                       |
| JavaScript (ES6+), HTML, CSS | Application behavior, structure, and styling.                       |
| Recharts                     | Displays charts and analytics visualizations.                       |
| jsPDF and jsPDF-AutoTable    | Generate PDF reports and formatted tables.                          |
| SheetJS (`xlsx`)             | Supports spreadsheet export and handling.                           |

### Backend

| Technology                      | Purpose                                                |
| ------------------------------- | ------------------------------------------------------ |
| Node.js                         | JavaScript runtime for the backend.                    |
| Express 5                       | Defines the REST API and server routes.                |
| MongoDB                         | Stores visitor and account data as documents.          |
| Mongoose                        | Defines models and communicates with MongoDB.          |
| JSON Web Token (`jsonwebtoken`) | Supports token-based authentication.                   |
| `bcryptjs`                      | Hashes passwords.                                      |
| CORS                            | Controls which frontend origins can call the API.      |
| `dotenv`                        | Loads backend environment variables from `.env`.       |
| Nodemon                         | Restarts the backend automatically during development. |

### Hosting and developer tools

- **Cloudflare Pages:** hosts the frontend.
- **Render:** hosts the backend API.
- **MongoDB Atlas:** hosts the production database.
- **Git and GitHub:** source control and repository hosting.
- **npm:** installs JavaScript dependencies and runs project scripts.

## Project structure

```text
visitor-management-system/
├── client/                    # React + Vite frontend
│   ├── public/                # Static frontend assets
│   ├── src/
│   │   ├── pages/              # Application pages
│   │   ├── services/           # API request helpers
│   │   └── config.js           # Backend API base URL
│   ├── package.json
│   └── vite.config.js
├── server/                    # Node.js + Express backend
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Authentication and other middleware
│   ├── models/                 # Mongoose data models
│   ├── index.js                # Backend entry point
│   └── package.json
└── README.md
```

This is a high-level structure. Refer to the repository for the current complete list of files and folders.

## Using the live application

1. Open the [live application](https://visitor-management-system-96x.pages.dev).
2. Sign in with an administrator account that has already been provisioned for the application. No shared demo username or password is published in this repository.
3. Use the visitor registration page to enter the requested information and submit a visitor record.
4. Open the Admin Dashboard to review visitor records and escort requests.
5. Use the available escort controls to assign an employee when a visitor needs an escort.
6. Open Visitor History to review previous records. Use restore or delete actions carefully.
7. Open Employee Management to view employee accounts, change account status, or reset a password.
8. Open Reports or Analytics to review visitor activity and use the available export options.

If you cannot sign in, contact the person who administers the application. Do not share your password or authentication token.

## Run locally

### Prerequisites

Install the following before starting:

- Node.js (a current supported LTS release)
- npm (included with Node.js)
- Git
- A MongoDB Atlas database or a local MongoDB server

### 1. Clone the repository

```bash
git clone https://github.com/OmerMasih/visitor-management-system.git
cd visitor-management-system
```

### 2. Install and configure the backend

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Replace the example values with your own settings. Keep this file private and never commit it to Git.

Start the backend from the `server` directory:

```bash
npm run dev
```

The backend should run at `http://localhost:5000`. You can check the backend test endpoint at:

```text
http://localhost:5000/api/test
```

Keep this terminal running.

### 3. Install and configure the frontend

Open a second terminal window. From the repository root, run:

```bash
cd client
npm install
```

Create `client/.env` if you need to set the API URL explicitly:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Vite normally serves the app at `http://localhost:5173`. Keep both terminals running while using the local application.

### 4. Sign in locally

Use an existing authorized administrator account or follow the administrator provisioning process configured for this project. Do not add real credentials, passwords, or tokens to the README or source control.

## Environment variables

### Backend: `server/.env`

| Variable     | Purpose                                                    | Local example                       |
| ------------ | ---------------------------------------------------------- | ----------------------------------- |
| `PORT`       | Port used by the Express server.                           | `5000`                              |
| `MONGO_URI`  | MongoDB connection string.                                 | Set your private connection string. |
| `JWT_SECRET` | Private key used to sign and verify authentication tokens. | Generate a long, random secret.     |
| `CLIENT_URL` | Frontend origin allowed by the backend CORS configuration. | `http://localhost:5173`             |

### Frontend: `client/.env`

| Variable       | Purpose                                                                                                 | Local example           |
| -------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the backend API. Do not add `/api` to the end; application requests append their API paths. | `http://localhost:5000` |

For production, `VITE_API_URL` should point to the deployed backend. Vite exposes variables beginning with `VITE_` to browser code, so never place passwords, database credentials, JWT secrets, or other private values in frontend environment variables.

## API overview

The backend exposes REST-style endpoints. The following authentication and employee routes are part of the application:

| Method  | Endpoint                                 | Purpose                                                               |
| ------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `POST`  | `/api/auth/login`                        | Authenticates an account and returns an access token.                 |
| `GET`   | `/api/auth/employees`                    | Lists employee accounts. Requires authentication.                     |
| `PATCH` | `/api/auth/employees/:id/status`         | Changes an employee account's active status. Requires authentication. |
| `PATCH` | `/api/auth/employees/:id/reset-password` | Resets an employee's password. Requires authentication.               |
| `GET`   | `/api/test`                              | Checks whether the backend is responding.                             |

Visitor operations are provided under `/api/visitors`. Check the route files in `server/routes` for the current visitor endpoints, request fields, and authorization requirements.

Protected API requests use this header format:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Use a real token only in the application or a private development environment. Never publish tokens in documentation, screenshots, issue reports, or source control.

## Deployment

The production application uses separate frontend and backend services.

### Frontend: Cloudflare Pages

- **Project:** `visitor-management-system`
- **Root directory:** `client`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `VITE_API_URL` set to the deployed Render backend URL.

When frontend changes are pushed to the connected GitHub branch, Cloudflare Pages can build and deploy the updated frontend. Confirm that the deployment finishes successfully before testing the live site.

### Backend: Render

- **Service root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:** `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.
- **CORS:** `CLIENT_URL` must match the deployed frontend origin.

The backend connects to MongoDB Atlas using `MONGO_URI`. After deploying backend changes, check the Render logs and test the backend health/test endpoint.

### Production URLs

- Frontend: https://visitor-management-system-96x.pages.dev
- Backend: https://visitor-management-system-p1g3.onrender.com

A successful frontend build does not by itself prove that the backend, database connection, authentication, or all browser requests are working. Test the complete user workflow after each deployment.

## Security recommendations

- Keep `.env` files out of Git and make sure they are listed in `.gitignore`.
- Never commit MongoDB connection strings, JWT secrets, passwords, or access tokens.
- Use strong, unique secrets in production.
- Store passwords as hashes; never store plain-text passwords.
- Keep authentication middleware on protected routes.
- Use HTTPS for deployed application traffic.
- Restrict CORS to trusted frontend origins.
- Give administrator access only to authorized people.
- Limit database access permissions and maintain appropriate backups.
- Avoid placing sensitive visitor information in public logs, screenshots, or bug reports.

## Troubleshooting

### The frontend cannot reach the backend

- Confirm that the backend is running or that the Render service is available.
- Check `VITE_API_URL` and make sure it points to the backend base URL.
- Do not add an extra `/api` suffix to `VITE_API_URL`.
- Restart the Vite development server after changing frontend environment variables.
- Check the browser Developer Tools **Console** and **Network** tabs for failed requests.

### The API returns an authentication error

- Sign in again to obtain a valid token.
- Confirm that the request includes `Authorization: Bearer ...`.
- Confirm that the account is active and authorized to access the route.

### The backend cannot connect to MongoDB

- Check `MONGO_URI` in the backend environment settings.
- Confirm that the database is running and reachable.
- For MongoDB Atlas, check network access rules and database-user permissions.
- Review local or Render logs, but do not share connection strings or secrets.

### The live site does not show the latest changes

- Confirm that the latest commit was pushed to the correct GitHub branch.
- Check the Cloudflare Pages or Render deployment log, depending on which part changed.
- Confirm that the deployment completed successfully.
- Refresh the browser after deployment. If needed, try a hard refresh.

### Employee Management does not load

- Confirm that you are signed in with an authorized account.
- Check that the backend employee route is available at `/api/auth/employees`.
- In Developer Tools, inspect the failed request in the **Network** tab and check the response status. Do not share your bearer token publicly.

## Build for production

To create an optimized frontend build:

```bash
cd client
npm install
npm run build
```

Vite writes the production files to `client/dist`.

## Project status and license

This project is actively developed. Pages, features, API routes, and setup instructions may change as the application evolves. Check the source code and deployment settings for the latest implementation details.

No open-source license has been specified yet. Add a `LICENSE` file before distributing or reusing this project under an open-source license.
