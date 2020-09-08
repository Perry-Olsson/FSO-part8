const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3  
  },
  favoriteGenre: {
    type: String,
    required: false
  }
})

module.exports = mongoose.model('User', schema)