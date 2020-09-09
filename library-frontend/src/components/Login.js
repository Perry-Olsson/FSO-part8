import React, { useState }from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const Login = ({ show, setToken, setPage, notify }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login] = useMutation(LOGIN, {
    onError: (error) => { notify(error.graphQLErrors[0].message) }
  })

  // useEffect(() => {
  //   if (result.data) {
  //     const token = result.data.login.vaule
  //     setToken(token)
  //     localStorage.setItem('library-user-token', token)
  //     setUsername('')
  //     setPassword('')
  //     setPage('authors')
  //   }
  // }, [result.data]) // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault()
    const loggedIn = await login({ variables: { username, password } })
    if (loggedIn) {
      const token = loggedIn.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      setPage('authors')
    }
    setUsername('')
    setPassword('')
  }

  if (!show)
    return null

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <label>username</label>
          <input type='text' value={username} onChange={({ target }) => setUsername(target.value)} />
        </div>
        <div>
          <label>password</label>
          <input type='password' value={password} onChange={({ target }) => setPassword(target.value)} />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default Login