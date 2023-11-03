import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = "public/imgs";

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Obtén la categoría del producto desde la solicitud
    const category = req.body.category;
    // Define la ruta completa donde se guardarán las imágenes
    const destination = path.join(rootDir, category);
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    // Genera un nombre de archivo único
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

export default __dirname;
