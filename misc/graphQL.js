
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const User = require('./models/user')
const Book = require('./models/books')
const Author = require('./models/authors')
const jwt = require('jsonwebtoken')
const user = require('./models/user')
require('dotenv').config()

const JWT_SECRET = 'BIIIIIIG_SECRET'

mongoose.set('useFindAndModify', false)

const MONGODB_URI = process.env.MONGODB_URI
console.log(MONGODB_URI)

console.log('connecting to MongoDB...')
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }

  type Token {
    value: String!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
    // let tempBooks = books
    // if (args.author)
    //   tempBooks = tempBooks.filter(b => b.author.toLowerCase() === args.author.toLowerCase())
    if (args.genre)
      return Book.find({ genres: args.genre }).populate('author')
    return Book.find({}).populate('author')
    },
    allAuthors: () => Author.find({}),
    me: (root, args, { currentUser }) => currentUser
  },
  Author: {
    bookCount: async (root) => {
      const result = await Book.find({ author: root.id })
      return result.length
    } 
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      let author = await Author.findOne({ name: args.author })
      try { 
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()   
        } 
      
        const book = new Book({ ...args, author })
        await book.save()
        return book
      } catch (error) {
          throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError("not authenticated")
      const author = await Author.findOne({ name: args.name })
      if (!author) return null  

      author.born = args.setBornTo
      try { await author.save() }
      catch (error) { throw new UserInputError(error.message, { invalidArgs: args }) }
      return author
    },
    createUser: (root, args) => {
      console.log(args)
      const user = new User({ ...args })
      return user.save()
        .catch((error) => { throw new UserInputError(error.message, { invalidArgs: args })})
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'bigPassword') 
        throw new UserInputError("Wrong credentials")

      const userForToken = {
        username: user.username,
        id: user._id
      }

      console.log(userForToken)

      return { value: jwt.sign(userForToken, JWT_SECRET) } 
    }
}
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await user.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
