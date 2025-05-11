-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS PetCare;
USE PetCare;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vet', 'staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Owner table
CREATE TABLE IF NOT EXISTS Owner (
    owner_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pet table
CREATE TABLE IF NOT EXISTS Pet (
    pet_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    dob DATE,
    gender ENUM('Male', 'Female', 'Unknown'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Owner(owner_id) ON DELETE CASCADE
);

-- VetAppointment table
CREATE TABLE IF NOT EXISTS VetAppointment (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    reason TEXT NOT NULL,
    vet_name VARCHAR(100) NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);

-- Vaccination table
CREATE TABLE IF NOT EXISTS Vaccination (
    vaccine_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    administered_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);

-- FeedingLog table
CREATE TABLE IF NOT EXISTS FeedingLog (
    feeding_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    date DATETIME NOT NULL,
    food_type VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);

-- MedicalHistory table
CREATE TABLE IF NOT EXISTS MedicalHistory (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    record_date DATE NOT NULL,
    symptom TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    vet_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);

