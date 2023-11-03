import express from "express";
import path from "path";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import { connectToDB } from "./config/dbConnection.js";
import { upload } from "./utils.js";

import { productsRouter } from "./routes/products.routes.js";
import { cartsRouter } from "./routes/carts.routes.js";
import { viewsRouter } from "./routes/views.routes.js";
import { ProductManager } from "./persistence/classes/ProductManager.js";
import { productsModel } from "./persistence/mongo/products.model.js";
import mongoose from "mongoose";

const port = 8080;
const app = express();

const httpServer = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
const io = new Server(httpServer);

connectToDB();

const productsService = new ProductManager();

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.post("/upload", upload.single("image"), (req, res) => {
  // Manejo de errores
  upload(req, res, function (err) {
    if (err) {
      console.error("Error al cargar el archivo:", err);
      res.status(500).json({ error: "Error al cargar el archivo." });
    } else {
      // El archivo se ha cargado correctamente
      res.send("Imagen subida con éxito.");
    }
  });
});

io.on("connection", async (socket) => {
  console.log("Client succesfully connected");
  const products = await productsService.getProducts();
  socket.emit("productList", products);

  socket.on("addProduct", async (data) => {
    await productsService.addProduct(data);
    const products = await productsService.getProducts();
    socket.emit("productList", products);
  });
});
