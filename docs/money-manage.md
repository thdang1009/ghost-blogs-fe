# Product Requirements Document: Money Management Web App (Inspired by Money Lover)

**1. Introduction**

- **1.1 Purpose:** This document outlines the requirements for a personal money management web application built using Angular. The application aims to help users track their income and expenses, create budgets, and gain insights into their financial habits, with a user interface and feature set inspired by the Money Lover mobile application.
- **1.2 Goals:**
  - Provide users with a clear and intuitive interface for managing their personal finances.
  - Enable users to easily record income and expense transactions.
  - Allow users to create and track budgets for various spending categories.
  - Generate insightful reports and visualizations of financial data.
  - Support multiple wallets for managing different types of funds.
  - Offer a user experience comparable to the Money Lover mobile application in terms of usability and key features.
- **1.3 Target Audience:** Individuals who want to actively manage their personal finances, track their spending, and achieve their financial goals. This includes users familiar with budgeting apps and those new to financial management tools.

**2. Feature Overview**

The money management web application will allow users to:

- Track income and expenses by category and wallet.
- Create and manage budgets for different expense categories.
- View financial reports and charts summarizing their income, expenses, and budget status.
- Manage multiple wallets for cash, bank accounts, credit cards, etc.
- Set financial goals and track their progress.
- Manage recurring transactions (income and expenses).

The application will be built using Angular for the front-end, ensuring a responsive and dynamic user experience.

**3. Functional Requirements**

- **3.1 Authentication and User Management:**
  - Users should be able to sign up for a new account using email and password or other social login options.
  - Users should be able to log in and log out of their accounts.
  - Users should be able to manage their profile information (e.g., name, email, password).
- **3.2 Dashboard:**
  - Upon login, users should be presented with a dashboard providing an overview of their financial status.
  - The dashboard should display key information such as:
    - Total balance across all wallets.
    - Summary of income and expenses for the current period (e.g., month).
    - Progress against their budgets (visual representation).
    - Quick access to add new transactions.
- **3.3 Transaction Management:**
  - Users should be able to add new income and expense transactions.
  - Each transaction should include:
    - Date
    - Amount
    - Category (with pre-defined and user-defined options)
    - Wallet (selection from their managed wallets)
    - Description (optional)
    - Option to attach an image/receipt (future enhancement).
  - Users should be able to view a list of their transactions, filtered by date, category, wallet, etc.
  - Users should be able to edit and delete existing transactions.
  - Support for recurring transactions with customizable frequency (daily, weekly, monthly, yearly).
- **3.4 Budget Management:**
  - Users should be able to create budgets for different expense categories (e.g., food, transportation, entertainment).
  - Users should be able to set a budget amount and period (e.g., monthly).
  - The application should visually display the progress of spending against each budget.
  - Users should be able to edit and delete existing budgets.
  - Option for budget carry-over or reset at the end of the period (future enhancement).
- **3.5 Wallet Management:**
  - Users should be able to create and manage multiple wallets (e.g., "Cash," "Checking Account," "Credit Card").
  - Each wallet should have a name and currency.
  - The dashboard and transaction forms should reflect the created wallets.
  - Ability to transfer funds between different wallets.
  - Option to set a starting balance for each wallet.
- **3.6 Reports and Analytics:**
  - Generate reports and charts to visualize financial data, including:
    - Income vs. Expense summary (bar chart, pie chart).
    - Spending by category (pie chart, bar chart).
    - Income by category (pie chart, bar chart).
    - Budget vs. Actual spending (bar chart).
    - Cash flow over time (line chart).
  - Users should be able to customize the time period for the reports (e.g., daily, weekly, monthly, yearly, custom range).
  - Ability to export reports in various formats (e.g., CSV, PDF) (future enhancement).
- **3.7 Goal Setting (Future Enhancement):**
  - Users should be able to set financial goals (e.g., saving for a down payment, paying off debt).
  - Ability to track progress towards these goals.
  - Visual representation of goal progress.
- **3.8 Search and Filtering:**
  - Users should be able to search for transactions based on keywords in the description or other relevant fields.
  - Users should be able to filter transactions by date range, category, wallet, and status (income/expense).
- **3.9 Settings and Preferences:**
  - Users should be able to set their default currency.
  - Option to customize categories and subcategories.
  - Ability to set up notifications and reminders (e.g., for recurring transactions, budget alerts).

**4. Non-Functional Requirements**

- **4.1 Performance:** The application should be responsive and load data quickly. Transactions and reports should be generated efficiently.
- **4.2 Usability:** The user interface should be intuitive, clean, and easy to navigate, similar to the Money Lover app.
- **4.3 Accessibility:** The application should strive to be accessible to users with disabilities, following accessibility guidelines.
- **4.4 Security:** User financial data should be securely stored and protected. Implement appropriate security measures against unauthorized access.
- **4.5 Reliability:** The application should be stable and function without errors. Data integrity should be maintained.
- **4.6 Scalability:** The application architecture should be scalable to handle a growing number of users and transactions.
- **4.7 Responsiveness:** The web application should be responsive and adapt to different screen sizes (desktop, tablet).

**5. User Stories**

- As a user, I want to easily add my daily expenses so I can track where my money is going.
- As a user, I want to create a monthly budget for groceries so I can control my spending in that category.
- As a user, I want to see a chart of my spending by category for the last month to understand my spending habits.
- As a user, I want to manage different wallets for my cash and bank accounts.
- As a user, I want to set a goal to save for a new laptop and see how much progress I've made.
- As a user, I want to record my monthly rent payment as a recurring expense.
- As a user, I want to search for a specific transaction by its description.
- As a user, I want to customize the categories of my income and expenses.

**6. Design Considerations (Inspired by Money Lover)**

- **Clean and Minimalist UI:** Focus on a clean and uncluttered design with easy-to-understand icons and labels, similar to Money Lover.
- **Intuitive Navigation:** Implement a straightforward navigation structure, possibly using a bottom navigation bar (if suitable for web) or a clear sidebar menu as seen in Money Lover screenshots.
- **Visualizations:** Utilize charts and graphs effectively to present financial data in an easy-to-grasp manner, mirroring the visual reporting in Money Lover.
- **Color Coding:** Use color-coding to differentiate between income and expenses, and to highlight budget status, similar to Money Lover's approach.
- **Floating Action Button (FAB):** Consider using a FAB for quickly adding new transactions, a common UI pattern in Money Lover and other finance apps.
- **Category Icons:** Use visually appealing icons for transaction categories, enhancing the user experience as seen in Money Lover.

**7. Technology Stack**

- **Frontend:** Angular
- **Backend:** NodeJS
- **Database:** MongoDB

**8. Success Metrics**

- Number of registered users.
- Daily/Monthly active users.
- Number of transactions recorded per user.
- Number of budgets created per user.
- Frequency of report generation.
- User retention rate.
- User satisfaction (measured through surveys or feedback).

**9. Future Enhancements (Post-MVP)**

- Bank account linking for automatic transaction updates.
- Bill payment reminders.
- Investment tracking.
- Debt management features.
- Collaborative budgeting for families.
- AI-powered insights and recommendations.

This PRD provides a solid foundation for the development of your money management web application inspired by Money Lover. Remember that this document is a living document and should be updated as the project evolves.
