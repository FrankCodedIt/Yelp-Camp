const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

//picking a random element from array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//seeding the database with 50 different combinations of camps genereated randomly using ciities
const seedDB = async () => {
  await Campground.deleteMany({});
  //generating the title of the campground using seedHelpers
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "68355e16970ffc2e5c4a3965",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: `https://picsum.photos/400?random=${Math.random()}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt nostrum voluptatum quam fuga molestiae atque repellendus exercitationem neque dignissimos distinctio ut, eius numquam quae ratione quasi dolorum laborum facere optio!",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dc05shrl6/image/upload/v1748472495/YelpCamp/s4revsm32ou8v7yfykv8.jpg",
          filename: "YelpCamp/s4revsm32ou8v7yfykv8",
        },
        {
          url: "https://res.cloudinary.com/dc05shrl6/image/upload/v1748472495/YelpCamp/nvbwi5wlmmzfejqqaakk.jpg",
          filename: "YelpCamp/nvbwi5wlmmzfejqqaakk",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
