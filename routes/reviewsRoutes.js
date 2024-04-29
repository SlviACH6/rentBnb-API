import { Router } from 'express'
import db from '../db.js'

const router = Router()

// send post request

router.post('/reviews', async (req, res) => {
  const { review_date, review, rating, user_id, house_id } = req.body
  const postQueryString = `INSERT INTO reviews (review_date, review, rating, user_id, house_id)
  VALUES ('${review_date}', '${review}', ${rating}, ${user_id}, ${house_id} )
  RETURNING * `

  try {
    console.log(postQueryString)
    const { rows } = await db.query(postQueryString)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

// send reviews queries

router.get('/reviews', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT reviews.*, users.profile_picture
      FROM reviews
      INNER JOIN users ON reviews.user_id = users.user_id`)
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

router.get(`/reviews/:house_id`, async (req, res) => {
  let houseReviewId = req.params.house_id
  console.log(houseReviewId)

  try {
    const { rows } = await db.query(
      ` SELECT reviews.*, users.profile_picture
      FROM reviews
      INNER JOIN users ON reviews.user_id = users.user_id
      WHERE reviews.house_id = ${houseReviewId}`
    )
    res.json(rows)
    console.log(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

router.delete('/reviews/:review_id', async (req, res) => {
  let deleteQueryString = `DELETE FROM reviews WHERE review_id = ${req.params.review_id}`
  console.log(deleteQueryString)
  const { rows } = await db.query(deleteQueryString)
  try {
    res.json(rows[0])
  } catch (err) {
    res.json({ error: err.message })
  }
})

export default router
