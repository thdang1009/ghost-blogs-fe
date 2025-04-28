# Product Requirements Document: Voice Input for Todo App

**1. Introduction**

- **1.1 Purpose:** This document outlines the requirements for a new feature in the todo application that allows users to add new todo items or update the status of existing items using voice commands. This feature aims to provide a more convenient and hands-free way for users to manage their tasks.
- **1.2 Goals:**
  - Enable users to quickly add new tasks to their todo list using voice input.
  - Allow users to update the status of existing todo items (e.g., "Complete," "In Progress," "Todo") using voice commands based on similar content.
  - Improve user efficiency and convenience in managing their tasks.
  - Leverage the browser's Web Speech API for voice recognition.
  - Support both English and Vietnamese languages for voice commands.
  - Allow users to switch between languages using voice commands.
- **1.3 Target Audience:** Existing users of the todo application who may find voice input a faster or more accessible method for task management, especially when their hands are occupied.

**2. Feature Overview**

This feature will introduce a microphone button within the todo application interface. When clicked, it will activate voice recognition, allowing users to speak commands to create new tasks or update the status of existing ones. The system will parse the voice input based on a predefined format: `${status} ${content}`. Users can also switch between English and Vietnamese languages using voice commands.

**3. Functional Requirements**

- **3.1 Voice Input Button:**
  - The application will display a clearly identifiable microphone button within the main todo list view. The location should be intuitive for users (e.g., near the add new item input or as a floating action button).
  - Clicking the microphone button will initiate the browser's speech recognition functionality (via the Web Speech API).
- **3.2 Start/Stop Recording:**
  - Visual feedback will be provided to the user when voice recording is active (e.g., a pulsing animation on the microphone icon, a temporary message indicating "Listening...").
  - The application will automatically stop recording after a short period of inactivity or when the user indicates they are finished speaking.
  - A visual cue (e.g., a stop button or tapping the microphone icon again) will also allow the user to manually stop the recording.
- **3.3 Language Selection:**
  - The application will support both English and Vietnamese languages.
  - Users can switch between languages using voice commands:
    - "Set language to English" - Switches to English
    - "Set language to Vietnamese" or "Set language to Vietnam" - Switches to Vietnamese
  - The current language setting will be remembered during the session.
  - All user feedback messages will be displayed in the currently selected language.
- **3.4 Voice Parsing for New Items:**
  - The application will process the transcribed voice input.
  - It will attempt to parse the input based on the format `${status} ${content}`.
  - **Status Keywords:** Define a set of recognized status keywords in both English and Vietnamese:
    - English: "Todo," "Add," "New" for adding new items
    - Vietnamese: "Thêm," "Mới" for adding new items
  - **Content:** The remaining part of the voice input after the status keyword will be treated as the content of the new todo item.
  - Example:
    - English: Saying "Todo Buy groceries" should create a new todo item with the content "Buy groceries" and the status "Todo".
    - Vietnamese: Saying "Thêm mua đồ" should create a new todo item with the content "mua đồ" and the status "Todo".
- **3.5 Voice Parsing for Status Updates:**
  - If the parsed status keywords match an action for updating status, the application will search for existing todo items with similar content in the current view.
  - **Status Keywords for Updates:**
    - English: "Complete," "Done," "In Progress," "Update to," "Set to"
    - Vietnamese: "Hoàn thành," "Xong," "Đang làm," "Cập nhật," "Chuyển"
  - **Content Matching:** Implement a basic content similarity check (e.g., if the spoken content partially matches the text of an existing todo item).
  - **Update Logic:** If a single, reasonably similar item is found, its status will be updated to the spoken status.
  - **Ambiguity Handling:** If multiple similar items are found, or no similar items are found, provide feedback to the user in the appropriate language.
  - Example:
    - English: If you have an item "Pay bills" with status "Todo", saying "Complete Pay bills" should update its status to "Complete".
    - Vietnamese: If you have an item "Thanh toán hóa đơn" with status "Todo", saying "Hoàn thành thanh toán hóa đơn" should update its status to "Complete".
- **3.6 Input Handling and Validation:**
  - After parsing, the new todo item (for creation) will be added to the current list with the identified status and content.
  - For status updates, the status of the matched item will be updated in the view.
  - Provide visual confirmation to the user upon successful addition or update of a todo item (e.g., a brief success message or animation).
  - Handle cases where the voice input is unclear or does not match the expected format. Provide informative feedback to the user in the appropriate language.
- **3.7 Web Speech API Integration:**
  - The feature will utilize the browser's built-in Web Speech API for voice recognition.
  - Default language setting will be Vietnamese (vi-VN).
  - Handle potential issues related to browser compatibility and user permissions for microphone access. Inform the user if their browser does not support the Web Speech API.

**4. Non-Functional Requirements**

- **4.1 Performance:** Voice recognition and parsing should be reasonably fast, providing a near real-time experience for the user.
- **4.2 Usability:** The microphone button should be easily discoverable and the voice command format should be simple and intuitive. Clear feedback should be provided to the user throughout the process.
- **4.3 Accessibility:** Ensure the voice input feature adheres to accessibility guidelines as much as possible. Consider users with disabilities who may rely on voice input.
- **4.4 Reliability:** The voice recognition accuracy will depend on the browser's Web Speech API, but the application's parsing logic should be robust and handle various input scenarios gracefully.
- **4.5 Security:** Ensure user privacy by only processing voice input when explicitly initiated by the user and adhering to the security policies of the Web Speech API.

**5. User Stories**

- As a user, I want to be able to click a microphone button and say "Todo Buy milk" so that a new todo item with the text "Buy milk" and the status "Todo" is added to my list.
- As a user, I want to be able to click a microphone button and say "Thêm mua sữa" so that a new todo item with the text "mua sữa" and the status "Todo" is added to my list.
- As a user, I want to be able to click a microphone button and say "Complete Call John" to update the status of the existing todo item "Call John" to "Complete".
- As a user, I want to be able to click a microphone button and say "Hoàn thành gọi điện cho John" to update the status of the existing todo item "gọi điện cho John" to "Complete".
- As a user, I want to be able to switch between English and Vietnamese by saying "Set language to English" or "Set language to Vietnamese".
- As a user, I want to see a visual indication that the application is listening for my voice input.
- As a user, I want to receive clear feedback in my preferred language when my voice command is successfully processed or when there are any issues.
