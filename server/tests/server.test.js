const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');


const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user')
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
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
  it('should not create a new todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('Should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('Should return a 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectId().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('Should return a 404 for a non object ids', (done) => {
    request(app)
      .get('/todos/1234')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('Should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('Should return a 404 for a non object id', (done) => {
    request(app)
      .delete('/todos/1234')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('Should return a 404 if todo not found', (done) => {
    const id = new ObjectId();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('Should delete the todo', (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
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
  });
  it('Should not delete the todo of anothre user', (done) => {
    request(app)
      .delete(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Todo.findById(todos[1]._id.toHexString()).then((todo) => {
          expect(todo).toExist()
          done()
        }).catch((e) => {
          done(e)
        })
      });
  });
});
describe('PATCH /todos/:id', () => {
  it('Should update the todo', (done) => {
    var id = todos[0]._id.toHexString();
    var text = 'Updated from test';
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true)
        expect(res.body.todo.completedAt).toBeA('number')
      })
      .end(done)
  });
  it('Should not update the todo of another user', (done) => {
    var id = todos[0]._id.toHexString();
    var text = 'Updated from test';
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(404)
      .end(done)
  });
  it('Should clear the completed at when todo is not completed', (done) => {
    var id = todos[1]._id.toHexString();
    var text = 'Updated from test';
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).notToExist
      })
      .end(done)
  });
});

describe('GET /users/me', () => {
  it('Should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('Should create a user', (done) => {
    var email = 'example@example.com'
    var password = 'examplePass'

    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body).toExist();
        expect(res.body.email).toBe(email)
      })
      .end((err) => {
        if (err) {
          return done(e)
        }
        User.findOne({email}).then((user) => {
          expect(user).toExist()
          expect(user.password).toNotBe(password)
          done()
        }).catch((e) => {
          done(e)
        })
      })
  })
  it('Should return validation errors if request invalid', (done) => {
    var email = 'qwerabcd.'
    var password = '123'

    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(400)
      .end(done)

  })
  it('Should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: users[0].password
      })
      .expect(400)
      .end(done)
  });
});

describe('POST /users/login', () => {
  it('Should login user and return auth token', (done) => {
    var email = users[1].email;
    var password = users[1].password;
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.header['x-auth']
          });
          done()
        }).catch((e) => {
          done(e)
        })
      })
  })
  it('Should reject invalid login', (done) => {
    var email = users[1].email;
    var password = 'password'

    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toNotExist()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => { done(e) });
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('Should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email: users[0].email
        }).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => {
          done(e)
        })
      })
  })
  it('Should return 401 for invalid tokens', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token+1)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        User.findOne({
          email: users[0].email
        }).then((user) => {
          expect(user.tokens.token).toExist
          done();
        }).catch((e) => {
          done(e);
        });
      });
  })
})
