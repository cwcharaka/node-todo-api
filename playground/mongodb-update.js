// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('58a94014080f656e85a79622')
  // }, {
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false
  // }).then((results) => {
  //   console.log(results);
  // });

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('58a94272080f656e85a796ec')
  }, {
    $set: { name: 'Charaka' },
    $inc: { age: 1 }
  }, {
    returnOriginal: false
  }).then((resutls) => {
    console.log(resutls);
  });
  // db.close();
});
