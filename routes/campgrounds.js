const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds', {campgrounds})
})

router.get('/new', (request, response) => {
    response.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (request, response) =>{
    const campground = await Campground.findById(request.params.id).populate('reviews');
    response.render('campgrounds/show', {campground})
}))

router.get('/:id/edit', catchAsync(async (request, response) => {
    const campground = await Campground.findById(request.params.id)
    response.render('campgrounds/edit', {campground})
}))

router.put('/:id', validateCampground,  catchAsync(async (request, response) => {
    const {id} = request.params;
    const campground = await Campground.findByIdAndUpdate(id, {...request.body.campground})
    response.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (request, response) =>{
    const {id} = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect('/campgrounds')
}))

module.exports = router;