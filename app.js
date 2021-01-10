const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const ShortUrl = require("./models/shortUrl");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const requireAuth = require("./middlewares/authMiddlewares");
const User = require("./models/User");
const mkdirp = require("mkdirp");

// load environment variables
require("dotenv").config();

const app = express();

// create ./uploads directory if does not exist
mkdirp.sync("./uploads");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(10, (err, raw) => {
      cb(null, `${raw.toString("hex")}-${Date.now()}-${file.originalname}`);
    });
  },
});

const upload = multer({ storage: storage });
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: maxAge,
  });
};

app.set("view engine", "ejs");
app.use(flash());
app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(upload.single("file"));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.req = req;
  next();
});
app.use(
  session({
    cookie: { maxAge: 60000 },
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

const handleErrors = (req, err) => {
  let error_message;

  if (
    err.message === "incorrect password" ||
    err.message === "incorrect username"
  ) {
    error_message = "incorrect credentials.";
  } else if (err.code === 11000 && Object.keys(err.keyValue).includes("code")) {
    error_message = "code already in use.";
  } else if (err.code === 11000 && Object.keys(err.keyValue).includes("path")) {
    error_message = "a short url for this url already exists.";
  } else {
    error_message = "something went wrong!";
  }
  req.flash("error", error_message);
};

const dbURI = "mongodb://localhost/urlShortener";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log("connected to database.");
    app.listen(4000, () => {
      console.log("listening to requests on port 4000.");
    });
  })
  .catch((err) => console.log(err));

app.get("/", requireAuth, (req, res) => {
  res.render("index", { error_messages: req.flash("error"), title: "Home" });
});

app.post("/", requireAuth, async (req, res) => {
  let data;
  if (req.file) {
    data = {
      path: req.file.filename,
      kind: "file",
    };
  } else {
    data = {
      path: req.body.website_url,
      kind: "url",
    };
  }

  // if user has provided short code, use that
  // else it will be automatically generated
  if (req.body.short_code) {
    data.code = req.body.short_code;
  }

  try {
    const record = await ShortUrl.create(data);
    res.render("success", { code: record.code, title: "Success" });
  } catch (err) {
    handleErrors(req, err);
    res.redirect("/");
  }
});

app.get("/404", (req, res) => {
  res.status(404).render("404");
});

app.get("/all", requireAuth, async (req, res) => {
  const records = await ShortUrl.find();
  res.render("allurls", { records, title: "All URLs" });
});

app.get("/signin", (req, res) => {
  res.render("signin", {
    title: "Sign In",
    error_messages: req.flash("error"),
  });
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { maxAge: maxAge * 1000, httpOnly: true });
    res.redirect("/");
  } catch (err) {
    handleErrors(req, err);
    res.redirect("/signin");
  }
});

app.get("/signout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

app.get("/:code", async (req, res) => {
  const code = req.params.code;
  const record = await ShortUrl.findOne({ code });
  if (record) {
    let redirectUrl;
    if (record.kind === "url") {
      redirectUrl = record.path;
    } else {
      redirectUrl = "/uploads/" + record.path;
    }
    // increment the click count
    record.clicks += 1;
    // don't need to wait for it to complete
    record.save();
    // redirect the user to redirectUrl
    res.redirect(redirectUrl);
  } else {
    res.render("404");
  }
});
