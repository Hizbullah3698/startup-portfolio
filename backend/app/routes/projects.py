"""
Project CRUD API routes.

Prefix  : /api/projects
Tag     : Projects
Auth    : NONE (Part 5 will add authentication)

⚠️  SECURITY WARNING — Part 5 is NOT yet implemented.
    POST / PUT / DELETE are currently unprotected.
    Do NOT expose this backend publicly until Part 5 authentication is in place.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["Projects"])

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
MAX_LIMIT = 100  # Safety ceiling on page size


def _get_project_or_404(project_id: int, db: Session) -> Project:
    """Return the project or raise 404 — never expose DB internals."""
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id={project_id} was not found.",
        )
    return project


def _slug_exists(slug: str, db: Session, exclude_id: Optional[int] = None) -> bool:
    """Check if a slug is already used by another project."""
    stmt = select(Project).where(Project.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(Project.id != exclude_id)
    return db.execute(stmt).scalar_one_or_none() is not None


# ---------------------------------------------------------------------------
# GET /api/projects
# ---------------------------------------------------------------------------
@router.get(
    "/",
    response_model=list[ProjectResponse],
    summary="List Projects",
    description=(
        "Return a paginated list of portfolio projects, ordered by newest first. "
        "Optionally filter by category."
    ),
    status_code=status.HTTP_200_OK,
)
def list_projects(
    skip: int = Query(0, ge=0, description="Number of records to skip (offset)"),
    limit: int = Query(
        10, ge=1, le=MAX_LIMIT, description="Maximum number of records to return"
    ),
    category: Optional[str] = Query(None, description="Filter projects by category"),
    db: Session = Depends(get_db),
) -> list[Project]:
    stmt = select(Project)

    if category:
        stmt = stmt.where(Project.category == category)

    stmt = stmt.order_by(Project.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(stmt).scalars().all())


# ---------------------------------------------------------------------------
# GET /api/projects/{project_id}
# ---------------------------------------------------------------------------
@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get Project",
    description="Return a single project by its integer ID.",
    status_code=status.HTTP_200_OK,
)
def get_project(project_id: int, db: Session = Depends(get_db)) -> Project:
    return _get_project_or_404(project_id, db)


# ---------------------------------------------------------------------------
# POST /api/projects
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=ProjectResponse,
    summary="Create Project",
    description=(
        "Create a new portfolio project. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_201_CREATED,
)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> Project:
    # Duplicate slug check
    if _slug_exists(payload.slug, db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A project with slug '{payload.slug}' already exists.",
        )

    project = Project(**payload.model_dump())
    db.add(project)
    try:
        db.commit()
        db.refresh(project)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create project due to a data conflict.",
        )
    return project


# ---------------------------------------------------------------------------
# PUT /api/projects/{project_id}
# ---------------------------------------------------------------------------
@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update Project",
    description=(
        "Partially or fully update an existing project. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_200_OK,
)
def update_project(
    project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)
) -> Project:
    project = _get_project_or_404(project_id, db)

    updates = payload.model_dump(exclude_unset=True)

    # Slug uniqueness check (only when the slug is being changed)
    if "slug" in updates and updates["slug"] != project.slug:
        if _slug_exists(updates["slug"], db, exclude_id=project_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A project with slug '{updates['slug']}' already exists.",
            )

    for field, value in updates.items():
        setattr(project, field, value)

    try:
        db.commit()
        db.refresh(project)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update project due to a data conflict.",
        )
    return project


# ---------------------------------------------------------------------------
# DELETE /api/projects/{project_id}
# ---------------------------------------------------------------------------
@router.delete(
    "/{project_id}",
    summary="Delete Project",
    description=(
        "Permanently delete a project. "
        "⚠️ Unprotected until Part 5 authentication is implemented."
    ),
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project(project_id: int, db: Session = Depends(get_db)) -> None:
    project = _get_project_or_404(project_id, db)
    db.delete(project)
    db.commit()
