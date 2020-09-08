const mongoose = require('mongoose')
const User = require('./models/user')
const Book = require('./models/books')
const Author = require('./models/authors')
const resources = require('./testResources')
require('dotenv').config()

mongoose.set('useFindAndModify', false)

const MONGODB_URI = process.env.MONGODB_URI
console.log(MONGODB_URI)

console.log('connecting to MongoDB...')
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

if (process.argv[2] === 'empty') {
  const deleteAll = async () => {
    await Book.deleteMany({})
    await Author.deleteMany({})
    mongoose.connection.close()
  }
  deleteAll()
}

if (process.argv[2] === 'fill') {
  const fill = async () => {
    for (let author of resources.authors) {
      const newAuthor = new Author(author)
      await newAuthor.save()
    }
    for (let book of resources.books){
      const author = await Author.findOne({ name: book.author })
      const newBook = new Book({ ...book, author})
      await newBook.save()
    }    
    mongoose.connection.close()  
  }
  fill()
}

if (process.argv[2] === 'emptyUsers') {
  const deleteUsers = async () => {
    await User.deleteMany({})
    mongoose.connection.close()
  }
  deleteUsers()
}

