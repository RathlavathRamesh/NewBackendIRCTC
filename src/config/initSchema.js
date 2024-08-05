import Pool from "./database.js";

async function setupDatabase() {
    const connection = await Pool.getConnection();
    try {
        // Create users table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') NOT NULL
            )
        `);

        // Create trains table with the updated schema
        await connection.query(`
            CREATE TABLE IF NOT EXISTS trains (
                id INT AUTO_INCREMENT PRIMARY KEY,
                train_number VARCHAR(255) UNIQUE NOT NULL,
                train_name VARCHAR(255) NOT NULL,
                source VARCHAR(255) NOT NULL,
                destination VARCHAR(255) NOT NULL,
                total_seats INT NOT NULL
            )
        `);

        // Drop the existing bookings table if it exists
        await connection.query(`
            DROP TABLE IF EXISTS bookings;
        `);

        // Create bookings table and add foreign key constraints
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                train_id INT NOT NULL,
                seats_booked INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (train_id) REFERENCES trains(id)
            )
        `);

        console.log("Tables and foreign keys created/updated successfully.");
    } catch (error) {
        console.error("Error setting up the database:", error);
    } finally {
        connection.release();
    }
}

setupDatabase();
