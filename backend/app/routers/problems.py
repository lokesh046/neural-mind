from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/problems", tags=["problems"])

@router.get("", response_model=List[schemas.ProblemResponse])
def read_problems(db: Session = Depends(get_db)):
    problems = db.query(models.Problem).all()
    return problems

@router.get("/{problem_id}", response_model=schemas.ProblemDetailResponse)
def read_problem(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Create a copy or manually build the detail response filtering private test cases
    public_test_cases = [tc for tc in problem.test_cases if tc.is_public]
    
    # We populate a Pydantic-compatible dict
    return schemas.ProblemDetailResponse(
        id=problem.id,
        title=problem.title,
        difficulty=problem.difficulty,
        tags=problem.tags,
        description_md=problem.description_md,
        theory_md=problem.theory_md,
        starter_code=problem.starter_code,
        test_cases=public_test_cases,
        created_at=problem.created_at
    )

@router.post("", response_model=schemas.ProblemDetailResponse, status_code=status.HTTP_201_CREATED)
def create_problem(
    problem_in: schemas.ProblemCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Only logged-in users can create/seed
):
    problem = models.Problem(
        title=problem_in.title,
        description_md=problem_in.description_md,
        theory_md=problem_in.theory_md,
        starter_code=problem_in.starter_code,
        difficulty=problem_in.difficulty,
        tags=problem_in.tags
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    
    for tc_in in problem_in.test_cases:
        tc = models.TestCase(
            problem_id=problem.id,
            input_json=tc_in.input_json,
            expected_output=tc_in.expected_output,
            is_public=tc_in.is_public
        )
        db.add(tc)
    
    db.commit()
    db.refresh(problem)
    return problem

@router.put("/{problem_id}", response_model=schemas.ProblemDetailResponse)
def update_problem(
    problem_id: int,
    problem_in: schemas.ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    update_data = problem_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(problem, key, value)
        
    db.commit()
    db.refresh(problem)
    return problem

@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    db.delete(problem)
    db.commit()
    return None
