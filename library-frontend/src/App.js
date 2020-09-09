

import React, { useState, useEffect } from 'react'
import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useQuery, useApolloClient } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')
  const [notification, setNotification] = useState(null)
  const client = useApolloClient()

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  useEffect(() => {
    const token = localStorage.getItem('library-user-token')
    if (token) {
      setToken(token)
    }
  }, [])

  if (authors.loading)
    return <div>loading...</div>
  if (authors.error)
    return <div>server not responding</div>

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
        {token ?
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={logout}>logout</button>
          </>
          : <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Notify message={notification} />

      <Authors
        show={page === 'authors'}
        authors={authors.data.allAuthors}
        token={token}
        notify={notify}
      />

      {!books.loading && <Books
        show={page === 'books'}
        books={books.data.allBooks}
      />}

      <NewBook
        show={page === 'add'}
        setPage={setPage}
        setNotification={setNotification}
        notify={notify}
      />

      <Login
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
        notify={notify}
      />

    </div>
  )
}

export default App