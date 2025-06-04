# Stoic Persona

A modern web application built with SolidJS and TailwindCSS, designed to help users explore and understand Stoic philosophy.

## Tech Stack

- [SolidJS](https://www.solidjs.com/) - A declarative, efficient, and flexible JavaScript library for building user interfaces
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Vinxi](https://vinxi.dev/) - A modern build tool for SolidJS applications
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Anthropic Claude](https://www.anthropic.com/) - AI integration for enhanced functionality

## Prerequisites

- Node.js >= 22
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
```

You can obtain these values from:
- Supabase: Project Settings > API
- Anthropic: API Keys section in your account dashboard

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Features

- Modern UI with TailwindCSS
- AI-powered insights
- Database integration with Supabase
- PDF processing capabilities
- Interactive user experience with driver.js
