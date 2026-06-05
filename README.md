# Recipefy Web/Mobile App

## Project Description

Recipefy is a modern, full-stack recipe application designed for discovering recipes and sharing creations with a community. Built with a React frontend and an Express/Node backend, the application displays recipes from multiple sources: third-party recipe APIs, including Edamam when credentials are configured, a DummyJSON fallback for official recipe data, and a custom Firebase database for user-submitted recipes.

The platform features a responsive UI built with React, Vite, and Tailwind CSS v4, Firebase Authentication, Firestore data storage, Firebase Storage image uploads, a commenting and rating system, saved recipes, admin review tools, and an integrated AI recipe assistant powered by the OpenAI API when an API key is available.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [How to Use Project](#how-to-use-project)
- [Major Components and Features](#major-components-and-features)
- [Status of Features](#status-of-features)
- [API Information](#api-information)
- [Database Overview](#database-overview)
- [Technology Stack](#technology-stack)
- [Credits](#credits)

## Installation

### Clone the Repository

```bash
git clone https://github.com/tulipbayy/forge-recipe-app.git
cd forge-recipe-app
```

### Setup Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5001
```

Note: You need a `.env` file in the `backend/` directory containing your OpenAI key and Edamam API credentials if you want those services enabled. You must also place the Firebase Admin service account file at `backend/serviceAccountKey.json`, or provide the service account through an environment variable.

### Setup Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the URL printed by Vite, usually:

```text
http://localhost:5173
```

Note: You need a `.env` file in the `frontend/` directory containing your Vite Firebase configuration keys.

## Environment Variables

### Backend `.env`

Create `backend/.env`:

```env
PORT=5001

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key
EDAMAM_ACCOUNT_USER=your_edamam_account_user

FIREBASE_SERVICE_ACCOUNT=optional_json_string_service_account
```

`OPENAI_API_KEY` is optional for local testing. If it is missing, the chatbot route returns a basic fallback response instead of calling OpenAI.

`EDAMAM_APP_ID` and `EDAMAM_APP_KEY` are optional for local testing. If they are missing or the Edamam request fails, the backend falls back to DummyJSON recipes.

### Frontend `.env`

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Firebase Authentication, Firestore, and Firebase Storage must be enabled in the Firebase console for all user features to work.

## How to Use Project

1. Start the backend server from the `backend/` directory.
2. Start the frontend development server from the `frontend/` directory.
3. Open the Vite URL in your browser.
4. Use the navigation bar or side menu to move between pages.
5. Sign in with the login button to access user features.

Main user flows:

- Discover recipes from official API data and community-created recipes.
- Search and filter recipes from the Recipe page.
- Click a recipe card to view ingredients, instructions, ratings, comments, image uploads, and chatbot help.
- Save recipes and view them later from My Recipes.
- Create a new recipe with title, description, ingredients, instructions, category, and image upload.
- Comment on recipes, reply to comments, and upvote replies.
- Use the admin page to approve or reject community recipe submissions if the logged-in user has `isAdmin: true` in Firestore.

## Major Components and Features

### Frontend Pages

- Home Page: Landing page with welcome content and navigation into the app.
- Recipe Page: Displays official and community recipes with search and filters.
- Recipe Detail Page: Shows recipe details, comments, replies, ratings, save action, image upload, and chatbot.
- My Recipes Page: Allows users to switch between created recipes and saved recipes.
- Create Recipe Page: Lets authenticated users submit new community recipes.
- Admin Page: Allows admin users to review, approve, and reject community recipes.

### Backend Routes

- `/api/recipes`: Fetches official and community recipes, searches recipes, creates community recipes, fetches details, and handles ratings.
- `/api/users`: Handles user profiles, saved recipes, created recipes, and user-specific data.
- `/api/comments`: Handles comments, replies, deletes, and reply upvotes.
- `/api/chat`: Handles recipe assistant chatbot messages.
- `/api/admin`: Handles pending, published, rejected, approve, reject, and admin stats routes.
- `/api/savedRecipes`: Legacy saved recipe route used by part of the app.

### Key Features

- Dynamic API routing through Express.
- Responsive React layout.
- Firebase login and protected user features.
- Firestore storage for users, community recipes, comments, saved recipes, and ratings.
- Firebase Storage uploads for recipe images and user dish photos.
- Admin approval workflow for user-submitted recipes.
- AI chatbot with OpenAI support and fallback responses.
- Comments, replies, reply upvotes, and ratings.

## Status of Features

| Feature | Status | Notes |
| --- | --- | --- |
| Home page | Complete | Provides app entry point and navigation. |
| Recipe browsing | Complete | Supports official recipes and approved community recipes. |
| Recipe search/filtering | Complete | Uses frontend filters and backend recipe/search routes. |
| Recipe detail page | Complete | Displays recipe content, save action, comments, image upload, ratings, and chatbot. |
| User authentication | Complete | Uses Firebase Authentication. |
| Create recipe | Complete | Authenticated users can submit community recipes. |
| Admin review | Complete | Requires Firestore user document with `isAdmin: true`. |
| Saved recipes | Complete | Users can save and remove recipes. |
| Comments and replies | Complete | Users can comment, reply, delete authorized comments, and upvote replies. |
| Ratings | Complete | Users can rate recipes and view ratings. |
| Chatbot | Complete | Uses OpenAI when configured and fallback responses when not configured. |
| Image uploads | Complete | Uses Firebase Storage; requires storage configuration and rules. |
| Deployment | Future step | Local development setup is documented. |

## API Information

### Edamam Recipe API

Recipefy can use the Edamam Recipe API for official recipe search when the required credentials are provided in `backend/.env`.

Required backend variables:

- `EDAMAM_APP_ID`
- `EDAMAM_APP_KEY`
- `EDAMAM_ACCOUNT_USER`

### DummyJSON Recipes API

If Edamam is not configured or an Edamam request fails, the backend falls back to DummyJSON recipe endpoints. This keeps the app usable during local development and demos.

### OpenAI API

The chatbot route uses the OpenAI API when `OPENAI_API_KEY` is configured. The assistant receives the current recipe title, ingredients, and instructions so it can answer recipe-specific questions.

If the key is missing or the API call fails, the chatbot returns a basic fallback response.

### Firebase

Firebase is used for:

- Authentication
- Firestore database
- Firebase Storage image uploads
- Firebase Admin verification on the backend

Backend Firebase Admin setup requires either:

- `backend/serviceAccountKey.json`
- or `FIREBASE_SERVICE_ACCOUNT` in `backend/.env`

## Database Overview

Main Firestore collections:

- `users`: User profile data, email, profile picture, admin flag, and saved recipe references.
- `recipes`: Community recipes and cached official recipe data.
- `comments`: Recipe comments and replies.
- `ratings`: User recipe ratings.
- `savedRecipes`: Saved recipe records by user.
- `chatConversations`: Planned structure for chatbot conversation history.
- `userImages`: User-uploaded recipe images.

Important admin note:

To access the Admin page, a user's Firestore document in `users` must include:

```json
{
  "isAdmin": true
}
```

## Technology Stack

Frontend:

- React
- Vite
- React Router
- Tailwind CSS v4
- Firebase client SDK

Backend:

- Node.js
- Express.js
- Express Rate Limit
- Firebase Admin SDK
- OpenAI SDK

Database and Storage:

- Google Firebase Authentication
- Google Firestore
- Firebase Storage

External APIs:

- Edamam Recipe API
- DummyJSON Recipes API
- OpenAI API

Project management:

- GitHub
- Feature branches and pull requests
- Trello
- Figma

## Credits

Developed by: Ryan Taylor, Bayansulu Tulepbayeva, Ibaad Hassan, Sunshine Huang, Jun Hong

Special thanks to the instructional team for guidance and project requirements.
