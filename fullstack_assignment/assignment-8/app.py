from setup_db import select_entries, add_entry, edit_entry, delete_entry, check_login
import sqlite3
from time import sleep
import json
from flask import Flask, request, g

app = Flask(__name__)
DATABASE = './database.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

#INDEX
@app.route('/')
def index():
    return app.send_static_file("index.html")

#Initializes entry table shown on index
@app.route("/entries", methods=["POST"])
def getEntries():
    sleep(1)
    user = request.get_json()
    user_id = user.get("user_id")
    conn = get_db()
    entries = select_entries(conn, user_id)
    return json.dumps(entries)

#Adds a new entry to the database
@app.route("/add_entry", methods=["POST"])
def add_entry_to_db():
    entry = request.get_json()
    conn = get_db()
    new_id = entry.get("id")
    new_name = entry.get("name")
    new_email = entry.get("email")
    new_number = entry.get("number")
    user_id = entry.get("user_id")
    #Import assigmnet 4 logic
    if new_id != "" and new_name != "" and new_email != "" and new_number != "":
        add_entry(conn, new_id, new_name, new_email, new_number, user_id)
    entries = select_entries(conn, user_id)
    return json.dumps(entries)

#Edits an existing entry in the database, returns new data
@app.route("/edit_entry", methods = ["POST"])
def update_entry_in_db():
    entry = request.get_json()
    conn = get_db()
    old_id = entry.get("id")
    new_name = entry.get("name")
    new_email = entry.get("email")
    new_number = entry.get("number")
    user_id = entry.get("user_id")
    if new_name != "" and new_email != "" and new_number != "":
        edit_entry(conn, old_id, new_name, new_email, new_number)
    entries = select_entries(conn, user_id)
    return json.dumps(entries)

#Delete an entry in the database, returns new data
@app.route("/delete_entry", methods = ["POST"])
def delete_entry_in_db():
    entry = request.get_json()
    conn = get_db()
    id = entry.get("id")
    user_id = entry.get("user_id")
    if id != "":
        delete_entry(conn, id)
    entries = select_entries(conn, user_id)
    return json.dumps(entries)

@app.route("/log_in", methods = ["POST"])
def login():
    conn = get_db()
    user = request.get_json()
    username = user.get("username")
    password = user.get("password")
    if username != "" and password != "":
        data = check_login(conn, username, password)
        return json.dumps(data)
    

if __name__ == "__main__":
    app.run(debug=True)