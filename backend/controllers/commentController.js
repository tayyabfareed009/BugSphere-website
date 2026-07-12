import Comment from '../models/Comment.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({ bug: req.params.bugId, author: req.user._id, text: req.body.text, mentions: req.body.mentions || [] })
  res.status(201).json(await comment.populate('author mentions', 'name email role avatar'))
})

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)
  if (!comment) return res.status(404).json({ message: 'Comment not found' })
  if (!comment.author.equals(req.user._id) && req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' })
  comment.text = req.body.text || comment.text
  await comment.save()
  res.json(comment)
})

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)
  if (!comment) return res.status(404).json({ message: 'Comment not found' })
  if (!comment.author.equals(req.user._id) && req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' })
  await comment.deleteOne()
  res.json({ message: 'Comment deleted' })
})
