const {ObjectId} = require('mongodb')

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user')

// Todo.remove({}).then((results) => {
//   console.log(results);
// });


// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()

Todo.findOneAndRemove({_id: '58b0e5484b742969b0bd6a84'}).then((todo) => {
  console.log(todo);
})


Todo.findByIdAndRemove('58b0e5484b742969b0bd6a84').then((todo) => {
  console.log(todo);
});
