const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');


const {app} = require('./../server');
const {Todo} = require('./../models/todo');

var todos = [{
  _id: new ObjectId(),
  text: 'First test todo'
}, {
  _id: new ObjectId(),
  text: 'Second test todo'
}]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => {
    done();
  });
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if(err){
        return done(err);
      }
      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => {
        done(e);
      })
    });
  });
  it('should not create a new todo with invalid body', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err){
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });
});

describe('Get /todos', () => {
  it('should return all the todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('Should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('Should return a 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectId().toHexString()}`)
      .expect(404)
      .end(done);
  });
  it('Should return a 404 for a non object ids', (done) => {
    request(app)
      .get('/todos/1234')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('Should return a 404 for a non object id', (done) => {
    request(app)
      .delete('/todos/1234')
      .expect(404)
      .end(done);
  });
  it('Should return a 404 if todo not found', (done) => {
    const id = new ObjectId();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
  it('Should delete the todo', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0]._id.text).toNotExist(res.body.todo._id.text)
          done()
        }).catch((e) => {
          done(e)
        })
      });
  })
});
