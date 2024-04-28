import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.post('/photos', async (req, res) => {
  const { house_photosurl, house_id } = req.body
  console.log(req.body)

  const newPhotoQuery = `INSERT INTO house_photos (house_photosurl, house_id)
      VALUES ('${house_photosurl}', ${house_id})
      RETURNING * `
  console.log(newPhotoQuery)
  try {
    const { rows } = await db.query(newPhotoQuery)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

// GET PHOTOS ROUTES
router.get('/photos', async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM house_photos`)

    if (!rows.length) {
      throw new Error('No photos found')
    }
    console.log(rows)

    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

router.get('/photos/:house_id', async (req, res) => {
  let house_id = req.params.house_id
  try {
    const { rows } = await db.query(
      `SELECT hp.house_photosurl
      FROM house_photos hp
      INNER JOIN houses h ON hp.house_id = h.house_id
      WHERE h.house_id = ${house_id}`
    )
    if (!rows.length) {
      throw new Error(`No photos found for house with ID ${house_id}`)
    }
    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
})

////PATCH PHOTOS ID ROUTE
router.patch('/photos/:photoId', async (req, res) => {
  let photoIdPatch = req.params.photoId
  let photoUrl = req.body.house_photosurl

  try {
    const { rows } = await db.query(`UPDATE house_photos
      SET house_photosurl = '${photoUrl}'
      WHERE photo_id = ${photoIdPatch} 
      RETURNING house_photosurl `)

    if (!rows.length) {
      throw new Error('The house ID provided is not valid')
    }

    console.log(rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json({ error: err.message })
  }
})

export default router
