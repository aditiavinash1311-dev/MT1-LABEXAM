import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample books
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 350
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        price: 450
    },
    {
        id: 3,
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        price: 300
    }
];

// Create HTTP server
const server = http.createServer((req, res) => {

    // Welcome route
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end("<h1>Welcome to Library Management System</h1>");
    }

    // Get all books
    else if (req.method === "GET" && req.url === "/books") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(books));
    }

    // About route
    else if (req.method === "GET" && req.url === "/about") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end("<h1>Library Management Application</h1><p>Manage your books easily.</p>");
    }

    // Serve HTML using FS module
    else if (req.method === "GET" && req.url === "/home") {

        const filePath = path.join(__dirname, "public", "index.html");

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });

                res.end("Error reading HTML file");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });
    }

    // Add a new book
    else if (req.method === "POST" && req.url === "/add-book") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {
                const newBook = JSON.parse(body);

                if (
                    newBook.id === undefined ||
                    !newBook.title ||
                    !newBook.author ||
                    newBook.price === undefined ||
                    newBook.price === null ||
                    newBook.title.trim() === "" ||
                    newBook.author.trim() === "" ||
                    !Number.isFinite(Number(newBook.id)) ||
                    !Number.isFinite(Number(newBook.price))
                ) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "All required fields are needed"
                    }));

                    return;
                }

                if (books.some(book => book.id === Number(newBook.id))) {
                    res.writeHead(409, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "Book ID already exists"
                    }));

                    return;
                }

                const book = {
                    id: Number(newBook.id),
                    title: newBook.title.trim(),
                    author: newBook.author.trim(),
                    price: Number(newBook.price)
                };

                books.push(book);

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Book added successfully",
                    book: book
                }));
            }

            catch (error) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Invalid JSON data"
                }));
            }
        });
    }

    // Invalid route
    else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("404 - Page Not Found");
    }

});

// Start server
server.listen(3000, () => {
    console.log("HTTP Server running at http://localhost:3000");
});