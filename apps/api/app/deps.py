from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models import User, UserRole


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def db_session() -> Generator[Session, None, None]:
    yield from get_db()


def current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(db_session)
) -> User:
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )
    user = db.scalar(select(User).where(User.email == payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


def instructor_user(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.instructor:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Instructor access required.")
    return user
