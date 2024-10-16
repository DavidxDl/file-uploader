import { config } from "dotenv";
config();
import express from "express";
import passport from "passport";
import LocalStragity from "passport-local";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { router as filesRouter } from "./routes/files";
import { router as foldersRouter } from "./routes/folders";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "dogs",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);
app.use(passport.session());

passport.use(
  new LocalStragity.Strategy(
    async (username: string, password: string, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { username: username },
        });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use("/files", filesRouter);
app.use("/folders", foldersRouter);

app.get("/", (req, res) => {
  return res.render("index", { user: req.user });
});

app.get("/sign-up", (req, res) => {
  return res.render("sign-up", { errors: [] });
});

app.post("/sign-up", async (req, res) => {
  const {
    username,
    password,
    repeat_password,
  }: { username: string; password: string; repeat_password: string } = req.body;

  const username_exist = await prisma.user.findMany({
    where: { username: username },
  });

  if (password !== repeat_password) {
    return res.render("sign-up", {
      errors: ["passwords don't match!"],
      username: username,
      password: password,
      repeat_password: repeat_password,
    });
  }

  if (username_exist.length) {
    return res.render("sign-up", {
      errors: ["username already exist"],
      username: username,
      password: password,
      repeat_password: repeat_password,
    });
  }

  bcrypt.hash(password, 10, async (error, hPassword) => {
    if (error) {
      console.error("couldnt hash password", error);
      return;
    }
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hPassword,
      },
    });
  });

  return res.redirect("/");
});

app.get("/login", (req, res) => {
  return res.render("login", { errors: [] });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
