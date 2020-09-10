import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
        born
        id
      }
      published
      genres
      id
    }
  }`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int, $genres: [String!]!){
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
      ) {
        title
        author {
          name
          born
          bookCount
          id
        }
        published
        genres
        id
      }
  }`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title 
      author {
        name
        born 
        id
      }
      published
      genres
      id
    }
  }`

export const EDIT_BIRTH_YEAR = gql`
  mutation editBirthYear($name: String!, $year: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $year
    ) {
      name
      born
      bookCount
      id
    }
  }`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }`

export const ME = gql`
  query {
    me {
      username 
      favoriteGenre
    }
  }
`

export const RECOMMENDED_BOOKS = gql`
  query recommendedBooks($genre: String!) {
    allBooks(genre: $genre) {
      title
      author {
        name
        born
      }
      published
      genres
      id
    }
  }
`