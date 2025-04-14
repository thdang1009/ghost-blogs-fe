# Product Requirements Document: Configurable Default Coupon Image

**1. Introduction**

This document outlines the requirements for a new feature that will allow administrators to configure a default image to be displayed for coupons when no specific image is uploaded. This feature aims to provide more flexibility and branding options for coupons within the application.

**2. Goals**

* Enable administrators to set a global default image for coupons.
* Improve visual consistency for coupons that do not have a unique image assigned.
* Provide a fallback mechanism to ensure a placeholder image is always displayed for coupons.

**3. User Stories**

* **As an administrator,** I want to be able to navigate to a configuration page in the admin panel.
* **As an administrator,** I want to see a dropdown list of all uploaded files on the default coupon image configuration page.
* **As an administrator,** I want to be able to select an image from the dropdown list to set it as the default coupon image.
* **As an administrator,** I want to be able to confirm my selection by clicking a button.
* **As a user,** I want to see the configured default coupon image if a specific coupon does not have an image uploaded.
* **As a user,** I want to see the original default image (`assets/img/coupon-blank.jpg`) if the administrator has not configured a default image or if the configured image is no longer available.

**4. Technical Design**

**4.1. Admin Configuration Page**

* **Navigation:** A new item labeled "Coupon Settings" will be added to the admin operation menu. Clicking this item will navigate the administrator to the coupon configuration page.
* **UI Elements:**
    * **Dropdown (mat-select):** This dropdown will be populated with a list of all uploaded files. The data for this dropdown will be fetched from the same API used in the post-edit component (refer to `post-edit.component.ts` for API details, likely a GET request to an endpoint for managing uploaded files). The display value for each option in the dropdown should be the filename or a user-friendly representation of the uploaded file.
    * **Confirm Button (Button A):** A button labeled "Save Default Image" will be present next to the dropdown.

**4.2. API Endpoints**

* **GET Uploaded Files:** (Implementation detail - existing API, refer to `post-edit.component.ts`) This API is used to fetch the list of available uploaded files for the dropdown.
* **POST `/v1/config`:** This API endpoint will be called when the "Save Default Image" button is clicked. The request body will be a JSON object with the following structure:
    ```json
    {
      "defaultCouponImage": "path/to/selected_image_filename.jpg"
    }
    ```
    The backend will store this configuration value.
* **GET `/v1/config?keys=defaultCouponImage`:** This API endpoint will be called when the coupon page is loaded (specifically before the `CouponDetailDialogComponent` is rendered). The response will be a JSON object containing the default coupon image configuration:
    ```json
    {
      "defaultCouponImage": "path/to/default_coupon_image.jpg"
    }
    ```
    If no default image has been configured, the `defaultCouponImage` field in the response will be `null`.

**4.3. Frontend Implementation**

* **Coupon Page Load:** When the coupon page is loaded, an API call to `GET /v1/config?keys=defaultCouponImage` will be made.
* **CouponDetailDialogComponent:**
    * The `CouponDetailDialogComponent` currently uses `assets/img/coupon-blank.jpg` as the default image. This will be modified.
    * When the component initializes, it will check the value returned from the `GET /v1/config?keys=defaultCouponImage` API call.
    * If the `defaultCouponImage` value is not `null`, the component will use the value as the image source.
    * If the `defaultCouponImage` value is `null`, the component will fall back to using `assets/img/coupon-blank.jpg`.

**5. UI/UX Design**

* **Admin Menu:** The "Coupon Settings" menu item should be placed logically within the admin operation menu, likely under a "Settings" or "Configuration" section.
* **Configuration Page:**
    * The page should have a clear heading like "Default Coupon Image Configuration".
    * The dropdown should be labeled clearly, e.g., "Select Default Coupon Image".
    * The "Save Default Image" button should be prominent and clearly indicate its action.
    * Consider providing a preview of the currently selected default image (optional, but recommended for better UX).

**6. Acceptance Criteria**

* A "Coupon Settings" item exists in the admin operation menu, leading to the coupon configuration page.
* The default coupon image configuration page loads a dropdown list populated with uploaded files fetched from the appropriate API.
* An administrator can select an image from the dropdown.
* Clicking the "Save Default Image" button successfully calls the `POST /v1/config` API with the selected image filename as the `defaultCouponImage` value in the payload.
* When the coupon page loads and the `CouponDetailDialogComponent` is initialized, a call is made to `GET /v1/config?keys=defaultCouponImage`.
* If a default coupon image is configured (API returns a non-null value), that image is displayed in the `CouponDetailDialogComponent` instead of `assets/img/coupon-blank.jpg`.
* If no default coupon image is configured (API returns `null`), the `CouponDetailDialogComponent` displays `assets/img/coupon-blank.jpg`.
* The application handles cases where the configured default image file might no longer exist (e.g., due to file deletion), falling back to `assets/img/coupon-blank.jpg` in such scenarios.

**7. Future Considerations (Optional)**

* Allow administrators to upload a new default image directly from this configuration page.
* Implement validation to ensure the selected file is a valid image format.
* Provide error handling and feedback to the administrator upon saving the default image configuration.