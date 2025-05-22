# Project Overview

This is a full-stack chat application built with Next.js and Supabase that supports user authentication, file uploads, and real-time conversations.

# Features

*   User authentication (login, registration, password reset)
*   Chat management (create, delete, rename conversations)
*   PDF file uploads
*   Real-time chat interface
*   User-configurable settings
*   Theme customization (dark/light mode)

# Tech Stack

*   Next.js 14 (App Router)
*   Tailwind CSS
*   Next.js API Routes
*   PostgreSQL (Supabase)
*   Drizzle ORM
*   TypeScript

# Getting Started

## Prerequisites

*   Node.js v18+
*   PostgreSQL
*   Git

## Installation

1.  Clone the repository: `git clone https://github.com/maifree123/chatbot2`
2.  Navigate to the project directory: `cd chatbot2`
3.  Install dependencies: `npm install`

## Configuration

1.  Create a `.env.local` file by copying the `.env.example` file. If `.env.example` does not exist, create `.env.local` and add the following environment variables:
    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon key
    *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project service role key (if needed for specific backend operations)
    *   `DATABASE_URL`: Your PostgreSQL connection string (obtained from Supabase)
    *   `OPENAI_API_KEY`: Your OpenAI API key (if using OpenAI for any features)
2.  Update the environment variables in `.env.local` with your actual credentials and settings.

## Running the application

1.  Run the development server: `npm run dev`
2.  Open [http://localhost:3000](http://localhost:3000) in your browser.

# Usage

Register or log in to your account. Create new chats, send messages, and upload PDF files. Manage your chat settings and user profile.

# Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

# License

This project is licensed under the MIT License. See the LICENSE file for details. (LICENSE file to be created)
