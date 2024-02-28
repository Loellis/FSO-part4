const { test, after, beforeEach, describe } = require("node:test")
const assert = require("node:assert")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { usersInDb } = require("./test_helper")
const supertest = require("supertest")
const app = require("../app")
const User = require("../models/user")

const api = supertest(app)

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash("sekret", 10)
    const user = new User({ username: "root", passwordHash })

    await user.save()
  })

  describe("user creation", () => {
    test("creation succeeds with a fresh username", async () => {
      const usersBeforeOperation = await usersInDb()
  
      const newUser = {
        username: "loellis",
        name: "Martin Kobro",
        password: "Orbok",
      }
  
      await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/)
  
      const usersAfterOperation = await usersInDb()
      assert.strictEqual(usersAfterOperation.length, usersBeforeOperation.length + 1)
  
      const usernames = usersAfterOperation.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })
  
    test("creation fails with proper statuscode and message if username already taken", async () => {
      const usersBeforeOperation = await usersInDb()
  
      const newUser = {
        username: "root",
        name: "Superuser",
        password: "salainen",
      }
  
      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/)
  
      const usersAfterOperation = await usersInDb()
      assert(result.body.error.includes("expected `username` to be unique"))
  
      assert.strictEqual(usersBeforeOperation.length, usersAfterOperation.length)
    })

    test("creation fails with proper status code when password is too short", async () => {
      const usersBeforeOperation = await usersInDb()
    
      const newUser = {
      username: "ValidUsername",
      name: "ValidName",
      password: "pi"
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    const usersAfterOperation = await usersInDb()

    assert(result.body.error.includes("password must be at least 3 characters long"))
    assert.strictEqual(usersBeforeOperation.length, usersAfterOperation.length)
    })

    test("creation fails with proper status code when username is too short", async () => {
      const usersBeforeOperation = await usersInDb()
    
      const newUser = {
      username: "no",
      name: "ValidName",
      password: "ValidPassword"
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    const usersAfterOperation = await usersInDb()

    assert(result.body.error.includes("User validation failed: username:") && result.body.error.includes("is shorter than the minimum allowed length (3)"))
    assert.strictEqual(usersBeforeOperation.length, usersAfterOperation.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})