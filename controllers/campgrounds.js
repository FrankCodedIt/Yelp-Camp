const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds", { campgrounds });
};

module.exports.renderNewForm = (request, response) => {
  response.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  //   const geoData = await geocoder
  //     .forwardGeocode({
  //       query: "Johannesburg, SA",
  //       limit: 1,
  //     })
  //     .send();
  //   console.log(geoData.body.features);
  //   res.send("Ok!!!!!");
  const campground = new Campground(req.body.campground);
  console.log(campground);
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
  request.flash("success", "Successfully updated campground!");
  response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (request, response) => {
  const { id } = request.params;
  await Campground.findByIdAndDelete(id);
  request.flash("success", "Successfully deleted campground!");
  response.redirect("/campgrounds");
};
