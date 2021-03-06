import React, { useState } from 'react'
import Select from 'react-select'
import { useMutation } from '@apollo/client'
import { EDIT_BIRTH_YEAR, ALL_AUTHORS } from '../queries'

const SetBirthYear = ({ authors, notify }) => {
  const [year, setYear] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const options = authors.map(a => { return { value: a.name, label: a.name }})

  const [ editBirthYear ] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [ { query: ALL_AUTHORS }],
    onError: (error) => {
      notify(error.graphQLErrors[0].message)
    }
  })

  const updateAuthor = (event) => {
    event.preventDefault()
    if (selectedOption) {
      if (!year)
        notify('must provide a year')
      else {
        editBirthYear({ variables: { name: selectedOption.value, year } })
        setSelectedOption(null)
        setYear('')
      }
    }
  }

  return (
    <div>
      <h3>Set Birth Year</h3>
      <form onSubmit={updateAuthor} >
        <div style={{ display: 'flex', flexDirection: 'column', width: '15em' }}>
          <label>name</label>
          <Select
            isClearable={true}
            onChange={setSelectedOption}
            options={options}
            value={selectedOption}
          />
          <label>year</label>
          <input required type='number' value={year} onChange={({ target }) => setYear(parseInt(target.value))} />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default SetBirthYear