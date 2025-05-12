const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const { request } = require('http');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.get('/', (request, response) => {
    response.render('home')
})


app.get('/campgrounds', async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (request, response) => {
    response.render('campgrounds/new')
})

app.post('/campgrounds', async (request, response) => {
    const campground = new Campground(request.body.campground)
    await campground.save()
    response.redirect(`/campgrounds/${campground._id}`)
})


app.get('/campgrounds/:id', async (request, response) =>{
    const campground = await Campground.findById(request.params.id)
    response.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async (request, response) => {
    const campground = await Campground.findById(request.params.id)
    response.render('campgrounds/edit', {campground})
})

app.put('/campgrounds/:id', async (request, response) => {
    const {id} = request.params;
    const campground = await Campground.findByIdAndUpdate(id, {...request.body.campground})
    response.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (request, response) =>{
    const {id} = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect('/campgrounds')
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})