# AtmoRoute

AtmoRoute is a real-time vehicle tracking application that combines live public transit data with current weather conditions. It ingests data from GTFS-realtime feeds and a weather API, stores the combined information in a Supabase database, and displays the vehicle positions on a live map.

## Project Overview

This project is composed of two main parts:

- **Backend**: A Python script (`ingestion.py`) that runs continuously. It fetches vehicle position data from a GTFS-Realtime API and weather data from the OpenWeather API. It then processes this data, combines them, and upserts the records into a Supabase PostgreSQL database.
- **Frontend**: A Next.js application that connects to the Supabase database in real-time to display the vehicle locations and their status (including delays and weather) on an interactive map.

## Features

- **Real-time Data Ingestion**: Fetches and processes GTFS-RT vehicle positions and trip updates.
- **Weather Integration**: Enriches transit data with current weather conditions for each vehicle's location.
- **Scalable Backend**: Uses a Supabase PostgreSQL database for robust and real-time data storage.
- **Live Map Display**: (In Progress) A frontend to visualize vehicle locations and status in real-time.

## Tech Stack

- **Backend**: Python, `requests`, `supabase-py`
- **Frontend**: Next.js, React, TypeScript, Mapbox / Leaflet (TBD)
- **Database**: Supabase (PostgreSQL with Realtime capabilities)
- **APIs**: GTFS-Realtime, OpenWeather API

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Python 3.8+
- Node.js and npm
- A Supabase account
- An OpenWeather API Key
- Access to a GTFS-Realtime API endpoint

### Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create a Python virtual environment and activate it:**

    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required Python packages:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    Create a file named `.env` in the project's root directory (`AtmoRoute/.env`) and add the following variables:

    ```env
    # Supabase credentials
    SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    SUPABASE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

    # API credentials
    TRANSIT_URL="YOUR_GTFS_REALTIME_API_URL"
    OPENWEATHER_API_KEY="YOUR_OPENWEATHER_API_KEY"
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd ../frontend
    ```

2.  **Install the required Node.js packages:**

    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env.local` in the `frontend` directory (`AtmoRoute/frontend/.env.local`) and add the following variables for the client-side app:

    ```env
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

    _Note: Make sure to use your public `anon` key for the frontend, not the service role key._

## Running the Application

### Backend

To start the data ingestion process, run the `ingestion.py` script from the project's root directory:

```bash
# Make sure your virtual environment is activated
python backend/ingestion.py
```

The script will now run in a loop, fetching and storing data every 15 seconds.

### Frontend

To start the Next.js development server:

```bash
# From the /frontend directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live map.
