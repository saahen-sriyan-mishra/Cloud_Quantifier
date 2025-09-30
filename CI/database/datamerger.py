import os
import pandas as pd
import sqlite3

# Get current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Paths
folder_path = os.path.join(script_dir, "individual_stocks_5yr")
sqlite_db_path = os.path.join(script_dir, "stocks_data.db")
table_name = "market_data"

# Connect to SQLite
conn = sqlite3.connect(sqlite_db_path)
cursor = conn.cursor()

# Drop existing table (optional)
cursor.execute(f"DROP TABLE IF EXISTS {table_name}")

# Track if any data was inserted
data_inserted = False

# Loop through all files in folder
for file in os.listdir(folder_path):
    file_path = os.path.join(folder_path, file)

    try:
        # Support .xlsx, .xls, and .csv files
        if file.endswith(".xlsx") or file.endswith(".xls"):
            df = pd.read_excel(file_path, engine="openpyxl")
        elif file.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            print(f"Skipped (not Excel or CSV): {file}")
            continue

        # Ensure required columns exist
        required_cols = {"date", "open", "high", "low", "close", "volume", "Name"}
        if not required_cols.issubset(df.columns):
            print(f"Skipped (missing columns): {file}")
            continue

        # Insert into SQLite
        df.to_sql(table_name, conn, if_exists="append", index=False)
        data_inserted = True
        print(f"Imported: {file}")

    except Exception as e:
        print(f"Failed to import {file}: {e}")

# Done
conn.close()

if data_inserted:
    print("All valid files imported into 'stocks_data.db'.")
else:
    print("No valid files were imported. Check file format and content.")
