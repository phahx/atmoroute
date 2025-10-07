import os
import time
from dotenv import load_dotenv
import requests
from google.transit import gtfs_realtime_pb2
from supabase import create_client, Client

# Load env variables from .env file
load_dotenv()

# -- Initialize Supabase Client --
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -- API Configuration --
TRANSIT_URL = os.getenv("TRANSIT_REALTIME_URL")
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
# Example for Albany, NY
WEATHER_URL = f"https://api.openweathermap.org/data/2.5/weather?lat=42.6621&lon=-73.7932&appid={WEATHER_API_KEY}&units=metric"

def get_transit_data(access_token):
    """Fetches and parses GTFS-Realtime data."""
    try:
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        feed = gtfs_realtime_pb2.FeedMessage()
        response = requests.get(TRANSIT_URL, headers=headers)
        response.raise_for_status() # Raises an exception for bad status codes
        feed.ParseFromString(response.content)
        return feed.entity
    except requests.exceptions.RequestException as e:
        print(f"Error fetching transit data: {e}")
        return []

def get_weather_data():
    """Fetches current weather data."""
    try:
        response = requests.get(WEATHER_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None

def main():
    """Main function to run the ingestion loop."""
    access_token = os.getenv("TRANSIT_REALTIME_ACCESS_TOKEN")
    while True:
        print("--- Running ingestion cycle ---")

        # 1. Fetch data from both APIs
        vehicle_entities = get_transit_data(access_token)
        weather_data = get_weather_data()
        if not vehicle_entities or not weather_data:
            print("Failed to fetch data, skipping this cycle.")
            time.sleep(60) # Wait longer if an API fails.
            continue

        # 2. Process and combine data
        vehicles_to_insert = []
        current_weather_condition = weather_data['weather'][0]['main'] # "Rain", "Clouds" etc.

        # First, create a mapping from trip_id to delay from all trip_updates
        trip_delays = {}
        for entity in vehicle_entities:
            if entity.HasField('trip_update'):
                trip_id = entity.trip_update.trip.trip_id
                # The delay field in TripUpdate is the overall trip delay
                if entity.trip_update.HasField('delay'):
                    trip_delays[trip_id] = entity.trip_update.delay

        for entity in vehicle_entities:
            # We only care about entities that have vehicle position data
            if not entity.HasField('vehicle'):
                continue

            vehicle = entity.vehicle

            # Create a dictionary that matches Supabase table columns
            vehicle_record = {
                "vehicle_id": vehicle.vehicle.id,
                "latitude": vehicle.position.latitude,
                "longitude": vehicle.position.longitude,
                "route_id": vehicle.trip.route_id,
                "trip_id": vehicle.trip.trip_id,
                "delay_seconds": entity.trip_update.delay,
                "timestamp": "now()", # Supabase will convert this to the current timestamp
                "weather": current_weather_condition
            }
            vehicles_to_insert.append(vehicle_record)
        
        # 3. Insert data in Supabase
        if vehicles_to_insert:
            print(f"Inserting {len(vehicles_to_insert)} vehicle records...")
            try:
                # Using 'upsert' method to handle existing records.
                data, count = supabase.table("vehicle_positions").upsert(
                    vehicles_to_insert,
                    on_conflict="vehicle_id"
                ).execute()
                print(f"Successfully upserted {len(data[1])} records.")
            except Exception as e:
                print(f"Error inserting into Supabase: {e}")
        else:
            print("No vehicle data to insert.")

        # 4. Wait for the next cycle
        print("Cycle complete. Waiting for 15 seconds...")
        time.sleep(15)

if __name__ == "__main__":
    main()
            