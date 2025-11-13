from http import HTTPStatus
import logging
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.db.postgres import Post, SessionLocal


logger = logging.getLogger("post_crud")
logging.basicConfig(level=logging.INFO)

class PostCRUD:
    def __init__(self):
        try:
            self.db: Session = SessionLocal()
            logger.info("PostgreSQL session initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL session: {e}")
            raise RuntimeError(f"PostgreSQL session initialization failed: {e}")


    def create_post(self, post_data: dict):
        try:
            now_utc = datetime.now(timezone.utc)
            post = Post(
                postId=str(uuid4()),
                topic=post_data.get("topic"),
                blog=post_data.get("blog"),
                linkedin=post_data.get("linkedin"),
                whatsapp=post_data.get("whatsapp"),
                images=[],
                status="Generated",
                createdAt=now_utc,
                updatedAt=now_utc,
            )

            self.db.add(post)
            self.db.commit()
            self.db.refresh(post)
            return {
                "topic": post.topic,
                "blog": post.blog,
                "linkedin": post.linkedin,
                "whatsapp": post.whatsapp,
                "status": post.status
            }

        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"SQLAlchemy error creating post: {e}")
            raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Failed to create post.")
        finally:
            self.db.close()


    def update_post_images(self, post_id: str, image_meta: list):
        try:
            self.db = SessionLocal()
            post = self.db.query(Post).filter(Post.postId == post_id).first()
            if not post:
                raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Post not found")

            post.images = image_meta
            post.updatedAt = datetime.now(timezone.utc)
            self.db.commit()
            logger.info(f"Images added to postId={post_id}")
        except SQLAlchemyError as e:
            self.db.rollback()
            logger.error(f"SQLAlchemy error updating images: {e}")
            raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Failed to update images.")
        finally:
            self.db.close()

 
    def get_post_by_id(self, post_id: str, platform: str | None = None):
        try:
            post = self.db.query(Post).filter(Post.postId == post_id).first()
            if not post:
                logger.warning(f"Post not found (postId={post_id})")
                return None

            images = post.images or []

            if platform:
                platform = platform.lower().strip()
                valid_fields = {"blog", "linkedin", "whatsapp"}

                if platform not in valid_fields:
                    logger.warning(f"Invalid platform '{platform}' requested for postId={post_id}")
                    return None

                platform_data = getattr(post, platform, None)
                logger.info(f"Retrieved {platform} data with images for postId={post_id}")
                return {
                    "platform": platform,
                    "data": platform_data or {},
                    "images": images,
                    "status": post.status,
                }
            logger.info(f"Post retrieved successfully (postId={post_id})")
            return {
                "blog": post.blog,
                "linkedin": post.linkedin,
                "whatsapp": post.whatsapp,
                "images": images,
                "status": post.status,
            }

        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemy error fetching post by ID: {e}")
            raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Failed to fetch posts.")
        finally:
            self.db.close()


    def update_status(self, post_id: str, new_status: str):
        try:
            post = self.db.query(Post).filter(Post.postId == post_id).first()
            if not post:
                logger.warning(f"Cannot update — post not found (postId={post_id})")
                return None

            post.status = new_status
            post.updatedAt = datetime.utcnow()
            self.db.commit()
            logger.info(f"Post status updated (postId={post_id}, status={new_status})")
            return post

        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemy error updating status: {e}")
            raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Failed to update status.")
        finally:
            self.db.close()

 
    def get_all_posts(self, status: str):
        try:
            query = self.db.query(Post)
            if status:
                query = query.filter(Post.status == status)

            posts = query.order_by(Post.createdAt.desc()).all()

            logger.info(f"Fetched {len(posts)} posts (status={status or 'all'})")

            result = [
                {
                    "postId": p.postId,
                    "topic": p.topic,
                    "blog": p.blog,
                    "linkedin": p.linkedin,
                    "whatsapp": p.whatsapp,
                    "status": p.status,
                    "images": p.images,
                    "createdAt": p.createdAt.isoformat() if p.createdAt else None,
                    "updatedAt": p.updatedAt.isoformat() if p.updatedAt else None,
                }
                for p in posts
            ]

            return result

        except SQLAlchemyError as e:
            logger.error(f"Error fetching posts: {e}")
            raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail="Failed to fetch posts.")
        finally:
            self.db.close()