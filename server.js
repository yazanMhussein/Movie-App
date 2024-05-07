'use strict';

//setup the require things

const express = require('express')
const cors = require('cors')
const app = express()

const dataJ = require('./Movie Data/data.json');
const pg = require('pg')
let axios = require('axios');
require('dotenv').config()
// setup the server app = express and port = process.env.PORT

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//server data to for render and a database
const DataBase= process.env.PG_DATABASE
const UserName= process.env.PG_USER
const password= process.env.PG_PASSWORD
const Host= process.env.PG_HOST
const Port=process.env.PG_PORT

const client = new pg.Client(`postgresql://${UserName}:${password}@${Host}:${Port}/${DataBase}`)
const PORT = 8080;


// try this out to see a differents between class vs function
// function Movie(title,poster_path,overview)
// {
//     this.title = title;
//       this.poster_path = poster_path;
//       this.overview = overview;
// }


// here is where i create constructor 
 class Movie {
    constructor(title,poster_path,overview){
     this.title = title;
     this.poster_path = poster_path;
     this.overview = overview;
     }
    }
    // this is where i create a new instance of Movie class to pass it to json
    const movieName = new Movie(
        dataJ.title,
        dataJ.poster_path,
        dataJ.overview
        );
// here is where i create constructor list 
class Movie2 {
    constructor(id,poster_path,title,overview){
     this.id = id;
     this.title = title;
     this.poster_path = poster_path;
     this.overview = overview;
     }
}        

class Movie3 {
    constructor(id,name,){
        this.id = id;
        this.name = name;  
    }
}
class Movie4 {
    constructor(id,poster_path,name,origin_country,original_language,first_air_date,overview){
        this.id = id;
        this.poster_path = poster_path;
        this.origin_country = origin_country;
        this.original_language = original_language;
        this.first_air_date = first_air_date;
        this.overview = overview;
        this.name = name;
    }
}


//router
app.get("/",movieRouter)
app.get("/favorite",favoriteMessage)
app.get("/movieTrening",movieTrening)
app.get("/movieSearch",movieSearch)
app.get("/popular",popularPerson)
app.get("/tv",tvList)

///router with database
app.get("/getMovies",getMovie)
app.post("/addMovies",addMovie)
app.put("/movieUpdate/:id",updateMovie)
app.delete("/movieDelete/:id",deleteMovie)


app.use(errorHandler);

//get movie to our database



//this read form the database
function getMovie(req,res){
    const sql = 'SELECT * FROM movieLibrary';
    client.query(sql)
    .then((dataJ)=>{
        res.send(dataJ.rows)
    })
    .catch((err) => {
         errorHandler(err,req,res);
    })
}


//this create to the database
function addMovie(req,res){
    const addMovie = req.body;
    const sql = 'INSERT INTO movieLibrary (title,poster_path,overview) VALUES ($1,$2,$3) RETURNING *'

    const values = [addMovie.title, addMovie.poster_path,addMovie.overview]

    client.query(sql, values)
    .then((dataJ)=>{
        res.status(200).send(dataJ.rows) 
    })
    .catch(err=>{
        errorHandler(err,req,res);
    })
}

//this update to the database
function updateMovie(req,res){
    const id= req.params.id;
    
    const sql =`UPDATE movieLibrary SET title=$1, poster_path=$2, overview=$3 where id=${id} RETURNING *`
    const values = [req.body.title, req.body.poster_path, req.body.overview]
    client.query(sql, values)
    .then((dataJ)=>{
        res.status(200).send(dataJ.rows)
    })
    .catch(err=>{
        errorHandler(err,req,res);
    })
}

//this delete from the database
function deleteMovie(req,res){
    const id= req.params.id;
    const sql =`DELETE FROM movieLibrary WHERE id=${id}`
    client.query(sql)
    .then((dataJ)=>{
        res.status(204).json({})

    })
    .catch((err) => {
         errorHandler(err,req,res);
    })
}

//this is function will you to the movieTrening router 
function movieTrening(req,res){
const mdbApiKey = process.env.mdbApiKey; 
const urlTrending = `https://api.themoviedb.org/3/trending/all/week?api_key=${mdbApiKey}&language=en-US`;  
axios.get(urlTrending)
    .then((MovieListresult)=>{
         let mapResult = MovieListresult.data.results.map((item)=>{
         let movieList= new Movie(item.title,item.poster_path,item.overview)
         console.log("im the movieLidt data",movieList)
         return movieList;
    })         
         res.send(mapResult)
      })
      .catch((err)=>{
        errorHandler(err,req,res)
      })
 }
// this is function will you to the movieSearch router 
function movieSearch(req,res){
    const mdbApiKey = process.env.mdbApiKey; 
                    
const urlsearch = `https://api.themoviedb.org/3/search/movie?api_key=${mdbApiKey}&language=en-US&query=The&page=2`;  
axios.get(urlsearch)
    .then((MovieListresult)=>{
         let mapResult = MovieListresult.data.results.map((item)=>{
         let movieList= new Movie2(item.id,item.poster_path,item.title,item.release_date,item.overview)
         return movieList;
    })         
         res.send(mapResult)
      })
      .catch((err)=>{
        errorHandler(err,req,res)
      })

 }
// //this is function will you to the popular router 
function popularPerson(req,res){
    const mdbApiKey = process.env.mdbApiKey;             
    const urlUpopular =`https://api.themoviedb.org/3/person/popular?api_key=${mdbApiKey}&language=en-US&page=1`;
    axios.get(urlUpopular)
    .then((MovieListresult)=>{
        let mapResult = MovieListresult.data.results.map((item)=>{
        let movieList= new Movie3(item.id,item.name)
        return movieList;
   })         
        res.send(mapResult)
     })
     .catch((err)=>{
        errorHandler(err,req,res)
     })
}
//this is function will you to the tv router 
function tvList(req,res){
    const mdbApiKey = process.env.mdbApiKey; 
    const UrlTv =`https://api.themoviedb.org/3/discover/tv?api_key=${mdbApiKey}&include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc`;
    axios.get(UrlTv)
    .then((MovieListresult)=>{
        let mapResult = MovieListresult.data.results.map((item)=>{
        let movieList= new Movie4(item.id,item.poster_path,item.name,item.origin_country,item.original_language,item.first_air_date,item.overview)
        return movieList;
   })         
        res.send(mapResult)
     })
     .catch((err)=>{
        errorHandler(err,req,res)
     })
}
// this is my main router        
function movieRouter (req,res) {   
    // this is res.json(movieName) it's so the json can be put on the body
    res.json(movieName);
}

// this is my favorite router i send a message to the body    
function favoriteMessage (req,res){
    res.send("Welcome to Favorite Page")
}

//this is my 404 router i send a error message to the body if something doesn't work
app.use((req, res, next) => {
    res.status(404).json({ status: 404, responseText: 'Page not found' });
  })
// // this is my 500 router i send a error message to the body if something doesn't work
// app.use((err,req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ status: 500, responseText: 'Sorry, something went wrong' });
//    })
   // i add a errorHandler 
function errorHandler(erorr, req, res) {
    const err = {
        status: 500,
        massage: erorr
        }
        res.status(500).send(err);
    }
    
    client.connect()
    .then(() => {
        // http://localhost:8080 => (Ip = localhost) (port = 8080)
        app.listen(PORT, () => {
            console.log(`listening on ${PORT} : I am ready`);
    });
})


