import { Router } from 'express';
import { createExpense, getGroupExpenses, getExpenseSummary } from '../controllers/expenseController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

router.use(authMiddleware);

router.post('/', createExpense);
router.get('/group/:groupId', getGroupExpenses);
router.get('/summary/:groupId', getExpenseSummary);

export default router;
