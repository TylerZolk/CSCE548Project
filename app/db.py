import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_conn():
    """
    Create a DB connection. Set DATABASE_URL like:
    postgresql://user:password@localhost:5432/vulnvault
    """
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is not set.")
    return psycopg2.connect(url, cursor_factory=RealDictCursor)
