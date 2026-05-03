const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PATH = './data.json';
const COMMENTS_PATH = './comments.json';

app.use(cors({
  origin: 'http://localhost:3000',  // chỉ cho phép NextJS
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// === Hàm đọc/ghi dữ liệu bài viết ===
async function readData() {
  try {
    const raw = await fs.readFile(PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFile(PATH, JSON.stringify(data, null, 2));
}

// === Hàm đọc/ghi dữ liệu bình luận ===
async function readComments() {
  try {
    const raw = await fs.readFile(COMMENTS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

async function writeComments(data) {
  await fs.writeFile(COMMENTS_PATH, JSON.stringify(data, null, 2));
}

// === Routes bài viết ===

// GET - Lấy danh sách bài viết
app.get('/api/posts', async (req, res) => {
  const posts = await readData();
  res.json(posts);
});

// POST - Tạo bài viết mới
app.post('/api/posts', async (req, res) => {
  const { title, content, author } = req.body;

  // Validation đơn giản
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  const posts = await readData();

  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  await writeData(posts);

  res.status(201).json(newPost);
});

// PUT - Cập nhật bài viết
app.put('/api/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const posts = await readData();
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }

  posts[index] = { ...posts[index], ...req.body };
  await writeData(posts);
  res.json(posts[index]);
});

// DELETE - Xoá bài viết
app.delete('/api/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const posts = await readData();
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }

  posts.splice(index, 1);
  await writeData(posts);
  res.json({ message: 'Đã xoá thành công' });
});

// === Routes bình luận ===

// GET - Lấy bình luận theo bài viết
app.get('/api/posts/:id/comments', async (req, res) => {
  const postId = Number(req.params.id);
  const comments = await readComments();
  res.json(comments.filter(c => c.postId === postId));
});

// POST - Thêm bình luận vào bài viết
app.post('/api/posts/:id/comments', async (req, res) => {
  const postId = Number(req.params.id);
  const { author, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'Thiếu dữ liệu' });

  const comments = await readComments();
  const newComment = {
    id: Date.now(),
    postId,
    author,
    content,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  await writeComments(comments);
  res.status(201).json(newComment);
});

// DELETE - Xoá bình luận
app.delete('/api/comments/:id', async (req, res) => {
  const id = Number(req.params.id);
  const comments = await readComments();
  const index = comments.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Không tìm thấy bình luận' });

  comments.splice(index, 1);
  await writeComments(comments);
  res.json({ message: 'Đã xoá bình luận' });
});

app.listen(5000, () => {
  console.log('Backend chạy tại port :5000');
});
