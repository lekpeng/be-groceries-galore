module.exports = {
  register: async (req, res) => {
    // validations
    const { formData, userType } = req.body;
    console.log("user Type", userType);
    console.log("REGISTER FORM DATA", formData);
    return;
  },

  //   if (formData.error) {
  //     return res.status(409).json({ error: formData.error.message });
  //   }

  //   const validatedValues = formData.value;

  //   // checks for unique email and username
  //   try {
  //     const user = await userModel.findOne({
  //       username: validatedValues.username,
  //     });
  //     if (user) {
  //       return res.status(409).json({ error: "user exists" });
  //     }
  //     const email = await userModel.findOne({ email: validatedValues.email });
  //     if (email) {
  //       return res.status(409).json({ error: "email already registered, please use another" });
  //     }
  //   } catch (err) {
  //     return res.status(500).json({ error: "failed to get user" });
  //   }

  //   // hashing password and putting req object into user variable
  //   const passHash = await bcrypt.hash(req.body.password, 10);
  //   const user = { ...req.body, password: passHash };

  //   // creating user in db
  //   try {
  //     await userModel.create(user);
  //   } catch (err) {
  //     return res.status(500).json({ error: "Failed to register user" });
  //   }

  //   return res.status(200).json("User successfully created");
  // },
};
