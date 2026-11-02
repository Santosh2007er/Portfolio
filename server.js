
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
console.log("Gmail address loaded:", Boolean(process.env.EMAIL_USER));
console.log("Gmail app password loaded:", Boolean(process.env.EMAIL_APP_PASSWORD));

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: "portfolio",
    waitForConnections: true,
    connectionLimit: 10
});
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Test backend and database connection
app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ message: "Backend and database connected!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database connection failed." });
    }
});

// Receive contact form messages
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !message.trim()
        ) {
            return res.status(400).json({
                error: "Please fill in all fields."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanMessage = message.trim();

        if (
            cleanName.length > 100 ||
            cleanEmail.length > 150 ||
            cleanMessage.length > 5000 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                error: "Please check your submitted details."
            });
        }

        await db.execute(
            "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
            [cleanName, cleanEmail, cleanMessage]
        );
        let emailSent = false;

try {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: cleanEmail,
        subject: `New portfolio message from ${cleanName}`,
        text: `Name: ${cleanName}

Email: ${cleanEmail}

Message:
${cleanMessage}`
    });

    emailSent = true;

} catch (mailError) {
    console.error("Email notification failed:", mailError);
}

        res.status(201).json({
    message: emailSent
        ? "Message saved and email notification sent!"
        : "Message saved, but email notification failed.",
    emailSent
});

    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({
            error: "Unable to save your message."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
