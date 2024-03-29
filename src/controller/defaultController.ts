import { Router } from "express";
import ProductModel from "../models/productModel";
import productModel from "../models/productModel";

const router = Router();

router.get('/products', async (req, res) => {
  try {
    const result = await ProductModel.find({}).exec();

    return res.status(200).json(result);
  } catch(err) {
    res.sendStatus(500);
  }
});

router.post('/product', async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const image = req.body.image;

  if(title !== undefined && description !== undefined && price !== undefined && image !== undefined) {
    return res.sendStatus(400);
  }

  try {
    await productModel.create({
      title,
      description,
      price,
      image
    });
    
    res.sendStatus(201);
  } catch(err) {
    res.sendStatus(500);
  }
});

export default router;