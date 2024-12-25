const Product = require("../models/Product");
// npm install bcrypt
const bcrypt = require("bcrypt");
const auth = require("../auth");

module.exports.getAllProduct = async (userData, reqBody) => {
	if (userData.isAdmin) {
		return Product.find({}).then((result) => {
			return result;
		});
	} else {
		return false;
	}
};

module.exports.getActiveProduct = (reqBody) => {
	return Product.find({ isActive: true }).then((result) => {
		return result;
	});
};

module.exports.getProduct = (productId, reqBody) => {
	return Product.findById(productId).then((result) => {
		if (result == null) {
			return false;
		}
		if (result.isActive) {
			return result;
		} else {
			return false;
		}
	});
};

module.exports.registerProduct = async (userData, reqBody) => {
	if (userData.isAdmin) {
		const newProduct = new Product({
			name: reqBody.name,
			description: reqBody.description,
			price: reqBody.price,
			imagepath: reqBody.imagepath,  // Updated to imagepath
			category: reqBody.category,
		});

		return await Product.findOne({ name: reqBody.name }).then((result) => {
			if (result == null) {
				return newProduct.save().then((product, error) => {  // Ensure variable names are consistent
					if (error) {
						return false;
					} else {
						return true;
					}
				});
			} else {
				return false;
			}
		});
	} else {
		return false;
	}
};

module.exports.updateProduct = async (userData, productId, reqBody) => {
	if (userData.isAdmin) {
		return await Product.findById(productId).then((result) => {
			if (result == null) {
				return false;
			} else {
				// Update fields using reqBody values
				result.name = reqBody.name;
				result.description = reqBody.description;
				result.price = reqBody.price;
				result.imagepath = reqBody.imagepath;  // Update imagepath
				result.category = reqBody.category;

				return result.save().then((product, error) => {  // Ensure variable names are consistent
					if (error) {
						return false;
					} else {
						return true;
					}
				});
			}
		});
	} else {
		return false;
	}
};

module.exports.archiveProduct = async (userData, productId) => {
	if (userData.isAdmin) {
		return await Product.findById(productId).then((result) => {
			if (result == null) {
				return false;
			} else {
				result.isActive = false;
				return result.save().then((product, error) => {  // Ensure variable names are consistent
					if (error) {
						return false;
					} else {
						return true;
					}
				});
			}
		});
	} else {
		return false;
	}
};

module.exports.restockProduct = async (userData, productId) => {
	if (userData.isAdmin) {
		return await Product.findById(productId).then((result) => {
			if (result == null) {
				return false;
			} else {
				result.isActive = true;
				return result.save().then((product, error) => {  // Ensure variable names are consistent
					if (error) {
						return false;
					} else {
						return true;
					}
				});
			}
		});
	} else {
		return false;
	}
};
