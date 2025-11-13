import logging
from http import HTTPStatus
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.api.controllers.agent import PostCRUD
from app.schemas.content import TopicInput, ApproveIn, PublishIn
from app.utils.content_service import ContentService
from app.utils.image_service import ImageService
from app.core.model_registry import ModelRegistry

router = APIRouter()
logger = logging.getLogger("post_agent")
logging.basicConfig(level=logging.INFO)

registry = ModelRegistry()

# Pass registry to both services
content_service = ContentService(registry)
image_service = ImageService(registry)

@router.post("/generate")
async def generate_content(payload: TopicInput):
    try:
        if not payload.topics:
            raise HTTPException(status_code=400, detail="At least one topic is required")


        drafts = content_service.generate_content(payload.topics)

        post_data = {
            "topic": payload.topics,
            "blog": drafts.get("blog", {}),
            "linkedin": drafts.get("linkedin", {}),
            "whatsapp": drafts.get("whatsapp", {}),
            "status": "generated",
        }

        controller = PostCRUD()
        post = controller.create_post(post_data)
        logger.info(f"[Generate] Post created (postId={post['postId']})")

        image_meta = []
        if getattr(payload, "image_generated", False):
            logger.info(f"[Generate] Generating images for postId={post['postId']}")
            image_meta = image_service.generate_images(topic=payload.topics, count=1)
            controller.update_post_images(post["postId"], image_meta)

        response_data = {**post, "images": image_meta}

        return JSONResponse(
            status_code=HTTPStatus.CREATED,
            content={
                "message": "Content generated successfully.",
                "data": response_data,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("[Generate] Unexpected error during generation.")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/approve")
async def approve_post(payload: ApproveIn):
    try:
        controller = PostCRUD()

        existing_post = controller.get_post_by_id(payload.postId)
        if not existing_post:
            return JSONResponse(
                content={"message": f"Post with ID '{payload.postId}' not found."},
                status_code=HTTPStatus.NOT_FOUND,
            )

        controller.update_status(payload.postId, payload.status)
        logger.info(f"[Approve] Post {payload.postId} updated to '{payload.status}'.")

        message = (
            "Post approved successfully."
            if payload.status.lower() == "approved"
            else f"Post status updated to '{payload.status}'."
        )

        return JSONResponse(content={"message": message}, status_code=HTTPStatus.OK)

    except Exception as e:
        logger.exception("[Approve] Unexpected error during approval.")
        raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/publish")
async def publish_post(payload: PublishIn):
    try:
        controller = PostCRUD()
        post_item = controller.get_post_by_id(payload.postId)

        if not post_item:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Post not found")

        result = {"postId": payload.postId, "platforms": {}}

        for platform in payload.platforms:
            platform_name = platform.lower().strip()
            if platform_name in {"blog", "linkedin", "whatsapp"}:
                result["platforms"][platform_name] = post_item.get(platform_name)
            else:
                logger.warning(f"[Publish] Platform '{platform_name}' not found for postId={payload.postId}")

        # Always include images + status
        result["images"] = post_item.get("images", [])
        result["status"] = post_item.get("status")

        return JSONResponse(
            status_code=HTTPStatus.OK,
            content={"message": "Published successfully", "data": result},
        )

    except Exception as e:
        logger.exception("[Publish] Unexpected error during publishing.")
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/posts")
async def get_all_posts(status: str):
    try:
        controller = PostCRUD()
        posts = controller.get_all_posts(status)

        if not posts:
            return JSONResponse(
                content={"message": "No posts found."},
                status_code=HTTPStatus.OK,
            )

        return JSONResponse(
            content={
                "message": "Posts fetched successfully.",
                "data": posts,
            },
            status_code=HTTPStatus.OK,
        )

    except Exception as e:
        logger.exception("[GetAllPosts] Unexpected error while retrieving posts.")
        raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/post/id")
async def get_post_by_id(post_id: str):
    try:
        controller = PostCRUD()
        post = controller.get_post_by_id(post_id)

        if not post:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Post not found")

        return JSONResponse(
            status_code=HTTPStatus.OK,
            content={"message": "Post retrieved successfully.", "data": post},
        )

    except Exception as e:
        logger.exception("[GetByID] Unexpected error fetching post.")
        raise HTTPException(status_code=HTTPStatus.INTERNAL_SERVER_ERROR, detail=str(e))