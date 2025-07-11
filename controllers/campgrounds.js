const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const {cloudinary} = require("../cloudinary");

module.exports.index = async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds", { campgrounds });
};

module.exports.renderNewForm = (request, response) => {
  response.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (request, response) => {
  const campground = await Campground.findById(request.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    request.flash("error", "Cannot find that campground!");
    return response.redirect("/campgrounds");
  }
  response.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    request.flash("error", "Cannot find that campground!");
    return response.redirect("/campgrounds");
  }
  response.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...request.body.campground,
  });
  const imgs = request.files.map( f=> ({url:f.path, filename: f.filename}));
  campground.images.push(...imgs);
  await campground.save();
  if(request.body.deleteImages){
    for(let filename of request.body.deleteImages){
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({$pull: {images: {filename: {$in: request.body.deleteImages}}}})
  }
  request.flash("success", "Successfully updated campground!");
  response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (request, response) => {
  const { id } = request.params;
  await Campground.findByIdAndDelete(id);
  request.flash("success", "Successfully deleted campground!");
  response.redirect("/campgrounds");
};
