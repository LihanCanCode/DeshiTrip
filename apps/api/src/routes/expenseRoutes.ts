import { Router } from 'express';
import { createExpense, getGroupExpenses, getExpenseSummary } from '../controllers/expenseController';
import { scanReceipt } from '../controllers/scannerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

router.use(authMiddleware);

router.post('/', createExpense);
router.get('/group/:groupId', getGroupExpenses);
router.get('/summary/:groupId', getExpenseSummary);
router.post('/scan', scanReceipt);

export default router;
