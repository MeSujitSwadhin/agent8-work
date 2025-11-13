from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, Column, String, JSON, DateTime, func
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

Base = declarative_base()

class Post(Base):
    __tablename__ = "posts"
    postId = Column(String, primary_key=True)
    topic = Column(String, nullable=False)
    blog = Column(JSON, nullable=False)
    linkedin = Column(JSON, nullable=False)
    whatsapp = Column(JSON, nullable=False)
    images = Column(JSON, nullable=True)
    status = Column(String, default="generated")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

DB_USER = os.getenv("PG_USER")
DB_PASSWORD = os.getenv("PG_PASSWORD")
DB_HOST = os.getenv("PG_HOST")
DB_PORT = os.getenv("PG_PORT")
DB_NAME = os.getenv("PG_DB")

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base.metadata.create_all(bind=engine)