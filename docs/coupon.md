# Product Requirements Document: Frontend - Angular Coupon Management Tool

## 1. Introduction

This document outlines the requirements for the frontend component of the "Phiếu Bé Ngoan" (Good Behavior Coupons) management tool, which will be integrated into an existing Angular 18 website. This tool will allow the `GRAND_ADMIN` to manage coupons and pending reward requests.

## 2. Goal

To provide a user-friendly interface for the `GRAND_ADMIN` to effectively manage "Phiếu Bé Ngoan" and associated rewards.

## 3. Target Audience

- **Primary User:** `GRAND_ADMIN` with access to the administrative panel of the website.

## 4. Functional Requirements

### 4.1. Navigation

- A new menu item labeled "Coupon Management" will be added to the administration panel.
- This menu item will be accessible only to users identified as `GRAND_ADMIN`.
- Clicking this menu item will navigate the user to the route `/admin/tool/coupon`.

### 4.2. Page Layout

- The Coupon Management page will be divided into two main sections:
  - **Pending Rewards List:** Displayed at the top, occupying approximately 1/3 of the page.
  - **Coupons List:** Displayed below the pending rewards list, occupying approximately 2/3 of the page.

### 4.3. Pending Rewards List

- This section will display a list of rewards that have been requested but not yet processed.
- Each item in the list will display relevant information (to be determined in backend requirements for reward).
- **Edit Functionality:** For each reward item, there will be an "Edit" button, visible only to the `GRAND_ADMIN` with email `mean.ghost.site@gmail.com`. Clicking this button will allow the admin to modify the reward details (fields to be determined).
- **Delete Functionality:** For each reward item, there will be a "Delete" button, visible only to the `GRAND_ADMIN` with email `mean.ghost.site@gmail.com`. Clicking this button will prompt for confirmation and then delete the reward.

### 4.4. Coupons List

- This section will display a list of all available "Phiếu Bé Ngoan".
- Each item in the list will display the following properties:
  - ID (Read-only)
  - Description (Maximum 36 characters)
  - Status (used/unused)
  - Usage Purpose
- **Edit Functionality:** For each coupon item, there will be an "Edit" button, visible only to the `GRAND_ADMIN` with email `mean.ghost.site@gmail.com`. Clicking this button will allow the admin to modify the Description and Usage Purpose. The Status cannot be edited directly.
- **Delete Functionality:** For each coupon item, there will be a "Delete" button, visible only to the `GRAND_ADMIN` with email `mean.ghost.site@gmail.com`. Clicking this button will prompt for confirmation and then delete the coupon.

### 4.5. Coupon Quantity Management

- A section or button (to be determined) will be available on the page, visible only to the `GRAND_ADMIN` with email `mean.ghost.site@gmail.com`, to increase or decrease the total number of "Phiếu Bé Ngoan". This functionality will likely involve input fields for the number of coupons to add or remove.

### 4.6. Coupon Redemption Functionality

- A "Redeem Coupon" button will be available, visible only to the `GRAND_ADMIN` with email `honghue.hr@gmail.com`.
- Clicking this button will trigger a modal or interface allowing the admin to:
  - Select one or more "unused" coupons from the list.
  - Select a "Pending Reward" from the list above.
  - Upon confirmation, the selected coupons' status will be updated to "Used", and the "Usage Purpose" field will be automatically populated with the description of the redeemed reward.

## 5. Technical Requirements

### 5.1. Technology Stack

- Angular 18
- TypeScript
- Integration with the existing website's authentication and authorization mechanisms.
- Communication with the backend API via HTTP requests.

### 5.2. API Endpoints

- The frontend will consume the following backend API endpoints:
  - `GET /coupon`: To fetch the list of coupons.
  - `POST /coupon`: To create new coupons (via the quantity management feature).
  - `PUT /coupon/:id`: To update existing coupons.
  - `DELETE /coupon/:id`: To delete coupons.
  - `PUT /coupon/redeem`: To redeem coupons (payload will include an array of coupon IDs and the reward ID).
  - `GET /reward`: To fetch the list of rewards.
  - `POST /reward`: To create new rewards.
  - `PUT /reward/:id`: To update existing rewards.
  - `DELETE /reward/:id`: To delete rewards.

### 5.3. Security

- Access to the entire `/admin/tool/coupon` route and its functionalities will be restricted to authenticated users with the `GRAND_ADMIN` role.
- Specific actions (edit, delete for both coupons and rewards, increase/decrease coupon quantity) will be further restricted to the `GRAND_ADMIN` with the specified email addresses.

### 5.4. User Interface

- The UI should be responsive and consistent with the existing website's design language.
- Appropriate error handling and user feedback mechanisms should be implemented.

## 6. Future Considerations

- Filtering and sorting options for the coupons and rewards lists.
- More detailed information displayed for each reward.
- History of redeemed coupons.
