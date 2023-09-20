const User = require("../modals/user");
const Order=require("../modals/order")
const Supply=require("../modals/supply")
const ErrorHandler = require("../utils/HandleError");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.registerUser = async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const { name, email, password,role } = req.body;
    console.log(req.body)

    const user = await User.findOne({ email });
    if (user)
      return res.status(400).send({
        success: false,
        error: {
          email: {
            message: "Email is already in use",
          },
        },
      });
    else {
      const newUser = await User.create({
        name,
        email,
        password,
        role,
        avatar: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });

      sendToken(newUser, 200, res);
    }
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      error: error.errors,
    });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).send({
      success: false,
      error: {
        message: "Please enter your email or password",
      },
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).send({
      success: false,
      error: {
        email: "Email is not a valid email",
      },
    });
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(401).send({
      success: false,
      error: {
        password: "Password is not correct",
      },
    });
  }

  sendToken(user, 200, res);
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(404).send({
        success: false,
        error: {
          message: "User not found with this email address",
        },
      });

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow: \n\n${resetUrl}\n\n If you have not request this email, then ignore it`;
    await sendEmail({
      email: user.email,
      subject: "Walmart password recovery email",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).send({
      success: false,
      error: {
        message: error.message,
      },
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        error: {
          message: "Password reset token is invalid or expired",
        },
      });
    }

    if (!req.body.password || !req.body.confirmPassword) {
      return res.status(400).send({
        success: false,
        error: {
          message: "Please enter your password or confirm password",
        },
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send({
        success: false,
        error: {
          message: "ConfirmPassword does not match",
        },
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        error: error.errors,
      },
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(req.body.oldPassword);

    if (!isMatch) {
      return res.status(400).send({
        success: false,
        error: {
          message: "Old password is incorrect",
        },
      });
    }

    user.password = req.body.password;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        error: error.errors,
      },
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const newUserProfile = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
      const image_id = user.avatar.public_id;
      const res = await cloudinary.v2.uploader.destroy(image_id);
      const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      newUserProfile.avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserProfile, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      error: {
        error: error.errors,
      },
    });
  }
};

exports.getCurrentUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
};

exports.logOut = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.allUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        error: error.errors,
      },
    });
  }
};

exports.getAdmin= async (req, res, next) => {
  try {
    const admin = await User.findOne({role:'admin'});

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        error: error.errors,
      },
    });
  }
};


exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        message: "User does not exist",
      },
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUser, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        error: error.errors,
      },
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const image_id = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(image_id);

    await user.remove();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        message: "User does not exist",
      },
    });
  }
};


exports.addSupply=async (req, res, next) => {
  try {
    const supply = await Supply.create(req.body);

    const order=await Order.findByIdAndUpdate(req.body.order,{transfered:true})
    

    res.status(200).json({
      success: true,
      supply
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        message: "Can not add supply",
      },
    });
  }
};

exports.getAllSupply=async(req, res, next) => {
  try {
    const supplies = await Supply.find().sort({createdAt:-1}).populate('order');
    

    res.status(200).json({
      success: true,
      supplies
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        message: "Can not get all supplies",
      },
    });
  }
};

exports.updateSupply=async(req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id,{supplied:req.body.supplied});
    

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error: {
        message: "Can not get all supplies",
      },
    });
  }
};
