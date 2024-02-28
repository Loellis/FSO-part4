const { test, after, beforeEach, describe } = require("node:test")
const assert = require("node:assert")
const bcrypt = require("bcrypt")
const User = require("../models/user")
const { usersInDb } = require("./test_helper")
const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")

const api = supertest(app)

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash("sekret", 10)
    const user = new User({ username: "root", passwordHash })

    await user.save()
  })

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

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})