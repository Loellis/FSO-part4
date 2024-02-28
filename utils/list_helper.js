const _ = require("lodash")

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogEntries) => {
  const likes = blogEntries.map(blog => blog.likes)
  return blogEntries.length === 0 ? 0 : likes.reduce((sum, likes) => sum + likes, 0)
}

const favoriteBlog = (blogEntries) => {
  const likes = blogEntries.map(blog => blog.likes)
  return blogEntries.length === 0 ? {} : blogEntries[likes.indexOf(Math.max(...likes))]
}

const mostBlogs = (blogEntries) => {
  if (blogEntries.length === 0) { 
    return {}
  }

  const authorCounts = {}
  blogEntries.forEach(blog => {
    if (authorCounts[blog.author]) {
      authorCounts[blog.author] += 1
    } else {
      authorCounts[blog.author] = 1
    }
  })

  const mostBlogsAuthor = Object.keys(authorCounts).reduce((authorA, authorB) => authorCounts[authorA] > authorCounts[authorB] ? authorA : authorB)

  return {
    author: mostBlogsAuthor,
    blogs: authorCounts[mostBlogsAuthor]
  }
}

const mostBlogsLodash = (blogEntries) => {
  if (blogEntries.length === 0) { 
    return {}
  }

  const authorGroups = _.groupBy(blogEntries, "author")
  const mostBlogsAuthor = _.maxBy(Object.keys(authorGroups), author => authorGroups[author].length)

  return {
    author: mostBlogsAuthor,
    blogs: authorGroups[mostBlogsAuthor].length
  }
}

const mostLikes = (blogEntries) => {
  if (blogEntries.length === 0) { 
    return {}
  }

  const likeCounts = {}
  blogEntries.forEach(blog => {
    if (likeCounts[blog.author]) {
      likeCounts[blog.author] += blog.likes
    } else {
      likeCounts[blog.author] = blog.likes
    }
  })

  const mostLikesAuthor = Object.keys(likeCounts).reduce((authorA, authorB) => likeCounts[authorA] > likeCounts[authorB] ? authorA : authorB)

  return {
    author: mostLikesAuthor,
    likes: likeCounts[mostLikesAuthor]
  }
}

const mostLikesLodash = (blogEntries) => {
  if (blogEntries.length === 0) { 
    return {}
  }

  const likeGroups = _.groupBy(blogEntries, "author")
  const mostLikesAuthor = _.maxBy(Object.keys(likeGroups), author => _.sumBy(likeGroups[author], "likes"))

  return { 
    author: mostLikesAuthor,
    likes: _.sumBy(likeGroups[mostLikesAuthor], "likes")
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostBlogsLodash,
  mostLikes,
  mostLikesLodash
}