const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// This line of code registers a handler on the root path, "/".
app.get("/", (req, res) => {
  res.send("Hello!");
});
// This line of code registers a handler on the  path, "/urls.json".
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// This line of code registers a handler on the  path, "/hello".
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});