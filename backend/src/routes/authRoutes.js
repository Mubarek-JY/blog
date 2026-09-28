import express from "express";
import bcrypt from "bcrypt";
import { db } from "../prisma/db.ts";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, username, name } = req.body;

  // CHECK IF IT ALREADY REGISTERED
  const exists = await db.orm.public.User.where({
    email,
  }).first();
  if (exists) {
    return res.json({
      message: "user with this email already exists. Try login instead",
    });
  }

  //HASH THE PASSWORD
  const hashedPassword = bcrypt.hashSync(password, 10);

  //ADD TO DB
  try {
    const user = await db.orm.public.User.create({
      email,
      password: hashedPassword,
      username,
      name: name ?? null,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({ token });
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});

//LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.orm.public.User.where({
    email,
  }).first();
  if (!user) {
    return res.sendStatus(404);
  }
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.send({ message: "Incorrect password" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({ token });
});
export default router;
