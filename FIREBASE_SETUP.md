# Setting Up Your Own Firebase Project for ShieldChat

To run this application securely with your own backend, you need to set up a free Firebase project. This guide will walk you through the process step-by-step.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and log in with your Google account.
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g., `ShieldChat-App`).
4. You can disable Google Analytics for this project as it's not strictly necessary.
5. Click **Create project** and wait for it to finish. Click **Continue**.

## 2. Register Your Web App

1. On your new project's dashboard, click the **Web** icon (it looks like `</>`) to add a web app.
2. Give your app a register nickname (e.g., `ShieldChat Web`).
3. Click **Register app**.

## 3. Extract the Firebase Config

After registering the app, Firebase will show you a configuration block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "myapp-project-123.firebaseapp.com",
  projectId: "myapp-project-123",
  storageBucket: "myapp-project-123.appspot.com",
  messagingSenderId: "65211879809",
  appId: "1:65211879909:web:3ae38ef1cb4fa3e990cb8c"
};
```

1. **Copy this entire `firebaseConfig` object.**
2. In your local codebase, open `src/firebase-config.js` and **replace** the existing `firebaseConfig` object with the one you just copied from your own project.

## 4. Enable Google Authentication

1. In the Firebase Console, go to **Build** > **Authentication** from the left sidebar.
2. Click **Get started**.
3. Go to the **Sign-in method** tab.
4. Click on **Google** under the "Add new provider" section.
5. Toggle the **Enable** switch in the top right.
6. Provide a *project support email* (select your email address from the dropdown).
7. Click **Save**.

## 5. Enable Firestore Database

1. In the Firebase Console, go to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Select an appropriate location (closest to you) and click **Next**.
4. Start in **Test mode** (or production mode) and click **Create**.

### Setting Up Basic Security Rules

Once your database is created, you must update the security rules to allow reading and writing messages.
1. Click the **Rules** tab in the Firestore dashboard.
2. Replace everything with the following rules:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      // Allows anyone logged in to create or read messages.
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click **Publish**.

## 6. (Optional) Run the App Locally

If everything is set up correctly, start your development server:
```bash
npm install
npm run dev
```

Your app is now firmly connected to your very own robust real-time database and auth provider! You can start creating secure end-to-end encrypted rooms.
