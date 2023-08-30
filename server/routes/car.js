const router = require("express").Router();
const authMiddleWare = require("../middlewares/auth");
const Car = require("../models/Car");
const User = require("../models/User");

//Car Registration

router.post('/registercar', authMiddleWare, async (req, res) => {
  try {
    const check = await Car.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ message: "Exist" });
    }
    const { fullName, city, state, postalCode, phoneNumber, email, model, year, color, licensePlate, imageBase64 } = req.body;
    const newCar = new Car({ fullName, city, state, postalCode, phoneNumber, email, model, year, color, licensePlate, imageBase64 })
    await newCar.save();
    res.status(200).json({ message: "Car Registration successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});


// Reserve Car
router.post('/reservecar', authMiddleWare, async (req, res) => {

  try {
    const { carId, email } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // if the car id already exist in reservedCar array dont push
    if (user.reservedCars.includes(carId)) {
      return res.status(400).json({ message: 'Car already reserved' });
    }

    user.reservedCars.push(carId);
    await user.save();
    res.status(200).json({ message: "Car reserved successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }

});

//get all cars
router.get('/allcars', authMiddleWare, async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// get car by id
router.get('/car/:id', authMiddleWare, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.status(200).json(car);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

//get user data though email using get method and fetch car details using the id in the reservedCars array
router.get('/user/:email', authMiddleWare, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    const cars = await Car.find({ _id: { $in: user.reservedCars } });
    res.status(200).json({ user, cars });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
