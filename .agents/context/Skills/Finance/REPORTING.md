# Rule — Financial reporting

## Monthly report (deadline: 5th of the following month)
- MRR, churn, number of active/trial shops
- Costs: infra, SaaS, marketing, personnel — versus budget
- Remaining runway (months)

## Data principles
1. Single source: the `billing` table in the DB + exports from the payment gateway; never take numbers from third-party dashboards
2. Revenue recognized on an accrual basis (by service period), not by cash receipt date
3. Currency figures: VND, rounded to the nearest thousand; investor reports add a USD column at the end-of-period rate
4. Every report links to the original query/sheet for traceability
