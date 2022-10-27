import { Router } from 'express';
import { fetchProducts } from '../controllers';

const router = Router();

router.get('/', fetchProducts);

export const ProductsRouter = router;
