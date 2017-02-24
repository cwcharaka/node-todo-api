const {ObjectId} = require('mongodb')

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user')

// var id = '58b0b446ccb11eafae94694';
//
//
// if (!ObjectId.isValid(id)) {
//   console.log('Id not valid!');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos: ',todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo ', todo);
//// })

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found.!');
//   }
//   console.log('Todo By Id ', todo);
// }).catch((e) => console.log(e));

var id = '58a957ebaa91d9ba9501c47b';

User.findById(id).then((user) => {
  if (!user) {
    return console.log('User not found');
  }
  console.log('User by Id: ', user);
}).catch((e) => { console.log(e);})
