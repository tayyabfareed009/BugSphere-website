import multer from 'multer'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter(req, file, cb) {
    const allowed = file.mimetype.startsWith('image/') || ['text/plain', 'text/x-c', 'text/x-java-source', 'application/json', 'application/pdf', 'application/zip'].includes(file.mimetype)
    if (!allowed) return cb(new Error('Unsupported attachment type'))
    cb(null, true)
  }
})
