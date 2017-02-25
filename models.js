const mongoose = require('mongoose');

// this is schema to represent a blog item

const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {type: String, required: true},
  created: {type: Date, required: false}
});
//blogSchema.virtual('authorString').get(function() {
  //return `${this.author.firstName} ${this.author.lastName}`.trim()});
blogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName,
    created: this.created
  };
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};