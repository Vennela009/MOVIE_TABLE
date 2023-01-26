const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let  dataBase = null;
const initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (error) {
    console.log(`Error is ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseMovieNameObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
const convertDbObjectToResponseMovieObject = (dbObject)=>{
    return {
         movieId: dbObject.movie_id,
         directorId: dbObject.director_id,
         movieName: dbObject.movie_name,
         leadActor: dbObject.lead_actor,
    }

};
const convertDbObjectToResponseDirectorObject = (dbObject)=>{
    return{
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
    }
}
//API2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieQuery = `INSERT INTO MOVIE(directorId, movieName, leadActor)
  VALUES(${directorId},'${movieName}','${leadActor}')`;
  await dataBase.run(movieQuery);
  response.send(`Movie Successfully Added`);
});
//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieQuery = `UPDATE MOVIE
   SET director_id = ${directorId}, movie_name = '${movieName}',lead_actor = '${leadActor}'
   WHERE movie_id = ${movieId}`;
  await dataBase.run(movieQuery);
  response.send("Movie Details Updated");
});
//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `DELETE FROM MOVIE 
    WHERE movie_id = ${movieId}`;
  await dataBase.run(movieQuery);
  response.send("Movie Removed");
});
//API1
app.get("/movies/", async (request, response) => {
  const movieQuery = `SELECT MOVIE_ID FROM MOVIE`;
  const allMovieName = await dataBase.all(movieQuery);
  response.send(allMovieName.map(eachMovie)=> convertDbObjectToResponseMovieNameObject(eachMovie))
});
//API3
app.get("/movies/:movieId/",async(request,response)=>{
    const {movieId} = request.params;
    const movieQuery = `SELECT * FROM MOVIE 
    WHERE movie_id = ${movieId}`;
    const movieDetails = await dataBase.get(movieQuery);
    response.send(convertDbObjectToResponseMovieObject(movieDetails));
})
//API6
app.get("/directors/",async(request,response)=>{
    const directorQuery = `SELECT * FROM DIRECTOR`
    const directorDetails = await dataBase.all(directorQuery);
    response.send(directorDetails.map(eachDirector)=>convertDbObjectToResponseDirectorObject(eachDirector));
})
//API7
app.get("/directors/:directorId/movies/",async(request,response)=>{
    const {directorId} = request.params;
    const movieQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId}`
    const allMovieName = await dataBase.all(movieQuery);
    response.send(allMovieName.map(eachMovie)=>convertDbObjectToResponseMovieNameObject(eachMovie));
})
module.exports = app;
