const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const PORT = 5000 || process.env.PORT;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser : true,
    useUnifiedTopology : true
})
.then(()=> {console.log("MONGO DB CONNECTED")})
.catch((err)=>{console.error("ERROR CONNECTING:", err)})

const bookSchema = new mongoose.Schema({
    title : {type:String, required:true},
    author : {type:String, required:true},
    genre : {type:String, required:true},
    publishedYear : {type:Number},
    availableCopies : {type:Number, required:true},
    borrowedBy : {type:mongoose.Types.ObjectId, ref: 'user'},
})

const book = mongoose.model('book', bookSchema);

app.get('/', async (req, res) => {
    try{
        const books = await book.find().populate('brrowedBy', 'name email')
        res.status(200).json(books);
    } catch {
        res.status(500).json({ message: "Internal Server Error"})
    }
});

app.post('/', async (req, res) => {
    try{
        const {title, author, genre, publishedYear, availableCopies} = req.body;

        if(!title || !author || !genre || !publishedYear || !availableCopies) {
            return res.status(400).json({ message: "Bad Request"})
        }

        const newbook = new book({
            title, author, genre, publishedYear, availableCopies
        })
        await newbook.save();
        res.status(200).json(newbook);
    } catch {
        res.status(500).json({ message: "Internal Server Error"})
    }
});

app.put('/:id', async(req, res) => {
    try{
        const {title, author, genre, publishedYear, availableCopies} = req.body;

        const updatebook = await book.findByIdAndUpdate(
            req.params.id,
            {title, author, genre, publishedYear, availableCopies},
            {new : true, runValidators : true}
        )

        if(!updatebook){
            res.status(404).json({message : "Not Found"})
        }

        res.status(200).json(updatebook)
    }catch {
        res.status(500).json({ message: "Internal Server Error"})
    }
});

app.delete('/:id', async(req, res) => {
    try{
        const deleteBook = await book.findByIdAndDelete(req.params.id);

        if(!deleteBook) {
            res.status(404).json({message : "Not found"})
        }

        res.status(200).json({message : "Book removed successfully"})
    } catch {
        res.status(500).json({ message: "Internal Server Error"})
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})