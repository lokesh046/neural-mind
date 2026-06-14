from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, executor
from app.routers.auth import get_current_user
from app.config import settings
import logging

logger = logging.getLogger("submissions")
router = APIRouter(prefix="/api/submissions", tags=["submissions"])

async def run_and_grade_submission_task(submission_id: str):
    """Background task to run and grade a submission."""
    from app.database import SessionLocal
    
    db = SessionLocal()
    
    try:
        submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
        if not submission:
            logger.error(f"Background execution: Submission {submission_id} not found.")
            return
        
        logger.info(f"Background execution: Grading submission {submission_id}...")
        status, error_message = await executor.execute_submission(db, submission)
        
        submission.status = status
        submission.error_message = error_message
        db.commit()
        logger.info(f"Background execution: Submission {submission_id} finished with status '{status}'")
    except Exception as e:
        logger.exception(f"Background execution: Exception occurred for submission {submission_id}:")
        try:
            submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
            if submission:
                submission.status = "runtime_error"
                submission.error_message = f"Internal Grading Error: {str(e)}"
                db.commit()
        except Exception as inner_ex:
            logger.error(f"Could not write failure status to DB: {inner_ex}")
    finally:
        db.close()

@router.post("/submit", response_model=schemas.SubmissionResponse, status_code=status.HTTP_202_ACCEPTED)
def submit_solution(
    submission_in: schemas.SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify problem exists
    problem = db.query(models.Problem).filter(models.Problem.id == submission_in.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    # Create submission record
    submission = models.Submission(
        user_id=current_user.id,
        problem_id=submission_in.problem_id,
        code=submission_in.code,
        status="pending"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Queue background grading task
    background_tasks.add_task(run_and_grade_submission_task, submission.id)
    
    return submission

@router.get("/completed-ids", response_model=List[int])
def get_completed_ids(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    completed_submissions = db.query(models.Submission.problem_id)\
        .filter(models.Submission.user_id == current_user.id)\
        .filter(models.Submission.status == "accepted")\
        .distinct()\
        .all()
    return [item[0] for item in completed_submissions]

@router.get("/{submission_id}", response_model=schemas.SubmissionDetail)
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    # Standard check to ensure users can only view their own submissions
    if submission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden to view other users' submissions")
        
    return submission
