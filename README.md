# NC News API

## Description

NC News is a back-end RESTful API built with Node.js, Express, and PostgreSQL for a news website. This API allows you to manage and interact with news articles, topics, comments, and users. It is designed as part of a project for the Northcoders back-end development course.

## Hosted Version

The hosted version of the project is live on Render, where the API is deployed. You can access it here:
https://be-news-ksrf.onrender.com/api

## Setup Instructions

Follow the steps below to set up and run the project locally.

1. Clone the Repository to your local machine: git clone https://github.com/Exyre/be-news.git
   cd be-nc-news

2. Install Dependencies: Make sure you have Node.js and npm installed, then install the         
   required dependencies: 
    npm install

3. Set Up Environment Variables:
   Create a `.env.test` file for the test database and a `.env.development` file for the development database.

4. Add the following values to both files

**.env.test**

PGDATABASE=nc_news_test

**.env.development**

PGDATABASE=nc_news_development

**.env.production**

DATABASE_URL=postgresql://postgres.drofrsfaypvofegdwfjr:database2025backend@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
NODE_ENV=production

5. Set Up the Local Database: Make sure you have PostgreSQL installed. Then, create the       
   required databases and run the seed script to populate them:
    npm run setup-dbs
    npm run seed-dev

6. Run the App Locally: Now that you've set up the environment files, you can start the server:
    npm start

7. To ensure everything is working correctly, you can run the tests with:
    npm test

8. Deploying the API (Optional)
   If you'd like to deploy the app to a hosting provider like Render, follow these steps:

    Sign up to Render.
    Connect your GitHub account to Render and select this repository.
    Set up a new Web Service on Render.
    Add the appropriate environment variables for the production environment (e.g., DATABASE_URL, NODE_ENV).
    Render will automatically build and deploy your app.
    Once the deployment is complete, you’ll get a live URL for your hosted API.