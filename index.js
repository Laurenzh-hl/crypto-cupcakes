require("dotenv").config(".env");
const { auth } = require("express-openid-connect");
const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
const { PORT = 3000 } = process.env;
// TODO - require express-openid-connect and destructure auth from it

const { User, Cupcake } = require("./db");

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
// define the config object
// attach Auth0 OIDC auth router
// create a GET / route handler that sends back Logged in or Logged out

const { AUTH0_SECRET, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_BASE_URL } =
  process.env;

const config = {
  authRequired: true, // this is different from the documentation
  auth0Logout: true,
  secret: AUTH0_SECRET,
  baseURL: AUTH0_AUDIENCE,
  clientID: AUTH0_CLIENT_ID,
  issuerBaseURL: AUTH0_BASE_URL,
};
app.use(auth(config));

app.get("/", (req, res) => {
  const {
    sid,
    given_name,
    family_name,
    nickname,
    name,
    picture,
    updated_at,
    email,
    email_verified,
    sub,
  } = req.oidc.user;
  res.set("Content-Type", "text/html");
  res.send(
    Buffer.from(
      `<h1>Cupcake Crazy Home page</h1>
       <h2>Welcome, ${name}</h2>
       <p>Username: ${email}</p>
       <img src="${picture}" alt="some picture">`
    )
  );
});

app.get("/cupcakes", async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// error handling middleware
app.use((error, req, res, next) => {
  console.error("SERVER ERROR: ", error);
  if (res.statusCode < 400) res.status(500);
  res.send({ error: error.message, name: error.name, message: error.message });
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});
