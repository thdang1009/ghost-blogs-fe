# Product Requirements Document: Google Analytics Dashboard Metrics

## 1. Introduction

This document outlines the requirements for fetching and displaying key metrics from Google Analytics (GA4) within the blog website's dashboard application. The goal is to provide a clear and informative overview of the blog's performance based on data obtained from Google Analytics.

## 2. Goal

To retrieve relevant metrics from Google Analytics (GA4) using the Google Analytics Data API (v1) and display them within the blog's dashboard application. This will enable users to monitor the blog's performance, understand audience behavior, and make data-driven decisions for content strategy and website optimization.

## 3. Target Metrics

The following metrics should be fetched from Google Analytics and displayed on the dashboard. For each metric, we will identify the likely corresponding metric name and relevant dimensions within the Google Analytics Data API v1. Please refer to the official Google Analytics Data API v1 documentation for the most accurate and up-to-date details on API endpoints, request parameters, and response structures.

**3.1. Total Users**

- **Description:** The total number of unique visitors who have interacted with the blog within a specified period.
- **GA4 Metric Name:** `totalUsers`
- **Relevant Dimensions:** `dateRange`
- **API Request:** Use the `runReport` method. Include `totalUsers` in the `metrics` array and `dateRanges` in the request body.
- **Expected Response:** The response will contain rows with the total count of unique users for the specified date range(s).

**3.2. New vs. Returning Users**

- **Description:** A breakdown of users into those who are new to the blog and those who have visited before.
- **GA4 Metrics Names:** `newUsers`, `returningUsers` (can be derived by segmenting `totalUsers` by the `userType` dimension)
- **Relevant Dimensions:** `dateRange`, `userType` (filter for 'New' and 'Returning')
- **API Request:** Use the `runReport` method. Include `totalUsers` in the `metrics` array and `userType` in the `dimensions` array. Filter the `userType` dimension to get separate counts for 'New' and 'Returning' users.
- **Expected Response:** The response will contain rows with `userType` ('New', 'Returning') and the corresponding user count for the specified date range(s).

**3.3. Page Views**

- **Description:** The total number of times pages on the blog have been viewed.
- **GA4 Metric Name:** `screenPageViews`
- **Relevant Dimensions:** `dateRange`
- **API Request:** Use the `runReport` method. Include `screenPageViews` in the `metrics` array and `dateRanges` in the request body.
- **Expected Response:** The response will contain rows with the total number of page views for the specified date range(s).

**3.4. Sessions**

- **Description:** The number of distinct visits to the blog.
- **GA4 Metric Name:** `sessions`
- **Relevant Dimensions:** `dateRange`
- **API Request:** Use the `runReport` method. Include `sessions` in the `metrics` array and `dateRanges` in the request body.
- **Expected Response:** The response will contain rows with the total number of sessions for the specified date range(s).

**3.5. Average Session Duration**

- **Description:** The average length of a session on the blog, typically measured in seconds.
- **GA4 Metric Name:** `averageSessionDuration`
- **Relevant Dimensions:** `dateRange`
- **API Request:** Use the `runReport` method. Include `averageSessionDuration` in the `metrics` array and `dateRanges` in the request body.
- **Expected Response:** The response will contain rows with the average session duration in seconds for the specified date range(s).

**3.6. Pages per Session**

- **Description:** The average number of pages viewed during a session.
- **GA4 Metric Name:** `screenPageViewsPerSession`
- **Relevant Dimensions:** `dateRange`
- **API Request:** Use the `runReport` method. Include `screenPageViewsPerSession` in the `metrics` array and `dateRanges` in the request body.
- **Expected Response:** The response will contain rows with the average number of pages viewed per session for the specified date range(s).

**3.7. Bounce Rate**

- **Description:** The percentage of sessions where users landed on a page and left without interacting with the blog further.
- **GA4 Metric Name:** `bounceRate`
- **Relevant Dimensions:** `dateRange`
- **API Request:** Use the `runReport` method. Include `bounceRate` in the `metrics` array and `dateRanges` in the request body.
- **Expected Response:** The response will contain rows with the bounce rate (as a percentage) for the specified date range(s).

**3.8. Traffic Sources**

- **Description:** The origin of the traffic to the blog (e.g., organic search, direct, referral, social).
- **GA4 Metric Name:** `sessions` (or `totalUsers`, `screenPageViews`)
- **Relevant Dimensions:** `dateRange`, `sessionSource`, `sessionMedium`
- **API Request:** Use the `runReport` method. Include a relevant metric (e.g., `sessions`) in the `metrics` array and `sessionSource`, `sessionMedium` in the `dimensions` array.
- **Expected Response:** The response will contain rows with the source, medium, and the corresponding metric value for the specified date range(s).

**3.9. Device Breakdown (Desktop, Mobile, Tablet)**

- **Description:** The distribution of blog traffic across different device categories.
- **GA4 Metric Name:** `sessions` (or `totalUsers`, `screenPageViews`)
- **Relevant Dimensions:** `dateRange`, `deviceCategory`
- **API Request:** Use the `runReport` method. Include a relevant metric in the `metrics` array and `deviceCategory` in the `dimensions` array.
- **Expected Response:** The response will contain rows with the device category ('desktop', 'mobile', 'tablet') and the corresponding metric value for the specified date range(s).

**3.10. Location (Country/Region)**

- **Description:** The geographical distribution of blog users.
- **GA4 Metric Name:** `sessions` (or `totalUsers`)
- **Relevant Dimensions:** `dateRange`, `country`, (optionally) `region`
- **API Request:** Use the `runReport` method. Include a relevant metric in the `metrics` array and `country` (or `region`) in the `dimensions` array.
- **Expected Response:** The response will contain rows with the country (or region) and the corresponding metric value for the specified date range(s).

**3.11. Top Performing Pages/Posts (by Page Views)**

- **Description:** The blog pages or posts with the highest number of views.
- **GA4 Metric Name:** `screenPageViews`
- **Relevant Dimensions:** `dateRange`, `pagePath` (or `pageTitle`)
- **API Request:** Use the `runReport` method. Include `screenPageViews` in the `metrics` array and `pagePath` (or `pageTitle`) in the `dimensions` array. You will likely want to order the results by `screenPageViews` in descending order and limit the number of rows returned.
- **Expected Response:** The response will contain rows with the page path (or title) and the corresponding number of page views, ordered by views.

**3.12. Average Time on Page**

- **Description:** The average amount of time users spend viewing a specific page.
- **GA4 Metric Name:** `averageEngagementTime`
- **Relevant Dimensions:** `dateRange`, `pagePath` (or `pageTitle`)
- **API Request:** Use the `runReport` method. Include `averageEngagementTime` in the `metrics` array and `pagePath` (or `pageTitle`) in the `dimensions` array.
- **Expected Response:** The response will contain rows with the page path (or title) and the average engagement time for that page.

**3.13. Exit Pages**

- **Description:** The last pages users visited before leaving the blog. Note that a direct equivalent of "Exit Pages" as in Universal Analytics doesn't exist in GA4. You can approximate this by looking at pages with a high number of exits by analyzing page sequences or using explorations in the GA4 interface. For the API, you might analyze event data (`page_view`, `session_start`) to infer exit behavior, or focus on `screenPageViews` with `pagePath`.
- **GA4 Metric Name:** `screenPageViews`
- **Relevant Dimensions:** `dateRange`, `pagePath`
- **API Request:** Use the `runReport` method with `screenPageViews` and `pagePath`. Further analysis of user behavior might be needed to pinpoint exit points.
- **Expected Response:** Rows with page paths and their view counts, which can be further analyzed.

**3.14. Internal Search Terms**

- **Description:** The terms users search for within the blog's internal search functionality. This requires that internal site search tracking is set up in Google Analytics as events.
- **GA4 Metric Name:** Based on the event name you configured for internal search (e.g., `view_search_results`). You'll likely look at the event parameter for the search term.
- **Relevant Dimensions:** `dateRange`, Event parameter for search term (e.g., `searchTerm` if you set it up).
- **API Request:** Use the `runReport` method, filtering for the internal search event and including the relevant event parameter as a dimension.
- **Expected Response:** Rows with the search terms and the count of times they were searched for.

**3.15. Comments**

- **Description:** The number of comments submitted on blog posts. This typically requires sending comment events to Google Analytics.
- **GA4 Metric Name:** Based on the event name you configured for comments (e.g., `comment`).
- **Relevant Dimensions:** `dateRange`, (potentially) `pagePath` or `pageTitle` to see comments per post.
- **API Request:** Use the `runReport` method, filtering for the comment event.
- **Expected Response:** The number of comment events, optionally broken down by page.

**3.16. Social Shares**

- **Description:** The number of times blog content has been shared on social media platforms. This requires tracking social sharing events.
- **GA4 Metric Name:** Based on the event name you configured for social shares (e.g., `share`). You might also have an event parameter for the social network.
- **Relevant Dimensions:** `dateRange`, (optionally) `pagePath`, `socialNetwork` (if tracked as a parameter).
- **API Request:** Use the `runReport` method, filtering for the share event. Include `socialNetwork` as a dimension if available.
- **Expected Response:** The number of share events, optionally broken down by page or social network.

**3.17. Key Events/Conversions (if applicable)**

- **Description:** Tracking of specific actions that are important for the blog's goals, such as newsletter sign-ups, downloads, or contact form submissions, configured as conversions in GA4.
- **GA4 Metric Name:** The name of the conversion event you have set up (e.g., `sign_up`, `download`).
- **Relevant Dimensions:** `dateRange`, (potentially) `pagePath` or other relevant dimensions depending on the conversion event.
- **API Request:** Use the `runReport` method, filtering for the specific conversion event name.
- **Expected Response:** The number of times the conversion event occurred, optionally broken down by relevant dimensions.

## 4. API Details

- **Base API Endpoint:** `https://analyticsdata.googleapis.com/v1beta1/properties/{propertyId}:runReport` (replace `{propertyId}` with your GA4 property ID). For other methods like `batchRunReports`, consult the official documentation.
- **HTTP Method:** `POST`

## 5. Authentication

Your Angular application will need to be authenticated to access the Google Analytics Data API. This typically involves:

1.  Creating a Google Cloud project. DONE
2.  Enabling the Google Analytics Data API.
3.  Creating credentials (e.g., OAuth 2.0 client ID).
4.  Implementing an authentication flow in your Angular application to obtain an access token.

## 6. Further Information

For detailed information on API endpoints, request parameters, response structures, authentication methods, and more, please refer to the official Google Analytics Data API v1 documentation: [https://developers.google.com/analytics/devguides/reporting/data/v1](https://developers.google.com/analytics/devguides/reporting/data/v1)
