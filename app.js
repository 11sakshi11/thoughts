const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const multer = require("multer");
const utilities = require(__dirname + "/utilities.js");
const BlogPost = require(__dirname + "/models/blog.js");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const homeStartingContent =
  "Start writing your feelings and opinions out and let the world know your thoughts. Deep dive right into reading and writing!!";
const aboutContent =
  "The best ideas can change who we are. THOUGHTS is where those ideas take shape, take off, and spark powerful conversations. Readers can come to find insightful and dynamic thinking. Here, expert and undiscovered voices alike dive into the heart of any topic and bring new ideas to the surface.";
const contactContent = "If you have any queries - you can contact me at: ";

let storage = multer.memoryStorage();
let upload = multer({ storage: storage });

// Connecting to the database using mongoose.
mongoose.connect("mongodb+srv://sakshi:sakshi@cluster0.xs9omcq.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define your BlogPost schema and model here

// ...

app.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find({});
    res.render("home", { home: homeStartingContent, blogPosts: posts });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/about", function (req, res) {
  res.render("about", { about: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contact: contactContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

// app.post("/compose", upload.single("uploadedImage"), (req, res) => {
//   const title = req.body.title;
//   const content = req.body.post;
//   let image = req.body.image;

//   if (!image || image === "") {
//     image = "gridimage-" + utilities.getRandomInt(6).toString() + ".jpeg";
//   }

//   var newPost;
//   if (!req.file) {
//     newPost = new BlogPost({
//       title: title,
//       content: content,
//       postedDate: utilities.getDate(),
//       image: image,
//     });
//   } else {
//     newPost = new BlogPost({
//       title: title,
//       content: content,
//       postedDate: utilities.getDate(),
//       imageFile: {
//         data: req.file.buffer,
//         contentType: "image/png",
//       },
//     });
//   }

//   newPost.save((err) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send("Internal Server Error");
//     }
//     res.redirect("/");
//   });
// });

app.post("/compose", upload.single("uploadedImage"), async (req, res) => {
  const title = req.body.title;
  const content = req.body.post;
  let image = req.body.image;

  if (!image || image === "") {
    image = "gridimage-" + utilities.getRandomInt(6).toString() + ".jpeg";
  }

  try {
    let newPost;
    if (!req.file) {
      newPost = new BlogPost({
        title: title,
        content: content,
        postedDate: utilities.getDate(),
        image: image,
      });
    } else {
      newPost = new BlogPost({
        title: title,
        content: content,
        postedDate: utilities.getDate(),
        imageFile: {
          data: req.file.buffer,
          contentType: "image/png",
        },
      });
    }

    await newPost.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


// app.get("/posts/:postId", (req, res) => {
//   let postId = req.params.postId;
//   BlogPost.findOne({ _id: postId }, (err, doc) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send("Internal Server Error");
//     }
//     if (doc) {
//       res.render("post", { post: doc });
//     } else {
//       res.status(404).send("Post not found");
//     }
//   });
// });

app.get("/posts/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await BlogPost.findOne({ _id: postId });
    if (post) {
      res.render("post", { post: post });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/delete/:deleteId", (req, res) => {
//   let deleteId = req.params.deleteId;
//   BlogPost.deleteOne({ _id: deleteId }, (err) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send("Internal Server Error");
//     }
//     res.redirect("/");
//   });
// });


app.get("/delete/:deleteId", async (req, res) => {
  try {
    const deleteId = req.params.deleteId;
    await BlogPost.deleteOne({ _id: deleteId });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/update/:updateId", (req, res) => {
//   let updateId = req.params.updateId;
//   BlogPost.findOne({ _id: updateId }, (err, doc) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send("Internal Server Error");
//     }
//     res.render("update", { title: doc.title, content: doc.content, id: updateId });
//   });
// });

app.get("/update/:updateId", async (req, res) => {
  try {
    const updateId = req.params.updateId;
    const post = await BlogPost.findOne({ _id: updateId });
    if (post) {
      res.render("update", { title: post.title, content: post.content, id: updateId });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// app.post("/update", (req, res) => {
//   const updateId = req.body.id;
//   const updatedTitle = req.body.title;
//   const updatedContent = req.body.post;

//   BlogPost.updateOne(
//     { _id: updateId },
//     {
//       title: updatedTitle,
//       content: updatedContent,
//       postedDate: utilities.getDate(),
//     },
//     (err) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).send("Internal Server Error");
//       }
//       res.redirect("/");
//     }
//   );
// });

app.post("/update", async (req, res) => {
  const updateId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.post;

  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(
      updateId,
      {
        title: updatedTitle,
        content: updatedContent,
        postedDate: utilities.getDate(),
      },
      { new: true } // To return the updated document
    );

    if (updatedPost) {
      res.redirect("/");
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(process.env.PORT || 8000, () => {
    console.log("Backend server is running...")
})
