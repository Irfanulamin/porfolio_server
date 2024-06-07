const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("portfolio");
    const collection = db.collection("users");
    const skillsCollection = client.db("portfolio").collection("skills");
    const blogsCollection = client.db("portfolio").collection("blogs");
    const projectsCollection = client.db("portfolio").collection("projects");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

    app.get("/skills", async (req, res) => {
      try {
        const result = await skillsCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/add-skills", async (req, res) => {
      const addedSkills = req.body;
      const result = await skillsCollection.insertOne(addedSkills);
      res.status(200).send(result);
    });

    app.put("/update-skills/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedSkillData = req.body;

        const updatedDetails = {
          $set: {
            title: updatedSkillData.title,
            imageUrl: updatedSkillData.imageUrl,
          },
        };
        const result = await skillsCollection.updateOne(filter, updatedDetails);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.delete("/delete-skills/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await skillsCollection.deleteOne(query);
        console.log(id, query, result);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/blogs", async (req, res) => {
      try {
        const result = await blogsCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/blogs/:id", async (req, res) => {
      try {
        const id = req.params.id; // Get the _id from request parameters
        const result = await blogsCollection.findOne({ _id: ObjectId(id) }); // Find the blog by _id
        if (result) {
          res.status(200).send(result);
        } else {
          res.status(404).send({ message: "Blog not found" });
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/add-blogs", async (req, res) => {
      const addedBlogs = req.body;
      const time_published = new Date().toLocaleDateString("en-CA");
      const addedBlogwithTime = { ...addedBlogs, time_published };
      const result = await blogsCollection.insertOne(addedBlogwithTime);
      res.status(200).send(result);
    });

    app.put("/update-blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedBlogData = req.body;

        const updatedDetails = {
          $set: {
            blog_name: updatedBlogData.blog_name,
            blog_image: updatedBlogData.blog_image,
            blog_description: updatedBlogData.blog_description,
          },
        };
        const result = await blogsCollection.updateOne(filter, updatedDetails);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.delete("/delete-blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogsCollection.deleteOne(query);
        console.log(id, query, result);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.get("/projects", async (req, res) => {
      try {
        const result = await projectsCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/add-projects", async (req, res) => {
      const addedBlogs = req.body;
      const result = await projectsCollection.insertOne(addedBlogs);
      res.status(200).send(result);
    });

    app.put("/update-projects/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedProjectData = req.body;
        const filteredFeatures = updatedProjectData.features.filter(
          (feature) => feature !== ""
        );
        const updatedDetails = {
          $set: {
            project_name: updatedProjectData.project_name,
            project_image: updatedProjectData.project_image,
            project_description: updatedProjectData.project_description,
            features: filteredFeatures,
            github_link: updatedProjectData.github_link,
            deploy_link: updatedProjectData.deploy_link,
          },
        };
        const result = await projectsCollection.updateOne(
          filter,
          updatedDetails
        );
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.delete("/delete-projects/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await projectsCollection.deleteOne(query);
        console.log(id, query, result);
        res.status(200).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date().toLocaleDateString("en-CA"),
  };
  res.json(serverStatus);
});
