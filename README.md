# Veterinary Management System

A modern, full-stack web application for managing veterinary clinic operations, built with Node.js, Express, MySQL, and a Tailwind CSS frontend.

## Features
- User authentication (JWT-based)
- Manage Owners, Pets, Appointments, Vaccinations, Feeding Logs, and Medical History
- Responsive, modern UI with Tailwind CSS
- Add, edit, and delete records for all entities
- Relational data: pets linked to owners, appointments/vaccinations/etc. linked to pets

## Tech Stack
- **Backend:** Node.js, Express, MySQL
- **Frontend:** HTML, JavaScript, Tailwind CSS

## Setup Instructions

### 1. Clone the Repository
```
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install Dependencies
```
npm install
```

### 3. Configure the Database
- Make sure you have MySQL installed and running.
- Create a database named `PetCare`.
- Import the schema from `schema.sql`:
```
mysql -u root -p PetCare < schema.sql
```
- Update the MySQL credentials in `server.js` if needed:
  - `host`, `user`, `password`, `database`

### 4. Start the Server
```
node server.js
```
- The app will run at [http://localhost:5000](http://localhost:5000)

### 5. Access the App
- Open your browser and go to [http://localhost:5000](http://localhost:5000)
- Register a new user and start managing your veterinary clinic!

## Usage
- Use the navigation bar to switch between Owners, Pets, Appointments, Vaccinations, Feeding Logs, and Medical History.
- Add, edit, or delete records using the provided buttons and modals.
- All data is stored in the MySQL database.

## Customization
- To change the color scheme, edit the Tailwind classes in the HTML files or update `tailwind.config.js`.
- To add more features or entities, extend the backend routes and database schema.

## Troubleshooting
- If you see `undefined` for pet names, make sure your backend API endpoints JOIN the Pet table and return `pet_name`.
- If you have issues connecting to MySQL, check your credentials and database setup.

## License
This project is for educational/demo purposes. Customize and use as you wish! 