
import React, { useState } from 'react'

const Books = ({ show, books }) => {
  const [filter, setFilter] = useState(null)

  if (!show) {
    return null
  }

  const buttonList = books.map(b => b.genres).flat().filter((g, i, a) => a.indexOf(g, i + 1) === -1)

  const filteredBooks = () => {
    return filter
      ? books.filter(b => b.genres.includes(filter))
      : books
  }

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filteredBooks().map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {buttonList.map(b => <button onClick={() => setFilter(b)} key={b}>{b}</button>)}
        <button onClick={() => setFilter(null)}>reset</button>
      </div>
    </div>
  )
}

export default Books