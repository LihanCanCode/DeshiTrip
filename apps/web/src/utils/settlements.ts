export interface SplitEntry {
    user?: string;
    guestName?: string;
    amount: number;
}

export interface ExpenseData {
    amount: number;
    paidBy?: { _id: string; name: string } | string;
    payerGuestName?: string;
    splitBetween: SplitEntry[];
    type?: 'Expense' | 'Settlement';
}

export interface SettlementItem {
    name: string;
    amount: number;
}

/**
 * Calculates net balances for a group of expenses.
 * Replicates the logic from the backend's getExpenseSummary.
 */
export function calculateSettlements(expenses: ExpenseData[]): SettlementItem[] {
    const balances: Record<string, { amount: number; name: string }> = {};

    expenses.forEach((exp) => {
        const amount = Number(exp.amount) || 0;

        // Handle Payer (gets credit)
        let payerKey = '';
        let payerName = '';

        if (exp.payerGuestName) {
            payerKey = `guest:${exp.payerGuestName}`;
            payerName = exp.payerGuestName + ' (Guest)';
        } else if (exp.paidBy) {
            const paidBy = exp.paidBy;
            if (typeof paidBy === 'string') {
                payerKey = paidBy;
                payerName = 'Member'; // We'll resolve names if possible, but ID is enough for math
            } else {
                payerKey = paidBy._id;
                payerName = paidBy.name;
            }
        }

        if (payerKey) {
            if (!balances[payerKey]) balances[payerKey] = { amount: 0, name: payerName };
            balances[payerKey].amount += amount;
        }

        // Handle Split (gets debt)
        if (exp.splitBetween && Array.isArray(exp.splitBetween)) {
            exp.splitBetween.forEach((split) => {
                let splitKey = '';
                let splitName = '';

                if (split.user) {
                    splitKey = split.user;
                    splitName = 'Member';
                } else if (split.guestName) {
                    splitKey = `guest:${split.guestName}`;
                    splitName = split.guestName + ' (Guest)';
                }

                if (splitKey) {
                    if (!balances[splitKey]) balances[splitKey] = { amount: 0, name: splitName };
                    balances[splitKey].amount -= split.amount;
                }
            });
        }
    });

    // Format and filter small amounts
    return Object.values(balances)
        .map((item) => ({
            name: item.name,
            amount: Math.round(item.amount * 100) / 100 // Round to 2 decimal places
        }))
        .filter((item) => Math.abs(item.amount) > 0.01)
        .sort((a, b) => b.amount - a.amount);
}
