const { test, after, beforeEach, before, describe } = require("node:test")
const assert = require("node:assert")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { initialBlogEntries, blogsInDb, nonExistingId } = require("./test_helper")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/blog")
const User = require("../models/user")

const api = supertest(app)

let authToken
let createdUser

// Block to execute before running any tests
before(async () => {
  // Remove any users in test database
  await User.deleteMany({})

  // Create new user with name root and password sekret
  password = "sekret"
  const saltRounds = 10
  passwordHash = await bcrypt.hash(password, saltRounds)

  createdUser = new User({ username: "root", passwordHash })
  await createdUser.save()

  // Login the created user
  const response = await api
    .post("/api/login")
    .send({ username: "root", password: "sekret" })

  // Save auth token
  authToken = response.body.token
})

describe("when there are initially some blogs saved", () => {
  beforeEach(async () => {
    // Remove any blogs in test database
    await Blog.deleteMany({})

    // Populate test database with some initial blog entries and set the created user as owner
    let blogObjects = initialBlogEntries.map(blog => {
      blog.user = createdUser._id
      return new Blog(blog)
    })

    // Operation to make sure all promises are resolved before performing tests
    let promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .expect("Content-Type", /application\/json/)
  })

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs").set("Authorization", `Bearer ${authToken}`)
    assert.strictEqual(response.body.length, initialBlogEntries.length)
  })

  test("check if id property is correctly named", async () => {
    const blogsBeforeOperation = await blogsInDb()
    const blogKeys = Object.keys(blogsBeforeOperation[0])

    assert(blogKeys.includes("id"))
    assert(!blogKeys.includes("_id"))
  })

  // ADDING A NEW ENTRY
  describe("adding a new blog entry", () => {
    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "Full stack open is fun!",
        author: "Martin Kobro",
        url: "http://www.thisisatotallylegitlink.com/",
        likes: 99,
        user: createdUser._id
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)

      const blogsAfterOperation = await blogsInDb()
      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length + 1)

      const titles = blogsAfterOperation.map(r => r.title)
      const authors = blogsAfterOperation.map(r => r.author)
      const urls = blogsAfterOperation.map(r => r.url)
      assert(titles.includes("Full stack open is fun!"))
      assert(authors.includes("Martin Kobro"))
      assert(urls.includes("http://www.thisisatotallylegitlink.com/"))
    })

    test("fails with status code 401 if auth token is not provided", async () => {
      const newBlog = {
        title: "Full stack open is fun!",
        author: "Martin Kobro",
        url: "http://www.thisisatotallylegitlink.com/",
        likes: 99,
        user: createdUser._id
      }

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(401)

      const blogsAfterOperation = await blogsInDb()
      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length)
    })

    test("likes property defaults to 0 when not defined", async () => {
      const newBlog = {
        title: "Blogpost without the likes property",
        author: "Martin Kobro",
        url: "http://www.thisisatotallylegitlink.com/",
        user: createdUser._id
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)

      const blogsAfterOperation = await blogsInDb()
      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length + 1)
      assert.strictEqual(blogsAfterOperation[blogsAfterOperation.length-1].likes, 0)
    })

    test("fails with empty blog object", async () => {
      const newBlog = {}

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length)
    })

    test("fails when author property is not defined", async () => {
      const newBlog = {
        title: "Full stack open is fun!",
        url: "http://www.thisisatotallylegitlink.com/",
        likes: 99,
        user: createdUser._id
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length)
    })

    test("fails when title property is not defined", async () => {
      const newBlog = {
        author: "Martin Kob",
        url: "http://www.thisisatotallylegitlink.com/",
        likes: 99,
        user: createdUser._id
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length)
    })

    test("fails when url property is not defined", async () => {
      const newBlog = {
        title: "This blog has no url",
        author: "Martin Kob",
        likes: 99,
        user: createdUser._id
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length)
    })
  })

  // VIEWING A SINGLE BLOG
  describe("View specific blogs", () => {
    test("succeeds with a valid id", async () => {
      const blogsBeforeOperation = await blogsInDb()
      const blogToView = blogsBeforeOperation[0]

      blogToView.user = blogToView.user.toString()

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test("fails with status code 404 if blog does not exist", async () => {
      const validNonExistingId = await nonExistingId()

      await api
        .get(`/api/blogs/${validNonExistingId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404)
    })

    test("fails with status code 400 if id is invalid", async () => {
      await api
      .get(`/api/blogs/not-a-valid-id`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400)
    })
  })

  // DELETING A BLOG
  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsBeforeOperation = await blogsInDb()
      const blogToDelete = blogsBeforeOperation[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204)

      const blogsAfterOperation = await blogsInDb()
      const titles = blogsAfterOperation.map(r => r.title)
      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length - 1)
    })
  })

  // UPDATING A BLOG
  describe("update of a blog", () => {
    test("succeeds with status code 200 if id is valid", async () => {
      const blogsBeforeOperation = await blogsInDb()
      const blogToUpdate = blogsBeforeOperation[0]

      const blogChanges =   {
        title: "Canonical string reduction (this is edited)",
        author: "Edsger W. Dijkstra (this is edited)",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html (this is edited)",
        likes: 80,
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(blogChanges)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      const blogsAfterOperation = await blogsInDb()
      const updatedBlog = blogsAfterOperation.find(b => b.id === blogToUpdate.id)
      assert.strictEqual(blogsAfterOperation.length, initialBlogEntries.length)
      assert.notStrictEqual(blogToUpdate, updatedBlog)
    })

    test("fails with status code 400 if id is not valid", async () => {
      const validBlogChanges =   {
        title: "Canonical string reduction (changed again)",
        author: "Edsger W. Dijkstra (changed again)",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html (changed again)",
        likes: 99,
      }

      await api
        .put("/api/blogs/non-existing-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validBlogChanges)
        .expect(400)
    })

    test("fails with status code 404 if id is valid, but not found", async () => {
      const validNonExistingId = await nonExistingId()

      const validBlogChanges =   {
        title: "Canonical string reduction (changed thrice)",
        author: "Edsger W. Dijkstra (changed thrice)",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html (changed thrice)",
        likes: 111,
      }

      await api
        .put(`/api/blogs/${validNonExistingId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(validBlogChanges)
        .expect(404)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})