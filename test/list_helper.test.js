const { test, describe } = require("node:test")
const assert = require("node:assert")
const listHelper = require("../utils/list_helper")
const { blogs } = require("./testdata.js")

// Test setup
const listWithOneBlog = [
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  }
]
const emptyList = []

test("dummy returns one", () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe("total likes", () => {
  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test("of empty list is zero", () => {
    const result = listHelper.totalLikes(emptyList)
    assert.strictEqual(result, 0)
  })

  test("of a bigger list is calculated right", () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 36)
  })
})


describe("favorite blog", () => {
  test("when list has only one blog, return that blog", () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, listWithOneBlog[0])
  })

  test("of empty list returns an empty object", () => {
    const result = listHelper.favoriteBlog(emptyList)
    assert.deepStrictEqual(result, {})
  })

  test("of a bigger list returns object with most likes", () => {
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[2]) // blogs[2] has the highest like value (12)
  })
})


describe("most blogs", () => {
  test("when list has only one blog, return that author", () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", blogs: 1 })
  })

  test("when list has only one blog, return that author (Lodash)", () => {
    const result = listHelper.mostBlogsLodash(listWithOneBlog)
    assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", blogs: 1 })
  })

  test("of empty list returns an empty object", () => {
    const result = listHelper.mostBlogs(emptyList)
    assert.deepStrictEqual(result, {})
  })

  test("of empty list returns an empty object (Lodash)", () => {
    const result = listHelper.mostBlogsLodash(emptyList)
    assert.deepStrictEqual(result, {})
  })

  test("of a bigger list returns author with most blogs and number of blogs", () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: "Robert C. Martin", blogs: 3 })
  })

  test("of a bigger list returns author with most blogs and number of blogs (Lodash)", () => {
    const result = listHelper.mostBlogsLodash(blogs)
    assert.deepStrictEqual(result, { author: "Robert C. Martin", blogs: 3 })
  })
})


describe("most likes", () => {
  test("when list has only one blog, return that author and number of likes", () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 5 })
  })

  test("when list has only one blog, return that author and number of likes (Lodash)", () => {
    const result = listHelper.mostLikesLodash(listWithOneBlog)
    assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 5 })
  })

  test("of empty list returns an empty object", () => {
    const result = listHelper.mostLikes(emptyList)
    assert.deepStrictEqual(result, {})
  })

  test("of empty list returns an empty object", () => {
    const result = listHelper.mostLikesLodash(emptyList)
    assert.deepStrictEqual(result, {})
  })

  test("of bigger list returns author with most likes and number of likes", () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 17 })
  })

  test("of bigger list returns author with most likes and number of likes", () => {
    const result = listHelper.mostLikesLodash(blogs)
    assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 17 })
  })
})