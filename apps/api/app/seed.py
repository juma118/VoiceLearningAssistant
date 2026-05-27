from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import Course, Lesson, Recommendation, Resource, User, UserRole
from app.services.rag import rag_service


PYTHON_INTRO = """
Python functions group reusable behavior behind a name. A function can accept parameters,
return values, and isolate a small idea so a program stays readable. Students often confuse
printing with returning: print shows text to a user, while return sends a value back to code.
"""

REST_INTRO = """
REST APIs let applications communicate through resources and HTTP methods. A client sends a
request such as GET /lessons or POST /questions, and a backend returns structured data, often
JSON. Authentication, validation, and clear status codes make APIs reliable.
"""


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "student@example.com")):
            return

        instructor = User(
            email="instructor@example.com",
            full_name="Dr. Ada Instructor",
            role=UserRole.instructor,
            password_hash=hash_password("password123"),
        )
        student = User(
            email="student@example.com",
            full_name="Sam Student",
            role=UserRole.student,
            password_hash=hash_password("password123"),
        )
        db.add_all([instructor, student])
        db.flush()

        course = Course(
            title="Programming Foundations with AI Tutor",
            description="Practice Python, web APIs, debugging, and software design with voice support.",
            level="Beginner to Intermediate",
            instructor_id=instructor.id,
        )
        db.add(course)
        db.flush()

        lesson_one = Lesson(
            course_id=course.id,
            title="Python Functions and Return Values",
            slug="python-functions",
            content=PYTHON_INTRO,
            summary="Functions make code reusable. Return values are used by the rest of a program.",
            position=1,
            estimated_minutes=25,
        )
        lesson_two = Lesson(
            course_id=course.id,
            title="REST APIs and Backend Routes",
            slug="rest-apis",
            content=REST_INTRO,
            summary="REST APIs connect clients and servers through resource-oriented HTTP routes.",
            position=2,
            estimated_minutes=30,
        )
        db.add_all([lesson_one, lesson_two])
        db.flush()

        resources = [
            Resource(
                course_id=course.id,
                lesson_id=lesson_one.id,
                title="Function Notes",
                content=PYTHON_INTRO,
            ),
            Resource(
                course_id=course.id,
                lesson_id=lesson_two.id,
                title="REST API Notes",
                content=REST_INTRO,
            ),
        ]
        db.add_all(resources)
        db.flush()
        db.add(
            Recommendation(
                student_id=student.id,
                lesson_id=lesson_two.id,
                topic="REST APIs",
                reason="Practice mapping user actions to backend routes and HTTP methods.",
                priority=2,
            )
        )
        db.commit()

        for resource in resources:
            rag_service.index_resource(resource)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
