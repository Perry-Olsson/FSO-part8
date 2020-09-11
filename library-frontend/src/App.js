import React, { useState, useEffect } from 'react'
import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommended from './components/Recommended'
import Login from './components/Login'
import {
  useQuery,
  useApolloClient,
  useSubscription,
  useLazyQuery,
} from '@apollo/client'
import {
  ALL_AUTHORS,
  ALL_BOOKS,
  ME,
  RECOMMENDED_BOOKS,
  BOOK_ADDED,
} from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')
  const [notification, setNotification] = useState(null)
  const [recommendBooks, result] = useLazyQuery(RECOMMENDED_BOOKS)
  const [recommendedBooks, setRecommendedBooks] = useState([])

  const client = useApolloClient()

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map((item) => item.id).includes(object.id)

    const booksInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(booksInStore.allBooks, addedBook))
      client.writeQuery({
        query: ALL_BOOKS,
        data: {
          ...booksInStore,
          allBooks: [...booksInStore.allBooks, addedBook],
        },
      })
    const authorsInStore = client.readQuery({ query: ALL_AUTHORS })
    if (!includedIn(authorsInStore.allAuthors, addedBook.author))
      client.writeQuery({
        query: ALL_AUTHORS,
        data: {
          ...authorsInStore,
          allAuthors: [...authorsInStore.allAuthors, addedBook.author],
        },
      })
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      notify(`${addedBook.title} added`)
      updateCacheWith(addedBook)
    },
  })

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const user = useQuery(ME)

  useEffect(() => {
    const token = localStorage.getItem('library-user-token')
    if (token) {
      setToken(token)
    }
  }, [])

  const getRecommended = () => {
    recommendBooks({ variables: { genre: user.data.me.favoriteGenre } })
  }

  useEffect(() => {
    if (result.data) {
      setRecommendedBooks(result.data.allBooks)
    }
  }, [result])

  if (authors.loading) return <div>loading...</div>
  if (authors.error) return <div>server not responding</div>

  const notify = (message) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button
              onClick={() => {
                getRecommended()
                setPage('recommended')
              }}
            >
              recommended
            </button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Notify message={notification} />

      <Authors
        show={page === 'authors'}
        authors={authors.data.allAuthors}
        token={token}
        notify={notify}
      />

      {!books.loading && (
        <Books show={page === 'books'} books={books.data.allBooks} />
      )}

      {!user.loading && (
        <NewBook
          show={page === 'add'}
          setPage={setPage}
          setNotification={setNotification}
          notify={notify}
          genre={user.data.me.favoriteGenre}
          updateCacheWith={updateCacheWith}
        />
      )}

      <Login
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
        notify={notify}
      />

      {!books.loading && !user.loading && (
        <Recommended show={page === 'recommended'} books={recommendedBooks} />
      )}
    </div>
  )
}

export default App
