import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWTSECRET
const router = Router()

router.post('/houses', async (req, res) => {
  try {
    const {
      location,
      price_night,
      bedrooms,
      bathrooms,
      description,
      house_photo
    } = req.body

    //req token from json web token
    const token = req.cookies.jwt

    if (!token) {
      throw new Error('Invalid authentication token')
    }

    const decodedToken = jwt.verify(token, jwtSecret)

    // The request was made with an invalid jwt token in the cookies

    if (!decodedToken) {
      throw new Error('Invalid authorization token')
    }

    // Else, the token is valid, the user is authenticated and can proceed
    // with the rest of the operations in the route

    const userId = decodedToken.user_id

    const queryString = `INSERT INTO houses (user_id, location, bedrooms, bathrooms, price_night, description, house_photo)
  VALUES (${userId},'${location}',${price_night},${bedrooms}, ${bathrooms}, '${description}', '${house_photo}')`

    const { rows } = await db.query(queryString)

    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

// route gets all the houses and if there is a query it gives the results of the query

router.get('/houses', async (req, res) => {
  let queryString = 'SELECT * FROM houses WHERE TRUE'

  const { location, max_price, min_rooms, sort, search, order } = req.query
  try {
    if (location) {
      queryString += ` AND location = '${location}'`
    }
    if (max_price) {
      queryString += ` AND price_night <= ${max_price}`
    }
    if (min_rooms) {
      queryString += ` AND bedrooms <= ${min_rooms}`
    }
    if (search) {
      queryString += ` AND description LIKE '%${search}%'`
    }
    if (sort === 'price_night') {
      queryString += ` ORDER BY price_night ${order}'`
    }
    if (sort === 'bedrooms') {
      queryString += ` ORDER BY bedrooms ${order}`
    }
    console.log(queryString)
    const { rows } = await db.query(queryString)
    if (!rows.length) {
      throw new Error(`There is no house corresponding to this query.`)
    }
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

// this route gets a specific house ID based on the route parameter

router.get('/houses/:house_id', async (req, res) => {
  let house_id = req.params.house_id
  try {
    const { rows } = await db.query(
      `SELECT * FROM houses WHERE house_id = ${house_id}`
    )
    //if the array is empty throws a specific error
    if (!rows.length) {
      throw new Error(`The house Id number ${house_id} does not exist.`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

// patch houses route

router.patch('/houses/:house_id', async (req, res) => {
  try {
    //req token from json web token
    const token = req.cookies.jwt

    if (!token) {
      throw new Error('Invalid authentication token')
    }

    const decodedToken = jwt.verify(token, jwtSecret)

    // The request was made with an invalid jwt token in the cookies

    if (!decodedToken) {
      throw new Error('Invalid authorization token')
    }

    let house_id = req.params.house_id
    const { location, price_night, bedrooms, bathrooms, description, user_id } =
      req.body

    let patchQueryString = ` UPDATE houses`
    if (
      location ||
      price_night ||
      bedrooms ||
      bathrooms ||
      description ||
      user_id
    ) {
      patchQueryString += ` SET`
      if (location) {
        patchQueryString += ` location = '${location}',`
      }
      if (price_night) {
        patchQueryString += ` price_per_night = ${price_night},`
      }
      if (bedrooms) {
        patchQueryString += ` bedroom = ${bedrooms},`
      }
      if (bathrooms) {
        patchQueryString += ` bathroom = ${bathrooms},`
      }
      if (description) {
        patchQueryString += ` description = '${description}',`
      }
      if (user_id) {
        patchQueryString += ` user_id = ${user_id},`
      }

      patchQueryString = patchQueryString.slice(0, -1)
      patchQueryString += ` WHERE house_id = ${house_id} RETURNING *`
    }

    const resQuery = await db.query(patchQueryString)
    const { rowCount, rows } = resQuery

    //if user_id from token is not thes same as user_id from the query then throw this error

    if (rows[0].user_id !== decodedToken.user_id) {
      throw new Error('You are not authorized')
    }

    if (rowCount === 0) {
      throw new Error(`There is no house corresponding to this query.`)
    }

    res.json(rows[0])
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

router.delete('/houses/:house_id', async (req, res) => {
  try {
    //req token from json web token
    const token = req.cookies.jwt

    if (!token) {
      throw new Error('Token does not exist please sign in')
    }

    const decodedToken = jwt.verify(token, jwtSecret)

    // The request was made with an invalid jwt token in the cookies

    if (!decodedToken) {
      throw new Error('Invalid authorization token')
    }

    const { rows, rowCount, fields } = await db.query(`
    DELETE FROM houses WHERE house_id = ${req.params.house_id} AND user_id = ${decodedToken.user_id} RETURNING *
    `)

    if (rowCount === 0) {
      throw new Error('You are not authorized')
    }

    res.json(rows[0])
  } catch (err) {
    console.log(err.message)
    res.json({ error: err.message })
  }
})

export default router
