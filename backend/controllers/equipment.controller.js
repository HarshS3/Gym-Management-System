import Equipment from "../models/equipment.model.js";

// Fetch all equipment for the authenticated gym
export const getEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.find({ gym: req.gym._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, equipments });
  } catch (err) {
    console.error("Error fetching equipments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add new equipment
export const addEquipment = async (req, res) => {
  try {
    const { name, muscleGroup, status, location, quantity } = req.body;
    if (!name || !muscleGroup) {
      return res.status(400).json({ success: false, message: "Name and muscleGroup are required" });
    }

    const equipment = await Equipment.create({
      name,
      muscleGroup,
      status: status || "active",
      location: location || "",
      quantity: quantity || 1,
      gym: req.gym._id,
    });

    res.status(201).json({ success: true, message: "Equipment added", equipment });
  } catch (err) {
    console.error("Error adding equipment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}; 