const prompt = require("prompt");
const mongoose = require("mongoose");
const User = require("./models/User");

const dbURI = "mongodb://localhost/urlShortener";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("connected to database.");
    createUser();
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });

function onErr(err) {
  console.log(err);
  return 1;
}

const createUser = () => {
  const properties = [
    {
      name: "username",
      validator: /^[a-zA-Z\s\-]+$/,
      warning: "Username must be only letters, spaces, or dashes",
    },
    {
      name: "password",
      hidden: true,
    },
  ];

  prompt.start();

  prompt.get(properties, function (err, result) {
    if (err) {
      return onErr(err);
    }

    User.create({ username: result.username, password: result.password })
      .then((user) => {
        console.log("user created successfully.");
        process.exit(0);
      })
      .catch((err) => console.error(err));
  });
};
