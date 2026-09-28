import { db } from "../prisma/db.ts";
import express from "express";

const router = express.Router();

//GET ALL POSTS
router.get("/", async (req, res) => {
  let { page, limit } = req.query;
  page = Number(page);
  limit = Number(limit);
  const posts = await db.orm.public.Post.where({}).include("author").all();
  res.json({ posts });
});

//CREATE NEW POST
router.post("/", async (req, res) => {
  const { title, content } = req.body;
  const authorId = req.id;
  try {
    await db.orm.public.Post.create({
      title: title ?? null,
      content,
      authorId,
    });
    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});

//UPDATE A POST
router.patch("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  const post = await db.orm.public.Post.where({ id: postId }).first();
  if (req.id != post.authorId) {
    return res.sendStatus(403);
  }

  await db.orm.public.Post.where({ id: postId }).update({
    title: title,
    content: content,
  });
  res.sendStatus(200);
});

//DELETE A POST
router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;

  const post = await db.orm.public.Post.where({ id: postId }).first();
  if (req.id != post.authorId) {
    return res.sendStatus(403);
  }

  await db.orm.public.Post.where({ id: postId }).delete();
  res.sendStatus(200);
});

//GET COMMENTS
router.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await db.orm.public.Comment.where({ postId })
      .include("author")
      .all();
    res.json({ comments });
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});

//WRITE A COMMENT
router.post("/comments/:postId", async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const authorId = req.id;
  try {
    await db.orm.public.Comment.create({
      content,
      postId,
      authorId,
    });
    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});

export default router;
