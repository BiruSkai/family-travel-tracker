import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Fill below to run the app
const db = new pg.Client({
  user: "",
  host: "",
  database: "world",
  password: "",
  port:,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

async function allUsers() {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

async function changeUser(currentUserId) {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [currentUserId]);
  return result.rows;
}

async function checkVisisted(currentUserId) {
  const result = await db.query("SELECT  u.id AS userId, name, color, vc.id AS countryId, vc.country_code FROM users_visitedcountries AS uv JOIN users AS u ON u.id = uv.user_id JOIN visited_countries AS vc ON vc.country_code = uv.country_code WHERE u.id = $1;", [currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    console.log("data in Loop checkVisisted: ", country)
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  let fetchUsers = await allUsers();
  console.log("fetchUsers: ", fetchUsers);
  console.log(typeof(fetchUsers));
  let currentUser = await changeUser(currentUserId); 
  console.log("currentUser: ", currentUser[0]);
  console.log(typeof(currentUser));
  console.log("typeof currentUser: ", typeof(currentUser));
  let combinedData = await checkVisisted(currentUserId);
  console.log("countries: ", combinedData);

  res.render("index.ejs", {
    countries: combinedData,
    total: combinedData.length,
    users: fetchUsers,
    color: currentUser[0].color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  console.log("add country: ", input);

  try {
    let result;
    if (input.toLowerCase() === "tanzania") {
      result = await db.query(
        "SELECT country_code,id FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
        [input.toLowerCase()]
      );
    } else {
      result = await db.query(
        "SELECT country_code,id FROM countries WHERE LOWER(country_name) = $1",
        [input.toLowerCase()]
      );
    }

    const data = result.rows[0];
    console.log("data: ", data)
    console.log("add id, countryCode: ", data.id, data.country_code);
    try {
      const visitedCountries = await db.query("SELECT country_code FROM visited_countries");
      console.log("visitedCountries: ", visitedCountries.rows);
      console.log(data)
      const findSameData = visitedCountries.rows.find(item => item.country_code == data.country_code.trim());
      console.log("findSameData: ", findSameData)
      if (findSameData === undefined) {
        try {
          await db.query("INSERT INTO visited_countries VALUES ($1, $2)", [data.id, data.country_code]);
          try {
            await db.query(
              "INSERT INTO users_visitedcountries (country_code, user_id) VALUES ($1, $2)",
              [data.country_code, currentUserId]
            );
            res.redirect("/"); 
          } catch (error) {
            console.log(err);
            res.redirect("/")
          }
        } catch (error) {
          console.log(error)
          res.redirect("/")
        }    
      } else {
        try {
          await db.query(
            "INSERT INTO users_visitedcountries (country_code, user_id) VALUES ($1, $2)",
            [data.country_code, currentUserId]
          );
          res.redirect("/"); 
        } catch (error) {
          console.log(error);
          const users = await allUsers();
          let currentUser = await changeUser(currentUserId); 
          const countries = await checkVisisted(currentUserId);
          res.render("index.ejs", {
            users,
            color:currentUser[0].color,
            countries,
            total: countries.length,
            error: "Country has already been added, try again.",
          });
        }       
      }
    } catch (err) {
      console.log(err);
      res.redirect("/")
    }
  } catch (err) {
    console.log(err);
    const users = await allUsers();
    let currentUser = await changeUser(currentUserId); 
    const countries = await checkVisisted(currentUserId);
    console.log("test: ", countries)
    const total = countries.length;
    res.render("index.ejs", {
      users,
      color: currentUser[0].color,
      countries, 
      total, 
      error: "Country name does not exist, try again."
    })
  }
});

app.post("/user", async (req, res) => {
  const {user, add} = req.body;
  console.log("user/add: ", user, add);

  if (user) {
    currentUserId = user
    res.redirect("/");
  } else if (add) {
    res.render("new.ejs");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const {name, color} = req.body;
  console.log("new name,color: ", name, color);
  try {
    const addNewName = await db.query("INSERT INTO users(name, color) VALUES ($1, $2)", [name, color]);
    console.log("addNewName: ", addNewName)
  
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/")
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
