import sqlite3
from sqlite3 import Error

database = r"./database.db"
def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    return conn

##### CREATE TABLES ######## 
sql_create_users_table = """CREATE TABLE IF NOT EXISTS users (
                                username TEXT PRIMARY KEY,
                                password TEXT
                            );"""
                            
sql_create_entries_table = """CREATE TABLE IF NOT EXISTS entries (
                                id TEXT PRIMARY KEY,
                                name TEXT,
                                email TEXT,
                                number TEXT,
                                user_id TEXT,
                                FOREIGN KEY (user_id) REFERENCES users (username)
                            );"""

def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)

#### INSERT #########
def add_entry(conn, id, name, email, number, user_id):
    """Add a new entry into the entries table
    :param conn:
    :param id:
    :param name:
    :param email:
    :param number:
    :param user_id:"""
    sql = """INSERT INTO entries(id,name,email,number,user_id)
              VALUES(?,?,?,?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (id, name, email, number, user_id))
        conn.commit()
    except Error as e:
        return e

def init_entries(conn):
    init = [(111111,"Halvor Nodeland", "halvor@nodeland.no", "332 19 912", "adm"),
            (222222,"Annette Tveiten", "annette@gmail.com", "+47 293 29 231", "adm"),
            (333333,"Bjarne Vindvett", "123@gmail.com", "+47 911 33 932", "adm")]
    for s in init:
        add_entry(conn, s[0], s[1], s[2], s[3], s[4])

def add_user(conn, username, password):
    """Add a new entry into the users table
    :param conn:
    :param username:
    :param password:"""
    sql = """ INSERT INTO users(username,password)
              VALUES(?,?)"""
    try:
        cur = conn.cursor()
        cur.execute(sql, (username, password))
        conn.commit()
    except Error as e:
        return e

def init_users(conn):
    init = [("adm","adm"),
            ("admin", "admin"),
            ("123", "123")]
    for s in init:
        add_user(conn, s[0], s[1])

#### UPDATE #########
def edit_entry(conn, id, name, email, number):
    cur = conn.cursor()
    sql = """UPDATE entries SET name = :name, email = :email, number = :number
            WHERE id = :id"""
    try: 
        cur.execute(sql, {'id': id, 'name': name, 'email':email, 'number':number})
        conn.commit()
    except Error as e:
        return e

### DELETE #######
def delete_entry(conn, id):
    cur = conn.cursor()
    sql = """DELETE from entries WHERE id = :id"""
    try: 
        cur.execute(sql, {'id':id})
        conn.commit()
    except Error as e:
        return e

#### SELECT #######
def select_entries(conn, user_id):
    cur = conn.cursor()
    try:
        sql = "SELECT id, name, email, number FROM entries WHERE user_id = :user_id"
        cur.execute(sql, {'user_id': user_id})
        entries = []

        for (id, name, email, number) in cur:
            entries.append({ 
                "id": id, 
                "name": name,
                "email": email,
                "number": number
                })
        return entries
    except Error as e:
        return e

def check_login (conn, username, password):
    cur = conn.cursor()
    sql = """SELECT * FROM users  WHERE username = :username AND password = :password"""
    cur.execute(sql, {'username': username, 'password': password})
    valid_user = []
    
    for (username, password) in cur:
        valid_user.append({
            "username": username, 
            "password": password
            })
    return valid_user

#### SETUP ####
def setup():
    conn = create_connection(database)
    if conn is not None:
        create_table(conn, sql_create_users_table)
        init_users(conn)
        
        create_table(conn, sql_create_entries_table)
        init_entries(conn)
        print(select_entries(conn))
        conn.close()

if __name__ == '__main__':
    # If executed as main, this will create tables and insert initial data
    setup()