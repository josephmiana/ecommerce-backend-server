//Capstone 2 User Model
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Name is required"],
	},
	address: {
		type: String,
		required: [true, "Address is required"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
	},
	password: {
		type: String,
		required: [true, "Description is required"],
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
},
{ timestamps: true });

module.exports = mongoose.model("User", userSchema);
