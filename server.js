const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/clinic", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

// Schemas
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  image: { type: String }, // URL to image
  diseases: { type: [String], default: [] },
});

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    disease: { type: String, required: true },
    doctor: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);

// Seed doctors if empty
async function seedDoctors() {
  const count = await Doctor.countDocuments();
  if (count > 0) return;
  const seed = [
    {
      name: "Dr. Alice Smith",
      specialty: "Cardiologist",
      image: "https://via.placeholder.com/150?text=Cardiologist",
      diseases: ["Heart Disease", "Hypertension", "Arrhythmia"],
    },
    {
      name: "Dr. John Doe",
      specialty: "Dermatologist",
      image: "https://via.placeholder.com/150?text=Dermatologist",
      diseases: ["Acne", "Eczema", "Psoriasis", "Skin Allergy"],
    },
    {
      name: "Dr. Emily Brown",
      specialty: "Pediatrician",
      image: "https://via.placeholder.com/150?text=Pediatrician",
      diseases: ["Fever", "Cold", "Flu", "Vaccination"],
    },
  ];
  await Doctor.insertMany(seed);
  console.log("Seeded doctors collection");
}

seedDoctors().catch((e) => console.error("Seeding error", e));

// Helpers
function isFutureOrToday(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

function validateAppointmentPayload(body) {
  const errors = [];
  const required = ["name", "age", "gender", "disease", "doctor", "appointmentDate"]; // notes optional
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || String(body[k]).trim() === "") {
      errors.push(`${k} is required`);
    }
  }

  const age = Number(body.age);
  if (Number.isNaN(age) || age < 0 || age > 120) errors.push("Age must be a number between 0 and 120");

  if (!isFutureOrToday(body.appointmentDate)) errors.push("Appointment date cannot be in the past");

  if (!["Male", "Female", "Other"].includes(body.gender)) errors.push("Invalid gender");

  return errors;
}

// Doctors routes
app.get("/doctors", async (req, res) => {
  try {
    const { disease } = req.query;
    let filter = {};
    if (disease) {
      // Case-insensitive match within diseases array
      filter = { diseases: { $elemMatch: { $regex: `^${disease}$`, $options: "i" } } };
    }
    const docs = await Doctor.find(filter).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// Appointments routes
app.post("/appointments", async (req, res) => {
  try {
    const errors = validateAppointmentPayload(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });

    const payload = { ...req.body };
    // Normalize date
    payload.appointmentDate = new Date(payload.appointmentDate);

    const created = await Appointment.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

app.get("/appointments", async (req, res) => {
  try {
    const items = await Appointment.find().sort({ appointmentDate: 1 }).lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

app.put("/appointments/:id", async (req, res) => {
  try {
    const errors = validateAppointmentPayload(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });

    const payload = { ...req.body };
    payload.appointmentDate = new Date(payload.appointmentDate);

    const updated = await Appointment.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Appointment not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

app.delete("/appointments/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
