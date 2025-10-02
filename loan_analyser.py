#!/usr/bin/env python3
from typing import List, Dict

class Loan:
    def __init__(self, principal: float, annual_rate: float, term_years: int):
        self.principal = principal
        self.annual_rate = annual_rate
        self.term_years = term_years
        self.monthly_rate = annual_rate / 12
        self.total_months = term_years * 12

    def monthly_payment(self) -> float:
        r = self.monthly_rate
        n = self.total_months
        if r == 0:
            return self.principal / n
        return self.principal * r * (1 + r) ** n / ((1 + r) ** n - 1)

    def amortization_schedule(self) -> List[Dict[str, float]]:
        schedule = []
        balance = self.principal
        payment = self.monthly_payment()
        for month in range(1, self.total_months + 1):
            interest = balance * self.monthly_rate
            principal_paid = payment - interest
            balance -= principal_paid
            if balance < 0:
                principal_paid += balance
                balance = 0
            schedule.append({
                "month": month,
                "payment": round(payment,2),
                "principal_paid": round(principal_paid,2),
                "interest_paid": round(interest,2),
                "remaining_balance": round(balance,2)
            })
        return schedule

    def total_interest(self) -> float:
        return sum(p["interest_paid"] for p in self.amortization_schedule())

def demo():
    loan = Loan(10000, 0.05, 2)
    print("Monthly Payment:", round(loan.monthly_payment(),2))
    schedule = loan.amortization_schedule()
    print("Amortization Schedule (first 5 months):")
    for entry in schedule[:5]:
        print(entry)
    print("Total Interest Paid:", round(loan.total_interest(),2))

if __name__ == "__main__":
    demo()
