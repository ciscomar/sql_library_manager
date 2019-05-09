'use strict';
//sequelize validation Title and author required
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: 'Title is Required'}
      }
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {msg: 'Author is Required'}
      }
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  }, {});
  Book.associate = function(models) {
    
  };
  return Book;
};