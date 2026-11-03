import express from "express";

const app = express();

// Middleware to read JSON data
app.use(express.json());

// Sample books
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 350,
        category: "Fiction"
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        price: 450,
        category: "Self Help"
    },
    {
        id: 3,
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 550,
        category: "Programming"
    }
];

// Validate book information
function validBook(book) {
    return (
        book &&
        book.id !== undefined &&
        book.id !== null &&
        String(book.title || "").trim() !== "" &&
        String(book.author || "").trim() !== "" &&
        book.price !== undefined &&
        book.price !== null &&
        Number.isFinite(Number(book.id)) &&
        Number.isFinite(Number(book.price))
    );
}

// 1. GET - Retrieve all books
app.get("/books", (req, res) => {
    res.status(200).json(books);
});

// 2. GET - Retrieve book by ID
app.get("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// 3. POST - Add a new book
app.post("/books", (req, res) => {

    const newBook = req.body;

    if (!validBook(newBook)) {
        return res.status(400).json({
            message: "Please provide valid book details"
        });
    }

    const id = Number(newBook.id);

    if (books.some(b => b.id === id)) {
        return res.status(409).json({
            message: "Book ID already exists"
        });
    }

    const book = {
        id: id,
        title: String(newBook.title).trim(),
        author: String(newBook.author).trim(),
        price: Number(newBook.price),
        category: newBook.category || "General"
    };

    books.push(book);

    res.status(201).json({
        message: "Book added successfully",
        book: book
    });
});

// 4. PUT - Update book details
app.put("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, price, category } = req.body;

    if (
        (title !== undefined && String(title).trim() === "") ||
        (author !== undefined && String(author).trim() === "") ||
        (price !== undefined && !Number.isFinite(Number(price)))
    ) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }

    books[index] = {
        ...books[index],
        ...(title !== undefined && { title: String(title).trim() }),
        ...(author !== undefined && { author: String(author).trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(category !== undefined && { category: category })
    };

    res.status(200).json({
        message: "Book updated successfully",
        book: books[index]
    });
});

// 5. DELETE - Delete book by ID
app.delete("/books/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook[0]
    });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    next(err);
});

// Invalid route
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Start Express server
app.listen(4000, () => {
    console.log("Express Server running at http://localhost:4000");
});